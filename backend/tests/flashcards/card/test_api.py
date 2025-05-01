import uuid
from typing import Any

import pytest
from fastapi.testclient import TestClient

from src.core.config import settings
from src.flashcards.schemas import CardCreate, CardUpdate, CollectionCreate


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
    return rsp.json()


@pytest.fixture
def test_card(
    client: TestClient,
    normal_user_token_headers: dict[str, str],
    test_collection: dict[str, Any],
) -> dict[str, Any]:
    """Create a testing card"""
    collection_id = test_collection["id"]
    card_data = CardCreate(front="Test front", back="Test back")
    rsp = client.post(
        f"{settings.API_V1_STR}/collections/{collection_id}/cards/",
        json=card_data.model_dump(),
        headers=normal_user_token_headers,
    )

    assert rsp.status_code == 200
    return rsp.json()


@pytest.fixture
def test_multiple_cards(
    client: TestClient,
    normal_user_token_headers: dict[str, str],
    test_collection: dict[str, Any],
) -> list[dict[str, Any]]:
    """Create testing cards"""
    collection_id = test_collection["id"]

    cards = []
    for i in range(5):
        card_data = CardCreate(front=f"Test front {i}", back=f"Test back {i}")
        rsp = client.post(
            f"{settings.API_V1_STR}/collections/{collection_id}/cards/",
            json=card_data.model_dump(),
            headers=normal_user_token_headers,
        )

        assert rsp.status_code == 200
        cards.append(rsp.json())
    return cards


def test_create_card_with_nonexistent_collection(
    client: TestClient, normal_user_token_headers: dict[str, str]
):
    non_existent_collection_id = uuid.uuid4()
    card_data = CardCreate(front="Test front", back="Test back")

    rsp = client.post(
        f"{settings.API_V1_STR}/collections/{non_existent_collection_id}/cards/",
        json=card_data.model_dump(),
        headers=normal_user_token_headers,
    )

    assert rsp.status_code == 404
    content = rsp.json()
    assert "detail" in content
    assert "not found" in content["detail"]


def test_read_card(
    client: TestClient,
    normal_user_token_headers: dict[str, str],
    test_collection: dict[str, Any],
    test_card: dict[str, Any],
):
    """Read one card"""

    collection_id = test_collection["id"]
    card_id = test_card["id"]
    rsp = client.get(
        f"{settings.API_V1_STR}/collections/{collection_id}/cards/{card_id}",
        headers=normal_user_token_headers,
    )

    assert rsp.status_code == 200
    content = rsp.json()
    assert content
    assert content["collection_id"] == collection_id
    assert content["id"] == card_id


def test_read_nonexistent_card(
    client: TestClient,
    normal_user_token_headers: dict[str, str],
    test_collection: dict[str, Any],
):
    collection_id = test_collection["id"]
    non_existent_card_id = str(uuid.uuid4())
    rsp = client.get(
        f"{settings.API_V1_STR}/collections/{collection_id}/cards/{non_existent_card_id}",
        headers=normal_user_token_headers,
    )

    assert rsp.status_code == 404
    content = rsp.json()
    assert "detail" in content
    assert "not found" in content["detail"]


def test_different_user_access(
    client: TestClient,
    superuser_token_headers: dict[str, str],
    test_collection: dict[str, Any],
    test_card: dict[str, Any],
):
    collection_id = test_collection["id"]
    card_id = test_card["id"]

    rsp = client.get(
        f"{settings.API_V1_STR}/collections/{collection_id}/cards/{card_id}",
        headers=superuser_token_headers,
    )

    assert rsp.status_code == 404


def test_read_cards(
    client: TestClient,
    normal_user_token_headers: dict[str, str],
    test_collection: dict[str, Any],
    test_card: dict[str, Any],
):
    """Read cards"""
    collection_id = test_collection["id"]
    rsp = client.get(
        f"{settings.API_V1_STR}/collections/{collection_id}/cards/",
        headers=normal_user_token_headers,
    )

    assert rsp.status_code == 200
    content = rsp.json()
    assert "data" in content
    assert "count" in content
    assert content["count"] >= 1

    card_ids = [card["id"] for card in content["data"]]
    assert test_card["id"] in card_ids


def test_read_cards_with_pagination(
    client: TestClient,
    normal_user_token_headers: dict[str, str],
    test_collection: dict[str, Any],
    test_multiple_cards: list[dict[str, Any]],
):
    collection_id = test_collection["id"]
    rsp = client.get(
        f"{settings.API_V1_STR}/collections/{collection_id}/cards?skip=2&limit=3",
        headers=normal_user_token_headers,
    )

    assert rsp.status_code == 200
    content = rsp.json()
    assert content["count"] >= len(test_multiple_cards)
    assert len(content["data"]) <= 3


def test_read_cards_with_nonexistent_collection(
    client: TestClient, normal_user_token_headers: dict[str, str]
):
    non_existent_collection_id = uuid.uuid4()

    rsp = client.get(
        f"{settings.API_V1_STR}/collections/{non_existent_collection_id}/cards",
        headers=normal_user_token_headers,
    )

    assert rsp.status_code == 404
    content = rsp.json()
    assert "detail" in content
    assert "not found" in content["detail"]


def test_update_card_success(
    client: TestClient,
    normal_user_token_headers: dict[str, str],
    test_collection: dict[str, Any],
    test_card: dict[str, Any],
):
    collection_id = test_collection["id"]
    card_id = test_card["id"]
    update_data = CardUpdate(front="Front Update", back=test_card["back"])

    rsp = client.put(
        f"{settings.API_V1_STR}/collections/{collection_id}/cards/{card_id}",
        json=update_data.model_dump(),
        headers=normal_user_token_headers,
    )

    assert rsp.status_code == 200
    content = rsp.json()
    assert collection_id == content["collection_id"]
    assert card_id == content["id"]
    assert content["front"] == update_data.front
    # Make sure other data not change
    assert content["back"] == test_card["back"]


def test_update_nonexistent_card(
    client: TestClient,
    normal_user_token_headers: dict[str, str],
    test_collection: dict[str, Any],
):
    collection_id = test_collection["id"]
    non_existent_card_id = str(uuid.uuid4())
    update_data = CardUpdate(
        front="Nonexistent Card Front", back="Nonexistent Card Back"
    )

    rsp = client.put(
        f"{settings.API_V1_STR}/collections/{collection_id}/cards/{non_existent_card_id}",
        json=update_data.model_dump(),
        headers=normal_user_token_headers,
    )

    assert rsp.status_code == 404
    content = rsp.json()
    assert "detail" in content
    assert "not found" in content["detail"]


def test_different_user_update(
    client: TestClient,
    normal_user_token_headers: dict[str, str],
    superuser_token_headers: dict[str, str],
    test_collection: dict[str, Any],
    test_card: dict[str, Any],
):
    collection_id = test_collection["id"]
    card_id = test_card["id"]
    update_data = CardUpdate(front="Cross Card Front", back="Cross Card Back")
    rsp = client.put(
        f"{settings.API_V1_STR}/collections/{collection_id}/cards/{card_id}",
        json=update_data.model_dump(),
        headers=superuser_token_headers,
    )

    assert rsp.status_code == 404

    # Verity the data is still the same before updating
    verify_rsp = client.get(
        f"{settings.API_V1_STR}/collections/{collection_id}/cards/{card_id}",
        headers=normal_user_token_headers,
    )
    assert verify_rsp.status_code == 200
    content = verify_rsp.json()

    assert content["collection_id"] == test_collection["id"]
    assert content["id"] == test_card["id"]
    assert content["front"] == test_card["front"]
    assert content["back"] == test_card["back"]


def test_delete_card_success(
    client: TestClient,
    normal_user_token_headers: dict[str, str],
    test_collection: dict[str, Any],
    test_card: dict[str, Any],
):
    collection_id = test_collection["id"]
    card_id = test_card["id"]
    rsp = client.delete(
        f"{settings.API_V1_STR}/collections/{collection_id}/cards/{card_id}",
        headers=normal_user_token_headers,
    )

    assert rsp.status_code == 204
    assert rsp.content == b""

    verify_rsp = client.get(
        f"{settings.API_V1_STR}/collections/{collection_id}/cards/{card_id}",
        headers=normal_user_token_headers,
    )
    assert verify_rsp.status_code == 404
    content = verify_rsp.json()
    assert "detail" in content
    assert "not found" in content["detail"]


def test_delete_nonexistent_card(
    client: TestClient,
    normal_user_token_headers: dict[str, str],
    test_collection: dict[str, Any],
):
    collection_id = test_collection["id"]
    non_existent_card_id = str(uuid.uuid4())

    rsp = client.delete(
        f"{settings.API_V1_STR}/collections/{collection_id}/cards/{non_existent_card_id}",
        headers=normal_user_token_headers,
    )

    assert rsp.status_code == 404
    content = rsp.json()
    assert "detail" in content
    assert "not found" in content["detail"]


def test_different_user_delete(
    client: TestClient,
    normal_user_token_headers: dict[str, str],
    superuser_token_headers: dict[str, str],
    test_collection: dict[str, Any],
    test_card: dict[str, Any],
):
    collection_id = test_collection["id"]
    card_id = test_card["id"]
    rsp = client.delete(
        f"{settings.API_V1_STR}/collections/{collection_id}/cards/{card_id}",
        headers=superuser_token_headers,
    )

    assert rsp.status_code == 404

    # Verity the data still exists
    verify_rsp = client.get(
        f"{settings.API_V1_STR}/collections/{collection_id}/cards/{card_id}",
        headers=normal_user_token_headers,
    )
    assert verify_rsp.status_code == 200


def test_deleted_card_not_in_list(
    client: TestClient,
    normal_user_token_headers: dict[str, str],
    test_collection: dict[str, Any],
    test_multiple_cards: list[dict[str, Any]],
):
    collection_id = test_collection["id"]
    rsp = client.get(
        f"{settings.API_V1_STR}/collections/{collection_id}/cards/",
        headers=normal_user_token_headers,
    )
    list_before = rsp.json()

    delete_card = test_multiple_cards[0]

    # Check test_card in the card list
    assert delete_card["id"] in [card["id"] for card in list_before["data"]]

    # Delete test card
    rsp = client.delete(
        f"{settings.API_V1_STR}/collections/{collection_id}/cards/{delete_card['id']}",
        headers=normal_user_token_headers,
    )
    assert rsp.status_code == 204

    # Re-read the card list
    rsp = client.get(
        f"{settings.API_V1_STR}/collections/{collection_id}/cards/",
        headers=normal_user_token_headers,
    )
    list_after = rsp.json()
    assert list_after["count"] == len(test_multiple_cards) - 1
    assert delete_card["id"] not in [card["id"] for card in list_after["data"]]
