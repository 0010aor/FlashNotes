import uuid
from typing import Any
from unittest.mock import AsyncMock, patch

import pytest
from fastapi.testclient import TestClient

from src.ai_models.gemini.exceptions import AIGenerationError
from src.core.config import settings
from src.flashcards.schemas import Card, Collection, CollectionCreate, CollectionUpdate


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
def test_multiple_collections(
    client: TestClient, normal_user_token_headers: dict[str, str]
) -> list[dict[str, Any]]:
    """Create multiple testing collections"""

    collections = []
    for i in range(5):
        collection_data = CollectionCreate(name=f"Test Collection {i}")
        rsp = client.post(
            f"{settings.API_V1_STR}/collections/",
            json=collection_data.model_dump(),
            headers=normal_user_token_headers,
        )

        assert rsp.status_code == 200
        collections.append(rsp.json())
    return collections


@pytest.fixture
def mock_collection() -> Collection:
    collection_id = uuid.uuid4()
    collection = Collection(
        id=collection_id,
        name="AI collection",
        user_id=uuid.uuid4(),
        cards=[
            Card(
                id=uuid.uuid4(),
                front="front1",
                back="back1",
                collection_id=collection_id,
            ),
            Card(
                id=uuid.uuid4(),
                front="front2",
                back="back2",
                collection_id=collection_id,
            ),
        ],
    )
    return collection


def test_create_collection_with_prompt(
    client: TestClient,
    normal_user_token_headers: dict[str, str],
    mock_collection: Collection,
):
    collection_data = CollectionCreate(
        name="AI collection", prompt="Create flashcards about pytest"
    )

    with patch(
        "src.flashcards.services.generate_ai_collection", new_callable=AsyncMock
    ) as mock_ai_generate:
        mock_ai_generate.return_value = mock_collection

        rsp = client.post(
            f"{settings.API_V1_STR}/collections/",
            json=collection_data.model_dump(),
            headers=normal_user_token_headers,
        )

        assert rsp.status_code == 200
        content = rsp.json()
        assert content["name"] == collection_data.name
        assert content["id"] == str(mock_collection.id)

        mock_ai_generate.assert_called_once()


def test_create_collection_with_ai_generation_error(
    client: TestClient, normal_user_token_headers: dict[str, str]
):
    collection_data = CollectionCreate(
        name="Test AI Error", prompt="Create flashcards but fail with AI error"
    )

    with patch(
        "src.flashcards.services.generate_ai_collection", new_callable=AsyncMock
    ) as mock_ai_generate:
        err_msg = "AI service is unavailable"
        mock_ai_generate.side_effect = AIGenerationError(err_msg)

        rsp = client.post(
            f"{settings.API_V1_STR}/collections/",
            json=collection_data.model_dump(),
            headers=normal_user_token_headers,
        )

        assert rsp.status_code == 500
        content = rsp.json()
        assert "detail" in content
        assert err_msg in content["detail"]


def test_read_collection(
    client: TestClient,
    normal_user_token_headers: dict[str, str],
    test_collection: dict[str, Any],
):
    """Read one collection"""

    collection_id = test_collection["id"]
    rsp = client.get(
        f"{settings.API_V1_STR}/collections/{collection_id}",
        headers=normal_user_token_headers,
    )

    assert rsp.status_code == 200
    content = rsp.json()
    assert content
    assert content["user_id"]
    assert content["id"] == collection_id


def test_read_nonexistent_collection(
    client: TestClient,
    normal_user_token_headers: dict[str, str],
):
    non_existent_collection_id = str(uuid.uuid4())
    rsp = client.get(
        f"{settings.API_V1_STR}/collections/{non_existent_collection_id}",
        headers=normal_user_token_headers,
    )

    assert rsp.status_code == 404
    content = rsp.json()
    assert "detail" in content
    assert "not found" in content["detail"]


def test_different_user_access(
    client: TestClient,
    normal_user_token_headers: dict[str, str],
    superuser_token_headers: dict[str, str],
):
    collection_data = CollectionCreate(name="User Restricted Collection")
    rsp = client.post(
        f"{settings.API_V1_STR}/collections/",
        json=collection_data.model_dump(),
        headers=normal_user_token_headers,
    )
    assert rsp.status_code == 200
    content = rsp.json()
    collection_id = content["id"]

    rsp = client.get(
        f"{settings.API_V1_STR}/collections/{collection_id}",
        headers=superuser_token_headers,
    )

    assert rsp.status_code == 404


def test_read_collections(
    client: TestClient,
    normal_user_token_headers: dict[str, str],
    test_collection: dict[str, Any],
):
    """Read collections"""
    rsp = client.get(
        f"{settings.API_V1_STR}/collections/", headers=normal_user_token_headers
    )

    assert rsp.status_code == 200
    content = rsp.json()
    assert "data" in content
    assert "count" in content
    assert content["count"] >= 1

    collection_ids = [collection["id"] for collection in content["data"]]
    assert test_collection["id"] in collection_ids


def test_read_collections_with_pagination(
    client: TestClient,
    normal_user_token_headers: dict[str, str],
    test_multiple_collections: list[dict[str, Any]],
):
    rsp = client.get(
        f"{settings.API_V1_STR}/collections?skip=2&limit=2",
        headers=normal_user_token_headers,
    )

    assert rsp.status_code == 200
    content = rsp.json()
    assert content["count"] >= len(test_multiple_collections)
    assert len(content["data"]) <= 2


def test_update_collection_success(
    client: TestClient,
    normal_user_token_headers: dict[str, str],
    test_collection: dict[str, Any],
):
    collection_id = test_collection["id"]
    update_data = CollectionUpdate(name="Update Collection")

    rsp = client.put(
        f"{settings.API_V1_STR}/collections/{collection_id}",
        json=update_data.model_dump(),
        headers=normal_user_token_headers,
    )

    assert rsp.status_code == 200
    content = rsp.json()
    assert collection_id == content["id"]
    assert content["name"] == update_data.name
    # Make sure other data not change
    assert len(content["cards"]) == len(test_collection["cards"])
    assert content["user_id"] == test_collection["user_id"]


def test_update_nonexistent_collection(
    client: TestClient, normal_user_token_headers: dict[str, str]
):
    non_existent_collection_id = str(uuid.uuid4())
    update_data = CollectionUpdate(name="Nonexistent Collection")

    rsp = client.put(
        f"{settings.API_V1_STR}/collections/{non_existent_collection_id}",
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
):
    collection_id = test_collection["id"]
    update_data = CollectionUpdate(name="Cross User Collection Update")
    rsp = client.put(
        f"{settings.API_V1_STR}/collections/{collection_id}",
        json=update_data.model_dump(),
        headers=superuser_token_headers,
    )

    assert rsp.status_code == 404

    # Verity the data is still the same before updating
    verify_rsp = client.get(
        f"{settings.API_V1_STR}/collections/{collection_id}",
        headers=normal_user_token_headers,
    )
    content = verify_rsp.json()

    assert content["name"] == test_collection["name"]


def test_delete_collection_success(
    client: TestClient,
    normal_user_token_headers: dict[str, str],
    test_collection: dict[str, Any],
):
    collection_id = test_collection["id"]
    rsp = client.delete(
        f"{settings.API_V1_STR}/collections/{collection_id}",
        headers=normal_user_token_headers,
    )

    assert rsp.status_code == 204
    assert rsp.content == b""

    verify_rsp = client.get(
        f"{settings.API_V1_STR}/collections/{collection_id}",
        headers=normal_user_token_headers,
    )
    assert verify_rsp.status_code == 404
    content = verify_rsp.json()
    assert "detail" in content
    assert "not found" in content["detail"]


def test_delete_nonexistent_collection(
    client: TestClient, normal_user_token_headers: dict[str, str]
):
    non_existent_collection_id = str(uuid.uuid4())

    rsp = client.delete(
        f"{settings.API_V1_STR}/collections/{non_existent_collection_id}",
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
):
    collection_id = test_collection["id"]
    rsp = client.delete(
        f"{settings.API_V1_STR}/collections/{collection_id}",
        headers=superuser_token_headers,
    )

    assert rsp.status_code == 404

    # Verity the data still exists
    verify_rsp = client.get(
        f"{settings.API_V1_STR}/collections/{collection_id}",
        headers=normal_user_token_headers,
    )
    assert verify_rsp.status_code == 200


def test_deleted_collection_not_in_list(
    client: TestClient,
    normal_user_token_headers: dict[str, str],
    test_multiple_collections: list[dict[str, Any]],
):
    rsp = client.get(
        f"{settings.API_V1_STR}/collections/", headers=normal_user_token_headers
    )
    list_before = rsp.json()

    delete_collection = test_multiple_collections[0]

    # Check test_collection in the collection list
    assert delete_collection["id"] in [
        collection["id"] for collection in list_before["data"]
    ]

    # Delete test collection
    rsp = client.delete(
        f"{settings.API_V1_STR}/collections/{delete_collection['id']}",
        headers=normal_user_token_headers,
    )
    assert rsp.status_code == 204

    # Re-read the collection list
    rsp = client.get(
        f"{settings.API_V1_STR}/collections/", headers=normal_user_token_headers
    )
    list_after = rsp.json()
    assert list_after["count"] == len(test_multiple_collections) - 1
    assert delete_collection["id"] not in [
        collection["id"] for collection in list_after["data"]
    ]
