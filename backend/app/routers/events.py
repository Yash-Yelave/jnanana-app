from datetime import UTC, datetime
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth import get_current_user_id
from app.db import get_db_session
from app.models import Event, EventParticipant, JuleTransaction, JuleWallet
from app.schemas import EventRead

router = APIRouter(prefix="/events", tags=["events"])

Db = Annotated[AsyncSession, Depends(get_db_session)]
UserId = Annotated[UUID, Depends(get_current_user_id)]

BASE_ALLOCATION = 50


async def check_in_participant(db: AsyncSession, event: Event, user_id: UUID) -> dict[str, object]:
    """Check a user into an event and grant the base Jule allocation exactly once.

    Shared by the participant's own check-in and the admin's manual check-in so the
    two paths cannot drift apart.
    """
    participant = (
        await db.execute(
            select(EventParticipant)
            .where(EventParticipant.event_id == event.id, EventParticipant.user_id == user_id)
            .with_for_update()
        )
    ).scalar_one_or_none()

    if participant is None:
        participant = EventParticipant(
            event_id=event.id,
            user_id=user_id,
            registration_status="registered",
            checkin_status="checked_in",
        )
        db.add(participant)
        await db.flush()
    else:
        participant.checkin_status = "checked_in"

    tokens_granted = 0
    if not participant.tokens_allocated:
        participant.tokens_allocated = True
        tokens_granted = BASE_ALLOCATION

        wallet = (
            await db.execute(select(JuleWallet).where(JuleWallet.user_id == user_id).with_for_update())
        ).scalar_one_or_none()
        if wallet is None:
            wallet = JuleWallet(user_id=user_id, balance=0)
            db.add(wallet)
            await db.flush()
        wallet.balance += BASE_ALLOCATION
        wallet.updated_at = datetime.now(UTC)

        db.add(
            JuleTransaction(
                user_id=user_id,
                event_id=event.id,
                amount=BASE_ALLOCATION,
                transaction_type="event_allocation",
                notes=f"Base token allocation for {event.name}",
            )
        )

    return {
        "message": f"Checked in to {event.name}",
        "checkin_status": "checked_in",
        "tokens_granted": tokens_granted,
    }


@router.get("", response_model=list[EventRead])
async def list_events(db: Db) -> list[Event]:
    stmt = select(Event).where(Event.status == "published").order_by(Event.event_date.asc())
    return list((await db.scalars(stmt)).all())


@router.get("/{event_id}", response_model=EventRead)
async def get_event(event_id: UUID, db: Db) -> Event:
    event = await db.get(Event, event_id)
    if event is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")
    return event


@router.get("/{event_id}/me")
async def my_participation(event_id: UUID, db: Db, user_id: UserId) -> dict[str, object]:
    """Lets the event page render the right check-in state instead of guessing."""
    participant = (
        await db.execute(
            select(EventParticipant).where(
                EventParticipant.event_id == event_id, EventParticipant.user_id == user_id
            )
        )
    ).scalar_one_or_none()
    if participant is None:
        return {"registered": False, "checkin_status": "pending", "tokens_allocated": False}
    return {
        "registered": True,
        "checkin_status": participant.checkin_status,
        "tokens_allocated": participant.tokens_allocated,
    }


@router.post("/{event_id}/checkin")
async def checkin_event(event_id: UUID, db: Db, user_id: UserId) -> dict[str, object]:
    event = await db.get(Event, event_id)
    if event is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")
    if event.status != "published":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="This event is not open for check-in")

    result = await check_in_participant(db, event, user_id)
    await db.commit()
    return result
