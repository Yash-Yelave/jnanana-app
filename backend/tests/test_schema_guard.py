"""The app must refuse to boot against a database that has not been migrated.

Before this guard existed the app called `Base.metadata.create_all` at startup,
which silently produced tables with no RLS policies attached. Removing that
created the opposite risk — booting against an empty database and failing on the
first real request. This closes both.
"""

import pytest
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine

from app.main import REQUIRED_COLUMNS, REQUIRED_TABLES, verify_schema
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


async def test_table_present_but_column_missing_is_still_reported(session_factory):
    """A migration that widens a table can fail on its own.

    Checking table names alone called that healthy, so the API booted and then
    failed on the first request touching the column - the exact failure this
    guard exists to prevent.
    """
    engine = session_factory.kw["bind"]

    # Rebuild mentorship_requests without the column the later migration adds,
    # leaving every other table exactly as the fixture created it.
    async with engine.begin() as conn:
        await conn.execute(text("drop table mentorship_requests"))
        await conn.execute(
            text(
                "create table mentorship_requests ("
                "id varchar primary key, mentee_id varchar, mentor_id varchar,"
                " status varchar, tokens_used integer)"
            )
        )

    missing = await verify_schema(engine)

    assert "mentorship_requests.duration_minutes" in missing
    # The table itself exists, so it must not also be named as missing.
    assert "mentorship_requests" not in missing


async def test_every_declared_column_belongs_to_a_required_table():
    """A column guard on a table nobody checks would never run."""
    for table, _column in REQUIRED_COLUMNS:
        assert table in REQUIRED_TABLES
