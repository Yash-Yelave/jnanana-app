from fastapi import HTTPException

BOOKING_TRANSITIONS = {
    "pending_payment": {"confirmed", "cancelled"},
    "confirmed": {"in_progress", "cancelled", "disputed"},
    "in_progress": {"completed", "disputed"},
    "completed": {"disputed"},
    "cancelled": set(),
    "disputed": set(),
}


def ensure_transition(current: str, target: str, transitions: dict[str, set[str]] = BOOKING_TRANSITIONS) -> None:
    if target not in transitions.get(current, set()):
        raise HTTPException(status_code=409, detail=f"cannot change status from {current} to {target}")
