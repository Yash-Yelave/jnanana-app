"""Integration test harness for the Jule token ledger and mentorship request flow.

These tests exercise the real routers and the real SQLAlchemy models. Postgres is
not available in CI, so the schema is materialised on SQLite with the two
Postgres-only column types (ARRAY, JSONB) mapped to JSON for the test session.
Everything the ledger depends on — constraints, defaults, transaction boundaries,
router logic — is the production code path.
"""

import asyncio
import sys

if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

import os
from collections.abc import AsyncIterator
from datetime import UTC, datetime
from uuid import UUID, uuid4

os.environ.setdefault("APP_ENV", "test")
os.environ.setdefault("DATABASE_URL", "postgresql+psycopg://u:p@localhost:5432/test")
os.environ.setdefault("SUPABASE_URL", "https://example.supabase.co")
os.environ.setdefault("SUPABASE_PUBLISHABLE_KEY", "pk-test")
os.environ.setdefault("SUPABASE_SECRET_KEY", "sk-test")
os.environ.setdefault("FRONTEND_URL", "http://localhost:3000")
os.environ.setdefault("CORS_ORIGINS", "http://localhost:3000")

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy import JSON
from sqlalchemy.dialects.postgresql import ARRAY, JSONB
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.auth import CurrentUser, get_current_user, get_current_user_id, require_admin
from app.db import get_db_session
from app.main import app
from app.models import Base, Event, MentorProfile, Profile

TEST_TABLES = [
    "profiles",
    "mentor_profiles",
    "events",
    "event_participants",
    "jule_wallets",
    "jule_transactions",
    "mentorship_requests",
    "notifications",
    "bug_reports",
    # joined by the mentor discovery projection for the rating aggregate
    "reviews",
]


def _sqlite_compatible_metadata() -> None:
    """Swap Postgres-only column types for JSON so the schema builds on SQLite."""
    for table in Base.metadata.tables.values():
        for column in table.columns:
            if isinstance(column.type, (ARRAY, JSONB)):
                column.type = JSON()


@pytest_asyncio.fixture
async def session_factory() -> AsyncIterator[async_sessionmaker[AsyncSession]]:
    _sqlite_compatible_metadata()
    engine = create_async_engine("sqlite+aiosqlite:///:memory:")
    tables = [Base.metadata.tables[name] for name in TEST_TABLES]

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all, tables=tables)

    factory = async_sessionmaker(engine, expire_on_commit=False)
    yield factory
    await engine.dispose()


class Actor:
    """The identity the API client authenticates as; mutable between requests."""

    def __init__(self) -> None:
        self.id: UUID = uuid4()
        self.is_admin: bool = False

    def become(self, user_id: UUID, *, admin: bool = False) -> None:
        self.id = user_id
        self.is_admin = admin


@pytest.fixture
def actor() -> Actor:
    return Actor()


@pytest_asyncio.fixture
async def client(
    session_factory: async_sessionmaker[AsyncSession], actor: Actor
) -> AsyncIterator[AsyncClient]:
    async def override_db() -> AsyncIterator[AsyncSession]:
        async with session_factory() as session:
            yield session

    async def override_user() -> CurrentUser:
        return CurrentUser(id=actor.id, is_admin=actor.is_admin)

    async def override_user_id() -> UUID:
        return actor.id

    def override_admin() -> CurrentUser:
        # Mirrors the real require_admin contract so tests still prove the guard exists.
        from fastapi import HTTPException

        if not actor.is_admin:
            raise HTTPException(status_code=403, detail="admin access required")
        return CurrentUser(id=actor.id, is_admin=True)

    app.dependency_overrides[get_db_session] = override_db
    app.dependency_overrides[get_current_user] = override_user
    app.dependency_overrides[get_current_user_id] = override_user_id
    app.dependency_overrides[require_admin] = override_admin

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test/api/v1") as ac:
        yield ac

    app.dependency_overrides.clear()


@pytest_asyncio.fixture
async def seed(session_factory: async_sessionmaker[AsyncSession]) -> dict[str, UUID]:
    """A mentee, an approved mentor, an unapproved mentor, and a published event."""
    mentee_id, mentor_id, pending_id, admin_id = uuid4(), uuid4(), uuid4(), uuid4()
    event_id = uuid4()

    async with session_factory() as session:
        session.add_all(
            [
                Profile(id=mentee_id, role="student", first_name="Asha", last_name="Rao"),
                Profile(id=mentor_id, role="mentor", first_name="JA", last_name="Sir"),
                Profile(id=pending_id, role="mentor", first_name="New", last_name="Mentor"),
                Profile(id=admin_id, role="admin", first_name="Admin", last_name="User"),
            ]
        )
        await session.flush()
        session.add_all(
            [
                MentorProfile(profile_id=mentor_id, headline="Founder", approval_status="approved"),
                MentorProfile(profile_id=pending_id, headline="Applicant", approval_status="pending"),
                Event(
                    id=event_id,
                    slug="j-spotlight-01",
                    name="J-Spotlight Edition 01",
                    description="The first Jnanana event.",
                    event_date=datetime.now(UTC),
                    location="Bengaluru",
                    status="published",
                ),
            ]
        )
        await session.commit()

    return {
        "mentee": mentee_id,
        "mentor": mentor_id,
        "pending_mentor": pending_id,
        "admin": admin_id,
        "event": event_id,
    }
