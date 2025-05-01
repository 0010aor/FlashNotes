import uuid
from typing import Any

from sqlmodel import Session

from src.flashcards.models import Collection
from src.flashcards.schemas import CollectionUpdate
from src.flashcards.services import (
    check_collection_access,
    create_collection,
    delete_collection,
    get_collection,
    get_collections,
    update_collection,
)


def test_create_collection(db: Session, test_user: dict[str, Any]):
    collection = create_collection(
        session=db, user_id=test_user["id"], name="Test Collection"
    )
    assert collection.id is not None
    assert collection.name == "Test Collection"
    assert collection.user_id == test_user["id"]
    assert collection.created_at is not None
    assert collection.updated_at is not None


def test_get_collection(
    db: Session, test_user: dict[str, Any], test_collection: Collection
):
    db_collection = get_collection(
        session=db, id=test_collection.id, user_id=test_user["id"]
    )
    assert db_collection is not None
    assert db_collection.id == test_collection.id
    assert db_collection.name == test_collection.name
    assert db_collection.user_id == test_user["id"]


def test_get_collection_not_found(db: Session, test_user: dict[str, Any]):
    db_collection = get_collection(session=db, id=uuid.uuid4(), user_id=test_user["id"])
    assert db_collection is None


def test_get_collection_with_wrong_user(db: Session, test_other_user: dict[str, Any]):
    db_collection = get_collection(
        session=db, id=uuid.uuid4(), user_id=test_other_user["id"]
    )
    assert db_collection is None


def test_get_collections(
    db: Session, test_user: dict[str, Any], test_multiple_collections: list[Collection]
):
    limit = 2
    db_collections, count = get_collections(
        session=db, user_id=test_user["id"], limit=limit
    )

    assert len(db_collections) == limit
    assert count == len(test_multiple_collections)

    # Verify the order
    for i in range(len(db_collections) - 1):
        assert db_collections[i].updated_at >= db_collections[i + 1].updated_at


def test_get_collection_skip(
    db: Session, test_user: dict[str, Any], test_multiple_collections: list[Collection]
):
    skip = 2
    limit = 2

    db_collections, count = get_collections(
        session=db, user_id=test_user["id"], skip=skip, limit=limit
    )

    assert len(db_collections) == limit
    assert count == len(test_multiple_collections)


def test_get_collection_empty(db: Session, test_user: dict[str, Any]):
    db_collections, count = get_collections(session=db, user_id=test_user["id"])

    assert len(db_collections) == 0
    assert count == 0


def test_update_collection(db: Session, test_collection: Collection):
    original_updated_at = test_collection.updated_at

    import time

    time.sleep(0.01)

    collection_in = CollectionUpdate(name="Updated Collection")
    collection_update = update_collection(
        session=db, collection=test_collection, collection_in=collection_in
    )

    assert collection_update is not None
    assert collection_update.name == collection_in.name
    assert collection_update.updated_at > original_updated_at


def test_delete_collection(
    db: Session, test_user: dict[str, Any], test_collection: Collection
):
    delete_collection(session=db, collection=test_collection)

    db_collection = get_collection(
        session=db, id=test_collection.id, user_id=test_user["id"]
    )

    assert db_collection is None


def test_check_collection_access(db: Session, test_collection: Collection):
    can_access = check_collection_access(
        session=db, collection_id=test_collection.id, user_id=test_collection.user_id
    )

    assert can_access is True


def test_check_collection_access_with_nonexistent_collection(
    db: Session, test_user: dict[str, Any]
):
    non_existent_collection_id = uuid.uuid4()
    can_access = check_collection_access(
        session=db, collection_id=non_existent_collection_id, user_id=test_user["id"]
    )

    assert can_access is False


def test_check_collection_access_with_other_user(
    db: Session, test_collection: Collection, test_other_user: dict[str, Any]
):
    can_access = check_collection_access(
        session=db, collection_id=test_collection.id, user_id=test_other_user["id"]
    )

    assert can_access is False
