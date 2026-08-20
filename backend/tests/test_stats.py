"""The public counters must be real counts, readable without a session.

Design system §0.2 bans invented statistics. These assertions are what keep the
landing-page numbers honest: they come from records, and an empty database
reports zero rather than anything flattering.
"""

import pytest
from sqlalchemy import select

from app.models import MentorshipRequest

pytestmark = pytest.mark.asyncio


async def test_empty_programme_reports_zero(client, session_factory):
    assert (await client.get("/stats")).json() == {
        "mentors": 0,
        "mentees": 0,
        "mentorship_minutes": 0,
    }


async def test_counts_everyone_registered_as_a_mentor(client, seed):
    body = (await client.get("/stats")).json()

    # seed has two mentor registrations: one approved, one still pending. The
    # label says "registered", so both count.
    assert body["mentors"] == 2
    assert body["mentees"] == 1


async def test_approval_does_not_change_the_registered_count(client, actor, seed):
    assert (await client.get("/stats")).json()["mentors"] == 2

    actor.become(seed["admin"], admin=True)
    await client.post(f"/admin/mentors/{seed['pending_mentor']}/approve")

    # Approval governs discovery, not registration.
    assert (await client.get("/stats")).json()["mentors"] == 2


async def test_minutes_count_only_completed_sessions_with_a_logged_duration(
    client, actor, seed, session_factory
):
    actor.become(seed["mentee"])
    await client.post(f"/events/{seed['event']}/checkin")
    request_id = (
        await client.post("/mentorship-requests", json={"mentor_id": str(seed["mentor"]), "tokens_used": 10})
    ).json()["id"]

    # Pending contributes nothing.
    assert (await client.get("/stats")).json()["mentorship_minutes"] == 0

    actor.become(seed["mentor"])
    await client.post(f"/mentorship-requests/{request_id}/action", json={"action": "accept"})

    # Accepted but not yet held still contributes nothing.
    assert (await client.get("/stats")).json()["mentorship_minutes"] == 0

    await client.post(
        f"/mentorship-requests/{request_id}/action",
        json={"action": "complete", "duration_minutes": 90},
    )

    assert (await client.get("/stats")).json()["mentorship_minutes"] == 90

    async with session_factory() as session:
        stored = (await session.execute(select(MentorshipRequest.duration_minutes))).scalar_one()
    assert stored == 90


async def test_completing_without_a_duration_adds_no_minutes(client, actor, seed):
    actor.become(seed["mentee"])
    await client.post(f"/events/{seed['event']}/checkin")
    request_id = (
        await client.post("/mentorship-requests", json={"mentor_id": str(seed["mentor"]), "tokens_used": 10})
    ).json()["id"]

    actor.become(seed["mentor"])
    await client.post(f"/mentorship-requests/{request_id}/action", json={"action": "accept"})
    await client.post(f"/mentorship-requests/{request_id}/action", json={"action": "complete"})

    # No invented fallback session length.
    assert (await client.get("/stats")).json()["mentorship_minutes"] == 0


async def test_a_new_registration_moves_the_counter(client, seed, session_factory):
    """The whole point of the landing-page band: someone signs up, the number moves.

    In production a Postgres trigger on auth.users inserts the profile row at
    signup, so this mirrors what that trigger does.
    """
    from uuid import uuid4

    from app.models import Profile

    before = (await client.get("/stats")).json()

    async with session_factory() as session:
        session.add(Profile(id=uuid4(), role="student", first_name="New", last_name="Mentee"))
        session.add(Profile(id=uuid4(), role="mentor", first_name="New", last_name="Mentor"))
        await session.commit()

    after = (await client.get("/stats")).json()

    assert after["mentees"] == before["mentees"] + 1
    assert after["mentors"] == before["mentors"] + 1


async def test_admins_are_counted_as_neither(client, seed, session_factory):
    from uuid import uuid4

    from app.models import Profile

    before = (await client.get("/stats")).json()

    async with session_factory() as session:
        session.add(Profile(id=uuid4(), role="admin", first_name="Ops", last_name="User"))
        await session.commit()

    after = (await client.get("/stats")).json()

    assert after["mentors"] == before["mentors"]
    assert after["mentees"] == before["mentees"]
