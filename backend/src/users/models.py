import uuid
from datetime import datetime, timezone
from typing import TYPE_CHECKING

from sqlmodel import Field, Relationship, SQLModel

from src.users.schemas import UserBase

if TYPE_CHECKING:
    from src.flashcards.models import Collection, PracticeSession


class User(UserBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    hashed_password: str
    collections: list["Collection"] = Relationship(
        back_populates="user",
        cascade_delete=True,
        sa_relationship_kwargs={"lazy": "selectin"},
    )
    practice_sessions: list["PracticeSession"] = Relationship(
        back_populates="user",
        cascade_delete=True,
        sa_relationship_kwargs={"lazy": "selectin"},
    )
    ai_usage_quota: "AIUsageQuota" = Relationship(
        back_populates="user",
        sa_relationship_kwargs={"uselist": False, "lazy": "selectin"},
    )


class AIUsageQuota(SQLModel, table=True):
    id: uuid.UUID | None = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(
        foreign_key="user.id", index=True, unique=True, ondelete="CASCADE"
    )
    usage_count: int = Field(default=0)
    last_reset_time: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )
    user: "User" = Relationship(back_populates="ai_usage_quota")
