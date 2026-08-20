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

## Database migrations — apply before starting the API

The API **never creates tables at startup**. `Base.metadata.create_all` was removed
because tables created that way arrive without the RLS policies the migrations
attach. The schema is owned entirely by `supabase/migrations/`.

Apply migrations first, then start the API:

```powershell
supabase db push          # remote project
supabase migration up --local   # local stack
```

If the database is missing a required table the API **refuses to boot** with a
message naming exactly which tables are absent, and `GET /health/ready` returns
503 with the same detail. This is deliberate: a half-migrated deployment fails
visibly at start rather than serving 500s to attendees mid-event.

The required set lives in `REQUIRED_TABLES` in `app/main.py`. Add to it whenever a
new table becomes load-bearing.

### Deploy order

1. `supabase db push`
2. Deploy the API (Render picks up `render.yaml`)
3. Confirm `GET /health/ready` returns `{"status": "ready"}`

Step 3 is the gate. A `503` naming missing tables means step 1 did not run.

## Admin bootstrap

`create_admin_user.py` reads `ADMIN_EMAIL` and `ADMIN_PASSWORD` from the
environment — credentials are never hard-coded. Set them locally, run once, and
do not commit real values:

```powershell
$env:ADMIN_EMAIL="you@example.com"; $env:ADMIN_PASSWORD="<strong-password>"
uv run python create_admin_user.py
```

## Tests

```powershell
uv run pytest
```

`tests/test_jule_ledger.py` asserts the SRS §49 acceptance loop end to end —
check-in grants 50 tokens exactly once, requests deduct and record, rejections
refund, and a mentee cannot action their own request.
`tests/test_admin_access.py` asserts that every admin endpoint refuses
non-admins. The suite runs the real routers and models against SQLite, with the
two Postgres-only column types mapped to JSON for the test session.

## Running locally on Windows

psycopg's async mode cannot use Windows' default `ProactorEventLoop`. `uvicorn
--reload` will fail with an `InterfaceError` on connect. Either run the API in
Docker (as production does) or start it through WSL. The test suite is
unaffected — it runs on SQLite.
