from datetime import UTC, datetime
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, Header, HTTPException, Query
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth import CurrentUser, get_current_user
from app.db import get_db
from app.domain import ensure_transition
from app.models import Booking, IdempotencyKey, LessonOffer, LessonRequest, MentorProfile, Profile, Review
from app.schemas import (
    BookingRead,
    BookingStatusInput,
    LessonRequestCreate,
    LessonRequestRead,
    OfferCreate,
    OfferRead,
    OfferStatusInput,
    ReviewCreate,
    ReviewRead,
)

router = APIRouter(tags=["bookings"])
Db = Annotated[AsyncSession, Depends(get_db)]
User = Annotated[CurrentUser, Depends(get_current_user)]


async def require_role(db: AsyncSession, user: CurrentUser, role: str) -> Profile:
    profile = await db.get(Profile, user.id)
    if profile is None or profile.role != role or profile.onboarding_status != "complete":
        raise HTTPException(status_code=403, detail=f"completed {role} profile required")
    return profile


@router.post("/lesson-requests", response_model=LessonRequestRead, status_code=201)
async def create_lesson_request(payload: LessonRequestCreate, db: Db, user: User) -> LessonRequest:
    await require_role(db, user, "student")
    if payload.preferred_mentor_id:
        mentor = await db.get(MentorProfile, payload.preferred_mentor_id)
        if mentor is None or mentor.approval_status != "approved":
            raise HTTPException(status_code=422, detail="preferred mentor is unavailable")
    request = LessonRequest(
        student_id=user.id,
        preferred_mentor_id=payload.preferred_mentor_id,
        skill_id=payload.skill_id,
        title=payload.title,
        description=payload.description,
        requested_start=payload.requested_start,
        requested_end=payload.requested_end,
        proposed_amount_minor=payload.proposed_amount_minor,
        currency=payload.currency.upper(),
    )
    db.add(request)
    await db.commit()
    await db.refresh(request)
    return request


@router.get("/lesson-requests")
async def list_lesson_requests(db: Db, user: User, limit: int = Query(default=50, ge=1, le=100)) -> dict[str, object]:
    profile = await db.get(Profile, user.id)
    if profile is None or profile.onboarding_status != "complete" or profile.role not in {"student", "mentor"}:
        raise HTTPException(status_code=403, detail="completed profile required")
    statement = select(LessonRequest).order_by(LessonRequest.created_at.desc()).limit(limit)
    if profile.role == "student":
        statement = statement.where(LessonRequest.student_id == user.id)
    else:
        statement = statement.where(
            LessonRequest.status.in_(["open", "negotiating"]),
            (LessonRequest.preferred_mentor_id.is_(None)) | (LessonRequest.preferred_mentor_id == user.id),
        )
    items = list((await db.scalars(statement)).all())
    return {"items": [LessonRequestRead.model_validate(item) for item in items], "next_cursor": None}


@router.get("/offers")
async def list_offers(db: Db, user: User, limit: int = Query(default=50, ge=1, le=100)) -> dict[str, object]:
    profile = await db.get(Profile, user.id)
    if profile is None:
        raise HTTPException(status_code=403, detail="profile required")
    statement = select(LessonOffer).order_by(LessonOffer.created_at.desc()).limit(limit)
    if profile.role == "mentor":
        statement = statement.where(LessonOffer.mentor_id == user.id)
    else:
        statement = statement.join(LessonRequest, LessonRequest.id == LessonOffer.request_id).where(
            LessonRequest.student_id == user.id
        )
    items = list((await db.scalars(statement)).all())
    return {"items": [OfferRead.model_validate(item) for item in items], "next_cursor": None}


@router.post("/lesson-requests/{request_id}/offers", response_model=OfferRead, status_code=201)
async def create_offer(request_id: UUID, payload: OfferCreate, db: Db, user: User) -> LessonOffer:
    await require_role(db, user, "mentor")
    mentor = await db.get(MentorProfile, user.id)
    if mentor is None or mentor.approval_status != "approved":
        raise HTTPException(status_code=403, detail="approved mentor profile required")
    request = await db.get(LessonRequest, request_id, with_for_update=True)
    if request is None or request.status not in {"open", "negotiating"}:
        raise HTTPException(status_code=409, detail="lesson request is not open")
    if request.preferred_mentor_id and request.preferred_mentor_id != user.id:
        raise HTTPException(status_code=403, detail="lesson request is assigned to another mentor")
    existing = await db.scalar(
        select(LessonOffer.id).where(
            LessonOffer.request_id == request_id, LessonOffer.mentor_id == user.id, LessonOffer.status == "pending"
        )
    )
    if existing:
        raise HTTPException(status_code=409, detail="pending offer already exists")
    offer = LessonOffer(
        request_id=request_id,
        mentor_id=user.id,
        amount_minor=payload.amount_minor,
        currency=payload.currency.upper(),
        note=payload.note,
    )
    request.status = "negotiating"
    request.updated_at = datetime.now(UTC)
    db.add(offer)
    await db.commit()
    await db.refresh(offer)
    return offer


@router.post("/offers/{offer_id}/accept", response_model=BookingRead, status_code=201)
async def accept_offer(
    offer_id: UUID,
    db: Db,
    user: User,
    idempotency_key: Annotated[str, Header(alias="Idempotency-Key", min_length=8, max_length=100)],
) -> Booking:
    await require_role(db, user, "student")
    previous = await db.get(IdempotencyKey, (user.id, idempotency_key))
    if previous and previous.operation == "accept_offer" and previous.resource_id:
        booking = await db.get(Booking, previous.resource_id)
        if booking:
            return booking

    offer = await db.get(LessonOffer, offer_id, with_for_update=True)
    if offer is None or offer.status != "pending":
        raise HTTPException(status_code=409, detail="offer is no longer available")
    request = await db.get(LessonRequest, offer.request_id, with_for_update=True)
    if request is None or request.student_id != user.id or request.status not in {"open", "negotiating"}:
        raise HTTPException(status_code=403, detail="lesson request cannot be accepted")

    booking = Booking(
        request_id=request.id,
        accepted_offer_id=offer.id,
        student_id=request.student_id,
        mentor_id=offer.mentor_id,
        starts_at=request.requested_start,
        ends_at=request.requested_end,
        amount_minor=offer.amount_minor,
        currency=offer.currency,
    )
    db.add(booking)
    await db.flush()
    request.status = "accepted"
    request.updated_at = datetime.now(UTC)
    offer.status = "accepted"
    offer.updated_at = datetime.now(UTC)
    await db.execute(
        update(LessonOffer)
        .where(LessonOffer.request_id == request.id, LessonOffer.id != offer.id, LessonOffer.status == "pending")
        .values(status="rejected", updated_at=datetime.now(UTC))
    )
    db.add(
        IdempotencyKey(
            user_id=user.id,
            key=idempotency_key,
            operation="accept_offer",
            resource_id=booking.id,
            response_status=201,
        )
    )
    await db.commit()
    await db.refresh(booking)
    return booking


@router.post("/offers/{offer_id}/status", response_model=OfferRead)
async def update_offer_status(offer_id: UUID, payload: OfferStatusInput, db: Db, user: User) -> LessonOffer:
    offer = await db.get(LessonOffer, offer_id, with_for_update=True)
    if offer is None or offer.status != "pending":
        raise HTTPException(status_code=409, detail="offer is no longer available")
    request = await db.get(LessonRequest, offer.request_id)
    allowed = payload.status == "withdrawn" and offer.mentor_id == user.id
    allowed = allowed or (payload.status == "rejected" and request is not None and request.student_id == user.id)
    if not allowed:
        raise HTTPException(status_code=403, detail="offer cannot be updated")
    offer.status = payload.status
    offer.updated_at = datetime.now(UTC)
    await db.commit()
    await db.refresh(offer)
    return offer


@router.get("/bookings")
async def list_bookings(db: Db, user: User, limit: int = Query(default=50, ge=1, le=100)) -> dict[str, object]:
    items = list(
        (
            await db.scalars(
                select(Booking)
                .where((Booking.student_id == user.id) | (Booking.mentor_id == user.id))
                .order_by(Booking.starts_at.desc())
                .limit(limit)
            )
        ).all()
    )
    return {"items": [BookingRead.model_validate(item) for item in items], "next_cursor": None}


@router.post("/bookings/{booking_id}/status", response_model=BookingRead)
async def update_booking_status(booking_id: UUID, payload: BookingStatusInput, db: Db, user: User) -> Booking:
    booking = await db.get(Booking, booking_id, with_for_update=True)
    if booking is None or user.id not in {booking.student_id, booking.mentor_id}:
        raise HTTPException(status_code=404, detail="booking not found")
    if payload.status == "confirmed":
        raise HTTPException(status_code=503, detail="payment provider is not configured")
    if payload.status in {"in_progress", "completed"} and user.id != booking.mentor_id:
        raise HTTPException(status_code=403, detail="only the mentor can update lesson progress")
    ensure_transition(booking.status, payload.status)
    booking.status = payload.status
    booking.cancellation_reason = payload.reason if payload.status in {"cancelled", "disputed"} else None
    booking.updated_at = datetime.now(UTC)
    await db.commit()
    await db.refresh(booking)
    return booking


@router.post("/bookings/{booking_id}/reviews", response_model=ReviewRead, status_code=201)
async def create_review(booking_id: UUID, payload: ReviewCreate, db: Db, user: User) -> Review:
    booking = await db.get(Booking, booking_id)
    if booking is None or booking.student_id != user.id:
        raise HTTPException(status_code=404, detail="booking not found")
    if booking.status != "completed":
        raise HTTPException(status_code=409, detail="only completed bookings can be reviewed")
    if await db.scalar(select(Review.id).where(Review.booking_id == booking_id)):
        raise HTTPException(status_code=409, detail="booking already reviewed")
    review = Review(
        booking_id=booking.id,
        student_id=user.id,
        mentor_id=booking.mentor_id,
        rating=payload.rating,
        comment=payload.comment,
    )
    db.add(review)
    await db.commit()
    await db.refresh(review)
    return review


@router.get("/reviews")
async def list_reviews(db: Db, user: User, limit: int = Query(default=50, ge=1, le=100)) -> dict[str, object]:
    items = list(
        (
            await db.scalars(
                select(Review)
                .where((Review.student_id == user.id) | (Review.mentor_id == user.id))
                .order_by(Review.created_at.desc())
                .limit(limit)
            )
        ).all()
    )
    return {"items": [ReviewRead.model_validate(item) for item in items], "next_cursor": None}


@router.post("/bookings/{booking_id}/meeting")
async def create_meeting(booking_id: UUID, db: Db, user: User) -> None:
    booking = await db.get(Booking, booking_id)
    if booking is None or user.id not in {booking.student_id, booking.mentor_id}:
        raise HTTPException(status_code=404, detail="booking not found")
    raise HTTPException(status_code=503, detail="video provider is not configured")
