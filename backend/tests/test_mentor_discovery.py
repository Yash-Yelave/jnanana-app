"""SRS §17 (revised): mentors self-register, so approval is the only quality gate.

Mentors are no longer allocated to events — discovery is global. That makes the
approval filter load-bearing: an unapproved self-registration must not appear in
discovery, and must not be requestable.
"""

import pytest

pytestmark = pytest.mark.asyncio


async def test_discovery_lists_only_approved_mentors(client, actor, seed):
    actor.become(seed["mentee"])

    items = (await client.get("/mentors")).json()["items"]

    ids = {item["id"] for item in items}
    assert str(seed["mentor"]) in ids
    assert str(seed["pending_mentor"]) not in ids


async def test_unapproved_mentor_profile_is_not_readable(client, actor, seed):
    actor.become(seed["mentee"])

    response = await client.get(f"/mentors/{seed['pending_mentor']}")

    assert response.status_code == 404


async def test_approved_mentor_profile_is_readable(client, actor, seed):
    actor.become(seed["mentee"])

    response = await client.get(f"/mentors/{seed['mentor']}")

    assert response.status_code == 200
    assert response.json()["headline"] == "Founder"


async def test_approval_moves_a_mentor_into_discovery(client, actor, seed):
    actor.become(seed["admin"], admin=True)
    assert (await client.post(f"/admin/mentors/{seed['pending_mentor']}/approve")).status_code == 200

    actor.become(seed["mentee"])
    ids = {item["id"] for item in (await client.get("/mentors")).json()["items"]}

    assert str(seed["pending_mentor"]) in ids
