# Backend integration guide

The frontend uses Supabase Auth for identities/sessions and FastAPI for product data and business actions.

## Environment

Copy `frontend/.env.example` to `.env.local` and configure:

```text
NEXT_PUBLIC_SUPABASE_URL=https://PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

Never expose the Supabase secret key, service-role credential, database password, or payment webhook secret through `NEXT_PUBLIC_*`.

## Authentication flow

1. Login/signup uses the browser Supabase client.
2. `src/proxy.ts` refreshes SSR cookies and performs optimistic protected-route redirects using verified claims.
3. Email confirmation returns through `/auth/confirm` and exchanges the code/token for a session.
4. `src/lib/api.ts` retrieves the current raw access token and forwards it to FastAPI as a Bearer token.
5. FastAPI verifies the token again and authorizes every data operation against persisted roles and ownership.

The proxy is not the security boundary; FastAPI and PostgreSQL enforce authorization.

## Product API

Use `apiFetch<T>(path, init)` from `src/lib/api.ts`. Paths are relative to `/api/v1`:

```ts
const profile = await apiFetch<Profile>("/me");
const bookings = await apiFetch<Page<Booking>>("/bookings");
```

Do not add Next.js API routes that merely proxy FastAPI. Add a server action/route only when a Next.js-specific cookie or rendering boundary requires it.

## Realtime and Storage

- Subscribe to `messages` through the browser Supabase client after the user joins the conversation. RLS filters unauthorized events.
- Upload avatars below `USER_ID/...` in the `avatars` bucket.
- Mentor documents and lesson resources remain backend-mediated private buckets.

## Deferred providers

Payment checkout and hosted meeting creation currently return `503 integration_not_configured`. Preserve that failure until a provider is implemented and verified; UI navigation alone is never proof of payment or meeting authorization.

See [backend API documentation](../../backend/docs/API.md) and [operations](../../backend/docs/OPERATIONS.md).
