import uuid
from datetime import datetime

from sqlmodel import SQLModel


class CollectionBasicInfo(SQLModel):
    name: str
    total_cards: int
    total_practice_sessions: int


class PracticeSessionStats(SQLModel):
    id: uuid.UUID
    created_at: datetime
    cards_practiced: int
    correct_answers: int
    total_cards: int
    is_completed: bool


class CardBasicStats(SQLModel):
    id: uuid.UUID
    front: str
    total_attempts: int
    correct_answers: int


class CollectionStats(SQLModel):
    collection_info: CollectionBasicInfo
    recent_sessions: list[PracticeSessionStats]
    difficult_cards: list[CardBasicStats]
