import uuid
from datetime import datetime, timezone
from typing import TYPE_CHECKING

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from src.users.models import User


class Collection(SQLModel, table=True):
    id: uuid.UUID | None = Field(default_factory=uuid.uuid4, primary_key=True)
    name: str = Field(index=True)
    user_id: uuid.UUID = Field(foreign_key="user.id", index=True, ondelete="CASCADE")
    user: "User" = Relationship(back_populates="collections")
    cards: list["Card"] = Relationship(back_populates="collection", cascade_delete=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    practice_sessions: list["PracticeSession"] = Relationship(
        back_populates="collection", sa_relationship_kwargs={"cascade": "all, delete"}
    )


class Card(SQLModel, table=True):
    id: uuid.UUID | None = Field(default_factory=uuid.uuid4, primary_key=True)
    front: str = Field(max_length=3000)
    back: str = Field(max_length=3000)
    collection_id: uuid.UUID = Field(foreign_key="collection.id")
    collection: Collection = Relationship(back_populates="cards")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    practice_cards: list["PracticeCard"] = Relationship(
        back_populates="card", sa_relationship_kwargs={"cascade": "all, delete"}
    )


class PracticeSession(SQLModel, table=True):
    id: uuid.UUID | None = Field(default_factory=uuid.uuid4, primary_key=True)
    collection_id: uuid.UUID = Field(foreign_key="collection.id")
    user_id: uuid.UUID = Field(foreign_key="user.id", index=True, ondelete="CASCADE")
    user: "User" = Relationship(back_populates="practice_sessions")
    is_completed: bool = Field(default=False)
    total_cards: int = Field(default=0)
    cards_practiced: int = Field(default=0)
    correct_answers: int = Field(default=0)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    collection: Collection = Relationship(back_populates="practice_sessions")
    practice_cards: list["PracticeCard"] = Relationship(
        back_populates="session", cascade_delete=True
    )


class PracticeCard(SQLModel, table=True):
    id: uuid.UUID | None = Field(default_factory=uuid.uuid4, primary_key=True)
    session_id: uuid.UUID = Field(foreign_key="practicesession.id")
    card_id: uuid.UUID = Field(foreign_key="card.id")
    is_correct: bool | None = Field(default=None)
    is_practiced: bool = Field(default=False)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    session: PracticeSession = Relationship(back_populates="practice_cards")
    card: Card = Relationship(back_populates="practice_cards")
