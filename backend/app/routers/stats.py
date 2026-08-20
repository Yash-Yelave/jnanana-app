"""Public programme counters for the landing page.

Deliberately aggregate-only and unauthenticated: it exposes three totals and no
rows, so it can be read by anonymous visitors without opening up any table.

Every figure here is counted from real records. Nothing is seeded, padded or
estimated — if a number is small, it is small.
"""

from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_db_session
from app.models import MentorshipRequest, Profile

router = APIRouter(prefix="/stats", tags=["stats"])

Db = Annotated[AsyncSession, Depends(get_db_session)]


@router.get("")
async def public_stats(db: Db) -> dict[str, int]:
    # Everyone who has registered as a mentor, matching the "Mentors registered"
    # label on the landing page. Approval gates who appears in discovery, not who
    # has signed up, so counting only approved profiles would undercount against
    # the word on screen.
    mentors = (
        await db.scalar(select(func.count()).select_from(Profile).where(Profile.role == "mentor"))
    ) or 0

    mentees = (
        await db.scalar(select(func.count()).select_from(Profile).where(Profile.role == "student"))
    ) or 0

    # Only completed mentorship counts as time actually given. Requests still
    # pending or accepted have not happened yet.
    minutes = (
        await db.scalar(
            select(func.coalesce(func.sum(MentorshipRequest.duration_minutes), 0)).where(
                MentorshipRequest.status == "completed"
            )
        )
    ) or 0

    return {
        "mentors": mentors,
        "mentees": mentees,
        # Reported in minutes, not hours: early on, a handful of 30-minute
        # sessions would round to zero hours and the counter would look dead.
        "mentorship_minutes": minutes,
    }
