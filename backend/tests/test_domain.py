import pytest
from fastapi import HTTPException

from app.domain import ensure_transition


def test_booking_transition_rules() -> None:
    ensure_transition("confirmed", "in_progress")
    with pytest.raises(HTTPException) as error:
        ensure_transition("completed", "confirmed")
    assert error.value.status_code == 409
