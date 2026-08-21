"""The SRS §49 acceptance loop, asserted end to end.

Covers the token invariants that must hold on event day: the base allocation is
granted exactly once, every movement is recorded, and nothing is spent that was
not first granted.
"""

from uuid import UUID, uuid4

import pytest
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

from app.models import JuleTransaction, JuleWallet, MentorshipRequest, Notification

pytestmark = pytest.mark.asyncio


async def _balance(factory: async_sessionmaker[AsyncSession], user_id) -> int:
    async with factory() as session:
        wallet = (
            await session.execute(select(JuleWallet).where(JuleWallet.user_id == user_id))
        ).scalar_one_or_none()
        return wallet.balance if wallet else 0


async def _transactions(factory: async_sessionmaker[AsyncSession], user_id) -> list[JuleTransaction]:
    async with factory() as session:
        return list(
            (
                await session.execute(
                    select(JuleTransaction)
                    .where(JuleTransaction.user_id == user_id)
                    .order_by(JuleTransaction.created_at)
                )
            ).scalars()
        )


# --- SRS §14: base allocation -------------------------------------------------


async def test_checkin_grants_fifty_tokens_once(client, seed, actor, session_factory):
    actor.become(seed["mentee"])

    first = await client.post(f"/events/{seed['event']}/checkin")
    assert first.status_code == 200
    assert first.json()["tokens_granted"] == 50
    assert await _balance(session_factory, seed["mentee"]) == 50

    # Re-scanning the QR must not top the wallet up again.
    second = await client.post(f"/events/{seed['event']}/checkin")
    assert second.status_code == 200
    assert second.json()["tokens_granted"] == 0
    assert await _balance(session_factory, seed["mentee"]) == 50

    ledger = await _transactions(session_factory, seed["mentee"])
    assert [(t.transaction_type, t.amount) for t in ledger] == [("event_allocation", 50)]


async def test_checkin_reports_participation_state(client, seed, actor):
    actor.become(seed["mentee"])

    before = await client.get(f"/events/{seed['event']}/me")
    assert before.json() == {"registered": False, "checkin_status": "pending", "tokens_allocated": False}

    await client.post(f"/events/{seed['event']}/checkin")

    after = await client.get(f"/events/{seed['event']}/me")
    assert after.json() == {"registered": True, "checkin_status": "checked_in", "tokens_allocated": True}


# --- SRS §20: spending on a mentorship request --------------------------------


async def test_request_deducts_tokens_and_records_transaction(client, seed, actor, session_factory):
    actor.become(seed["mentee"])
    await client.post(f"/events/{seed['event']}/checkin")

    response = await client.post(
        "/mentorship-requests",
        json={"mentor_id": str(seed["mentor"]), "event_id": str(seed["event"]), "tokens_used": 10},
    )

    assert response.status_code == 201, response.text
    assert response.json()["status"] == "pending"
    assert await _balance(session_factory, seed["mentee"]) == 40

    ledger = await _transactions(session_factory, seed["mentee"])
    assert [(t.transaction_type, t.amount) for t in ledger] == [
        ("event_allocation", 50),
        ("mentor_request", -10),
    ]


async def test_request_without_tokens_is_refused_and_costs_nothing(client, seed, actor, session_factory):
    actor.become(seed["mentee"])  # never checked in

    response = await client.post(
        "/mentorship-requests", json={"mentor_id": str(seed["mentor"]), "tokens_used": 10}
    )

    assert response.status_code == 400
    assert "Insufficient Jools Tokens" in response.json()["detail"]
    assert await _balance(session_factory, seed["mentee"]) == 0
    assert await _transactions(session_factory, seed["mentee"]) == []


async def test_unknown_mentor_is_rejected_without_charging(client, seed, actor, session_factory):
    actor.become(seed["mentee"])
    await client.post(f"/events/{seed['event']}/checkin")

    response = await client.post("/mentorship-requests", json={"mentor_id": str(uuid4()), "tokens_used": 10})

    assert response.status_code == 404
    # A4: no silent fallback to some other mentor, and no deduction.
    assert await _balance(session_factory, seed["mentee"]) == 50


async def test_unapproved_mentor_cannot_be_requested(client, seed, actor, session_factory):
    actor.become(seed["mentee"])
    await client.post(f"/events/{seed['event']}/checkin")

    response = await client.post(
        "/mentorship-requests", json={"mentor_id": str(seed["pending_mentor"]), "tokens_used": 10}
    )

    assert response.status_code == 400
    assert await _balance(session_factory, seed["mentee"]) == 50


async def test_duplicate_pending_request_is_rejected(client, seed, actor, session_factory):
    actor.become(seed["mentee"])
    await client.post(f"/events/{seed['event']}/checkin")
    body = {"mentor_id": str(seed["mentor"]), "tokens_used": 10}

    assert (await client.post("/mentorship-requests", json=body)).status_code == 201
    second = await client.post("/mentorship-requests", json=body)

    assert second.status_code == 409
    assert await _balance(session_factory, seed["mentee"]) == 40  # charged exactly once


# --- SRS §22 / §39: who may action a request ----------------------------------


async def test_mentee_cannot_accept_their_own_request(client, seed, actor, session_factory):
    actor.become(seed["mentee"])
    await client.post(f"/events/{seed['event']}/checkin")
    request_id = (
        await client.post("/mentorship-requests", json={"mentor_id": str(seed["mentor"]), "tokens_used": 10})
    ).json()["id"]

    response = await client.post(f"/mentorship-requests/{request_id}/action", json={"action": "accept"})

    assert response.status_code == 403
    async with session_factory() as session:
        req = await session.get(MentorshipRequest, UUID(request_id))
        assert req.status == "pending"


async def test_mentor_accepts_and_mentee_is_notified(client, seed, actor, session_factory):
    actor.become(seed["mentee"])
    await client.post(f"/events/{seed['event']}/checkin")
    request_id = (
        await client.post("/mentorship-requests", json={"mentor_id": str(seed["mentor"]), "tokens_used": 10})
    ).json()["id"]

    actor.become(seed["mentor"])
    response = await client.post(f"/mentorship-requests/{request_id}/action", json={"action": "accept"})

    assert response.status_code == 200
    assert response.json()["status"] == "accepted"
    # Accepted requests keep the tokens spent.
    assert await _balance(session_factory, seed["mentee"]) == 40

    async with session_factory() as session:
        kinds = list(
            (
                await session.execute(
                    select(Notification.kind).where(Notification.user_id == seed["mentee"])
                )
            ).scalars()
        )
    assert "mentorship_request.accepted" in kinds


async def test_rejection_refunds_the_mentee(client, seed, actor, session_factory):
    actor.become(seed["mentee"])
    await client.post(f"/events/{seed['event']}/checkin")
    request_id = (
        await client.post("/mentorship-requests", json={"mentor_id": str(seed["mentor"]), "tokens_used": 10})
    ).json()["id"]

    actor.become(seed["mentor"])
    response = await client.post(f"/mentorship-requests/{request_id}/action", json={"action": "reject"})

    assert response.status_code == 200
    assert await _balance(session_factory, seed["mentee"]) == 50

    ledger = await _transactions(session_factory, seed["mentee"])
    assert [(t.transaction_type, t.amount) for t in ledger] == [
        ("event_allocation", 50),
        ("mentor_request", -10),
        ("refund", 10),
    ]


async def test_cannot_accept_an_already_rejected_request(client, seed, actor):
    actor.become(seed["mentee"])
    await client.post(f"/events/{seed['event']}/checkin")
    request_id = (
        await client.post("/mentorship-requests", json={"mentor_id": str(seed["mentor"]), "tokens_used": 10})
    ).json()["id"]

    actor.become(seed["mentor"])
    await client.post(f"/mentorship-requests/{request_id}/action", json={"action": "reject"})
    second = await client.post(f"/mentorship-requests/{request_id}/action", json={"action": "accept"})

    assert second.status_code == 409


async def test_notification_reaches_the_mentor_on_new_request(client, seed, actor, session_factory):
    actor.become(seed["mentee"])
    await client.post(f"/events/{seed['event']}/checkin")
    await client.post("/mentorship-requests", json={"mentor_id": str(seed["mentor"]), "tokens_used": 10})

    async with session_factory() as session:
        kinds = list(
            (
                await session.execute(select(Notification.kind).where(Notification.user_id == seed["mentor"]))
            ).scalars()
        )
    assert kinds == ["mentorship_request.received"]


# --- SRS §21: both sides can see the request ----------------------------------


async def test_both_parties_see_the_request(client, seed, actor):
    actor.become(seed["mentee"])
    await client.post(f"/events/{seed['event']}/checkin")
    await client.post("/mentorship-requests", json={"mentor_id": str(seed["mentor"]), "tokens_used": 10})

    mentee_view = (await client.get("/mentorship-requests/my")).json()
    assert len(mentee_view) == 1
    assert mentee_view[0]["mentor_name"] == "JA Sir"

    actor.become(seed["mentor"])
    mentor_view = (await client.get("/mentorship-requests/my")).json()
    assert len(mentor_view) == 1
    assert mentor_view[0]["mentee_name"] == "Asha Rao"
