from datetime import datetime
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth import CurrentUser, require_admin
from app.db import get_db_session
from app.models import Event, EventParticipant, JuleTransaction, JuleWallet, MentorProfile, MentorshipRequest, Profile
from app.schemas import EventCreate, EventRead, TokenAdjustInput

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/metrics")
async def get_admin_metrics(
    admin: CurrentUser = Depends(require_admin),
    db: AsyncSession = Depends(get_db_session),
) -> dict[str, int]:
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
async def create_event(
    payload: EventCreate,
    admin: CurrentUser = Depends(require_admin),
    db: AsyncSession = Depends(get_db_session),
) -> EventRead:
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
    )


@router.post("/tokens/adjust")
async def adjust_user_tokens(
    payload: TokenAdjustInput,
    admin: CurrentUser = Depends(require_admin),
    db: AsyncSession = Depends(get_db_session),
) -> dict[str, object]:
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


@router.get("/mentors")
async def list_admin_mentors(
    status: str | None = None,
    admin: CurrentUser = Depends(require_admin),
    db: AsyncSession = Depends(get_db_session),
):
    stmt = select(MentorProfile, Profile).join(Profile, Profile.id == MentorProfile.profile_id)
    if status:
        stmt = stmt.where(MentorProfile.approval_status == status)
    res = await db.execute(stmt)
    rows = res.all()
    items = []
    for mp, p in rows:
        items.append({
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
        })
    return {"items": items}


@router.post("/mentors/{mentor_id}/approve")
async def approve_mentor(
    mentor_id: UUID,
    admin: CurrentUser = Depends(require_admin),
    db: AsyncSession = Depends(get_db_session),
):
    mp_stmt = select(MentorProfile).where(MentorProfile.profile_id == mentor_id)
    mp = (await db.execute(mp_stmt)).scalar_one_or_none()
    if not mp:
        raise HTTPException(status_code=404, detail="Mentor profile not found")

    mp.approval_status = "approved"
    mp.approved_at = datetime.utcnow()

    p_stmt = select(Profile).where(Profile.id == mentor_id)
    p = (await db.execute(p_stmt)).scalar_one_or_none()
    if p:
        p.onboarding_status = "complete"

    await db.commit()
    return {"message": "Mentor profile approved successfully"}


@router.post("/mentors/{mentor_id}/reject")
async def reject_mentor(
    mentor_id: UUID,
    payload: dict | None = None,
    admin: CurrentUser = Depends(require_admin),
    db: AsyncSession = Depends(get_db_session),
):
    mp_stmt = select(MentorProfile).where(MentorProfile.profile_id == mentor_id)
    mp = (await db.execute(mp_stmt)).scalar_one_or_none()
    if not mp:
        raise HTTPException(status_code=404, detail="Mentor profile not found")

    reason = payload.get("reason", "Application does not meet criteria") if payload else "Application does not meet criteria"
    mp.approval_status = "rejected"
    mp.rejection_reason = reason

    await db.commit()
    return {"message": "Mentor profile rejected"}
