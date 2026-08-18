from fastapi.testclient import TestClient

from app.main import app


def test_liveness_and_request_id() -> None:
    with TestClient(app) as client:
        response = client.get("/health/live", headers={"X-Request-ID": "test-request"})

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
    assert response.headers["X-Request-ID"] == "test-request"


def test_openapi_and_auth_boundary() -> None:
    with TestClient(app) as client:
        schema = client.get("/openapi.json")
        protected = client.get("/api/v1/me")

    assert schema.status_code == 200
    assert "/api/v1/offers/{offer_id}/accept" in schema.json()["paths"]
    assert "/api/v1/admin/users/{profile_id}/role" in schema.json()["paths"]
    assert "/api/v1/notifications/{notification_id}/read" in schema.json()["paths"]
    assert protected.status_code == 401
