from fastapi.testclient import TestClient

from app.main import app

# SRS §43 — the Phase 1 surface. Anything outside this is out of scope (§44).
PHASE_1_PATHS = [
    "/api/v1/events",
    "/api/v1/events/{event_id}/checkin",
    "/api/v1/jule/wallet",
    "/api/v1/jule/transactions",
    "/api/v1/mentorship-requests",
    "/api/v1/mentorship-requests/{request_id}/action",
    "/api/v1/mentors",
    "/api/v1/notifications",
    "/api/v1/admin/metrics",
    "/api/v1/admin/events/{event_id}/participants",
    "/api/v1/admin/tokens/adjust",
    "/api/v1/admin/users/{profile_id}/role",
]

# SRS §44 — explicitly not in scope. These must not be reachable.
OUT_OF_SCOPE_PREFIXES = (
    "/api/v1/bookings",
    "/api/v1/offers",
    "/api/v1/lesson-requests",
    "/api/v1/communities",
    "/api/v1/conversations",
    "/api/v1/courses",
    "/api/v1/plans",
    "/api/v1/subscriptions",
    "/api/v1/payments",
    "/api/v1/invoices",
    "/api/v1/referrals",
)


def test_liveness_and_request_id() -> None:
    with TestClient(app) as client:
        response = client.get("/health/live", headers={"X-Request-ID": "test-request"})

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
    assert response.headers["X-Request-ID"] == "test-request"


def test_phase_1_surface_is_served() -> None:
    with TestClient(app) as client:
        paths = client.get("/openapi.json").json()["paths"]

    missing = [path for path in PHASE_1_PATHS if path not in paths]
    assert not missing, f"Phase 1 endpoints are not served: {missing}"


def test_out_of_scope_surface_is_not_served() -> None:
    with TestClient(app) as client:
        paths = client.get("/openapi.json").json()["paths"]

    leaked = [p for p in paths if p.startswith(OUT_OF_SCOPE_PREFIXES)]
    assert not leaked, f"Out-of-scope endpoints are still mounted: {leaked}"


def test_protected_route_requires_a_token() -> None:
    with TestClient(app) as client:
        assert client.get("/api/v1/me").status_code == 401
