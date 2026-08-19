from uuid import UUID
from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth import get_current_user_id
from app.db import get_db_session
from app.models import JuleTransaction, JuleWallet
from app.schemas import JuleTransactionRead, JuleWalletRead

router = APIRouter(prefix="/jule", tags=["jule"])


@router.get("/wallet", response_model=JuleWalletRead)
async def get_wallet(
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db_session),
) -> JuleWalletRead:
    stmt = select(JuleWallet).where(JuleWallet.user_id == user_id)
    res = await db.execute(stmt)
    wallet = res.scalar_one_or_none()
    if not wallet:
        wallet = JuleWallet(user_id=user_id, balance=0)
        db.add(wallet)
        await db.commit()
        await db.refresh(wallet)
    return JuleWalletRead(user_id=wallet.user_id, balance=wallet.balance, updated_at=wallet.updated_at)


@router.get("/transactions", response_model=list[JuleTransactionRead])
async def list_transactions(
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db_session),
) -> list[JuleTransactionRead]:
    stmt = select(JuleTransaction).where(JuleTransaction.user_id == user_id).order_by(JuleTransaction.created_at.desc())
    res = await db.execute(stmt)
    txns = res.scalars().all()
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
