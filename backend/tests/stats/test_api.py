import uuid

from fastapi.testclient import TestClient
from sqlmodel import Session

from src.core.config import settings
from src.flashcards.models import Card, Collection, PracticeCard, PracticeSession
from src.users.schemas import UserCreate
from src.users import services as user_services
from tests.utils.utils import random_email, random_lower_string
from tests.utils.user import user_authentication_headers


def create_test_data(db: Session, user_id: uuid.UUID) -> Collection:
    collection = Collection(name="Test Collection", user_id=user_id)
    db.add(collection)
    db.flush()

    cards = []
    for i in range(5):
        card = Card(front=f"Front {i}", back=f"Back {i}",
                    collection_id=collection.id)
        db.add(card)
        cards.append(card)

    for i in range(10):
        session = PracticeSession(
            user_id=user_id,
            collection_id=collection.id,
            total_cards=len(cards),
            cards_practiced=len(cards),
            correct_answers=3,
            is_completed=True,
        )
        db.add(session)
        db.flush()

        for j, card in enumerate(cards):
            pc = PracticeCard(
                session_id=session.id,
                card_id=card.id,
                is_practiced=True,
                is_correct=(j % 2 == 0),
            )
            db.add(pc)

    db.commit()
    return collection


def test_stats_endpoint_with_limit(client: TestClient, db: Session) -> None:
    email = random_email()
    password = random_lower_string()
    limit = 7
    user_create = UserCreate(email=email, password=password)
    user = user_services.create_user(session=db, user_create=user_create)
    headers = user_authentication_headers(client=client, email=email,
                                          password=password)

    collection = create_test_data(db, user.id)
    url = f"{settings.API_V1_STR}/collections/{collection.id}/stats?limit={limit}"

    response = client.get(url, headers=headers)
    assert response.status_code == 200

    data = response.json()
    assert len(data["recent_sessions"]) <= limit
    assert len(data["difficult_cards"]) <= 5
