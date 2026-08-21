from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from uuid import uuid4

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import inspect, text
from sqlalchemy.engine import Connection
from sqlalchemy.ext.asyncio import AsyncEngine

from app.config import get_settings
from app.db import SessionFactory, engine
from app.routers import (
    accounts,
    admin,
    events,
    jule,
    mentors,
    mentorship_requests,
    notifications,
    stats,
)

# Tables the Phase 1 product cannot operate without. The schema is owned by
# supabase/migrations — the app never creates tables at boot, because tables
# created that way arrive without the RLS policies the migrations attach.
REQUIRED_TABLES = (
    "profiles",
    "mentor_profiles",
    "events",
    "event_participants",
    "jule_wallets",
    "jule_transactions",
    "mentorship_requests",
    "notifications",
)

# Columns added by a later migration than the one that created their table.
# A table can exist while the migration that widened it never ran, and checking
# table names alone would call that healthy - then /stats and "mark complete"
# fail on the first real request, which is exactly what this guard exists to
# prevent.
REQUIRED_COLUMNS: tuple[tuple[str, str], ...] = (
    ("mentorship_requests", "duration_minutes"),
)

SCHEMA_HINT = (
    "Apply the database migrations before starting the API: "
    "`supabase db push` (or `supabase migration up --local`). "
    "See backend/supabase/migrations/."
)


def _missing_schema(sync_conn: Connection) -> list[str]:
    inspector = inspect(sync_conn)
    present = set(inspector.get_table_names())
    missing = [name for name in REQUIRED_TABLES if name not in present]

    for table, column in REQUIRED_COLUMNS:
        if table not in present:
            continue  # already reported as a missing table
        columns = {col["name"] for col in inspector.get_columns(table)}
        if column not in columns:
            missing.append(f"{table}.{column}")
    return missing


async def verify_schema(target: AsyncEngine | None = None) -> list[str]:
    """Return the required tables and columns missing from the database."""
    async with (target or engine).connect() as conn:
        return await conn.run_sync(_missing_schema)


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncIterator[None]:
    # Fail loudly at boot rather than serving 500s on the first real request.
    # Skipped under APP_ENV=test, where the suite supplies its own schema;
    # verify_schema itself is covered directly by tests/test_schema_guard.py.
    if get_settings().app_env != "test":
        missing = await verify_schema()
        if missing:
            raise RuntimeError(f"Database is missing required schema: {', '.join(missing)}. {SCHEMA_HINT}")
    yield
    await engine.dispose()


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(title="Jnanana Foundation API", version="0.1.0", lifespan=lifespan)

    @app.exception_handler(HTTPException)
    async def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
        response = JSONResponse({"detail": exc.detail}, status_code=exc.status_code)
        origin = request.headers.get("origin")
        if origin:
            response.headers["Access-Control-Allow-Origin"] = origin
            response.headers["Access-Control-Allow-Credentials"] = "true"
        return response

    @app.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
        response = JSONResponse({"detail": str(exc)}, status_code=500)
        origin = request.headers.get("origin")
        if origin:
            response.headers["Access-Control-Allow-Origin"] = origin
            response.headers["Access-Control-Allow-Credentials"] = "true"
        return response

    @app.middleware("http")
    async def request_id(request: Request, call_next):  # type: ignore[no-untyped-def]
        response = await call_next(request)
        response.headers["X-Request-ID"] = request.headers.get("X-Request-ID", str(uuid4()))
        return response

    origins = set(settings.allowed_origins + [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
    ])
    app.add_middleware(
        CORSMiddleware,
        allow_origins=list(origins),
        allow_origin_regex=r"https?://.*",
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    # SRS §44: bookings, payments, courses, subscriptions, referrals and the
    # community/chat surface are explicitly out of scope for Phase 1.
    for router in (
        accounts.router,
        admin.router,
        events.router,
        jule.router,
        jule.jools_router,
        mentors.router,
        mentorship_requests.router,
        notifications.router,
        stats.router,
    ):
        app.include_router(router, prefix=settings.api_prefix)

    @app.get("/health/live", tags=["health"])
    async def live() -> dict[str, str]:
        return {"status": "ok"}

    @app.get("/health/ready", tags=["health"])
    async def ready() -> dict[str, str]:
        try:
            async with SessionFactory() as session:
                await session.execute(text("select 1"))
        except Exception as exc:
            raise HTTPException(status_code=503, detail="database unavailable") from exc

        missing = await verify_schema()
        if missing:
            raise HTTPException(
                status_code=503,
                detail=f"database is missing required schema: {', '.join(missing)}",
            )
        return {"status": "ready"}

    return app


app = create_app()
