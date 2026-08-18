# Setup and operations

## Development setup

Prerequisites: Node.js 22+, Python 3.13, uv, and a non-production Supabase project. Docker is required only for the optional local Supabase stack.

```powershell
cd backend
Copy-Item .env.example .env
uv sync
uv run uvicorn app.main:app --reload
```

```powershell
cd frontend
Copy-Item .env.example .env.local
npm install
npm run dev
```

Set Supabase Auth Site URL to the frontend origin and add `http://localhost:3000/auth/confirm` as a development redirect URL. Use a custom SMTP provider before relying on production verification email delivery.

The frontend also requires `NEXT_PUBLIC_SITE_URL`. Supabase redirect allowlists must contain the exact `/auth/confirm` URL for each environment. Password recovery, signup confirmation, and email resend use Supabase Auth; configure production SMTP in **Supabase Dashboard → Authentication → SMTP Settings**.

## First administrator

Application users cannot grant themselves admin access. Bootstrap the first administrator by setting trusted Auth `app_metadata.role` to `admin` with the Supabase Dashboard or an authenticated server-side Admin API call. Never put `admin` in user metadata and never expose a secret/service-role key to the frontend. The administrator can then use `/admin` to approve mentors and change persisted student/mentor roles; admin elevation remains an infrastructure operation.

## Environment separation

- Use separate Supabase projects for development, automated integration testing, staging, and production.
- Never run integration tests or MCP write tools against production.
- Frontend receives only the Supabase URL, publishable key, and public FastAPI URL.
- Database password and optional Supabase secret key remain backend-only deployment secrets.
- Rotate a leaked credential immediately and invalidate/revoke affected sessions where applicable.

## Migrations

The pinned migration authoring CLI is Supabase CLI `2.114.0`. Discover command flags with `--help` before using a different version.

```powershell
cd backend
npx --yes supabase@2.114.0 login
npx --yes supabase@2.114.0 link --project-ref YOUR_PROJECT_REF
npx --yes supabase@2.114.0 db push --dry-run
npx --yes supabase@2.114.0 db push
npx --yes supabase@2.114.0 migration list
```

Before a production push:

1. Apply and test on development/staging.
2. Run database security and performance advisors.
3. Inspect the SQL and generated diff.
4. Back up production and record a rollback/forward-fix procedure.
5. Apply during an appropriate maintenance window when locking changes are involved.

Do not maintain a parallel Alembic history. Supabase SQL migrations are the single source of schema truth.

## Quality gates

```powershell
cd backend
uv run ruff check .
uv run mypy app
uv run pytest
```

```powershell
cd frontend
npm run lint
npx tsc --noEmit
npm run build
```

Hosted validation additionally requires applying the migration, running test queries, testing RLS with separate student/mentor/admin users, checking Storage policies, confirming message Realtime delivery, and reviewing Supabase advisors.

## Deployment

- Run FastAPI as a long-lived ASGI service near the Supabase project region: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.
- Use the Supabase pooler connection string supplied for the deployment workload; require TLS.
- Configure exact frontend CORS origins and HTTPS URLs.
- Deploy the Next.js application with matching public environment values.
- Gate traffic on `/health/ready`; use `/health/live` for process restarts.
- Keep database connection counts within the selected Supabase plan limits.

Provider-neutral Dockerfiles are included in `frontend/` and `backend/`. Public Next.js variables are build-time arguments and must be supplied during the frontend image build. Backend secrets are runtime-only environment variables. The frontend image uses Next.js standalone output; the backend image uses the pinned `uv.lock` environment and exposes `/health/live` and `/health/ready`.

## Backup and recovery

- Enable the backup/PITR capability appropriate to the Supabase plan and data-loss objective.
- Test restoration into a separate project before treating backups as reliable.
- Ledger, payment, integration-event, and audit rows are immutable; correct errors with compensating rows/events.
- Prefer forward-fix migrations. Destructive rollback requires a tested backup and explicit approval.

## Activating external providers

Payments, email, and hosted video are intentionally disabled until providers are selected.

- Payment activation requires server-side order creation, signed webhook verification, idempotent provider events, amount/currency verification, and webhook-only success transitions. Never store raw card data.
- Email activation requires a provider, domain authentication, delivery/error tracking, and retry limits.
- Video activation requires authenticated room creation tied to a confirmed booking, short-lived participant tokens, and provider webhook cleanup.

Until those checks exist, the backend returns `503` and the frontend must not display a production success state.
