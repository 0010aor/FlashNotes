from typing import Any

import pytest
from sqlmodel import Session

from src.flashcards.models import Card, Collection
from src.flashcards.schemas import CardCreate
from src.flashcards.services import create_card, create_collection
from src.users.schemas import UserCreate
from src.users.services import create_user
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
def test_other_user(db: Session) -> dict[str, Any]:
    email = random_email()
    password = random_lower_string()
    full_name = random_lower_string()

    user_in = UserCreate(email=email, password=password, full_name=full_name)
    user = create_user(session=db, user_create=user_in)

    return {"id": user.id, "email": user.email}


@pytest.fixture
def test_collection(db: Session, test_user: dict[str, Any]) -> Collection:
    collection = create_collection(
        session=db, user_id=test_user["id"], name="Test Collection"
    )
    return collection


@pytest.fixture
def test_collection_with_multiple_cards(
    db: Session, test_user: dict[str, Any]
) -> Collection:
    cards = [CardCreate(front=f"front {i}", back=f"back {i}") for i in range(5)]
    collection = create_collection(
        session=db, user_id=test_user["id"], name="Test Collection", cards=cards
    )
    return collection


@pytest.fixture
def test_multiple_collections(
    db: Session, test_user: dict[str, Any]
) -> list[Collection]:
    collections = []
    for i in range(5):
        cards = [
            CardCreate(front=f"front {i}-{j}", back=f"back {i}-{j}") for j in range(1)
        ]
        collection = create_collection(
            session=db,
            user_id=test_user["id"],
            name=f"Test Collection {i}",
            cards=cards,
        )
        collections.append(collection)
    return collections


@pytest.fixture
def test_card(db: Session, test_collection: Collection) -> Card:
    card_in = CardCreate(front="front", back="back")
    card = create_card(session=db, card_in=card_in, collection_id=test_collection.id)
    return card


@pytest.fixture
def test_multiple_cards(db: Session, test_collection: Collection) -> list[Card]:
    cards = []
    for i in range(5):
        card_in = CardCreate(front=f"front {i}", back=f"back {i}")
        card = create_card(
            session=db, card_in=card_in, collection_id=test_collection.id
        )
        cards.append(card)

    return cards
