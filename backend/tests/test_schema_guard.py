"""The app must refuse to boot against a database that has not been migrated.

Before this guard existed the app called `Base.metadata.create_all` at startup,
which silently produced tables with no RLS policies attached. Removing that
created the opposite risk — booting against an empty database and failing on the
first real request. This closes both.
"""

import pytest
from sqlalchemy.ext.asyncio import create_async_engine

from app.main import REQUIRED_TABLES, verify_schema
from app.models import Base

pytestmark = pytest.mark.asyncio


async def test_empty_database_reports_every_required_table():
    engine = create_async_engine("sqlite+aiosqlite:///:memory:")
    try:
        assert await verify_schema(engine) == list(REQUIRED_TABLES)
    finally:
        await engine.dispose()


async def test_migrated_database_reports_nothing_missing(session_factory):
    # session_factory has already materialised the required tables.
    engine = session_factory.kw["bind"]
    assert await verify_schema(engine) == []


async def test_partial_schema_names_only_what_is_missing():
    engine = create_async_engine("sqlite+aiosqlite:///:memory:")
    try:
        async with engine.begin() as conn:
            await conn.run_sync(
                Base.metadata.create_all,
                tables=[Base.metadata.tables["profiles"], Base.metadata.tables["events"]],
            )

        missing = await verify_schema(engine)

        assert "profiles" not in missing
        assert "events" not in missing
        assert "jule_wallets" in missing
        assert "mentorship_requests" in missing
    finally:
        await engine.dispose()
