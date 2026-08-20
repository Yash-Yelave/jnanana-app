"""SRS §38: in-app notifications for mentorship request activity.

Written by the mentorship-requests router when a request is created, accepted, or
rejected. Extracted from the legacy platform router so that router can be removed
without taking notifications with it.
"""

from datetime import UTC, datetime
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth import CurrentUser, get_current_user
from app.db import get_db_session
from app.models import Notification

router = APIRouter(tags=["notifications"])

Db = Annotated[AsyncSession, Depends(get_db_session)]
User = Annotated[CurrentUser, Depends(get_current_user)]


@router.get("/notifications")
async def list_notifications(
    db: Db, user: User, limit: int = Query(default=50, ge=1, le=100)
) -> dict[str, object]:
    items = list(
        (
            await db.scalars(
                select(Notification)
                .where(Notification.user_id == user.id)
                .order_by(Notification.created_at.desc())
                .limit(limit)
            )
        ).all()
    )
    unread = (
        await db.scalar(
            select(func.count())
            .select_from(Notification)
            .where(Notification.user_id == user.id, Notification.read_at.is_(None))
        )
    ) or 0

    return {
        "items": [
            {
                "id": item.id,
                "kind": item.kind,
                "title": item.title,
                "body": item.body,
                "data": item.data,
                "read_at": item.read_at,
                "created_at": item.created_at,
            }
            for item in items
        ],
        "unread": unread,
        "next_cursor": None,
    }


@router.post("/notifications/{notification_id}/read", status_code=204)
async def mark_notification_read(notification_id: UUID, db: Db, user: User) -> None:
    notification = await db.get(Notification, notification_id)
    if notification is None or notification.user_id != user.id:
        raise HTTPException(status_code=404, detail="notification not found")
    notification.read_at = datetime.now(UTC)
    await db.commit()


@router.post("/notifications/read-all", status_code=204)
async def mark_all_read(db: Db, user: User) -> None:
    await db.execute(
        update(Notification)
        .where(Notification.user_id == user.id, Notification.read_at.is_(None))
        .values(read_at=datetime.now(UTC))
    )
    await db.commit()
