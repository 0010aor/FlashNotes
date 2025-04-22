import pytest

from src.core.config import settings
from src.flashcards.models import Collection
from tests.stats.utils import create_cards, create_practice_cards, create_sessions
from tests.utils.user import authentication_token_from_email, create_random_user


@pytest.fixture
def collection_with_sessions(db):
    def _create(user_id, num_cards=5, num_sessions=10):
        collection = Collection(name="Test Collection", user_id=user_id)
        db.add(collection)
        db.flush()
        cards = create_cards(db, collection, num_cards)
        sessions = create_sessions(db, user_id, collection, num_sessions, num_cards)
        create_practice_cards(db, sessions, cards)
        return collection

    return _create


@pytest.mark.parametrize("limit", [1, 10, 30])
def test_stats_endpoint_with_various_limits(
    client, db, collection_with_sessions, limit
):
    user = create_random_user(db)
    headers = authentication_token_from_email(client=client, email=user.email, db=db)
    collection = collection_with_sessions(user.id, num_cards=5, num_sessions=10)

    response = client.get(
        f"{settings.API_V1_STR}/collections/{collection.id}/stats?limit={limit}",
        headers=headers,
    )

    assert response.status_code == 200
    data = response.json()
    assert len(data["recent_sessions"]) <= limit
    assert all(session["is_completed"] for session in data["recent_sessions"])
    created_ats = [s["created_at"] for s in data["recent_sessions"]]
    assert created_ats == sorted(created_ats)
    assert len(data["difficult_cards"]) <= 5


def test_stats_endpoint_default_limit(client, db, collection_with_sessions):
    user = create_random_user(db)
    headers = authentication_token_from_email(client=client, email=user.email, db=db)
    collection = collection_with_sessions(user.id, num_cards=5, num_sessions=10)

    response = client.get(
        f"{settings.API_V1_STR}/collections/{collection.id}/stats", headers=headers
    )

    assert response.status_code == 200
    data = response.json()
    assert len(data["recent_sessions"]) <= 30


@pytest.mark.parametrize("bad_limit", [0, 100])
def test_stats_endpoint_limit_constraints(
    client, db, collection_with_sessions, bad_limit
):
    user = create_random_user(db)
    headers = authentication_token_from_email(client=client, email=user.email, db=db)
    collection = collection_with_sessions(user.id, num_cards=5, num_sessions=10)

    response = client.get(
        f"{settings.API_V1_STR}/collections/{collection.id}/stats?limit={bad_limit}",
        headers=headers,
    )

    assert response.status_code == 422


def test_stats_endpoint_unauthorized(client, db, collection_with_sessions):
    user = create_random_user(db)
    collection = collection_with_sessions(user.id, num_cards=5, num_sessions=10)

    response = client.get(
        f"{settings.API_V1_STR}/collections/{collection.id}/stats", headers=None
    )

    assert response.status_code in (401, 403)
