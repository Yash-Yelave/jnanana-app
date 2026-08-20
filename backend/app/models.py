from datetime import datetime, time
from uuid import UUID, uuid4

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, SmallInteger, String, Text, Time, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import ARRAY, JSONB
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    pass


class Profile(Base):
    __tablename__ = "profiles"

    id: Mapped[UUID] = mapped_column(primary_key=True)
    role: Mapped[str]
    onboarding_status: Mapped[str] = mapped_column(default="incomplete")
    first_name: Mapped[str] = mapped_column(String(80))
    last_name: Mapped[str] = mapped_column(String(80))
    username: Mapped[str | None] = mapped_column(String(40), unique=True)
    phone: Mapped[str | None]
    location: Mapped[str | None]
    avatar_path: Mapped[str | None]
    bio: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class UserSettings(Base):
    __tablename__ = "user_settings"

    user_id: Mapped[UUID] = mapped_column(ForeignKey("profiles.id", ondelete="CASCADE"), primary_key=True)
    notify_activity: Mapped[bool] = mapped_column(Boolean, default=True)
    weekly_digest: Mapped[bool] = mapped_column(Boolean, default=True)
    notify_collaborations: Mapped[bool] = mapped_column(Boolean, default=True)
    theme: Mapped[str] = mapped_column(default="system")
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class Skill(Base):
    __tablename__ = "skills"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    slug: Mapped[str] = mapped_column(unique=True)
    name: Mapped[str] = mapped_column(unique=True)
    active: Mapped[bool] = mapped_column(Boolean, default=True)


class ProfileSkill(Base):
    __tablename__ = "profile_skills"

    profile_id: Mapped[UUID] = mapped_column(ForeignKey("profiles.id", ondelete="CASCADE"), primary_key=True)
    skill_id: Mapped[UUID] = mapped_column(ForeignKey("skills.id", ondelete="CASCADE"), primary_key=True)
    kind: Mapped[str] = mapped_column(primary_key=True)


class MentorProfile(Base):
    __tablename__ = "mentor_profiles"

    profile_id: Mapped[UUID] = mapped_column(ForeignKey("profiles.id", ondelete="CASCADE"), primary_key=True)
    headline: Mapped[str | None]
    bio: Mapped[str | None] = mapped_column(Text)
    hourly_rate_minor: Mapped[int] = mapped_column(Integer, default=0)
    currency: Mapped[str] = mapped_column(String(3), default="INR")
    languages: Mapped[list[str]] = mapped_column(ARRAY(String), default=list)
    professions: Mapped[list[str]] = mapped_column(ARRAY(String), default=list)
    companies: Mapped[list[str]] = mapped_column(ARRAY(String), default=list)
    approval_status: Mapped[str] = mapped_column(default="pending")
    rejection_reason: Mapped[str | None]
    approved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class MentorAvailability(Base):
    __tablename__ = "mentor_availability"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    mentor_id: Mapped[UUID] = mapped_column(ForeignKey("mentor_profiles.profile_id", ondelete="CASCADE"))
    weekday: Mapped[int] = mapped_column(SmallInteger)
    starts_at: Mapped[time] = mapped_column(Time)
    ends_at: Mapped[time] = mapped_column(Time)
    timezone: Mapped[str] = mapped_column(default="Asia/Kolkata")
    active: Mapped[bool] = mapped_column(Boolean, default=True)


class LessonRequest(Base):
    __tablename__ = "lesson_requests"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    student_id: Mapped[UUID] = mapped_column(ForeignKey("profiles.id", ondelete="CASCADE"))
    preferred_mentor_id: Mapped[UUID | None] = mapped_column(
        ForeignKey("mentor_profiles.profile_id", ondelete="SET NULL")
    )
    skill_id: Mapped[UUID | None] = mapped_column(ForeignKey("skills.id", ondelete="SET NULL"))
    title: Mapped[str] = mapped_column(String(160))
    description: Mapped[str] = mapped_column(Text)
    requested_start: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    requested_end: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    proposed_amount_minor: Mapped[int] = mapped_column(Integer)
    currency: Mapped[str] = mapped_column(String(3), default="INR")
    status: Mapped[str] = mapped_column(default="open")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class LessonOffer(Base):
    __tablename__ = "lesson_offers"
    __table_args__ = (UniqueConstraint("request_id", "mentor_id", "status"),)

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    request_id: Mapped[UUID] = mapped_column(ForeignKey("lesson_requests.id", ondelete="CASCADE"))
    mentor_id: Mapped[UUID] = mapped_column(ForeignKey("mentor_profiles.profile_id", ondelete="CASCADE"))
    amount_minor: Mapped[int] = mapped_column(Integer)
    currency: Mapped[str] = mapped_column(String(3), default="INR")
    note: Mapped[str | None] = mapped_column(Text)
    status: Mapped[str] = mapped_column(default="pending")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class Booking(Base):
    __tablename__ = "bookings"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    request_id: Mapped[UUID] = mapped_column(ForeignKey("lesson_requests.id", ondelete="RESTRICT"), unique=True)
    accepted_offer_id: Mapped[UUID | None] = mapped_column(
        ForeignKey("lesson_offers.id", ondelete="RESTRICT"), unique=True
    )
    student_id: Mapped[UUID] = mapped_column(ForeignKey("profiles.id", ondelete="RESTRICT"))
    mentor_id: Mapped[UUID] = mapped_column(ForeignKey("mentor_profiles.profile_id", ondelete="RESTRICT"))
    starts_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    ends_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    amount_minor: Mapped[int] = mapped_column(Integer)
    platform_fee_minor: Mapped[int] = mapped_column(Integer, default=0)
    currency: Mapped[str] = mapped_column(String(3), default="INR")
    status: Mapped[str] = mapped_column(default="pending_payment")
    cancellation_reason: Mapped[str | None]
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class Review(Base):
    __tablename__ = "reviews"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    booking_id: Mapped[UUID] = mapped_column(ForeignKey("bookings.id", ondelete="RESTRICT"), unique=True)
    student_id: Mapped[UUID] = mapped_column(ForeignKey("profiles.id", ondelete="RESTRICT"))
    mentor_id: Mapped[UUID] = mapped_column(ForeignKey("mentor_profiles.profile_id", ondelete="RESTRICT"))
    rating: Mapped[int] = mapped_column(SmallInteger)
    comment: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class Course(Base):
    __tablename__ = "courses"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    mentor_id: Mapped[UUID | None] = mapped_column(ForeignKey("mentor_profiles.profile_id", ondelete="SET NULL"))
    skill_id: Mapped[UUID | None] = mapped_column(ForeignKey("skills.id", ondelete="SET NULL"))
    slug: Mapped[str] = mapped_column(unique=True)
    title: Mapped[str]
    description: Mapped[str] = mapped_column(Text)
    image_path: Mapped[str | None]
    status: Mapped[str] = mapped_column(default="draft")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class Enrollment(Base):
    __tablename__ = "enrollments"
    __table_args__ = (UniqueConstraint("course_id", "student_id"),)

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    course_id: Mapped[UUID] = mapped_column(ForeignKey("courses.id", ondelete="CASCADE"))
    student_id: Mapped[UUID] = mapped_column(ForeignKey("profiles.id", ondelete="CASCADE"))
    status: Mapped[str] = mapped_column(default="active")
    enrolled_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))


class Community(Base):
    __tablename__ = "communities"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    slug: Mapped[str] = mapped_column(unique=True)
    name: Mapped[str]
    description: Mapped[str] = mapped_column(Text)
    image_path: Mapped[str | None]
    tags: Mapped[list[str]] = mapped_column(ARRAY(String), default=list)
    active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class CommunityMember(Base):
    __tablename__ = "community_members"

    community_id: Mapped[UUID] = mapped_column(ForeignKey("communities.id", ondelete="CASCADE"), primary_key=True)
    user_id: Mapped[UUID] = mapped_column(ForeignKey("profiles.id", ondelete="CASCADE"), primary_key=True)
    role: Mapped[str] = mapped_column(default="member")
    joined_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class Conversation(Base):
    __tablename__ = "conversations"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    kind: Mapped[str]
    booking_id: Mapped[UUID | None] = mapped_column(ForeignKey("bookings.id", ondelete="CASCADE"), unique=True)
    community_id: Mapped[UUID | None] = mapped_column(ForeignKey("communities.id", ondelete="CASCADE"), unique=True)
    title: Mapped[str | None]
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class ConversationMember(Base):
    __tablename__ = "conversation_members"

    conversation_id: Mapped[UUID] = mapped_column(ForeignKey("conversations.id", ondelete="CASCADE"), primary_key=True)
    user_id: Mapped[UUID] = mapped_column(ForeignKey("profiles.id", ondelete="CASCADE"), primary_key=True)
    joined_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    last_read_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))


class Message(Base):
    __tablename__ = "messages"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    conversation_id: Mapped[UUID] = mapped_column(ForeignKey("conversations.id", ondelete="CASCADE"))
    sender_id: Mapped[UUID] = mapped_column(ForeignKey("profiles.id", ondelete="RESTRICT"))
    body: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    edited_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))


class Plan(Base):
    __tablename__ = "plans"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    slug: Mapped[str] = mapped_column(unique=True)
    name: Mapped[str]
    price_minor: Mapped[int] = mapped_column(Integer)
    currency: Mapped[str] = mapped_column(String(3), default="INR")
    billing_interval: Mapped[str] = mapped_column(default="month")
    features: Mapped[list[str]] = mapped_column(JSONB, default=list)
    active: Mapped[bool] = mapped_column(Boolean, default=True)


class Subscription(Base):
    __tablename__ = "subscriptions"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    user_id: Mapped[UUID] = mapped_column(ForeignKey("profiles.id", ondelete="CASCADE"))
    plan_id: Mapped[UUID] = mapped_column(ForeignKey("plans.id", ondelete="RESTRICT"))
    status: Mapped[str] = mapped_column(default="pending")
    provider: Mapped[str | None]
    provider_subscription_id: Mapped[str | None] = mapped_column(unique=True)
    current_period_start: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    current_period_end: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class ReferralCode(Base):
    __tablename__ = "referral_codes"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    owner_id: Mapped[UUID] = mapped_column(ForeignKey("profiles.id", ondelete="CASCADE"), unique=True)
    code: Mapped[str] = mapped_column(unique=True)
    active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class WalletEntry(Base):
    __tablename__ = "wallet_entries"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    user_id: Mapped[UUID] = mapped_column(ForeignKey("profiles.id", ondelete="RESTRICT"))
    amount_minor: Mapped[int] = mapped_column(Integer)
    currency: Mapped[str] = mapped_column(String(3), default="INR")
    kind: Mapped[str]
    reference_id: Mapped[UUID | None]
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class Invoice(Base):
    __tablename__ = "invoices"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    user_id: Mapped[UUID] = mapped_column(ForeignKey("profiles.id", ondelete="RESTRICT"))
    payment_id: Mapped[UUID] = mapped_column(unique=True)
    number: Mapped[str] = mapped_column(unique=True)
    storage_path: Mapped[str | None]
    issued_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class Notification(Base):
    __tablename__ = "notifications"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    user_id: Mapped[UUID] = mapped_column(ForeignKey("profiles.id", ondelete="CASCADE"))
    kind: Mapped[str]
    title: Mapped[str]
    body: Mapped[str] = mapped_column(Text)
    data: Mapped[dict[str, object]] = mapped_column(JSONB, default=dict)
    read_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class IdempotencyKey(Base):
    __tablename__ = "idempotency_keys"
    __table_args__ = {"schema": "private"}

    user_id: Mapped[UUID] = mapped_column(primary_key=True)
    key: Mapped[str] = mapped_column(primary_key=True)
    operation: Mapped[str]
    resource_id: Mapped[UUID | None]
    response_status: Mapped[int | None]
    response_body: Mapped[dict[str, object] | None] = mapped_column(JSONB)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class AuditEvent(Base):
    __tablename__ = "audit_events"
    __table_args__ = {"schema": "private"}

    id: Mapped[int] = mapped_column(primary_key=True)
    actor_id: Mapped[UUID | None] = mapped_column(ForeignKey("profiles.id", ondelete="SET NULL"))
    action: Mapped[str]
    entity_type: Mapped[str]
    entity_id: Mapped[UUID | None]
    data: Mapped[dict[str, object]] = mapped_column(JSONB, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class Event(Base):
    __tablename__ = "events"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    slug: Mapped[str] = mapped_column(unique=True)
    name: Mapped[str]
    description: Mapped[str] = mapped_column(Text)
    event_date: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    location: Mapped[str] = mapped_column(default="Online / Hybrid")
    image_path: Mapped[str | None]
    status: Mapped[str] = mapped_column(default="published")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class EventParticipant(Base):
    __tablename__ = "event_participants"
    __table_args__ = (UniqueConstraint("event_id", "user_id"),)

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    event_id: Mapped[UUID] = mapped_column(ForeignKey("events.id", ondelete="CASCADE"))
    user_id: Mapped[UUID] = mapped_column(ForeignKey("profiles.id", ondelete="CASCADE"))
    registration_status: Mapped[str] = mapped_column(default="registered")
    checkin_status: Mapped[str] = mapped_column(default="pending")
    tokens_allocated: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class JuleWallet(Base):
    __tablename__ = "jule_wallets"

    user_id: Mapped[UUID] = mapped_column(ForeignKey("profiles.id", ondelete="CASCADE"), primary_key=True)
    balance: Mapped[int] = mapped_column(Integer, default=0)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class JuleTransaction(Base):
    __tablename__ = "jule_transactions"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    user_id: Mapped[UUID] = mapped_column(ForeignKey("profiles.id", ondelete="CASCADE"))
    event_id: Mapped[UUID | None] = mapped_column(ForeignKey("events.id", ondelete="SET NULL"))
    amount: Mapped[int] = mapped_column(Integer)
    transaction_type: Mapped[str]
    related_mentor_id: Mapped[UUID | None] = mapped_column(ForeignKey("mentor_profiles.profile_id", ondelete="SET NULL"))
    notes: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class MentorshipRequest(Base):
    __tablename__ = "mentorship_requests"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    mentee_id: Mapped[UUID] = mapped_column(ForeignKey("profiles.id", ondelete="CASCADE"))
    mentor_id: Mapped[UUID] = mapped_column(ForeignKey("mentor_profiles.profile_id", ondelete="CASCADE"))
    event_id: Mapped[UUID | None] = mapped_column(ForeignKey("events.id", ondelete="SET NULL"))
    tokens_used: Mapped[int] = mapped_column(Integer, default=10)
    status: Mapped[str] = mapped_column(default="pending")
    note: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

