from datetime import UTC, datetime
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import aliased

from app.auth import CurrentUser, require_admin
from app.db import get_db_session
from app.models import (
    Event,
    EventParticipant,
    JuleTransaction,
    JuleWallet,
    MentorProfile,
    MentorshipRequest,
    Profile,
)
from app.routers.events import check_in_participant
from app.schemas import (
    AdminRequestRead,
    EventCreate,
    EventRead,
    EventUpdate,
    ParticipantRead,
    RequestStatusOverride,
    TokenAdjustInput,
)

router = APIRouter(prefix="/admin", tags=["admin"])

Admin = Annotated[CurrentUser, Depends(require_admin)]
Db = Annotated[AsyncSession, Depends(get_db_session)]


@router.get("/metrics")
async def get_admin_metrics(db: Db, _: Admin) -> dict[str, int]:
    u_cnt = (await db.execute(select(func.count(Profile.id)))).scalar() or 0
    m_cnt = (await db.execute(select(func.count(MentorProfile.profile_id)))).scalar() or 0
    e_cnt = (
        await db.execute(select(func.count(Event.id)).where(Event.status == "published"))
    ).scalar() or 0
    p_cnt = (await db.execute(select(func.count(EventParticipant.id)))).scalar() or 0
    req_cnt = (
        await db.execute(
            select(func.count(MentorshipRequest.id)).where(MentorshipRequest.status == "pending")
        )
    ).scalar() or 0

    issued = (
        await db.execute(
            select(func.coalesce(func.sum(JuleTransaction.amount), 0)).where(JuleTransaction.amount > 0)
        )
    ).scalar() or 0
    spent = (
        await db.execute(
            select(func.coalesce(func.sum(JuleTransaction.amount), 0)).where(JuleTransaction.amount < 0)
        )
    ).scalar() or 0

    return {
        "total_users": u_cnt,
        "total_mentors": m_cnt,
        "active_events": e_cnt,
        "event_participants": p_cnt,
        "pending_requests": req_cnt,
        "jule_tokens_issued": issued,
        "jule_tokens_spent": abs(spent),
    }


@router.post("/events", response_model=EventRead)
async def create_event(payload: EventCreate, db: Db, _: Admin) -> EventRead:
    existing = (await db.execute(select(Event).where(Event.slug == payload.slug))).scalar_one_or_none()
    if existing is not None:
        raise HTTPException(status_code=409, detail="an event with this slug already exists")

    ev = Event(
        slug=payload.slug,
        name=payload.name,
        description=payload.description,
        event_date=payload.event_date,
        location=payload.location,
        image_path=payload.image_path,
        status=payload.status,
    )
    db.add(ev)
    await db.commit()
    await db.refresh(ev)
    return EventRead.model_validate(ev)


@router.post("/tokens/adjust")
async def adjust_user_tokens(payload: TokenAdjustInput, db: Db, _: Admin) -> dict[str, object]:
    if payload.amount == 0:
        raise HTTPException(status_code=422, detail="amount must be non-zero")

    profile = await db.get(Profile, payload.user_id)
    if profile is None:
        raise HTTPException(status_code=404, detail="user not found")

    wallet = (
        await db.execute(select(JuleWallet).where(JuleWallet.user_id == payload.user_id).with_for_update())
    ).scalar_one_or_none()
    if wallet is None:
        wallet = JuleWallet(user_id=payload.user_id, balance=0)
        db.add(wallet)
        await db.flush()

    if wallet.balance + payload.amount < 0:
        raise HTTPException(
            status_code=400,
            detail=f"cannot deduct {abs(payload.amount)} Jule Tokens; balance is {wallet.balance}",
        )

    wallet.balance += payload.amount
    wallet.updated_at = datetime.now(UTC)

    db.add(
        JuleTransaction(
            user_id=payload.user_id,
            amount=payload.amount,
            transaction_type="activity_reward" if payload.amount > 0 else "admin_deduction",
            notes=payload.notes,
        )
    )
    await db.commit()
    return {"message": "Tokens adjusted", "new_balance": wallet.balance}


@router.get("/mentors")
async def list_admin_mentors(db: Db, _: Admin, approval_status: str | None = None) -> dict[str, object]:
    stmt = select(MentorProfile, Profile).join(Profile, Profile.id == MentorProfile.profile_id)
    if approval_status:
        stmt = stmt.where(MentorProfile.approval_status == approval_status)
    rows = (await db.execute(stmt)).all()
    return {
        "items": [
            {
                "profile_id": str(mp.profile_id),
                "first_name": p.first_name,
                "last_name": p.last_name,
                "headline": mp.headline,
                "bio": mp.bio,
                "approval_status": mp.approval_status,
                "rejection_reason": mp.rejection_reason,
                "professions": mp.professions or [],
                "approved_at": mp.approved_at.isoformat() if mp.approved_at else None,
                "created_at": mp.created_at.isoformat() if mp.created_at else None,
            }
            for mp, p in rows
        ]
    }


@router.post("/mentors/{mentor_id}/approve")
async def approve_mentor(mentor_id: UUID, db: Db, _: Admin) -> dict[str, str]:
    mp = await db.get(MentorProfile, mentor_id, with_for_update=True)
    if mp is None:
        raise HTTPException(status_code=404, detail="Mentor profile not found")

    mp.approval_status = "approved"
    mp.approved_at = datetime.now(UTC)
    mp.rejection_reason = None

    profile = await db.get(Profile, mentor_id)
    if profile is not None:
        profile.onboarding_status = "complete"

    await db.commit()
    return {"message": "Mentor profile approved successfully"}


@router.post("/mentors/{mentor_id}/reject")
async def reject_mentor(mentor_id: UUID, db: Db, _: Admin, payload: dict | None = None) -> dict[str, str]:
    mp = await db.get(MentorProfile, mentor_id, with_for_update=True)
    if mp is None:
        raise HTTPException(status_code=404, detail="Mentor profile not found")

    reason = (payload or {}).get("reason") or "Application does not meet criteria"
    mp.approval_status = "rejected"
    mp.rejection_reason = reason
    mp.approved_at = None

    profile = await db.get(Profile, mentor_id)
    if profile is not None:
        profile.onboarding_status = "pending"

    await db.commit()
    return {"message": "Mentor profile rejected"}


# --- SRS §36: event lifecycle -------------------------------------------------


@router.patch("/events/{event_id}", response_model=EventRead)
async def update_event(event_id: UUID, payload: EventUpdate, db: Db, _: Admin) -> Event:
    event = await db.get(Event, event_id, with_for_update=True)
    if event is None:
        raise HTTPException(status_code=404, detail="Event not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(event, field, value)

    await db.commit()
    await db.refresh(event)
    return event


@router.post("/events/{event_id}/publish", response_model=EventRead)
async def publish_event(event_id: UUID, db: Db, _: Admin) -> Event:
    return await _set_event_status(event_id, "published", db)


@router.post("/events/{event_id}/unpublish", response_model=EventRead)
async def unpublish_event(event_id: UUID, db: Db, _: Admin) -> Event:
    return await _set_event_status(event_id, "draft", db)


async def _set_event_status(event_id: UUID, status: str, db: AsyncSession) -> Event:
    event = await db.get(Event, event_id, with_for_update=True)
    if event is None:
        raise HTTPException(status_code=404, detail="Event not found")
    event.status = status
    await db.commit()
    await db.refresh(event)
    return event


@router.get("/events", response_model=list[EventRead])
async def list_all_events(db: Db, _: Admin) -> list[Event]:
    """Unlike the public listing, admins see drafts and completed events too."""
    return list((await db.scalars(select(Event).order_by(Event.event_date.desc()))).all())


# --- SRS §11: participants and manual check-in --------------------------------


@router.get("/events/{event_id}/participants", response_model=list[ParticipantRead])
async def list_participants(event_id: UUID, db: Db, _: Admin) -> list[ParticipantRead]:
    if await db.get(Event, event_id) is None:
        raise HTTPException(status_code=404, detail="Event not found")

    stmt = (
        select(EventParticipant, Profile, JuleWallet.balance)
        .join(Profile, Profile.id == EventParticipant.user_id)
        .outerjoin(JuleWallet, JuleWallet.user_id == EventParticipant.user_id)
        .where(EventParticipant.event_id == event_id)
        .order_by(Profile.first_name)
    )
    return [
        ParticipantRead(
            user_id=participant.user_id,
            first_name=profile.first_name,
            last_name=profile.last_name,
            phone=profile.phone,
            role=profile.role,
            registration_status=participant.registration_status,
            checkin_status=participant.checkin_status,
            tokens_allocated=participant.tokens_allocated,
            jule_balance=balance or 0,
        )
        for participant, profile, balance in (await db.execute(stmt)).all()
    ]


@router.post("/events/{event_id}/participants/{user_id}/checkin")
async def admin_checkin(event_id: UUID, user_id: UUID, db: Db, _: Admin) -> dict[str, object]:
    """Staff-operated check-in. Shares check_in_participant with the self-service
    path so the allocation rules cannot drift between the two."""
    event = await db.get(Event, event_id)
    if event is None:
        raise HTTPException(status_code=404, detail="Event not found")
    if await db.get(Profile, user_id) is None:
        raise HTTPException(status_code=404, detail="User not found")

    result = await check_in_participant(db, event, user_id)
    await db.commit()
    return result


# --- SRS §37: mentorship request oversight ------------------------------------


@router.get("/mentorship-requests", response_model=list[AdminRequestRead])
async def list_all_requests(db: Db, _: Admin, status: str | None = None) -> list[AdminRequestRead]:
    mentee = aliased(Profile)
    mentor = aliased(Profile)
    stmt = (
        select(MentorshipRequest, mentee, mentor, Event.name)
        .join(mentee, mentee.id == MentorshipRequest.mentee_id)
        .join(mentor, mentor.id == MentorshipRequest.mentor_id)
        .outerjoin(Event, Event.id == MentorshipRequest.event_id)
        .order_by(MentorshipRequest.created_at.desc())
    )
    if status:
        stmt = stmt.where(MentorshipRequest.status == status)

    return [
        AdminRequestRead(
            id=req.id,
            mentee_name=f"{mentee_p.first_name} {mentee_p.last_name}",
            mentor_name=f"{mentor_p.first_name} {mentor_p.last_name}",
            event_name=event_name,
            tokens_used=req.tokens_used,
            status=req.status,
            created_at=req.created_at,
        )
        for req, mentee_p, mentor_p, event_name in (await db.execute(stmt)).all()
    ]


@router.post("/mentorship-requests/{request_id}/status")
async def override_request_status(
    request_id: UUID, payload: RequestStatusOverride, db: Db, _: Admin
) -> dict[str, str]:
    """SRS §37: admins may intervene. Refunds follow the same rule as the mentor
    path so the ledger stays balanced however a request is resolved."""
    req = await db.get(MentorshipRequest, request_id, with_for_update=True)
    if req is None:
        raise HTTPException(status_code=404, detail="Request not found")

    previous = req.status
    if previous == payload.status:
        return {"status": previous, "message": "No change"}

    refunded = {"rejected", "cancelled"}
    if payload.status in refunded and previous not in refunded:
        wallet = (
            await db.execute(select(JuleWallet).where(JuleWallet.user_id == req.mentee_id).with_for_update())
        ).scalar_one_or_none()
        if wallet is None:
            wallet = JuleWallet(user_id=req.mentee_id, balance=0)
            db.add(wallet)
            await db.flush()
        wallet.balance += req.tokens_used
        wallet.updated_at = datetime.now(UTC)
        db.add(
            JuleTransaction(
                user_id=req.mentee_id,
                event_id=req.event_id,
                amount=req.tokens_used,
                transaction_type="refund",
                related_mentor_id=req.mentor_id,
                notes=f"Admin set request to {payload.status} ({req.tokens_used} Jule Tokens)",
            )
        )

    req.status = payload.status
    req.updated_at = datetime.now(UTC)
    await db.commit()
    return {"status": payload.status, "message": f"Request moved from {previous} to {payload.status}"}
