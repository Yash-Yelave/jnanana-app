# API contract

Base path: `/api/v1`. Protected endpoints require `Authorization: Bearer <Supabase access token>`. JSON is used for request and response bodies. List responses use `{ "items": [], "next_cursor": null }` where pagination is applicable.

## Accounts and mentors

| Method | Path | Behavior |
| --- | --- | --- |
| `GET` | `/skills` | Active skill catalogue |
| `GET` | `/me` | Current persisted profile |
| `POST` | `/me/onboarding` | Complete or repair onboarding |
| `PATCH` | `/me/profile` | Update safe profile fields |
| `GET/PUT` | `/me/settings` | Read or replace preferences |
| `GET` | `/mentors` | Approved mentor search with price/search/cursor filters |
| `GET` | `/mentors/{id}` | Approved mentor detail and review summary |
| `GET` | `/mentors/{id}/availability` | Public active rules |
| `PUT` | `/mentor/availability` | Replace current mentor rules |
| `GET` | `/admin/mentor-applications` | Pending applications; admin only |
| `POST` | `/admin/mentor-applications/{id}/decision` | Approve/reject; admin only |

## Lessons and bookings

| Method | Path | Behavior |
| --- | --- | --- |
| `POST/GET` | `/lesson-requests` | Create or list role-relevant requests |
| `POST` | `/lesson-requests/{id}/offers` | Approved mentor offer/counter-offer |
| `POST` | `/offers/{id}/accept` | Atomic, idempotent student acceptance |
| `GET` | `/bookings` | Current user's bookings |
| `POST` | `/bookings/{id}/status` | Authorized lifecycle transition |
| `POST` | `/bookings/{id}/reviews` | One review after completion |
| `POST` | `/bookings/{id}/meeting` | Returns `503` until video is configured |

Offer acceptance requires an `Idempotency-Key` header of 8-100 characters. Retrying the same authenticated operation returns the original booking rather than creating another.

## Learning, community, and commercial data

| Method | Path | Behavior |
| --- | --- | --- |
| `GET` | `/courses` | Published course catalogue |
| `POST` | `/courses/{id}/enroll` | Idempotent student enrollment |
| `GET` | `/me/enrollments` | Current student enrollments |
| `GET/POST` | `/communities`, `/communities/{id}/join` | Browse/join communities |
| `DELETE` | `/communities/{id}/membership` | Leave community |
| `GET/POST` | `/conversations` | List/create direct conversations |
| `GET/POST` | `/conversations/{id}/messages` | Cursor-read/send member messages |
| `GET` | `/plans` | Active plans |
| `POST/GET` | `/subscriptions` | Create/list pending or active subscriptions |
| `POST` | `/payments/checkout` | Returns `503` until payment is configured |
| `GET` | `/wallet`, `/referrals`, `/notifications` | Current user commercial/activity summaries |
| `GET` | `/dashboard/student`, `/dashboard/mentor` | Role-specific aggregate data |

## State machines

- Request: `open -> negotiating -> accepted`, with `cancelled` and `expired` terminal paths.
- Offer: `pending -> accepted | rejected | withdrawn`.
- Booking: `pending_payment -> confirmed -> in_progress -> completed`; controlled cancellation/dispute branches apply.
- Payment: `created -> pending -> succeeded | failed | refunded`.
- Subscription: `pending -> active -> past_due | cancelled | expired`.

Invalid transitions return `409`. A client cannot set a booking to `confirmed`; only a future verified payment integration may do so.

## Error behavior

| Status | Meaning |
| --- | --- |
| `401` | Missing, malformed, expired, or invalid Supabase access token |
| `403` | Authenticated but missing required role/ownership/approval |
| `404` | Resource not visible to the caller or not found |
| `409` | Duplicate operation or invalid lifecycle transition |
| `422` | Request validation or referenced-input failure |
| `503` | Database or external provider is not configured/available |
