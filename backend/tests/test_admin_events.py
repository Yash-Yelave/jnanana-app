"""SRS §11, §36, §37: the admin's event-day tooling.

Marking a participant checked in is the admin's primary job during an event, and
it is the only other path that grants Jule Tokens — so it must obey exactly the
same allocation rules as self check-in.
"""

import pytest
from sqlalchemy import select

from app.models import Event, JuleTransaction, JuleWallet, MentorshipRequest

pytestmark = pytest.mark.asyncio


async def test_admin_checkin_grants_tokens_once(client, actor, seed, session_factory):
    actor.become(seed["admin"], admin=True)

    first = await client.post(f"/admin/events/{seed['event']}/participants/{seed['mentee']}/checkin")
    assert first.status_code == 200
    assert first.json()["tokens_granted"] == 50

    second = await client.post(f"/admin/events/{seed['event']}/participants/{seed['mentee']}/checkin")
    assert second.json()["tokens_granted"] == 0

    async with session_factory() as session:
        wallet = (
            await session.execute(select(JuleWallet).where(JuleWallet.user_id == seed["mentee"]))
        ).scalar_one()
        assert wallet.balance == 50
        rows = list(
            (
                await session.execute(
                    select(JuleTransaction).where(JuleTransaction.user_id == seed["mentee"])
                )
            ).scalars()
        )
    assert len(rows) == 1


async def test_admin_and_self_checkin_do_not_double_allocate(client, actor, seed, session_factory):
    actor.become(seed["mentee"])
    await client.post(f"/events/{seed['event']}/checkin")

    actor.become(seed["admin"], admin=True)
    response = await client.post(f"/admin/events/{seed['event']}/participants/{seed['mentee']}/checkin")

    assert response.json()["tokens_granted"] == 0
    async with session_factory() as session:
        wallet = (
            await session.execute(select(JuleWallet).where(JuleWallet.user_id == seed["mentee"]))
        ).scalar_one()
    assert wallet.balance == 50


async def test_participant_list_reports_checkin_and_balance(client, actor, seed):
    actor.become(seed["mentee"])
    await client.post(f"/events/{seed['event']}/checkin")

    actor.become(seed["admin"], admin=True)
    rows = (await client.get(f"/admin/events/{seed['event']}/participants")).json()

    assert len(rows) == 1
    assert rows[0]["first_name"] == "Asha"
    assert rows[0]["checkin_status"] == "checked_in"
    assert rows[0]["jule_balance"] == 50


async def test_participants_require_admin(client, actor, seed):
    actor.become(seed["mentee"], admin=False)
    response = await client.get(f"/admin/events/{seed['event']}/participants")
    assert response.status_code == 403


async def test_unpublish_hides_event_from_public_listing(client, actor, seed):
    assert len((await client.get("/events")).json()) == 1

    actor.become(seed["admin"], admin=True)
    assert (await client.post(f"/admin/events/{seed['event']}/unpublish")).status_code == 200

    # Public listing is empty, but the admin listing still shows it.
    assert (await client.get("/events")).json() == []
    assert len((await client.get("/admin/events")).json()) == 1


async def test_unpublished_event_refuses_checkin(client, actor, seed):
    actor.become(seed["admin"], admin=True)
    await client.post(f"/admin/events/{seed['event']}/unpublish")

    actor.become(seed["mentee"])
    response = await client.post(f"/events/{seed['event']}/checkin")

    assert response.status_code == 400


async def test_event_edit_persists(client, actor, seed, session_factory):
    actor.become(seed["admin"], admin=True)

    response = await client.patch(
        f"/admin/events/{seed['event']}", json={"location": "Hyderabad", "name": "J-Spotlight 01 (moved)"}
    )

    assert response.status_code == 200
    async with session_factory() as session:
        event = await session.get(Event, seed["event"])
        assert event.location == "Hyderabad"
        assert event.name == "J-Spotlight 01 (moved)"
        assert event.slug == "j-spotlight-01"  # untouched fields survive


async def test_admin_sees_all_requests(client, actor, seed):
    actor.become(seed["mentee"])
    await client.post(f"/events/{seed['event']}/checkin")
    await client.post(
        "/mentorship-requests",
        json={"mentor_id": str(seed["mentor"]), "event_id": str(seed["event"]), "tokens_used": 10},
    )

    actor.become(seed["admin"], admin=True)
    rows = (await client.get("/admin/mentorship-requests")).json()

    assert len(rows) == 1
    assert rows[0]["mentee_name"] == "Asha Rao"
    assert rows[0]["mentor_name"] == "JA Sir"
    assert rows[0]["event_name"] == "J-Spotlight Edition 01"


async def test_admin_override_to_rejected_refunds(client, actor, seed, session_factory):
    actor.become(seed["mentee"])
    await client.post(f"/events/{seed['event']}/checkin")
    request_id = (
        await client.post("/mentorship-requests", json={"mentor_id": str(seed["mentor"]), "tokens_used": 10})
    ).json()["id"]

    actor.become(seed["admin"], admin=True)
    response = await client.post(
        f"/admin/mentorship-requests/{request_id}/status", json={"status": "rejected"}
    )

    assert response.status_code == 200
    async with session_factory() as session:
        wallet = (
            await session.execute(select(JuleWallet).where(JuleWallet.user_id == seed["mentee"]))
        ).scalar_one()
    assert wallet.balance == 50  # refunded


async def test_admin_override_refunds_only_once(client, actor, seed, session_factory):
    from uuid import UUID

    actor.become(seed["mentee"])
    await client.post(f"/events/{seed['event']}/checkin")
    request_id = (
        await client.post("/mentorship-requests", json={"mentor_id": str(seed["mentor"]), "tokens_used": 10})
    ).json()["id"]

    actor.become(seed["mentor"])
    await client.post(f"/mentorship-requests/{request_id}/action", json={"action": "reject"})

    # Already refunded by the mentor; an admin re-marking it must not pay twice.
    actor.become(seed["admin"], admin=True)
    await client.post(f"/admin/mentorship-requests/{request_id}/status", json={"status": "cancelled"})

    async with session_factory() as session:
        wallet = (
            await session.execute(select(JuleWallet).where(JuleWallet.user_id == seed["mentee"]))
        ).scalar_one()
        req = await session.get(MentorshipRequest, UUID(request_id))
    assert wallet.balance == 50
    assert req.status == "cancelled"
