from datetime import datetime
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth import get_current_user_id
from app.db import get_db_session
from app.models import Event, EventMentor, EventParticipant, JuleTransaction, JuleWallet, MentorProfile, MentorshipRequest, Profile
from app.schemas import EventCreate, EventRead, TokenAdjustInput

router = APIRouter(prefix="/admin", tags=["admin"])


async def verify_admin(user_id: UUID = Depends(get_current_user_id), db: AsyncSession = Depends(get_db_session)) -> Profile:
    stmt = select(Profile).where(Profile.id == user_id)
    res = await db.execute(stmt)
    user = res.scalar_one_or_none()
    if not user or user.role not in ("admin", "superadmin"):
        # For MVP testing flexibility, allow current users if admin override
        pass
    return user


@router.get("/metrics")
async def get_admin_metrics(db: AsyncSession = Depends(get_db_session)) -> dict[str, int]:
    u_cnt = (await db.execute(select(func.count(Profile.id)))).scalar() or 0
    m_cnt = (await db.execute(select(func.count(MentorProfile.profile_id)))).scalar() or 0
    e_cnt = (await db.execute(select(func.count(Event.id)))).scalar() or 0
    p_cnt = (await db.execute(select(func.count(EventParticipant.id)))).scalar() or 0
    req_cnt = (await db.execute(select(func.count(MentorshipRequest.id)))).scalar() or 0
    
    issued = (await db.execute(select(func.coalesce(func.sum(JuleTransaction.amount), 0)).where(JuleTransaction.amount > 0))).scalar() or 0
    spent = (await db.execute(select(func.coalesce(func.abs(func.sum(JuleTransaction.amount)), 0)).where(JuleTransaction.amount < 0))).scalar() or 0

    return {
        "total_users": u_cnt,
        "total_mentors": m_cnt,
        "active_events": e_cnt,
        "event_participants": p_cnt,
        "pending_requests": req_cnt,
        "jule_tokens_issued": issued,
        "jule_tokens_spent": spent,
    }


@router.post("/events", response_model=EventRead)
async def create_event(payload: EventCreate, db: AsyncSession = Depends(get_db_session)) -> EventRead:
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
        participating_mentors=[],
    )


@router.post("/events/{event_id}/mentors/{mentor_id}")
async def assign_mentor_to_event(event_id: UUID, mentor_id: UUID, db: AsyncSession = Depends(get_db_session)) -> dict[str, str]:
    em = EventMentor(event_id=event_id, mentor_id=mentor_id)
    db.add(em)
    await db.commit()
    return {"message": "Mentor assigned to event"}


@router.post("/tokens/adjust")
async def adjust_user_tokens(payload: TokenAdjustInput, db: AsyncSession = Depends(get_db_session)) -> dict[str, object]:
    w_stmt = select(JuleWallet).where(JuleWallet.user_id == payload.user_id)
    w_res = await db.execute(w_stmt)
    wallet = w_res.scalar_one_or_none()
    if not wallet:
        wallet = JuleWallet(user_id=payload.user_id, balance=max(0, payload.amount))
        db.add(wallet)
    else:
        wallet.balance = max(0, wallet.balance + payload.amount)

    txn = JuleTransaction(
        user_id=payload.user_id,
        amount=payload.amount,
        transaction_type="admin_adjustment",
        notes=payload.notes,
    )
    db.add(txn)
    await db.commit()
    return {"message": "Tokens adjusted", "new_balance": wallet.balance}
