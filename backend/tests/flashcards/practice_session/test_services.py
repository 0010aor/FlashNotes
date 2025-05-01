import json
import uuid
from collections.abc import Generator
from typing import Any
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from sqlmodel import Session

from src.ai_models.gemini.exceptions import AIGenerationError
from src.ai_models.gemini.provider import GeminiProvider
from src.flashcards.models import Card, Collection, PracticeSession
from src.flashcards.schemas import (
    AIFlashcard,
    AIFlashcardCollection,
)
from src.flashcards.services import (
    _get_collection_cards,
    generate_ai_collection,
    get_or_create_practice_session,
    get_practice_card,
    get_practice_cards,
    get_practice_session,
    get_practice_sessions,
    record_practice_card_result,
)


def mock_get_provider() -> Generator[GeminiProvider, None, None]:
    mock_provider = AsyncMock(spec=GeminiProvider)
    yield mock_provider


@pytest.fixture
def test_practice_session(
    db: Session,
    test_collection_with_multiple_cards: Collection,
) -> PracticeSession:
    session = get_or_create_practice_session(
        session=db,
        collection_id=test_collection_with_multiple_cards.id,
        user_id=test_collection_with_multiple_cards.user_id,
    )
    return session


@pytest.fixture
def test_multiple_practice_sessions(
    db: Session,
    test_multiple_collections: list[Collection],
) -> list[PracticeSession]:
    sessions = []
    for i in range(3):
        session = get_or_create_practice_session(
            session=db,
            collection_id=test_multiple_collections[i].id,
            user_id=test_multiple_collections[i].user_id,
        )
        sessions.append(session)

    return sessions


def test_get_or_create_practice_sessions(
    db: Session,
    test_collection_with_multiple_cards: Collection,
    test_user: dict[str, Any],
):
    session = get_or_create_practice_session(
        session=db,
        collection_id=test_collection_with_multiple_cards.id,
        user_id=test_collection_with_multiple_cards.user_id,
    )

    assert session is not None
    assert session.collection_id == test_collection_with_multiple_cards.id
    assert session.user_id == test_user["id"]
    assert session.is_completed is False
    assert session.total_cards == len(test_collection_with_multiple_cards.cards)
    assert session.cards_practiced == 0
    assert session.correct_answers == 0
    assert session.created_at is not None
    assert session.updated_at is not None


def test_get_practice_session(
    db: Session,
    test_practice_session: PracticeSession,
    test_user: dict[str, Any],
):
    session = get_practice_session(
        session=db,
        session_id=test_practice_session.id,
        user_id=test_practice_session.user_id,
    )

    assert session is not None
    assert session.collection_id == test_practice_session.collection_id
    assert session.user_id == test_user["id"]
    assert session.is_completed is False
    assert session.total_cards == test_practice_session.total_cards
    assert session.cards_practiced == 0
    assert session.correct_answers == 0
    assert session.created_at is not None
    assert session.updated_at is not None


def test_get_practice_sessions(
    db: Session,
    test_multiple_practice_sessions: list[PracticeSession],
    test_user: dict[str, Any],
):
    limit = 2
    db_sessions, count = get_practice_sessions(
        session=db, user_id=test_user["id"], limit=limit
    )

    assert count == len(test_multiple_practice_sessions)
    assert limit == len(db_sessions)
    # Verify the order
    for i in range(len(db_sessions) - 1):
        assert db_sessions[i].updated_at >= db_sessions[i + 1].updated_at


def test_get_practice_sessions_with_skip(
    db: Session,
    test_multiple_practice_sessions: list[PracticeSession],
    test_user: dict[str, Any],
):
    skip = 2
    limit = 2
    db_sessions, count = get_practice_sessions(
        session=db, user_id=test_user["id"], skip=skip, limit=limit
    )

    assert count == len(test_multiple_practice_sessions)
    assert 1 == len(db_sessions)  # Due to the total sessions is 3


def test_get_collection_cards(
    db: Session,
    test_collection_with_multiple_cards: Collection,
):
    cards = _get_collection_cards(
        session=db, collection_id=test_collection_with_multiple_cards.id
    )

    assert len(cards) == len(test_collection_with_multiple_cards.cards)


def test_get_practice_card(db: Session, test_collection: Collection, test_card: Card):
    session = get_or_create_practice_session(
        session=db, collection_id=test_collection.id, user_id=test_collection.user_id
    )

    card = get_practice_card(
        session=db,
        practice_session_id=session.id,
        card_id=test_card.id,
    )

    assert card is not None
    assert card.card_id == test_card.id
    assert card.is_correct is None
    assert card.is_practiced is False


def test_get_nonexistent_practice_card(
    db: Session, test_practice_session: PracticeSession
):
    non_existent_card_id = uuid.uuid4()
    card = get_practice_card(
        session=db,
        practice_session_id=test_practice_session.id,
        card_id=non_existent_card_id,
    )

    assert card is None


def test_get_practice_cards(db: Session, test_practice_session: PracticeSession):
    limit = 3
    cards, count = get_practice_cards(
        session=db, practice_session_id=test_practice_session.id, limit=limit
    )

    assert limit == len(cards)
    assert count == len(test_practice_session.practice_cards)
    for card in cards:
        assert card.is_practiced is False
        assert card.is_correct is None


def test_get_practice_cards_with_status(
    db: Session, test_practice_session: PracticeSession
):
    cards, count = get_practice_cards(
        session=db, practice_session_id=test_practice_session.id
    )

    record_practice_card_result(session=db, practice_card=cards[0], is_correct=True)
    record_practice_card_result(session=db, practice_card=cards[1], is_correct=True)

    complete_count = 2
    cards, count = get_practice_cards(
        session=db, practice_session_id=test_practice_session.id, status="completed"
    )

    assert count == complete_count
    assert len(cards) == complete_count
    for card in cards:
        assert card.is_practiced is True
        assert card.is_correct is True

    cards, count = get_practice_cards(
        session=db, practice_session_id=test_practice_session.id, status="pending"
    )

    assert len(cards) == len(test_practice_session.practice_cards) - complete_count
    for card in cards:
        assert card.is_practiced is False
        assert card.is_correct is None


def test_get_practice_card_with_asc_order(
    db: Session, test_practice_session: PracticeSession
):
    cards, _ = get_practice_cards(
        session=db, practice_session_id=test_practice_session.id, order="asc"
    )

    # Verify the order
    for i in range(len(cards) - 1):
        assert cards[i].updated_at <= cards[i + 1].updated_at


def test_get_practice_card_with_desc_order(
    db: Session, test_practice_session: PracticeSession
):
    cards, _ = get_practice_cards(
        session=db, practice_session_id=test_practice_session.id, order="desc"
    )

    # Verify the order
    for i in range(len(cards) - 1):
        assert cards[i].updated_at >= cards[i + 1].updated_at


def test_record_practice_card_result(
    db: Session, test_practice_session: PracticeSession
):
    before_card = test_practice_session.practice_cards[0]
    original_updated_at = before_card.updated_at

    import time

    time.sleep(0.01)

    after_card = record_practice_card_result(
        session=db, practice_card=before_card, is_correct=True
    )

    session = get_practice_session(
        session=db,
        session_id=test_practice_session.id,
        user_id=test_practice_session.user_id,
    )

    assert session.correct_answers == 1
    assert session.cards_practiced == 1
    assert session.total_cards == len(test_practice_session.practice_cards)
    assert session.is_completed is False
    assert after_card.updated_at > original_updated_at
    assert after_card.is_correct is True
    assert after_card.is_practiced is True

    for card in test_practice_session.practice_cards[0:]:
        record_practice_card_result(session=db, practice_card=card, is_correct=True)

    session = get_practice_session(
        session=db,
        session_id=test_practice_session.id,
        user_id=test_practice_session.user_id,
    )

    # assert session.is_completed is True
    assert session.cards_practiced == len(test_practice_session.practice_cards)
    assert session.correct_answers == len(test_practice_session.practice_cards)


@pytest.mark.asyncio
async def test_generate_ai_collection():
    mock_provider = AsyncMock()
    test_cards = [AIFlashcard(front="Question 1", back="Answer 1")]
    ai_collection = AIFlashcardCollection(name="AI Generated", cards=test_cards)

    with patch("src.flashcards.services.get_flashcard_config") as mock_get_config:
        mock_provider.run_model.return_value = json.dumps(
            {
                "collection": {
                    "name": "AI Generated",
                    "cards": [{"front": "Question 1", "back": "Answer 1"}],
                }
            }
        )
        mock_get_config.return_value = MagicMock()
        result = await generate_ai_collection(mock_provider, "Create pytest flashcards")
        assert result.name == ai_collection.name
        assert len(result.cards) == 1
        assert result.cards[0].front == "Question 1"
        assert result.cards[0].back == "Answer 1"
        mock_provider.run_model.assert_called_once()


@pytest.mark.asyncio
async def test_generate_ai_collection_invalid_json():
    mock_provider = AsyncMock()
    mock_provider.run_model.return_value = "Invalid JSON"
    with patch("src.flashcards.services.get_flashcard_config"):
        with pytest.raises(
            AIGenerationError, match="Failed to parse AI response as JSON"
        ):
            await generate_ai_collection(mock_provider, "Create flashcards")


@pytest.mark.asyncio
async def test_generate_ai_collection_missing_collection():
    mock_provider = AsyncMock()
    mock_provider.run_model.return_value = json.dumps({"other_field": "value"})
    with patch("src.flashcards.services.get_flashcard_config"):
        with pytest.raises(
            AIGenerationError, match="AI response missing 'collection' field"
        ):
            await generate_ai_collection(mock_provider, "Create flashcards")


@pytest.mark.asyncio
async def test_generate_ai_collection_empty_cards():
    mock_provider = AsyncMock()
    mock_provider.run_model.return_value = json.dumps(
        {"collection": {"name": "Empty Collection", "cards": []}}
    )
    with patch("src.flashcards.services.get_flashcard_config"):
        with pytest.raises(
            AIGenerationError, match="AI generated an empty collection with no cards"
        ):
            await generate_ai_collection(mock_provider, "Create flashcards")


@pytest.mark.asyncio
async def test_generate_ai_flashcard_success():
    mock_provider = AsyncMock()
    mock_get_config = MagicMock()
    valid_json_response = json.dumps(
        {"front": "What is Pytest?", "back": "A Python testing framework."}
    )
    mock_provider.run_model.return_value = valid_json_response
    with patch("src.flashcards.services.get_card_config", return_value=mock_get_config):
        from src.flashcards.services import generate_ai_flashcard

        result = await generate_ai_flashcard(
            "Create a flashcard about Pytest", mock_provider
        )
        assert result.front == "What is Pytest?"
        assert result.back == "A Python testing framework."
        mock_provider.run_model.assert_called_once_with(
            mock_get_config, "Create a flashcard about Pytest"
        )


@pytest.mark.asyncio
async def test_generate_ai_flashcard_invalid_json():
    mock_provider = AsyncMock()
    mock_provider.run_model.return_value = "Invalid JSON"
    with patch("src.flashcards.services.get_card_config"):
        from src.flashcards.services import generate_ai_flashcard

        with pytest.raises(
            AIGenerationError, match="Failed to parse AI response as JSON"
        ):
            await generate_ai_flashcard("Create a flashcard", mock_provider)


@pytest.mark.asyncio
async def test_generate_ai_flashcard_missing_fields():
    mock_provider = AsyncMock()
    mock_provider.run_model.return_value = json.dumps({"front": "Only front"})
    with patch("src.flashcards.services.get_card_config"):
        from src.flashcards.services import generate_ai_flashcard

        with pytest.raises(
            AIGenerationError, match="AI response missing 'front' or 'back' field"
        ):
            await generate_ai_flashcard("Create a flashcard", mock_provider)
