# Upskillink backend

FastAPI API for the Upskillink Next.js application. Supabase provides PostgreSQL, Auth, Storage, and Realtime.

## Local setup

1. Install Python 3.13 and [uv](https://docs.astral.sh/uv/).
2. Copy `.env.example` to `.env` and set development-project values.
3. Install and validate:

```powershell
uv sync
uv run uvicorn app.main:app --reload
uv run ruff check .
uv run mypy app
uv run pytest
```

OpenAPI is available at `http://127.0.0.1:8000/docs`. Never place the Supabase secret key or database password in frontend environment variables.

