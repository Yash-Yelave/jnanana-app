from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth import get_current_user_id
from app.db import get_db_session
from app.models import Event, EventMentor, EventParticipant, JuleTransaction, JuleWallet, MentorProfile, Profile
from app.schemas import EventCreate, EventRead, MentorRead

router = APIRouter(prefix="/events", tags=["events"])


@router.get("", response_model=list[EventRead])
async def list_events(db: AsyncSession = Depends(get_db_session)) -> list[EventRead]:
    stmt = select(Event).where(Event.status == "published").order_by(Event.event_date.asc())
    res = await db.execute(stmt)
    events = res.scalars().all()
    out = []
    for ev in events:
        out.append(
            EventRead(
                id=ev.id,
                slug=ev.slug,
                name=ev.name,
                description=ev.description,
                event_date=ev.event_date,
                location=ev.location,
                image_path=ev.image_path,
                status=ev.status,
                created_at=ev.created_at,
                participating_mentors=[],
            )
        )
    return out


@router.get("/{event_id}", response_model=EventRead)
async def get_event(event_id: UUID, db: AsyncSession = Depends(get_db_session)) -> EventRead:
    stmt = select(Event).where(Event.id == event_id)
    res = await db.execute(stmt)
    ev = res.scalar_one_or_none()
    if not ev:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")

    # Fetch participating mentors
    m_stmt = (
        select(Profile, MentorProfile)
        .join(MentorProfile, Profile.id == MentorProfile.profile_id)
        .join(EventMentor, MentorProfile.profile_id == EventMentor.mentor_id)
        .where(EventMentor.event_id == event_id)
    )
    m_res = await db.execute(m_stmt)
    mentors = []
    for p, mp in m_res.all():
        mentors.append(
            MentorRead(
                id=p.id,
                first_name=p.first_name,
                last_name=p.last_name,
                username=p.username,
                avatar_path=p.avatar_path,
                headline=mp.headline,
                bio=mp.bio,
                hourly_rate_minor=mp.hourly_rate_minor,
                currency=mp.currency,
                languages=mp.languages,
                professions=mp.professions,
                companies=mp.companies,
            )
        )

    return EventRead(
        id=ev.id,
        slug=ev.slug,
        name=ev.name,
        description=ev.description,
        event_date=ev.event_date,
        location=ev.location,
        image_path=ev.image_path,
        status=ev.status,
        created_at=ev.created_at,
        participating_mentors=mentors,
    )


@router.post("/{event_id}/checkin")
async def checkin_event(
    event_id: UUID,
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db_session),
) -> dict[str, object]:
    # Check event exists
    stmt = select(Event).where(Event.id == event_id)
    res = await db.execute(stmt)
    ev = res.scalar_one_or_none()
    if not ev:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event not found")

    # Get or create EventParticipant
    p_stmt = select(EventParticipant).where(
        EventParticipant.event_id == event_id, EventParticipant.user_id == user_id
    )
    p_res = await db.execute(p_stmt)
    participant = p_res.scalar_one_or_none()

    if not participant:
        participant = EventParticipant(
            event_id=event_id,
            user_id=user_id,
            registration_status="registered",
            checkin_status="checked_in",
            tokens_allocated=False,
        )
        db.add(participant)
    else:
        participant.checkin_status = "checked_in"

    # Allocate 50 Jule Tokens if not yet allocated
    tokens_granted = 0
    if not participant.tokens_allocated:
        participant.tokens_allocated = True
        tokens_granted = 50

        # Get or create JuleWallet
        w_stmt = select(JuleWallet).where(JuleWallet.user_id == user_id)
        w_res = await db.execute(w_stmt)
        wallet = w_res.scalar_one_or_none()
        if not wallet:
            wallet = JuleWallet(user_id=user_id, balance=50)
            db.add(wallet)
        else:
            wallet.balance += 50

        # Add JuleTransaction log
        txn = JuleTransaction(
            user_id=user_id,
            event_id=event_id,
            amount=50,
            transaction_type="event_allocation",
            notes=f"Base token allocation for {ev.name}",
        )
        db.add(txn)

    await db.commit()
    return {
        "message": f"Successfully checked into {ev.name}",
        "checkin_status": "checked_in",
        "tokens_granted": tokens_granted,
    }
