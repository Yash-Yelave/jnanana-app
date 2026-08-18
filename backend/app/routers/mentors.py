from datetime import UTC, datetime
from typing import Annotated, Any, Literal
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field
from sqlalchemy import delete, func, or_, select
from sqlalchemy.engine import Row
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.sql import Select

from app.auth import CurrentUser, get_current_user, require_admin
from app.db import get_db
from app.models import AuditEvent, MentorAvailability, MentorProfile, Profile, Review
from app.schemas import AvailabilityInput, AvailabilityRead, MentorRead, MentorSelfRead, MentorSelfUpdate, ReviewRead

router = APIRouter(tags=["mentors"])
Db = Annotated[AsyncSession, Depends(get_db)]
User = Annotated[CurrentUser, Depends(get_current_user)]
Admin = Annotated[CurrentUser, Depends(require_admin)]


class MentorDecision(BaseModel):
    status: Literal["approved", "rejected"]
    reason: str | None = Field(default=None, max_length=1000)


def mentor_projection() -> Select[Any]:
    return (
        select(
            MentorProfile.profile_id,
            Profile.first_name,
            Profile.last_name,
            Profile.username,
            Profile.avatar_path,
            MentorProfile.headline,
            MentorProfile.bio,
            MentorProfile.hourly_rate_minor,
            MentorProfile.currency,
            MentorProfile.languages,
            MentorProfile.professions,
            MentorProfile.companies,
            func.coalesce(func.avg(Review.rating), 0).label("average_rating"),
            func.count(Review.id).label("review_count"),
        )
        .join(Profile, Profile.id == MentorProfile.profile_id)
        .outerjoin(Review, Review.mentor_id == MentorProfile.profile_id)
        .where(MentorProfile.approval_status == "approved", Profile.role == "mentor")
        .group_by(MentorProfile.profile_id, Profile.id)
    )


def mentor_read(row: Row[Any]) -> MentorRead:
    data = row._mapping
    return MentorRead(
        id=data["profile_id"],
        first_name=data["first_name"],
        last_name=data["last_name"],
        username=data["username"],
        avatar_path=data["avatar_path"],
        headline=data["headline"],
        bio=data["bio"],
        hourly_rate_minor=data["hourly_rate_minor"],
        currency=data["currency"],
        languages=data["languages"],
        professions=data["professions"],
        companies=data["companies"],
        average_rating=round(float(data["average_rating"]), 2),
        review_count=data["review_count"],
    )


@router.get("/mentors")
async def list_mentors(
    db: Db,
    search: str | None = Query(default=None, max_length=100),
    max_price_minor: int | None = Query(default=None, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
    cursor: UUID | None = None,
) -> dict[str, object]:
    statement = mentor_projection().order_by(MentorProfile.profile_id).limit(limit + 1)
    if search:
        term = f"%{search}%"
        statement = statement.where(
            or_(Profile.first_name.ilike(term), Profile.last_name.ilike(term), MentorProfile.headline.ilike(term))
        )
    if max_price_minor is not None:
        statement = statement.where(MentorProfile.hourly_rate_minor <= max_price_minor)
    if cursor:
        statement = statement.where(MentorProfile.profile_id > cursor)
    rows = (await db.execute(statement)).all()
    items = [mentor_read(row) for row in rows[:limit]]
    return {"items": items, "next_cursor": str(items[-1].id) if len(rows) > limit else None}


@router.get("/mentors/{mentor_id}", response_model=MentorRead)
async def get_mentor(mentor_id: UUID, db: Db) -> MentorRead:
    row = (await db.execute(mentor_projection().where(MentorProfile.profile_id == mentor_id))).first()
    if row is None:
        raise HTTPException(status_code=404, detail="mentor not found")
    return mentor_read(row)


@router.get("/mentors/{mentor_id}/availability", response_model=list[AvailabilityRead])
async def get_availability(mentor_id: UUID, db: Db) -> list[MentorAvailability]:
    approved = await db.scalar(
        select(MentorProfile.profile_id).where(
            MentorProfile.profile_id == mentor_id, MentorProfile.approval_status == "approved"
        )
    )
    if approved is None:
        raise HTTPException(status_code=404, detail="mentor not found")
    return list(
        (
            await db.scalars(
                select(MentorAvailability).where(MentorAvailability.mentor_id == mentor_id, MentorAvailability.active)
            )
        ).all()
    )


@router.get("/mentors/{mentor_id}/reviews")
async def mentor_reviews(mentor_id: UUID, db: Db, limit: int = Query(default=50, ge=1, le=100)) -> dict[str, object]:
    approved = await db.scalar(
        select(MentorProfile.profile_id).where(
            MentorProfile.profile_id == mentor_id, MentorProfile.approval_status == "approved"
        )
    )
    if approved is None:
        raise HTTPException(status_code=404, detail="mentor not found")
    reviews = list(
        (
            await db.scalars(
                select(Review).where(Review.mentor_id == mentor_id).order_by(Review.created_at.desc()).limit(limit)
            )
        ).all()
    )
    return {"items": [ReviewRead.model_validate(review) for review in reviews], "next_cursor": None}


@router.put("/mentor/availability", response_model=list[AvailabilityRead])
async def replace_availability(payload: list[AvailabilityInput], db: Db, user: User) -> list[MentorAvailability]:
    profile = await db.get(Profile, user.id)
    mentor = await db.get(MentorProfile, user.id)
    if profile is None or profile.role != "mentor" or mentor is None:
        raise HTTPException(status_code=403, detail="mentor profile required")
    if len(payload) > 50:
        raise HTTPException(status_code=422, detail="too many availability rules")
    await db.execute(delete(MentorAvailability).where(MentorAvailability.mentor_id == user.id))
    rules = [MentorAvailability(mentor_id=user.id, **item.model_dump()) for item in payload]
    db.add_all(rules)
    await db.commit()
    for rule in rules:
        await db.refresh(rule)
    return rules


@router.get("/mentor/profile", response_model=MentorSelfRead)
async def get_own_mentor_profile(db: Db, user: User) -> MentorProfile:
    profile = await db.get(Profile, user.id)
    mentor = await db.get(MentorProfile, user.id)
    if profile is None or profile.role != "mentor" or mentor is None:
        raise HTTPException(status_code=403, detail="mentor profile required")
    return mentor


@router.patch("/mentor/profile", response_model=MentorSelfRead)
async def update_own_mentor_profile(payload: MentorSelfUpdate, db: Db, user: User) -> MentorProfile:
    mentor = await db.get(MentorProfile, user.id)
    profile = await db.get(Profile, user.id)
    if profile is None or profile.role != "mentor" or mentor is None:
        raise HTTPException(status_code=403, detail="mentor profile required")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(mentor, field, value.upper() if field == "currency" and value else value)
    mentor.updated_at = datetime.now(UTC)
    await db.commit()
    await db.refresh(mentor)
    return mentor


@router.get("/admin/mentor-applications")
async def mentor_applications(db: Db, _: Admin) -> dict[str, object]:
    rows = (
        await db.execute(
            select(MentorProfile, Profile)
            .join(Profile, Profile.id == MentorProfile.profile_id)
            .where(MentorProfile.approval_status == "pending")
            .order_by(MentorProfile.created_at)
        )
    ).all()
    return {
        "items": [
            {
                "profile_id": mentor.profile_id,
                "name": f"{profile.first_name} {profile.last_name}",
                "headline": mentor.headline,
                "created_at": mentor.created_at,
            }
            for mentor, profile in rows
        ],
        "next_cursor": None,
    }


@router.post("/admin/mentor-applications/{mentor_id}/decision")
async def decide_mentor(mentor_id: UUID, payload: MentorDecision, db: Db, admin: Admin) -> dict[str, str]:
    mentor = await db.get(MentorProfile, mentor_id, with_for_update=True)
    profile = await db.get(Profile, mentor_id, with_for_update=True)
    if mentor is None or profile is None:
        raise HTTPException(status_code=404, detail="mentor application not found")
    if profile.role != "mentor":
        raise HTTPException(status_code=409, detail="profile is not a mentor")
    if payload.status == "rejected" and not payload.reason:
        raise HTTPException(status_code=422, detail="rejection reason is required")
    mentor.approval_status = payload.status
    mentor.rejection_reason = payload.reason if payload.status == "rejected" else None
    mentor.approved_at = datetime.now(UTC) if payload.status == "approved" else None
    profile.onboarding_status = "complete" if payload.status == "approved" else "pending"
    db.add(
        AuditEvent(
            actor_id=admin.id,
            action=f"mentor.{payload.status}",
            entity_type="mentor_profile",
            entity_id=mentor_id,
            data={"reason": payload.reason} if payload.reason else {},
        )
    )
    await db.commit()
    return {"status": payload.status}
