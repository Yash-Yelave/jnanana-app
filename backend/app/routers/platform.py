from datetime import UTC, datetime
from typing import Annotated
from uuid import UUID, uuid4

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth import CurrentUser, get_current_user
from app.db import get_db
from app.models import (
    Booking,
    Course,
    Enrollment,
    Invoice,
    Notification,
    Plan,
    Profile,
    ReferralCode,
    Subscription,
    WalletEntry,
)
from app.schemas import (
    CourseRead,
    EnrollmentRead,
    InvoiceRead,
    PlanRead,
    SubscriptionRead,
    WalletEntryRead,
    WalletSummary,
)

router = APIRouter(tags=["platform"])
Db = Annotated[AsyncSession, Depends(get_db)]
User = Annotated[CurrentUser, Depends(get_current_user)]


class SubscriptionCreate(BaseModel):
    plan_id: UUID


@router.get("/courses", response_model=list[CourseRead])
async def list_courses(db: Db, limit: int = Query(default=50, ge=1, le=100)) -> list[Course]:
    return list(
        (
            await db.scalars(
                select(Course).where(Course.status == "published").order_by(Course.created_at.desc()).limit(limit)
            )
        ).all()
    )


@router.post("/courses/{course_id}/enroll", response_model=EnrollmentRead, status_code=201)
async def enroll(course_id: UUID, db: Db, user: User) -> Enrollment:
    profile = await db.get(Profile, user.id)
    course = await db.get(Course, course_id)
    if profile is None or profile.role != "student":
        raise HTTPException(status_code=403, detail="student profile required")
    if course is None or course.status != "published":
        raise HTTPException(status_code=404, detail="course not found")
    existing = await db.scalar(
        select(Enrollment).where(Enrollment.course_id == course_id, Enrollment.student_id == user.id)
    )
    if existing:
        return existing
    enrollment = Enrollment(course_id=course_id, student_id=user.id)
    db.add(enrollment)
    await db.commit()
    await db.refresh(enrollment)
    return enrollment


@router.get("/me/enrollments", response_model=list[EnrollmentRead])
async def list_enrollments(db: Db, user: User) -> list[Enrollment]:
    return list(
        (
            await db.scalars(
                select(Enrollment).where(Enrollment.student_id == user.id).order_by(Enrollment.enrolled_at.desc())
            )
        ).all()
    )


@router.get("/plans", response_model=list[PlanRead])
async def list_plans(db: Db) -> list[Plan]:
    return list((await db.scalars(select(Plan).where(Plan.active).order_by(Plan.price_minor))).all())


@router.post("/subscriptions", response_model=SubscriptionRead, status_code=201)
async def create_subscription(payload: SubscriptionCreate, db: Db, user: User) -> Subscription:
    plan = await db.get(Plan, payload.plan_id)
    if plan is None or not plan.active:
        raise HTTPException(status_code=404, detail="plan not found")
    current = await db.scalar(
        select(Subscription).where(Subscription.user_id == user.id, Subscription.status.in_(["pending", "active"]))
    )
    if current:
        return current
    subscription = Subscription(user_id=user.id, plan_id=plan.id)
    db.add(subscription)
    await db.commit()
    await db.refresh(subscription)
    return subscription


@router.get("/subscriptions", response_model=list[SubscriptionRead])
async def list_subscriptions(db: Db, user: User) -> list[Subscription]:
    return list(
        (
            await db.scalars(
                select(Subscription).where(Subscription.user_id == user.id).order_by(Subscription.created_at.desc())
            )
        ).all()
    )


@router.post("/payments/checkout")
async def checkout(_: User) -> None:
    raise HTTPException(status_code=503, detail="payment provider is not configured")


@router.get("/wallet", response_model=WalletSummary)
async def wallet(db: Db, user: User) -> WalletSummary:
    balance = await db.scalar(
        select(func.coalesce(func.sum(WalletEntry.amount_minor), 0)).where(WalletEntry.user_id == user.id)
    )
    return WalletSummary(currency="INR", balance_minor=int(balance or 0))


@router.get("/wallet/entries", response_model=list[WalletEntryRead])
async def wallet_entries(db: Db, user: User, limit: int = Query(default=50, ge=1, le=100)) -> list[WalletEntry]:
    return list(
        (
            await db.scalars(
                select(WalletEntry)
                .where(WalletEntry.user_id == user.id)
                .order_by(WalletEntry.created_at.desc())
                .limit(limit)
            )
        ).all()
    )


@router.get("/invoices", response_model=list[InvoiceRead])
async def invoices(db: Db, user: User) -> list[Invoice]:
    return list(
        (await db.scalars(select(Invoice).where(Invoice.user_id == user.id).order_by(Invoice.issued_at.desc()))).all()
    )


@router.get("/referrals")
async def referrals(db: Db, user: User) -> dict[str, object]:
    code = await db.scalar(select(ReferralCode).where(ReferralCode.owner_id == user.id))
    if code is None:
        code = ReferralCode(owner_id=user.id, code=uuid4().hex[:10].upper())
        db.add(code)
        await db.commit()
        await db.refresh(code)
    return {"code": code.code, "active": code.active}


@router.get("/notifications")
async def notifications(db: Db, user: User, limit: int = Query(default=50, ge=1, le=100)) -> dict[str, object]:
    items = list(
        (
            await db.scalars(
                select(Notification)
                .where(Notification.user_id == user.id)
                .order_by(Notification.created_at.desc())
                .limit(limit)
            )
        ).all()
    )
    return {
        "items": [
            {
                "id": item.id,
                "kind": item.kind,
                "title": item.title,
                "body": item.body,
                "data": item.data,
                "read_at": item.read_at,
                "created_at": item.created_at,
            }
            for item in items
        ],
        "next_cursor": None,
    }


@router.post("/notifications/{notification_id}/read", status_code=204)
async def mark_notification_read(notification_id: UUID, db: Db, user: User) -> None:
    notification = await db.get(Notification, notification_id)
    if notification is None or notification.user_id != user.id:
        raise HTTPException(status_code=404, detail="notification not found")
    notification.read_at = datetime.now(UTC)
    await db.commit()


@router.get("/dashboard/student")
async def student_dashboard(db: Db, user: User) -> dict[str, int]:
    profile = await db.get(Profile, user.id)
    if profile is None or profile.role != "student" or profile.onboarding_status != "complete":
        raise HTTPException(status_code=403, detail="completed student profile required")
    completed_bookings = await db.scalar(
        select(func.count()).select_from(Booking).where(Booking.student_id == user.id, Booking.status == "completed")
    )
    active_courses = await db.scalar(
        select(func.count())
        .select_from(Enrollment)
        .where(Enrollment.student_id == user.id, Enrollment.status == "active")
    )
    return {"completed_bookings": int(completed_bookings or 0), "active_courses": int(active_courses or 0)}


@router.get("/dashboard/mentor")
async def mentor_dashboard(db: Db, user: User) -> dict[str, int]:
    profile = await db.get(Profile, user.id)
    if profile is None or profile.role != "mentor" or profile.onboarding_status != "complete":
        raise HTTPException(status_code=403, detail="completed mentor profile required")
    completed, earnings = (
        await db.execute(
            select(func.count(), func.coalesce(func.sum(Booking.amount_minor - Booking.platform_fee_minor), 0)).where(
                Booking.mentor_id == user.id, Booking.status == "completed"
            )
        )
    ).one()
    return {"completed_bookings": int(completed), "earnings_minor": int(earnings)}
