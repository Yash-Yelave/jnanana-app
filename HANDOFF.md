# Handoff — Phase 1 SRS alignment

All code changes are done. **There are exactly three things left, and all three need
credentials or a database only you have.** Everything else is finished, built, and
tested.

---

## What you need to do

### 1. Rotate the admin password (5 minutes) — do this first

`backend/create_admin_user.py` had a live admin email and plaintext password
committed to the repo. It's removed from the code now, **but it's still in git
history**, so the old password must be treated as compromised.

1. Sign in to Supabase → Authentication → Users.
2. Change the password on the admin account that was in that file.
3. From then on the script reads credentials from the environment:

```powershell
$env:ADMIN_EMAIL="you@example.com"
$env:ADMIN_PASSWORD="<the new strong password>"
uv run python create_admin_user.py
```

Both keys are already in `backend/.env.example`. Never commit real values.

---

### 2. Apply the database migration

There's one new migration: `backend/supabase/migrations/20260820090000_srs_event_jule_schema.sql`.

It creates the five Phase 1 tables — `events`, `event_participants`,
`jule_wallets`, `jule_transactions`, `mentorship_requests` — with constraints,
indexes, and RLS policies.

```powershell
supabase db push
```

**This must run before the API starts.** The app used to call
`Base.metadata.create_all` at boot, which silently created tables with **no RLS
policies attached**. That's removed. The API now refuses to boot against an
un-migrated database and tells you exactly which tables are missing.

> Note: there is deliberately no `event_mentors` table. Mentors are no longer
> assigned to events — mentors and mentees both self-register, and discovery is
> global.

---

### 3. Deploy and confirm

```
1. supabase db push
2. Deploy the API (Render picks up render.yaml)
3. GET /health/ready  →  must return {"status": "ready"}
```

**Step 3 is the gate.** A `503` naming missing tables means step 2 ran before
step 1. Nothing else is needed.

---

## Then: the 13-step acceptance test

This is SRS §49. Run it once on a real phone against production. It is the
definition of done for Phase 1.

```
 1. Open the site                            → landing page loads
 2. Current event visible on the landing page
 3. Register as a Mentee
 4. Open the event → "Check in & claim 50 Jule Tokens"
 5. Header shows ⚡ 50 Jule
 6. Browse Mentors → only approved mentors appear
 7. Open a mentor profile
 8. Request Mentorship → "Use 10 Jule Tokens…?"
 9. Confirm → balance drops to 40
10. My Requests → shows Pending
11. Log in as that mentor → Requests tab shows it, bell shows 1 unread
12. Accept
13. Back as the mentee → status reads Accepted
```

To set the event up beforehand: **Admin → Events** (create) → **Participants**
(publish, and check people in on the day).

---

## What changed, briefly

**Security — these were live holes**

- Every endpoint in the admin router was **completely unauthenticated**. Anyone
  on the internet could call `POST /admin/tokens/adjust` and mint themselves
  unlimited Jule Tokens. All seven endpoints now require an admin token.
- A mentee could accept their own mentorship request.
- Requesting an unknown mentor fell through to *a randomly chosen mentor* and
  charged the mentee anyway. Now a clean 404 with no deduction.
- The wallet auto-created itself with a balance of 50 in two places, so users got
  free tokens without checking in, with no transaction record.
- Admin credentials removed from source.

**The core loop now actually works end to end**

Previously `checkinEvent`, `getMyMentorshipRequests`, and
`actionMentorshipRequest` existed in the API client but **were never called by
any UI**. The backend was fine; the buttons didn't exist.

- Check-in button on the event page (the handler existed, it just wasn't rendered)
- `/mentor/requests` — mentor sees requests, accepts or declines
- `/requests` — mentee sees status
- `/events` reads real data instead of a hardcoded array
- Notifications on request created / accepted / rejected, with a bell in the header
- Rejection and cancellation refund the mentee automatically

**Admin**

- Participant list with **Mark check-in** — the main event-day job, previously missing entirely
- Event publish / unpublish / edit
- Mentorship request overview with status override (refunds automatically)

**Scope (SRS §44)**

Removed the payments, bookings/offers, courses, subscriptions, referrals,
community, and chat surface — 3 backend routers and 13 frontend routes. Routes
went from 38 to 25, all Phase 1. It's all in git history if any of it is needed
later.

**Website**

- Events section and App section added — previously there was **no path from
  scanning the QR code to the event**
- How It Works now reads Join → Discover → Connect (Jule Tokens) → Grow per §27
- Navigation matches §26; "Join as Mentor" added to the desktop header
- Removed five faculty cards that literally read "Mentor Name"

---

## Verification already done

- **44 backend tests pass** (was 4). They cover the token ledger end to end:
  check-in grants 50 exactly once, requests deduct and record, rejections refund,
  a mentee can't action their own request, admin endpoints refuse non-admins,
  and admin + self check-in never double-allocate.
- Frontend builds clean; `tsc` and `eslint` pass.
- Tests run on SQLite, so they do **not** cover RLS behaviour or Postgres row
  locking. Step 3 above is what confirms those.

## One known local-dev issue

psycopg's async mode can't use Windows' default `ProactorEventLoop`, so
`uvicorn --reload` fails on Windows with an `InterfaceError`. Run the backend in
Docker or WSL. Production is Linux, so it's unaffected. The test suite is fine
either way (it uses SQLite).
