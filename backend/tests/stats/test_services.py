import uuid
from datetime import datetime
from typing import Any
from unittest.mock import MagicMock, patch

import pytest
from sqlmodel import Session

from src.flashcards.models import Collection
from src.stats.schemas import (
    CardBasicStats,
    CollectionBasicInfo,
    CollectionStats,
    PracticeSessionStats,
)
from src.stats.services import (
    _get_collection_basic_info,
    _get_difficult_cards,
    _get_recent_sessions,
    get_collection_stats,
)
from src.users.schemas import UserCreate
from src.users.services import create_user
from tests.stats.utils import create_cards, create_practice_cards, create_sessions
from tests.utils.utils import random_email, random_lower_string


@pytest.fixture
def test_user(db: Session) -> dict[str, Any]:
    email = random_email()
    password = random_lower_string()
    full_name = random_lower_string()

    user_in = UserCreate(email=email, password=password, full_name=full_name)
    user = create_user(session=db, user_create=user_in)

    return {"id": user.id, "email": user.email}


@pytest.fixture
def collection_with_sessions(db, test_user: dict[str, Any]):
    def _create(user_id, num_cards=5, num_sessions=10):
        collection = Collection(name="Test Collection", user_id=user_id)
        db.add(collection)
        db.flush()
        cards = create_cards(db, collection, num_cards)
        sessions = create_sessions(db, user_id, collection, num_sessions, num_cards)
        create_practice_cards(db, sessions, cards)
        return collection

    collection_out = _create(user_id=test_user["id"])

    return collection_out


def test_get_collection_basic_info_success(
    db: Session, collection_with_sessions: Collection
):
    info = _get_collection_basic_info(
        session=db, collection_id=collection_with_sessions.id
    )

    assert info is not None
    assert info.name == collection_with_sessions.name
    assert info.total_cards == len(collection_with_sessions.cards)
    assert info.total_practice_sessions == len(
        collection_with_sessions.practice_sessions
    )


def test_get_collection_basic_info_with_nonexistent_collection(db: Session):
    non_existent_collection_id = uuid.uuid4()
    with pytest.raises(ValueError) as exc_info:
        _get_collection_basic_info(session=db, collection_id=non_existent_collection_id)

    assert f"Collection with id {non_existent_collection_id} not found" in str(
        exc_info.value
    )


def test_get_recent_sessions(db: Session, collection_with_sessions: Collection):
    sessions = _get_recent_sessions(
        session=db, collection_id=collection_with_sessions.id
    )

    assert isinstance(sessions, list)
    assert len(sessions) == len(collection_with_sessions.practice_sessions)


def test_get_difficult_cards():
    mock_session = MagicMock(spec=Session)
    mock_collection_id = uuid.uuid4()

    mock_difficult_cards = [
        (uuid.uuid4(), "Difficult Card 1", 7, 2),
        (uuid.uuid4(), "Difficult Card 2", 6, 2),
        (uuid.uuid4(), "Difficult Card 3", 5, 1),
    ]

    mock_exec = mock_session.exec.return_value
    mock_exec.all.return_value = mock_difficult_cards

    result = _get_difficult_cards(
        session=mock_session, collection_id=mock_collection_id
    )

    assert isinstance(result, list)
    assert len(result) == len(mock_difficult_cards)

    for i, card_stat in enumerate(result):
        assert card_stat.id == mock_difficult_cards[i][0]
        assert card_stat.front == mock_difficult_cards[i][1]
        assert card_stat.total_attempts == mock_difficult_cards[i][2]
        assert card_stat.correct_answers == mock_difficult_cards[i][3]


def test_get_collection_stats():
    mock_session = MagicMock(spec=Session)
    mock_collection_id = uuid.uuid4()

    with (
        patch("src.stats.services._get_collection_basic_info") as mock_get_info,
        patch("src.stats.services._get_recent_sessions") as mock_get_sessions,
        patch("src.stats.services._get_difficult_cards") as mock_get_cards,
    ):
        mock_get_info.return_value = CollectionBasicInfo(
            name="Pytest collection", total_cards=15, total_practice_sessions=7
        )
        mock_get_sessions.return_value = [
            PracticeSessionStats(
                id=uuid.uuid4(),
                created_at=datetime.now(),
                cards_practiced=7,
                correct_answers=7,
                total_cards=7,
                is_completed=True,
            ),
            PracticeSessionStats(
                id=uuid.uuid4(),
                created_at=datetime.now(),
                cards_practiced=7,
                correct_answers=2,
                total_cards=7,
                is_completed=True,
            ),
        ]
        mock_get_cards.return_value = [
            CardBasicStats(
                id=uuid.uuid4(),
                front="Difficult Card 1",
                total_attempts=7,
                correct_answers=2,
            ),
            CardBasicStats(
                id=uuid.uuid4(),
                front="Difficult Card 2",
                total_attempts=6,
                correct_answers=2,
            ),
        ]

        result = get_collection_stats(mock_session, mock_collection_id)

        assert isinstance(result, CollectionStats)
        assert result.collection_info == mock_get_info.return_value
        assert result.recent_sessions == mock_get_sessions.return_value
        assert result.difficult_cards == mock_get_cards.return_value

        mock_get_info.assert_called_once_with(mock_session, mock_collection_id)
        mock_get_sessions.assert_called_once_with(
            session=mock_session, collection_id=mock_collection_id, limit=30
        )
        mock_get_cards.assert_called_once_with(
            session=mock_session, collection_id=mock_collection_id
        )
