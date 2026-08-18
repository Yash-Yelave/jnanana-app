from datetime import UTC, datetime
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth import CurrentUser, get_current_user
from app.db import get_db
from app.models import MentorProfile, Profile, ProfileSkill, Skill, UserSettings
from app.schemas import OnboardingInput, ProfileRead, ProfileUpdate, SettingsInput, SettingsRead, SkillRead

router = APIRouter(tags=["accounts"])
Db = Annotated[AsyncSession, Depends(get_db)]
User = Annotated[CurrentUser, Depends(get_current_user)]


async def profile_for_user(db: AsyncSession, user_id: UUID) -> Profile:
    profile = await db.get(Profile, user_id)
    if profile is None:
        raise HTTPException(status_code=404, detail="profile not found; complete onboarding")
    return profile


@router.get("/skills", response_model=list[SkillRead])
async def list_skills(db: Db) -> list[Skill]:
    return list((await db.scalars(select(Skill).where(Skill.active).order_by(Skill.name))).all())


@router.get("/me", response_model=ProfileRead)
async def me(db: Db, user: User) -> Profile:
    return await profile_for_user(db, user.id)


@router.post("/me/onboarding", response_model=ProfileRead, status_code=201)
async def onboard(payload: OnboardingInput, db: Db, user: User) -> Profile:
    profile = await db.get(Profile, user.id, with_for_update=True)
    if profile is not None and profile.onboarding_status == "complete":
        raise HTTPException(status_code=409, detail="onboarding already complete")

    if payload.skill_ids:
        found = set((await db.scalars(select(Skill.id).where(Skill.id.in_(payload.skill_ids), Skill.active))).all())
        if found != set(payload.skill_ids):
            raise HTTPException(status_code=422, detail="one or more skills are invalid")

    status = "pending" if payload.role == "mentor" else "complete"
    if profile is None:
        profile = Profile(
            id=user.id,
            role=payload.role,
            onboarding_status=status,
            first_name=payload.first_name,
            last_name=payload.last_name,
            username=payload.username,
            phone=payload.phone,
            location=payload.location,
            bio=payload.bio,
        )
        db.add(profile)
        db.add(UserSettings(user_id=user.id))
    else:
        profile.role = payload.role
        profile.onboarding_status = status
        profile.first_name = payload.first_name
        profile.last_name = payload.last_name
        profile.username = payload.username
        profile.phone = payload.phone
        profile.location = payload.location
        profile.bio = payload.bio
        profile.updated_at = datetime.now(UTC)

    await db.flush()
    await db.execute(delete(ProfileSkill).where(ProfileSkill.profile_id == user.id))
    skill_kind = "teaching" if payload.role == "mentor" else "learning"
    db.add_all(ProfileSkill(profile_id=user.id, skill_id=skill_id, kind=skill_kind) for skill_id in payload.skill_ids)

    if payload.role == "mentor":
        mentor = await db.get(MentorProfile, user.id)
        if mentor is None:
            db.add(
                MentorProfile(
                    profile_id=user.id,
                    headline=payload.headline,
                    bio=payload.bio,
                    hourly_rate_minor=payload.hourly_rate_minor,
                    currency=payload.currency.upper(),
                    languages=payload.languages,
                    professions=payload.professions,
                    companies=payload.companies,
                )
            )
        else:
            mentor.headline = payload.headline
            mentor.bio = payload.bio
            mentor.hourly_rate_minor = payload.hourly_rate_minor
            mentor.currency = payload.currency.upper()
            mentor.languages = payload.languages
            mentor.professions = payload.professions
            mentor.companies = payload.companies

    await db.commit()
    await db.refresh(profile)
    return profile


@router.patch("/me/profile", response_model=ProfileRead)
async def update_profile(payload: ProfileUpdate, db: Db, user: User) -> Profile:
    profile = await profile_for_user(db, user.id)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(profile, field, value)
    profile.updated_at = datetime.now(UTC)
    await db.commit()
    await db.refresh(profile)
    return profile


@router.get("/me/settings", response_model=SettingsRead)
async def get_settings(db: Db, user: User) -> UserSettings:
    settings = await db.get(UserSettings, user.id)
    if settings is None:
        raise HTTPException(status_code=404, detail="settings not found")
    return settings


@router.put("/me/settings", response_model=SettingsRead)
async def update_settings(payload: SettingsInput, db: Db, user: User) -> UserSettings:
    settings = await db.get(UserSettings, user.id)
    if settings is None:
        settings = UserSettings(user_id=user.id)
        db.add(settings)
    for field, value in payload.model_dump().items():
        setattr(settings, field, value)
    settings.updated_at = datetime.now(UTC)
    await db.commit()
    await db.refresh(settings)
    return settings
