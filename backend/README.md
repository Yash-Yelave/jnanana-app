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

## Documentation

- [Architecture](./docs/ARCHITECTURE.md)
- [Database and RLS](./docs/DATABASE.md)
- [API contract](./docs/API.md)
- [Setup and operations](./docs/OPERATIONS.md)

The initial migration under `supabase/migrations/` has been applied to the configured development project. Repeat migration, RLS, Storage, Realtime, and advisor checks for every staging/production project.

cd D:\J_Intern\jnanana-app\backend                                                                             
  uv sync                                                                                                        
  uv run uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload             