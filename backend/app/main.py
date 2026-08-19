from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from uuid import uuid4

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.config import get_settings
from app.db import SessionFactory, engine
from app.routers import accounts, admin, bookings, community, events, jule, mentors, mentorship_requests, platform



@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncIterator[None]:
    from app.models import Base
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    await engine.dispose()


from fastapi.responses import JSONResponse


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
    for router in (
        accounts.router,
        admin.router,
        bookings.router,
        community.router,
        events.router,
        jule.router,
        mentors.router,
        mentorship_requests.router,
        platform.router,
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
        return {"status": "ready"}

    return app


app = create_app()
