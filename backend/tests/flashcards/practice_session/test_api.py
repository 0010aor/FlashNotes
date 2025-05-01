import uuid
from datetime import datetime
from typing import Any
from unittest.mock import patch

import pytest
from fastapi.testclient import TestClient

from src.core.config import settings
from src.flashcards.schemas import (
    CardCreate,
    CollectionCreate,
    PracticeCard,
    PracticeCardResultPatch,
    PracticeSession,
)


@pytest.fixture
def test_collection(
    client: TestClient, normal_user_token_headers: dict[str, str]
) -> dict[str, Any]:
    """Create a testing collection"""
    collection_data = CollectionCreate(name="Test Collection")
    rsp = client.post(
        f"{settings.API_V1_STR}/collections/",
        json=collection_data.model_dump(),
        headers=normal_user_token_headers,
    )
    assert rsp.status_code == 200
    collection = rsp.json()

    card_count = 3
    for i in range(card_count):
        card_data = CardCreate(front=f"Test front {i}", back=f"Test back {i}")
        rsp = client.post(
            f"{settings.API_V1_STR}/collections/{collection['id']}/cards",
            json=card_data.model_dump(),
            headers=normal_user_token_headers,
        )
        assert rsp.status_code == 200

    return collection


@pytest.fixture
def test_practice_session(
    client: TestClient,
    normal_user_token_headers: dict[str, str],
    test_collection: dict[str, Any],
) -> dict[str, Any]:
    """Create a testing practice session"""
    collection_id = test_collection["id"]

    rsp = client.post(
        f"{settings.API_V1_STR}/practice-sessions",
        json={"collection_id": str(collection_id)},
        headers=normal_user_token_headers,
    )

    assert rsp.status_code == 200
    return rsp.json()


@pytest.fixture
def mock_completed_session() -> PracticeSession:
    session_id = uuid.uuid4()
    return PracticeSession(
        id=session_id,
        collection_id=uuid.uuid4(),
        user_id=uuid.uuid4(),
        is_completed=True,
        total_cards=2,
        cards_practiced=2,
        correct_answers=2,
        created_at=datetime.now(),
        updated_at=datetime.now(),
        practice_cards=[
            PracticeCard(
                id=uuid.uuid4(),
                card_id=uuid.uuid4(),
                session_id=session_id,
                is_correct=True,
                is_practiced=True,
                created_at=datetime.now(),
                updated_at=datetime.now(),
            ),
            PracticeCard(
                id=uuid.uuid4(),
                card_id=uuid.uuid4(),
                session_id=session_id,
                is_correct=True,
                is_practiced=True,
                created_at=datetime.now(),
                updated_at=datetime.now(),
            ),
        ],
    )


@pytest.fixture
def multiple_practice_sessions(
    client: TestClient, normal_user_token_headers: dict[str, str]
) -> dict[str, Any]:
    practice_session_count = 3

    # Create collections and sessions
    for i in range(practice_session_count):
        # Create collection first
        collection_data = CollectionCreate(name=f"Test Collection {i}")
        rsp = client.post(
            f"{settings.API_V1_STR}/collections/",
            json=collection_data.model_dump(),
            headers=normal_user_token_headers,
        )

        collection = rsp.json()
        collection_id = collection["id"]

        # Add card into collection
        card_data = CardCreate(front=f"Test front {i}", back=f"Test back {i}")
        rsp = client.post(
            f"{settings.API_V1_STR}/collections/{collection_id}/cards",
            json=card_data.model_dump(),
            headers=normal_user_token_headers,
        )

        # Create practice session
        rsp = client.post(
            f"{settings.API_V1_STR}/practice-sessions",
            json={"collection_id": str(collection_id)},
            headers=normal_user_token_headers,
        )

    rsp = client.get(
        f"{settings.API_V1_STR}/practice-sessions", headers=normal_user_token_headers
    )
    sessions = rsp.json()
    return sessions


def test_start_practice_session(
    client: TestClient,
    normal_user_token_headers: dict[str, str],
    test_collection: dict[str, Any],
):
    collection_id = test_collection["id"]

    rsp = client.post(
        f"{settings.API_V1_STR}/practice-sessions",
        json={"collection_id": str(collection_id)},
        headers=normal_user_token_headers,
    )

    assert rsp.status_code == 200
    session = rsp.json()
    assert session["collection_id"] == collection_id
    assert session["is_completed"] is False
    assert session["total_cards"] > 0
    assert session["cards_practiced"] == 0
    assert session["correct_answers"] == 0


def test_start_practice_with_empty_collection(
    client: TestClient, normal_user_token_headers
):
    # Create collection first
    collection_data = CollectionCreate(name="Empty Collection")
    rsp = client.post(
        f"{settings.API_V1_STR}/collections/",
        json=collection_data.model_dump(),
        headers=normal_user_token_headers,
    )

    collection = rsp.json()
    collection_id = collection["id"]
    rsp = client.post(
        f"{settings.API_V1_STR}/practice-sessions",
        json={"collection_id": str(collection_id)},
        headers=normal_user_token_headers,
    )

    assert rsp.status_code == 400
    content = rsp.json()
    assert "detail" in content
    assert "empty collection" in content["detail"]


def test_start_practice_session_with_nonexistent_collection(
    client: TestClient,
    normal_user_token_headers: dict[str, str],
):
    non_existent_collection_id = uuid.uuid4()

    rsp = client.post(
        f"{settings.API_V1_STR}/practice-sessions",
        json={"collection_id": str(non_existent_collection_id)},
        headers=normal_user_token_headers,
    )

    assert rsp.status_code == 404
    content = rsp.json()
    assert "detail" in content
    assert "not found" in content["detail"]


def test_list_practice_sessions(
    client: TestClient,
    normal_user_token_headers: dict[str, str],
    test_practice_session: dict[str, Any],
):
    """List practice session"""

    rsp = client.get(
        f"{settings.API_V1_STR}/practice-sessions", headers=normal_user_token_headers
    )

    assert rsp.status_code == 200
    content = rsp.json()
    assert "data" in content
    assert "count" in content
    assert len(content["data"]) >= 1

    session_ids = [session["id"] for session in content["data"]]
    assert test_practice_session["id"] in session_ids


def test_list_practice_session_with_pagination(
    client: TestClient,
    normal_user_token_headers: dict[str, str],
    multiple_practice_sessions: dict[str, Any],
):
    rsp = client.get(
        f"{settings.API_V1_STR}/practice-sessions?skip=0&limit=2",
        headers=normal_user_token_headers,
    )

    assert rsp.status_code == 200
    content = rsp.json()

    assert len(content["data"]) <= 2
    assert content["count"] == multiple_practice_sessions["count"]


def test_get_practice_session_status(
    client: TestClient,
    normal_user_token_headers: dict[str, str],
    test_practice_session: dict[str, Any],
):
    session_id = test_practice_session["id"]

    rsp = client.get(
        f"{settings.API_V1_STR}/practice-sessions/{session_id}",
        headers=normal_user_token_headers,
    )

    assert rsp.status_code == 200
    content = rsp.json()

    assert session_id == content["id"]
    assert "total_cards" in content
    assert "cards_practiced" in content
    assert "correct_answers" in content


def test_get_nonexistent_practice_session(
    client: TestClient, normal_user_token_headers: dict[str, str]
):
    non_existent_session_id = str(uuid.uuid4())

    rsp = client.get(
        f"{settings.API_V1_STR}/practice-sessions/{non_existent_session_id}",
        headers=normal_user_token_headers,
    )

    assert rsp.status_code == 404
    content = rsp.json()
    assert "detail" in content
    assert "not found" in content["detail"]


def test_list_practice_cards(
    client: TestClient,
    normal_user_token_headers: dict[str, str],
    test_practice_session: dict[str, Any],
):
    session_id = test_practice_session["id"]

    rsp = client.get(
        f"{settings.API_V1_STR}/practice-sessions/{session_id}/cards",
        headers=normal_user_token_headers,
    )

    assert rsp.status_code == 200
    content = rsp.json()

    # Verify PracticeSessionList response
    assert "data" in content
    assert "count" in content
    assert content["count"] > 0

    # Verify PracticeCardResponse
    card = content["data"][0]
    assert "card" in card
    assert "is_practiced" in card
    assert "is_correct" in card

    assert card["is_practiced"] is False
    assert card["is_correct"] is None


def test_list_practice_cards_with_nonexistent_session(
    client: TestClient,
    normal_user_token_headers: dict[str, str],
):
    non_existent_session_id = str(uuid.uuid4())

    rsp = client.get(
        f"{settings.API_V1_STR}/practice-sessions/{non_existent_session_id}/cards",
        headers=normal_user_token_headers,
    )

    assert rsp.status_code == 404
    content = rsp.json()
    assert "detail" in content
    assert "not found" in content["detail"]


def test_list_practice_cards_with_status_filter(
    client: TestClient,
    normal_user_token_headers: dict[str, str],
    test_practice_session: dict[str, Any],
):
    session_id = test_practice_session["id"]

    rsp = client.get(
        f"{settings.API_V1_STR}/practice-sessions/{session_id}",
        headers=normal_user_token_headers,
    )

    assert rsp.status_code == 200
    content = rsp.json()

    cards = content["practice_cards"]
    card_id = cards[0]["card_id"]

    # Mark card as practiced and correct
    practice_result = PracticeCardResultPatch(is_correct=True)
    rsp = client.patch(
        f"{settings.API_V1_STR}/practice-sessions/{session_id}/cards/{card_id}",
        json=practice_result.model_dump(),
        headers=normal_user_token_headers,
    )

    assert rsp.status_code == 200

    rsp = client.get(
        f"{settings.API_V1_STR}/practice-sessions/{session_id}/cards?status=completed",
        headers=normal_user_token_headers,
    )

    assert rsp.status_code == 200
    complete_cards = rsp.json()["data"]

    assert len(complete_cards) == 1
    assert complete_cards[0]["is_practiced"] is True
    assert complete_cards[0]["is_correct"] is True

    rsp = client.get(
        f"{settings.API_V1_STR}/practice-sessions/{session_id}/cards?status=pending",
        headers=normal_user_token_headers,
    )

    pending_cards = rsp.json()["data"]

    assert len(pending_cards) == 2
    for card in pending_cards:
        assert card["is_practiced"] is False


def test_update_practice_card_result(
    client: TestClient,
    normal_user_token_headers: dict[str, str],
    test_practice_session: dict[str, Any],
):
    session_id = test_practice_session["id"]

    rsp = client.get(
        f"{settings.API_V1_STR}/practice-sessions/{session_id}/cards",
        headers=normal_user_token_headers,
    )

    assert rsp.status_code == 200
    cards = rsp.json()["data"]
    card_id = cards[0]["card"]["id"]

    # Mark card0 as practiced and correct
    practice_result = PracticeCardResultPatch(is_correct=True)
    rsp = client.patch(
        f"{settings.API_V1_STR}/practice-sessions/{session_id}/cards/{card_id}",
        json=practice_result.model_dump(),
        headers=normal_user_token_headers,
    )

    assert rsp.status_code == 200
    result = rsp.json()

    assert result["is_practiced"] is True
    assert result["is_correct"] is True

    # Check the session stats are updated
    rsp = client.get(
        f"{settings.API_V1_STR}/practice-sessions/{session_id}",
        headers=normal_user_token_headers,
    )

    session = rsp.json()
    assert session["cards_practiced"] == 1
    assert session["correct_answers"] == 1

    card_id = cards[1]["card"]["id"]

    # Mark card1 as practiced and correct
    practice_result = PracticeCardResultPatch(is_correct=False)
    rsp = client.patch(
        f"{settings.API_V1_STR}/practice-sessions/{session_id}/cards/{card_id}",
        json=practice_result.model_dump(),
        headers=normal_user_token_headers,
    )

    assert rsp.status_code == 200
    result = rsp.json()

    assert result["is_practiced"] is True
    assert result["is_correct"] is False

    # Check the session stats are updated
    rsp = client.get(
        f"{settings.API_V1_STR}/practice-sessions/{session_id}",
        headers=normal_user_token_headers,
    )

    session = rsp.json()
    assert session["cards_practiced"] == 2
    assert session["correct_answers"] == 1


def test_update_practice_card_with_nonexistent_session(
    client: TestClient, normal_user_token_headers: dict[str, str]
):
    non_existent_session_id = str(uuid.uuid4())
    card_id = str(uuid.uuid4())

    practice_result = PracticeCardResultPatch(is_correct=True)
    rsp = client.patch(
        f"{settings.API_V1_STR}/practice-sessions/{non_existent_session_id}/cards/{card_id}",
        json=practice_result.model_dump(),
        headers=normal_user_token_headers,
    )

    assert rsp.status_code == 404
    content = rsp.json()
    assert "detail" in content
    assert "not found" in content["detail"]


def test_update_practice_card_with_nonexistent_card(
    client: TestClient,
    normal_user_token_headers: dict[str, str],
    test_practice_session: dict[str, Any],
):
    session_id = test_practice_session["id"]
    non_existent_card_id = str(uuid.uuid4())

    practice_result = PracticeCardResultPatch(is_correct=True)
    rsp = client.patch(
        f"{settings.API_V1_STR}/practice-sessions/{session_id}/cards/{non_existent_card_id}",
        json=practice_result.model_dump(),
        headers=normal_user_token_headers,
    )

    assert rsp.status_code == 404
    content = rsp.json()
    assert "detail" in content
    assert "not found" in content["detail"]


def test_update_practice_card_with_completed_session(
    client: TestClient,
    normal_user_token_headers: dict[str, str],
    mock_completed_session: PracticeSession,
):
    with patch("src.flashcards.services.get_practice_session") as mock_session:
        mock_session.return_value = mock_completed_session

        practice_result = PracticeCardResultPatch(is_correct=True)
        rsp = client.patch(
            f"{settings.API_V1_STR}/practice-sessions/{mock_completed_session.id}/cards/{mock_completed_session.practice_cards[0].id}",
            json=practice_result.model_dump(),
            headers=normal_user_token_headers,
        )

        mock_session.assert_called_once()

        assert rsp.status_code == 400
        content = rsp.json()

        assert "detail" in content
        assert "completed" in content["detail"]
