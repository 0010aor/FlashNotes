import uuid
from datetime import datetime, timedelta

from sqlalchemy import Float, case, func
from sqlmodel import Session, select

from src.flashcards.models import Card, Collection, PracticeCard, PracticeSession

from .schemas import (
    CardBasicStats,
    CollectionBasicInfo,
    CollectionStats,
    PracticeSessionStats,
)


def _get_collection_basic_info(
    session: Session, collection_id: uuid.UUID
) -> CollectionBasicInfo:
    collection = session.get(Collection, collection_id)
    if not collection:
        raise ValueError(
            f"Collection with id {collection_id} not found in _get_collection_basic_info"
        )
    collection_name = collection.name
    total_cards_stmt = select(func.count(Card.id)).where(
        Card.collection_id == collection_id
    )
    total_cards = session.exec(total_cards_stmt).one()
    total_sessions_stmt = select(func.count(PracticeSession.id)).where(
        PracticeSession.collection_id == collection_id,
        PracticeSession.is_completed,
    )
    total_sessions = session.exec(total_sessions_stmt).one()

    return CollectionBasicInfo(
        name=collection_name,
        total_cards=total_cards,
        total_practice_sessions=total_sessions,
    )


def _get_recent_sessions(
    session: Session, collection_id: uuid.UUID, recent_date: datetime, limit: int = 10
) -> list[PracticeSessionStats]:
    """Get recent practice sessions using an optimized query."""
    statement = (
        select(PracticeSession)
        .where(
            PracticeSession.collection_id == collection_id,
            PracticeSession.created_at >= recent_date,
        )
        .order_by(PracticeSession.created_at.asc())
        .limit(limit)
    )

    sessions = session.exec(statement).all()
    return [
        PracticeSessionStats(
            id=s.id,
            created_at=s.created_at,
            cards_practiced=s.cards_practiced,
            correct_answers=s.correct_answers,
            total_cards=s.total_cards,
            is_completed=s.is_completed,
        )
        for s in sessions
    ]


def _get_difficult_cards(
    session: Session,
    collection_id: uuid.UUID,
    recent_date: datetime,
    min_attempts: int = 2,
    limit: int = 5,
) -> list[CardBasicStats]:
    statement = (
        select(
            Card.id,
            Card.front,
            func.count(PracticeCard.id).label("total_attempts"),
            func.sum(case((PracticeCard.is_correct, 1), else_=0)).label(
                "correct_answers"
            ),
        )
        .join(PracticeCard, Card.id == PracticeCard.card_id)
        .join(PracticeSession, PracticeCard.session_id == PracticeSession.id)
        .where(
            Card.collection_id == collection_id,
            PracticeSession.is_completed,
            PracticeCard.is_practiced,
            PracticeCard.is_correct.is_not(None),
            PracticeSession.created_at >= recent_date,
        )
        .group_by(Card.id, Card.front)
        .having(func.count(PracticeCard.id) >= min_attempts)
        .order_by(
            func.sum(case((PracticeCard.is_correct, 1), else_=0)).cast(Float)
            / func.count(PracticeCard.id)
        )
        .limit(limit)
    )

    results = session.exec(statement).all()
    return [
        CardBasicStats(
            id=card_id,
            front=front[:100],
            total_attempts=total_attempts,
            correct_answers=correct_answers,
        )
        for card_id, front, total_attempts, correct_answers in results
    ]


def get_collection_stats(
    session: Session, collection_id: uuid.UUID, max_days: int = 30
) -> CollectionStats:
    recent_date = datetime.now() - timedelta(days=max_days)

    return CollectionStats(
        collection_info=_get_collection_basic_info(session, collection_id),
        recent_sessions=_get_recent_sessions(session, collection_id, recent_date),
        difficult_cards=_get_difficult_cards(session, collection_id, recent_date),
    )
