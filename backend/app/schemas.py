from datetime import datetime, time
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, model_validator


class ORMModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class OnboardingInput(BaseModel):
    role: Literal["student", "mentor"]
    first_name: str = Field(min_length=1, max_length=80)
    last_name: str = Field(min_length=1, max_length=80)
    username: str | None = Field(default=None, pattern=r"^[A-Za-z0-9_]{3,40}$")
    phone: str | None = Field(default=None, max_length=40)
    location: str | None = Field(default=None, max_length=160)
    bio: str | None = Field(default=None, max_length=2000)
    skill_ids: list[UUID] = Field(default_factory=list, max_length=20)
    headline: str | None = Field(default=None, max_length=200)
    hourly_rate_minor: int = Field(default=0, ge=0, le=10_000_000)
    currency: str = Field(default="INR", min_length=3, max_length=3)
    languages: list[str] = Field(default_factory=list, max_length=20)
    professions: list[str] = Field(default_factory=list, max_length=20)
    companies: list[str] = Field(default_factory=list, max_length=20)


class ProfileUpdate(BaseModel):
    first_name: str | None = Field(default=None, max_length=80)
    last_name: str | None = Field(default=None, max_length=80)
    username: str | None = Field(default=None)
    phone: str | None = Field(default=None, max_length=40)
    location: str | None = Field(default=None, max_length=160)
    avatar_path: str | None = Field(default=None, max_length=500)
    bio: str | None = Field(default=None, max_length=2000)
    headline: str | None = Field(default=None, max_length=200)
    languages: list[str] | None = Field(default=None)
    professions: list[str] | None = Field(default=None)
    companies: list[str] | None = Field(default=None)

    @model_validator(mode="before")
    @classmethod
    def clean_empty_strings(cls, data: object) -> object:
        if isinstance(data, dict):
            return {k: (None if v == "" else v) for k, v in data.items()}
        return data


class ProfileRead(ORMModel):
    id: UUID
    role: str
    onboarding_status: str
    first_name: str
    last_name: str
    username: str | None
    phone: str | None
    location: str | None
    avatar_path: str | None
    bio: str | None


class MentorSelfRead(ORMModel):
    profile_id: UUID
    headline: str | None
    bio: str | None
    hourly_rate_minor: int
    currency: str
    languages: list[str]
    professions: list[str]
    companies: list[str]
    approval_status: str
    rejection_reason: str | None


class MentorSelfUpdate(BaseModel):
    headline: str | None = Field(default=None, max_length=200)
    bio: str | None = Field(default=None, max_length=2000)
    hourly_rate_minor: int | None = Field(default=None, ge=0, le=10_000_000)
    currency: str | None = Field(default=None, min_length=3, max_length=3)
    languages: list[str] | None = Field(default=None, max_length=20)
    professions: list[str] | None = Field(default=None, max_length=20)
    companies: list[str] | None = Field(default=None, max_length=20)


class MeRead(ProfileRead):
    skills: list["SkillRead"] = Field(default_factory=list)
    mentor: MentorSelfRead | None = None


class SettingsInput(BaseModel):
    notify_activity: bool = True
    weekly_digest: bool = True
    notify_collaborations: bool = True
    theme: Literal["light", "dark", "system"] = "system"
    tour_completed: bool = False


class SettingsRead(SettingsInput):
    model_config = ConfigDict(from_attributes=True)
    user_id: UUID


class SkillRead(ORMModel):
    id: UUID
    slug: str
    name: str


class MentorRead(BaseModel):
    id: UUID
    first_name: str
    last_name: str
    username: str | None
    avatar_path: str | None
    headline: str | None
    bio: str | None
    hourly_rate_minor: int
    currency: str
    languages: list[str]
    professions: list[str]
    companies: list[str]
    average_rating: float = 0
    review_count: int = 0


class AvailabilityInput(BaseModel):
    weekday: int = Field(ge=0, le=6)
    starts_at: time
    ends_at: time
    timezone: str = Field(default="Asia/Kolkata", min_length=1, max_length=100)

    @model_validator(mode="after")
    def validate_times(self) -> "AvailabilityInput":
        if self.starts_at >= self.ends_at:
            raise ValueError("starts_at must be before ends_at")
        return self


class AvailabilityRead(AvailabilityInput):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    mentor_id: UUID
    active: bool


class LessonRequestCreate(BaseModel):
    preferred_mentor_id: UUID | None = None
    skill_id: UUID | None = None
    title: str = Field(min_length=3, max_length=160)
    description: str = Field(min_length=10, max_length=5000)
    requested_start: datetime
    requested_end: datetime
    proposed_amount_minor: int = Field(ge=0, le=100_000_000)
    currency: str = Field(default="INR", min_length=3, max_length=3)

    @model_validator(mode="after")
    def validate_times(self) -> "LessonRequestCreate":
        if self.requested_start >= self.requested_end:
            raise ValueError("requested_start must be before requested_end")
        return self


class LessonRequestRead(LessonRequestCreate):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    student_id: UUID
    status: str
    created_at: datetime


class LessonRequestUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=3, max_length=160)
    description: str | None = Field(default=None, min_length=10, max_length=5000)
    proposed_amount_minor: int | None = Field(default=None, ge=0, le=100_000_000)
    currency: str | None = Field(default=None, min_length=3, max_length=3)


class OfferCreate(BaseModel):
    amount_minor: int = Field(ge=0, le=100_000_000)
    currency: str = Field(default="INR", min_length=3, max_length=3)
    note: str | None = Field(default=None, max_length=2000)


class OfferRead(OfferCreate):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    request_id: UUID
    mentor_id: UUID
    status: str
    created_at: datetime


class OfferStatusInput(BaseModel):
    status: Literal["withdrawn", "rejected"]


class BookingRead(ORMModel):
    id: UUID
    request_id: UUID
    accepted_offer_id: UUID | None
    student_id: UUID
    mentor_id: UUID
    starts_at: datetime
    ends_at: datetime
    amount_minor: int
    platform_fee_minor: int
    currency: str
    status: str
    cancellation_reason: str | None
    created_at: datetime
    student_name: str | None = None
    mentor_name: str | None = None


class BookingStatusInput(BaseModel):
    status: Literal["confirmed", "in_progress", "completed", "cancelled", "disputed"]
    reason: str | None = Field(default=None, max_length=1000)


class ReviewCreate(BaseModel):
    rating: int = Field(ge=1, le=5)
    comment: str | None = Field(default=None, max_length=3000)


class ReviewRead(ReviewCreate):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    booking_id: UUID
    student_id: UUID
    mentor_id: UUID
    created_at: datetime


class CommunityRead(ORMModel):
    id: UUID
    slug: str
    name: str
    description: str
    image_path: str | None
    tags: list[str]


class ConversationParticipantRead(BaseModel):
    id: UUID
    first_name: str
    last_name: str
    avatar_path: str | None = None
    role: str | None = None


class ConversationRead(ORMModel):
    id: UUID
    kind: str
    booking_id: UUID | None
    community_id: UUID | None
    title: str | None
    created_at: datetime
    other_participant: ConversationParticipantRead | None = None


class MessageCreate(BaseModel):
    body: str = Field(min_length=1, max_length=5000)


class MessageRead(MessageCreate):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    conversation_id: UUID
    sender_id: UUID
    created_at: datetime
    edited_at: datetime | None


class PlanRead(ORMModel):
    id: UUID
    slug: str
    name: str
    price_minor: int
    currency: str
    billing_interval: str
    features: list[str]


class CourseRead(ORMModel):
    id: UUID
    mentor_id: UUID | None
    skill_id: UUID | None
    slug: str
    title: str
    description: str
    image_path: str | None
    status: str


class EnrollmentRead(ORMModel):
    id: UUID
    course_id: UUID
    student_id: UUID
    status: str
    enrolled_at: datetime
    completed_at: datetime | None


class SubscriptionRead(ORMModel):
    id: UUID
    user_id: UUID
    plan_id: UUID
    status: str
    current_period_start: datetime | None
    current_period_end: datetime | None


class WalletSummary(BaseModel):
    currency: str
    balance_minor: int


class WalletEntryRead(ORMModel):
    id: UUID
    amount_minor: int
    currency: str
    kind: str
    reference_id: UUID | None
    created_at: datetime


class InvoiceRead(ORMModel):
    id: UUID
    number: str
    storage_path: str | None
    issued_at: datetime


class RoleChangeInput(BaseModel):
    role: Literal["student", "mentor"]
    reason: str = Field(min_length=3, max_length=1000)


class EventCreate(BaseModel):
    slug: str = Field(min_length=3, max_length=80)
    name: str = Field(min_length=3, max_length=160)
    description: str = Field(min_length=10, max_length=5000)
    event_date: datetime
    location: str = Field(default="Online / Hybrid", max_length=200)
    image_path: str | None = None
    status: Literal["draft", "published", "completed"] = "published"


class EventRead(ORMModel):
    id: UUID
    slug: str
    name: str
    description: str
    event_date: datetime
    location: str
    image_path: str | None
    status: str
    created_at: datetime
class EventUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=3, max_length=160)
    description: str | None = Field(default=None, min_length=10, max_length=5000)
    event_date: datetime | None = None
    location: str | None = Field(default=None, max_length=200)
    image_path: str | None = None
    status: Literal["draft", "published", "completed"] | None = None


class ParticipantRead(BaseModel):
    user_id: UUID
    first_name: str
    last_name: str
    phone: str | None
    role: str
    registration_status: str
    checkin_status: str
    tokens_allocated: bool
    jule_balance: int


class AdminRequestRead(BaseModel):
    id: UUID
    mentee_name: str
    mentor_name: str
    event_name: str | None
    tokens_used: int
    status: str
    created_at: datetime


class RequestStatusOverride(BaseModel):
    status: Literal["pending", "accepted", "rejected", "completed", "cancelled"]


class JuleWalletRead(BaseModel):
    user_id: UUID
    balance: int
    updated_at: datetime


class JuleTransactionRead(ORMModel):
    id: UUID
    user_id: UUID
    event_id: UUID | None
    amount: int
    transaction_type: str
    related_mentor_id: UUID | None
    notes: str | None
    created_at: datetime


class TokenAdjustInput(BaseModel):
    user_id: UUID
    amount: int
    notes: str = Field(default="Admin Adjustment", max_length=500)


class MentorshipRequestCreate(BaseModel):
    mentor_id: UUID
    event_id: UUID | None = None
    tokens_used: int = Field(default=10, ge=1, le=100)
    note: str | None = Field(default=None, max_length=2000)


class MentorshipRequestRead(ORMModel):
    id: UUID
    mentee_id: UUID
    mentor_id: UUID
    event_id: UUID | None
    tokens_used: int
    status: str
    note: str | None
    duration_minutes: int | None = None
    created_at: datetime
    updated_at: datetime
    mentee_name: str | None = None
    mentor_name: str | None = None
    mentor_avatar: str | None = None
    mentor_headline: str | None = None


class MentorshipRequestActionInput(BaseModel):
    action: Literal["accept", "reject", "complete", "cancel"]
    reason: str | None = Field(default=None, max_length=1000)
    # Sent with `complete` so the public hours counter has a real figure to sum.
    duration_minutes: int | None = Field(default=None, gt=0, le=1440)


class CreateMentorInput(BaseModel):
    email: str
    first_name: str
    last_name: str
    headline: str | None = None
    bio: str | None = None
    professions: list[str] = Field(default_factory=list)
    companies: list[str] = Field(default_factory=list)


class BugReportCreate(BaseModel):
    title: str = Field(min_length=3, max_length=200)
    description: str = Field(min_length=5, max_length=5000)


class BugReportRead(ORMModel):
    id: UUID
    reporter_id: UUID
    reporter_name: str | None = None
    reporter_email: str | None = None
    reporter_role: str | None = None
    title: str
    description: str
    status: str
    admin_notes: str | None = None
    created_at: datetime
    updated_at: datetime


class BugReportStatusUpdate(BaseModel):
    status: Literal["open", "in_progress", "resolved", "closed"]
    admin_notes: str | None = Field(default=None, max_length=2000)


