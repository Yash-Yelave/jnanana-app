from datetime import UTC, datetime
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth import get_current_user_id
from app.db import get_db_session
from app.models import JuleTransaction, JuleWallet
from app.schemas import JuleTransactionRead, JuleWalletRead

router = APIRouter(prefix="/jule", tags=["jule"])
jools_router = APIRouter(prefix="/jools", tags=["jools"])

Db = Annotated[AsyncSession, Depends(get_db_session)]
UserId = Annotated[UUID, Depends(get_current_user_id)]


@router.get("/wallet", response_model=JuleWalletRead)
@jools_router.get("/wallet", response_model=JuleWalletRead)
async def get_wallet(db: Db, user_id: UserId) -> JuleWalletRead:
    wallet = (
        await db.execute(select(JuleWallet).where(JuleWallet.user_id == user_id))
    ).scalar_one_or_none()
    if wallet is None:
        # Read-only: an empty wallet reads as zero rather than being created here,
        # so a balance only ever exists because tokens were actually granted.
        return JuleWalletRead(user_id=user_id, balance=0, updated_at=datetime.now(UTC))
    return JuleWalletRead(user_id=wallet.user_id, balance=wallet.balance, updated_at=wallet.updated_at)


@router.get("/transactions", response_model=list[JuleTransactionRead])
@jools_router.get("/transactions", response_model=list[JuleTransactionRead])
async def list_transactions(db: Db, user_id: UserId) -> list[JuleTransactionRead]:
    stmt = (
        select(JuleTransaction)
        .where(JuleTransaction.user_id == user_id)
        .order_by(JuleTransaction.created_at.desc())
    )
    txns = (await db.scalars(stmt)).all()
    return [
        JuleTransactionRead(
            id=t.id,
            user_id=t.user_id,
            event_id=t.event_id,
            amount=t.amount,
            transaction_type=t.transaction_type,
            related_mentor_id=t.related_mentor_id,
            notes=t.notes,
            created_at=t.created_at,
        )
        for t in txns
    ]
