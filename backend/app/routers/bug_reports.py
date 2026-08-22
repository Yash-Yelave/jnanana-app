from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth import CurrentUser, get_current_user
from app.db import get_db_session
from app.models import BugReport, Profile
from app.schemas import BugReportCreate, BugReportRead

router = APIRouter(tags=["bug-reports"])

User = Annotated[CurrentUser, Depends(get_current_user)]
Db = Annotated[AsyncSession, Depends(get_db_session)]


@router.post("/me/bug-reports", status_code=status.HTTP_201_CREATED)
async def submit_bug_report(input_data: BugReportCreate, db: Db, user: User) -> dict[str, str]:
    """Submit a simple bug report for the currently logged in user (student or mentor)."""
    report = BugReport(
        reporter_id=user.id,
        title=input_data.title.strip(),
        description=input_data.description.strip(),
        status="open",
    )
    db.add(report)
    await db.commit()
    return {"message": "✓ Bug report submitted successfully! Our team will investigate."}


@router.get("/me/bug-reports")
async def list_my_bug_reports(db: Db, user: User) -> list[BugReportRead]:
    """List all bug reports submitted by the logged in user."""
    stmt = (
        select(BugReport)
        .where(BugReport.reporter_id == user.id)
        .order_by(BugReport.created_at.desc())
    )
    result = await db.execute(stmt)
    reports = result.scalars().all()

    profile = (await db.execute(select(Profile).where(Profile.id == user.id))).scalar_one_or_none()
    reporter_name = f"{profile.first_name} {profile.last_name}" if profile else "User"
    reporter_role = profile.role if profile else "user"

    out: list[BugReportRead] = []
    for r in reports:
        item = BugReportRead.model_validate(r)
        item.reporter_name = reporter_name
        item.reporter_email = None
        item.reporter_role = reporter_role
        out.append(item)
    return out
