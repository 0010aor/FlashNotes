import uuid
from typing import TYPE_CHECKING

from sqlmodel import Field, Relationship

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
