from datetime import UTC, datetime
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth import get_current_user_id
from app.db import get_db_session
from app.models import (
    JuleTransaction,
    JuleWallet,
    MentorProfile,
    MentorshipRequest,
    Notification,
    Profile,
)
from app.schemas import MentorshipRequestActionInput, MentorshipRequestCreate, MentorshipRequestRead

router = APIRouter(prefix="/mentorship-requests", tags=["mentorship-requests"])

Db = Annotated[AsyncSession, Depends(get_db_session)]
UserId = Annotated[UUID, Depends(get_current_user_id)]

ACTION_STATUS = {"accept": "accepted", "reject": "rejected", "complete": "completed", "cancel": "cancelled"}
ACTION_ALLOWED_FROM = {
    "accept": {"pending"},
    "reject": {"pending"},
    "cancel": {"pending"},
    "complete": {"accepted"},
}


def _full_name(profile: Profile | None) -> str | None:
    if profile is None:
        return None
    return f"{profile.first_name} {profile.last_name}".strip()


def _to_read(
    req: MentorshipRequest,
    mentee: Profile | None,
    mentor_profile: Profile | None,
    mentor: MentorProfile | None,
) -> MentorshipRequestRead:
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
        mentee_name=_full_name(mentee),
        mentor_name=_full_name(mentor_profile),
        mentor_avatar=mentor_profile.avatar_path if mentor_profile else None,
        mentor_headline=mentor.headline if mentor else None,
    )


@router.post("", response_model=MentorshipRequestRead, status_code=201)
async def create_request(payload: MentorshipRequestCreate, db: Db, user_id: UserId) -> MentorshipRequestRead:
    if payload.mentor_id == user_id:
        raise HTTPException(status_code=400, detail="You cannot request mentorship from yourself")

    # A4: the requested mentor must exist and be approved. No fallback, no fabrication.
    mentor = await db.get(MentorProfile, payload.mentor_id)
    if mentor is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Mentor not found")
    if mentor.approval_status != "approved":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="This mentor is not accepting requests yet"
        )

    duplicate = (
        await db.execute(
            select(MentorshipRequest).where(
                MentorshipRequest.mentee_id == user_id,
                MentorshipRequest.mentor_id == payload.mentor_id,
                MentorshipRequest.status == "pending",
            )
        )
    ).scalar_one_or_none()
    if duplicate is not None:
        raise HTTPException(status_code=409, detail="You already have a pending request with this mentor")

    # A3: never mint tokens here. A wallet with no check-in starts empty.
    wallet = (
        await db.execute(select(JuleWallet).where(JuleWallet.user_id == user_id).with_for_update())
    ).scalar_one_or_none()
    if wallet is None:
        wallet = JuleWallet(user_id=user_id, balance=0)
        db.add(wallet)
        await db.flush()

    if wallet.balance < payload.tokens_used:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Insufficient Jule Tokens. You have {wallet.balance}, "
                f"but {payload.tokens_used} are required. Check in at an event to receive tokens."
            ),
        )

    wallet.balance -= payload.tokens_used
    wallet.updated_at = datetime.now(UTC)

    req = MentorshipRequest(
        mentee_id=user_id,
        mentor_id=mentor.profile_id,
        event_id=payload.event_id,
        tokens_used=payload.tokens_used,
        status="pending",
        note=payload.note,
    )
    db.add(req)

    db.add(
        JuleTransaction(
            user_id=user_id,
            event_id=payload.event_id,
            amount=-payload.tokens_used,
            transaction_type="mentor_request",
            related_mentor_id=mentor.profile_id,
            notes=f"Mentorship request ({payload.tokens_used} Jule Tokens)",
        )
    )

    mentee = await db.get(Profile, user_id)
    mentor_profile = await db.get(Profile, mentor.profile_id)

    # B6: notify the mentor that a request arrived.
    db.add(
        Notification(
            user_id=mentor.profile_id,
            kind="mentorship_request.received",
            title="New mentorship request",
            body=f"{_full_name(mentee) or 'A mentee'} requested mentorship with you.",
            data={"request_id": str(req.id), "mentee_id": str(user_id)},
        )
    )

    await db.commit()
    await db.refresh(req)
    return _to_read(req, mentee, mentor_profile, mentor)


@router.get("/my", response_model=list[MentorshipRequestRead])
async def list_my_requests(db: Db, user_id: UserId) -> list[MentorshipRequestRead]:
    me = await db.get(Profile, user_id)
    if me is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")

    is_mentor = me.role == "mentor"
    other_side = MentorshipRequest.mentee_id if is_mentor else MentorshipRequest.mentor_id
    mine = MentorshipRequest.mentor_id if is_mentor else MentorshipRequest.mentee_id

    stmt = (
        select(MentorshipRequest, Profile, MentorProfile)
        .join(Profile, Profile.id == other_side)
        .join(MentorProfile, MentorProfile.profile_id == MentorshipRequest.mentor_id)
        .where(mine == user_id)
        .order_by(MentorshipRequest.created_at.desc())
    )

    rows = (await db.execute(stmt)).all()
    if is_mentor:
        # `other` is the mentee; the mentor side of every card is me.
        return [_to_read(req, other, me, mp) for req, other, mp in rows]
    return [_to_read(req, me, other, mp) for req, other, mp in rows]


@router.post("/{request_id}/action")
async def action_request(
    request_id: UUID, payload: MentorshipRequestActionInput, db: Db, user_id: UserId
) -> dict[str, str]:
    req = await db.get(MentorshipRequest, request_id, with_for_update=True)
    if req is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Request not found")

    # A5: accept/reject/complete are the mentor's to make; cancel is the mentee's.
    if payload.action in {"accept", "reject", "complete"}:
        if req.mentor_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, detail="Only the mentor can action this request"
            )
    elif req.mentee_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Only the mentee can cancel this request"
        )

    if req.status not in ACTION_ALLOWED_FROM[payload.action]:
        raise HTTPException(status_code=409, detail=f"cannot {payload.action} a request that is {req.status}")

    new_status = ACTION_STATUS[payload.action]
    req.status = new_status
    req.updated_at = datetime.now(UTC)

    # Refund on reject or cancel — the mentorship never happened.
    if payload.action in {"reject", "cancel"}:
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
                notes=f"Refund for {new_status} mentorship request ({req.tokens_used} Jule Tokens)",
            )
        )

    # B6: notify the mentee of the mentor's decision.
    if payload.action in {"accept", "reject"}:
        mentor_name = _full_name(await db.get(Profile, req.mentor_id)) or "Your mentor"
        accepted = payload.action == "accept"
        db.add(
            Notification(
                user_id=req.mentee_id,
                kind=f"mentorship_request.{new_status}",
                title=f"Mentorship request {new_status}",
                body=(
                    f"{mentor_name} accepted your request. The Jnanana team will coordinate the connection."
                    if accepted
                    else f"{mentor_name} could not take your request. "
                    f"Your {req.tokens_used} Jule Tokens have been refunded."
                ),
                data={"request_id": str(req.id), "mentor_id": str(req.mentor_id)},
            )
        )

    await db.commit()
    return {"message": f"Request status updated to {new_status}", "status": new_status}
