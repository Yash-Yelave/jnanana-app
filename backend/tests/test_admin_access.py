"""SRS §39: the admin surface must be closed to non-admins.

These endpoints mint and destroy Jule Tokens. Before this suite existed the whole
admin router was reachable with no token at all.
"""

import pytest
from sqlalchemy import select

from app.models import JuleTransaction, JuleWallet

pytestmark = pytest.mark.asyncio

ADMIN_ENDPOINTS = [
    ("get", "/admin/metrics", None),
    ("get", "/admin/mentors", None),
    (
        "post",
        "/admin/events",
        {
            "slug": "sneaky-event",
            "name": "Sneaky Event",
            "description": "Created without authorisation.",
            "event_date": "2026-09-01T10:00:00Z",
        },
    ),
    ("post", "/admin/tokens/adjust", {"user_id": "00000000-0000-0000-0000-000000000001", "amount": 9999}),
]


@pytest.mark.parametrize("method,path,body", ADMIN_ENDPOINTS)
async def test_non_admin_is_refused(client, actor, seed, method, path, body):
    actor.become(seed["mentee"], admin=False)

    response = await getattr(client, method)(path, json=body) if body else await getattr(client, method)(path)

    assert response.status_code == 403, f"{method.upper()} {path} was reachable by a non-admin"


async def test_non_admin_cannot_mint_tokens(client, actor, seed, session_factory):
    actor.become(seed["mentee"], admin=False)

    response = await client.post(
        "/admin/tokens/adjust", json={"user_id": str(seed["mentee"]), "amount": 9999}
    )

    assert response.status_code == 403
    async with session_factory() as session:
        wallet = (
            await session.execute(select(JuleWallet).where(JuleWallet.user_id == seed["mentee"]))
        ).scalar_one_or_none()
        assert wallet is None


async def test_admin_grant_is_recorded_in_the_ledger(client, actor, seed, session_factory):
    actor.become(seed["admin"], admin=True)

    response = await client.post(
        "/admin/tokens/adjust",
        json={"user_id": str(seed["mentee"]), "amount": 10, "notes": "Pitch competition winner"},
    )

    assert response.status_code == 200
    assert response.json()["new_balance"] == 10

    # SRS Rule 6: every addition must leave a transaction record.
    async with session_factory() as session:
        rows = list(
            (
                await session.execute(
                    select(JuleTransaction).where(JuleTransaction.user_id == seed["mentee"])
                )
            ).scalars()
        )
    assert [(t.transaction_type, t.amount, t.notes) for t in rows] == [
        ("activity_reward", 10, "Pitch competition winner")
    ]


async def test_admin_cannot_deduct_below_zero(client, actor, seed, session_factory):
    actor.become(seed["admin"], admin=True)
    await client.post("/admin/tokens/adjust", json={"user_id": str(seed["mentee"]), "amount": 10})

    response = await client.post(
        "/admin/tokens/adjust", json={"user_id": str(seed["mentee"]), "amount": -50}
    )

    assert response.status_code == 400
    async with session_factory() as session:
        wallet = (
            await session.execute(select(JuleWallet).where(JuleWallet.user_id == seed["mentee"]))
        ).scalar_one()
        assert wallet.balance == 10


async def test_admin_event_slug_must_be_unique(client, actor, seed):
    actor.become(seed["admin"], admin=True)
    body = {
        "slug": "j-spotlight-01",  # already seeded
        "name": "Duplicate",
        "description": "Should collide with the seeded event.",
        "event_date": "2026-09-01T10:00:00Z",
    }

    response = await client.post("/admin/events", json=body)

    assert response.status_code == 409
