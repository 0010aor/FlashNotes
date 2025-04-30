import uuid
from datetime import datetime

from pydantic import BaseModel, Field
from sqlmodel import SQLModel


class CollectionBase(SQLModel):
    name: str


class CollectionCreate(CollectionBase):
    prompt: str | None = Field(default=None, max_length=100)


class CollectionUpdate(SQLModel):
    name: str | None = None


class CardBase(SQLModel):
    front: str
    back: str


class CardCreate(CardBase):
    prompt: str | None = Field(default=None, max_length=100)


class CardUpdate(CardBase):
    front: str | None = None
    back: str | None = None


class Card(CardBase):
    id: uuid.UUID
    collection_id: uuid.UUID


class Collection(CollectionBase):
    id: uuid.UUID
    user_id: uuid.UUID
    cards: list[Card]


class CollectionList(SQLModel):
    data: list[Collection]
    count: int


class CardList(SQLModel):
    data: list[Card]
    count: int


class PracticeSessionBase(SQLModel):
    collection_id: uuid.UUID


class PracticeSessionCreate(PracticeSessionBase):  # Can be used as the request body
    pass


class PracticeSessionUpdate(SQLModel):
    is_completed: bool | None = None


class PracticeCardBase(SQLModel):
    card_id: uuid.UUID


class PracticeCardCreate(PracticeCardBase):
    pass


class PracticeCardUpdate(SQLModel):
    is_correct: bool | None = None
    is_practiced: bool | None = None


class PracticeCard(PracticeCardBase):
    id: uuid.UUID
    session_id: uuid.UUID
    is_correct: bool | None
    is_practiced: bool
    created_at: datetime
    updated_at: datetime


class PracticeSession(PracticeSessionBase):
    id: uuid.UUID
    user_id: uuid.UUID
    is_completed: bool
    total_cards: int
    cards_practiced: int
    correct_answers: int
    created_at: datetime
    updated_at: datetime
    practice_cards: list[PracticeCard]


class PracticeSessionList(SQLModel):
    data: list[PracticeSession]
    count: int


class PracticeCardResponse(SQLModel):
    card: Card
    is_practiced: bool
    is_correct: bool | None


class AIFlashcard(BaseModel):
    front: str
    back: str


class AIFlashcardCollection(BaseModel):
    name: str
    cards: list[AIFlashcard]


class PracticeResultSubmit(SQLModel):
    is_correct: bool


class PracticeCardListResponse(SQLModel):
    data: list[PracticeCardResponse]
    count: int


class PracticeCardResultPatch(SQLModel):
    is_correct: bool
