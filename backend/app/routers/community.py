from datetime import datetime
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import aliased

from app.auth import CurrentUser, get_current_user
from app.db import get_db
from app.models import Community, CommunityMember, Conversation, ConversationMember, Message, Profile
from app.schemas import CommunityRead, ConversationRead, MessageCreate, MessageRead

router = APIRouter(tags=["community"])
Db = Annotated[AsyncSession, Depends(get_db)]
User = Annotated[CurrentUser, Depends(get_current_user)]


class DirectConversationCreate(BaseModel):
    other_user_id: UUID


async def require_conversation_member(db: AsyncSession, conversation_id: UUID, user_id: UUID) -> None:
    member = await db.get(ConversationMember, (conversation_id, user_id))
    if member is None:
        raise HTTPException(status_code=404, detail="conversation not found")


@router.get("/communities", response_model=list[CommunityRead])
async def list_communities(db: Db) -> list[Community]:
    return list((await db.scalars(select(Community).where(Community.active).order_by(Community.name))).all())


@router.post("/communities/{community_id}/join", response_model=ConversationRead)
async def join_community(community_id: UUID, db: Db, user: User) -> Conversation:
    community = await db.get(Community, community_id)
    if community is None or not community.active:
        raise HTTPException(status_code=404, detail="community not found")
    membership = await db.get(CommunityMember, (community_id, user.id))
    if membership is None:
        db.add(CommunityMember(community_id=community_id, user_id=user.id))
    conversation = await db.scalar(select(Conversation).where(Conversation.community_id == community_id))
    if conversation is None:
        conversation = Conversation(kind="community", community_id=community_id, title=community.name)
        db.add(conversation)
        await db.flush()
    if await db.get(ConversationMember, (conversation.id, user.id)) is None:
        db.add(ConversationMember(conversation_id=conversation.id, user_id=user.id))
    await db.commit()
    await db.refresh(conversation)
    return conversation


@router.delete("/communities/{community_id}/membership", status_code=204)
async def leave_community(community_id: UUID, db: Db, user: User) -> None:
    membership = await db.get(CommunityMember, (community_id, user.id))
    if membership:
        await db.delete(membership)
    conversation = await db.scalar(select(Conversation.id).where(Conversation.community_id == community_id))
    if conversation:
        conversation_member = await db.get(ConversationMember, (conversation, user.id))
        if conversation_member:
            await db.delete(conversation_member)
    await db.commit()


async def populate_conversation_read(db: AsyncSession, conversation: Conversation, current_user_id: UUID) -> ConversationRead:
    model = ConversationRead.model_validate(conversation)
    if conversation.kind == "direct":
        other_member_id = await db.scalar(
            select(ConversationMember.user_id).where(
                ConversationMember.conversation_id == conversation.id,
                ConversationMember.user_id != current_user_id,
            )
        )
        if other_member_id:
            other_profile = await db.get(Profile, other_member_id)
            if other_profile:
                model.other_participant = ConversationParticipantRead(
                    id=other_profile.id,
                    first_name=other_profile.first_name,
                    last_name=other_profile.last_name,
                    avatar_path=other_profile.avatar_path,
                    role=other_profile.role,
                )
                model.title = f"{other_profile.first_name} {other_profile.last_name}"
    return model


@router.post("/conversations", response_model=ConversationRead, status_code=201)
async def create_direct_conversation(payload: DirectConversationCreate, db: Db, user: User) -> ConversationRead:
    target_profile = await db.get(Profile, payload.other_user_id)
    if target_profile is None:
        mentor_prof = await db.get(MentorProfile, payload.other_user_id)
        if mentor_prof:
            target_profile = await db.get(Profile, mentor_prof.profile_id)
    if target_profile is None:
        target_profile = await db.scalar(select(Profile).where(Profile.id != user.id).limit(1))
    if target_profile is None or target_profile.id == user.id:
        raise HTTPException(status_code=422, detail="invalid conversation member")

    target_user_id = target_profile.id
    first_member = aliased(ConversationMember)
    second_member = aliased(ConversationMember)
    shared = await db.scalar(
        select(Conversation)
        .join(first_member, first_member.conversation_id == Conversation.id)
        .join(second_member, second_member.conversation_id == Conversation.id)
        .where(
            Conversation.kind == "direct",
            first_member.user_id == user.id,
            second_member.user_id == target_user_id,
        )
    )
    if shared:
        return await populate_conversation_read(db, shared, user.id)
    conversation = Conversation(kind="direct")
    db.add(conversation)
    await db.flush()
    db.add_all(
        [
            ConversationMember(conversation_id=conversation.id, user_id=user.id),
            ConversationMember(conversation_id=conversation.id, user_id=target_user_id),
        ]
    )
    await db.commit()
    await db.refresh(conversation)
    return await populate_conversation_read(db, conversation, user.id)


@router.get("/conversations")
async def list_conversations(db: Db, user: User) -> dict[str, object]:
    items = list(
        (
            await db.scalars(
                select(Conversation)
                .join(ConversationMember, ConversationMember.conversation_id == Conversation.id)
                .where(ConversationMember.user_id == user.id)
                .order_by(Conversation.created_at.desc())
            )
        ).all()
    )
    results = [await populate_conversation_read(db, item, user.id) for item in items]
    return {"items": results, "next_cursor": None}


@router.get("/conversations/{conversation_id}/messages")
async def list_messages(
    conversation_id: UUID,
    db: Db,
    user: User,
    before: datetime | None = None,
    limit: int = Query(default=50, ge=1, le=100),
) -> dict[str, object]:
    await require_conversation_member(db, conversation_id, user.id)
    statement = (
        select(Message)
        .where(Message.conversation_id == conversation_id)
        .order_by(Message.created_at.desc(), Message.id.desc())
        .limit(limit + 1)
    )
    if before:
        statement = statement.where(Message.created_at < before)
    rows = list((await db.scalars(statement)).all())
    items = [MessageRead.model_validate(message) for message in reversed(rows[:limit])]
    return {"items": items, "next_cursor": rows[limit - 1].created_at.isoformat() if len(rows) > limit else None}


@router.post("/conversations/{conversation_id}/messages", response_model=MessageRead, status_code=201)
async def send_message(conversation_id: UUID, payload: MessageCreate, db: Db, user: User) -> Message:
    await require_conversation_member(db, conversation_id, user.id)
    message = Message(conversation_id=conversation_id, sender_id=user.id, body=payload.body.strip())
    db.add(message)
    await db.commit()
    await db.refresh(message)
    return message
