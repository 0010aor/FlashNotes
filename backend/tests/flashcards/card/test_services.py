import uuid

from sqlmodel import Session

from src.flashcards.models import Card, Collection
from src.flashcards.schemas import CardCreate, CardUpdate
from src.flashcards.services import (
    create_card,
    delete_card,
    get_card,
    get_card_by_id,
    get_card_with_collection,
    get_cards,
    update_card,
)


def test_create_card(db: Session, test_collection: Collection):
    card_in = CardCreate(front="front", back="back")
    card = create_card(session=db, card_in=card_in, collection_id=test_collection.id)

    assert card is not None
    assert card.id is not None
    assert card.front == card_in.front
    assert card.back == card_in.back
    assert card.collection_id == test_collection.id
    assert card.created_at is not None
    assert card.updated_at is not None


def test_get_card(db: Session, test_card: Card):
    db_card = get_card(session=db, card_id=test_card.id)

    assert db_card is not None
    assert db_card.id == test_card.id
    assert db_card.front == test_card.front
    assert db_card.back == test_card.back
    assert db_card.collection_id == test_card.collection_id
    assert db_card.updated_at is not None
    assert db_card.created_at is not None


def test_get_card_not_found(db: Session):
    db_card = get_card(session=db, card_id=uuid.uuid4())

    assert db_card is None


def test_get_card_by_id(db: Session, test_card: Card):
    db_card = get_card_by_id(session=db, card_id=test_card.id)

    assert db_card is not None
    assert db_card.id == test_card.id


def test_get_card_by_nonexistent_id(db: Session):
    non_existent_card_id = uuid.uuid4()
    db_card = get_card_by_id(session=db, card_id=non_existent_card_id)

    assert db_card is None


def test_get_card_with_collection(
    db: Session, test_collection: Collection, test_card: Card
):
    db_card = get_card_with_collection(
        session=db, card_id=test_card.id, user_id=test_collection.user_id
    )

    assert db_card is not None


def test_get_card_with_wrong_collection(db: Session, test_card: Card):
    db_card = get_card_with_collection(
        session=db,
        card_id=test_card.id,
        user_id=uuid.uuid4(),
    )

    assert db_card is None


def test_get_cards(
    db: Session, test_collection: Collection, test_multiple_cards: list[Card]
):
    limit = 3
    db_cards, count = get_cards(
        session=db, collection_id=test_collection.id, limit=limit
    )

    assert len(db_cards) == limit
    assert count == len(test_multiple_cards)
    # Verify the order
    for i in range(len(db_cards) - 1):
        assert db_cards[i].updated_at >= db_cards[i + 1].updated_at


def test_get_cards_skip(
    db: Session, test_collection: Collection, test_multiple_cards: list[Card]
):
    limit = 3
    skip = 2
    db_cards, count = get_cards(
        session=db, collection_id=test_collection.id, skip=skip, limit=limit
    )

    assert len(db_cards) == limit
    assert count == len(test_multiple_cards)


def test_get_cards_empty(db: Session, test_collection: Collection):
    db_cards, count = get_cards(session=db, collection_id=test_collection.id)

    assert len(db_cards) == 0
    assert count == 0


def test_update_card(db: Session, test_card: Card):
    original_updated_at = test_card.updated_at

    import time

    time.sleep(0.01)

    card_in = CardUpdate(front="Update front", back="Update back")
    updated_card = update_card(session=db, card=test_card, card_in=card_in)

    assert updated_card.front == card_in.front
    assert updated_card.back == card_in.back
    assert updated_card.updated_at > original_updated_at


def test_update_card_partial(db: Session, test_card: Card):
    original_updated_at = test_card.updated_at

    import time

    time.sleep(0.01)

    card_in = CardUpdate(front="Update front")
    updated_card = update_card(session=db, card=test_card, card_in=card_in)

    assert updated_card.front == card_in.front
    assert updated_card.back == test_card.back
    assert updated_card.updated_at > original_updated_at


def test_delete_card(db: Session, test_collection: Collection, test_card: Card):
    delete_card(session=db, card=test_card)

    card = get_card_with_collection(
        session=db, card_id=test_card.id, user_id=test_collection.user_id
    )
    assert card is None
