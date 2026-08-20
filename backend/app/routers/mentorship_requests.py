from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth import get_current_user_id
from app.db import get_db_session
from app.models import JuleTransaction, JuleWallet, MentorProfile, MentorshipRequest, Profile
from app.schemas import MentorshipRequestActionInput, MentorshipRequestCreate, MentorshipRequestRead

router = APIRouter(prefix="/mentorship-requests", tags=["mentorship-requests"])


@router.post("", response_model=MentorshipRequestRead)
async def create_request(
    payload: MentorshipRequestCreate,
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db_session),
) -> MentorshipRequestRead:
    # 1. Verify mentor profile exists (Strict 404 if not found)
    m_stmt = select(MentorProfile).where(MentorProfile.profile_id == payload.mentor_id)
    m_res = await db.execute(m_stmt)
    mentor = m_res.scalar_one_or_none()

    if not mentor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Mentor not found")

    # 2. Check or initialize Jule Wallet balance (Default 0 initial balance)
    w_stmt = select(JuleWallet).where(JuleWallet.user_id == user_id)
    w_res = await db.execute(w_stmt)
    wallet = w_res.scalar_one_or_none()
    if not wallet:
        wallet = JuleWallet(user_id=user_id, balance=0)
        db.add(wallet)
        await db.flush()

    if wallet.balance < payload.tokens_used:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Insufficient Jools. You have {wallet.balance} Jools, but {payload.tokens_used} are required.",
        )

    # Deduct tokens
    wallet.balance -= payload.tokens_used

    # Record transaction
    txn = JuleTransaction(
        user_id=user_id,
        event_id=payload.event_id,
        amount=-payload.tokens_used,
        transaction_type="mentor_request",
        related_mentor_id=mentor.profile_id,
        notes=f"Mentorship request ({payload.tokens_used} Jools)",
    )
    db.add(txn)

    # Create request using resolved mentor.profile_id
    req = MentorshipRequest(
        mentee_id=user_id,
        mentor_id=mentor.profile_id,
        event_id=payload.event_id,
        tokens_used=payload.tokens_used,
        status="pending",
        note=payload.note,
    )
    db.add(req)
    await db.commit()
    await db.refresh(req)

    # Fetch profile details for response
    p_stmt = select(Profile).where(Profile.id == user_id)
    mentee_p = (await db.execute(p_stmt)).scalar_one_or_none()

    m_p_stmt = select(Profile).where(Profile.id == mentor.profile_id)
    mentor_p = (await db.execute(m_p_stmt)).scalar_one_or_none()

    return MentorshipRequestRead(
        id=req.id,
        mentee_id=req.mentee_id,
        mentor_id=req.mentor_id,
        event_id=req.event_id,
        tokens_used=req.tokens_used,
        status=req.status,
        note=req.note,
        created_at=req.created_at,
        updated_at=req.updated_at,
        mentee_name=f"{mentee_p.first_name} {mentee_p.last_name}" if mentee_p else None,
        mentor_name=f"{mentor_p.first_name} {mentor_p.last_name}" if mentor_p else None,
        mentor_avatar=mentor_p.avatar_path if mentor_p else None,
        mentor_headline=mentor.headline,
    )


@router.get("/my", response_model=list[MentorshipRequestRead])
async def list_my_requests(
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db_session),
) -> list[MentorshipRequestRead]:
    # Check user role
    u_stmt = select(Profile).where(Profile.id == user_id)
    u_res = await db.execute(u_stmt)
    user_profile = u_res.scalar_one_or_none()
    if not user_profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")

    if user_profile.role == "mentor":
        stmt = (
            select(MentorshipRequest, Profile, MentorProfile)
            .join(Profile, MentorshipRequest.mentee_id == Profile.id)
            .join(MentorProfile, MentorshipRequest.mentor_id == MentorProfile.profile_id)
            .where(MentorshipRequest.mentor_id == user_id)
            .order_by(MentorshipRequest.created_at.desc())
        )
        res = await db.execute(stmt)
        items = res.all()
        out = []
        for req, mentee_p, mp in items:
            out.append(
                MentorshipRequestRead(
                    id=req.id,
                    mentee_id=req.mentee_id,
                    mentor_id=req.mentor_id,
                    event_id=req.event_id,
                    tokens_used=req.tokens_used,
                    status=req.status,
                    note=req.note,
                    created_at=req.created_at,
                    updated_at=req.updated_at,
                    mentee_name=f"{mentee_p.first_name} {mentee_p.last_name}",
                    mentor_name=f"{user_profile.first_name} {user_profile.last_name}",
                    mentor_avatar=user_profile.avatar_path,
                    mentor_headline=mp.headline,
                )
            )
        return out
    else:
        stmt = (
            select(MentorshipRequest, Profile, MentorProfile)
            .join(Profile, MentorshipRequest.mentor_id == Profile.id)
            .join(MentorProfile, MentorshipRequest.mentor_id == MentorProfile.profile_id)
            .where(MentorshipRequest.mentee_id == user_id)
            .order_by(MentorshipRequest.created_at.desc())
        )
        res = await db.execute(stmt)
        items = res.all()
        out = []
        for req, mentor_p, mp in items:
            out.append(
                MentorshipRequestRead(
                    id=req.id,
                    mentee_id=req.mentee_id,
                    mentor_id=req.mentor_id,
                    event_id=req.event_id,
                    tokens_used=req.tokens_used,
                    status=req.status,
                    note=req.note,
                    created_at=req.created_at,
                    updated_at=req.updated_at,
                    mentee_name=f"{user_profile.first_name} {user_profile.last_name}",
                    mentor_name=f"{mentor_p.first_name} {mentor_p.last_name}",
                    mentor_avatar=mentor_p.avatar_path,
                    mentor_headline=mp.headline,
                )
            )
        return out


@router.post("/{request_id}/action")
async def action_request(
    request_id: UUID,
    payload: MentorshipRequestActionInput,
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db_session),
) -> dict[str, str]:
    stmt = select(MentorshipRequest).where(MentorshipRequest.id == request_id)
    res = await db.execute(stmt)
    req = res.scalar_one_or_none()
    if not req:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Request not found")

    if req.mentor_id != user_id and req.mentee_id != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to access this request")

    # Fetch user profile to check role for actions
    u_stmt = select(Profile).where(Profile.id == user_id)
    user_profile = (await db.execute(u_stmt)).scalar_one_or_none()

    if payload.action in ("accept", "reject", "complete"):
        if not user_profile or user_profile.role != "mentor" or req.mentor_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only assigned mentors can accept, reject, or complete mentorship requests",
            )

    if payload.action == "accept":
        req.status = "accepted"
    elif payload.action == "reject":
        req.status = "rejected"
        # Refund Jule tokens to mentee
        w_stmt = select(JuleWallet).where(JuleWallet.user_id == req.mentee_id)
        w_res = await db.execute(w_stmt)
        wallet = w_res.scalar_one_or_none()
        if wallet:
            wallet.balance += req.tokens_used
            txn = JuleTransaction(
                user_id=req.mentee_id,
                event_id=req.event_id,
                amount=req.tokens_used,
                transaction_type="refund",
                related_mentor_id=req.mentor_id,
                notes=f"Refund for rejected mentorship request ({req.tokens_used} Jule Tokens)",
            )
            db.add(txn)
    elif payload.action == "complete":
        req.status = "completed"
    elif payload.action == "cancel":
        if req.mentee_id != user_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only the requesting mentee can cancel this request")
        req.status = "cancelled"

    await db.commit()
    return {"message": f"Request status updated to {req.status}"}
