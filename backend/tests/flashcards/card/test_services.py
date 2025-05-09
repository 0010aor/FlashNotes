from datetime import datetime, timedelta, timezone
from unittest.mock import MagicMock, patch
import uuid

from sqlmodel import Session

from src.flashcards.models import AIUsageQuota, Card, Collection
from src.flashcards.schemas import CardCreate, CardUpdate
from src.flashcards.services import (
    create_card,
    delete_card,
    get_card,
    get_card_by_id,
    get_card_with_collection,
    get_cards,
    get_usage_quota,
    is_within_ai_usage_quota,
    update_card,
)
from src.users.models import User
from src.core.config import settings


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


def test_ai_usage_quota_not_reached_first_time(db: Session, test_user: User):
    within_quota = is_within_ai_usage_quota(db, test_user["id"])
    assert within_quota is True


def test_ai_usage_quota_not_reached(db: Session, test_user: User):
    within_quota = is_within_ai_usage_quota(db, test_user["id"])
    assert within_quota is True


def test_ai_usage_quota_reached(test_user: User):
    test_session = MagicMock(spec=Session)
    mock_quota = MagicMock(spec=AIUsageQuota)
    mock_quota.usage_count = 3000 # exagerated for testing
    mock_quota.last_reset_time = datetime.now(timezone.utc)
    mock_quota.user_id = test_user["id"]
    test_session.exec.return_value.first.return_value = mock_quota

    within_quota = is_within_ai_usage_quota(test_session, test_user["id"])
    assert within_quota is False


def test_ai_usage_quota_reset(test_user: User):
    test_session = MagicMock(spec=Session)
    mock_quota = MagicMock(spec=AIUsageQuota)
    mock_quota.usage_count = 3000 # exagerated for testing
    # exagerated for testing
    mock_quota.last_reset_time = datetime.now(timezone.utc) - timedelta(days=700)
    test_session.exec.return_value.first.return_value = mock_quota

    within_quota = is_within_ai_usage_quota(test_session, test_user["id"])
    assert within_quota is True


def test_get_usage_quota_empty(test_user: User):
    test_session = MagicMock(spec=Session)
    test_session.exec.return_value.first.return_value = None

    ai_usage_quota = get_usage_quota(test_session, test_user["id"])
    assert ai_usage_quota.percentage_used == 0
    assert (
        ai_usage_quota.reset_date 
        >= datetime.now(timezone.utc) 
        + timedelta(days=settings.AI_QUOTA_TIME_RANGE_DAYS)
        - timedelta(milliseconds=10) # little bit of tolerance
    )


def test_get_usage_quota(test_user: User):
    test_session = MagicMock(spec=Session)
    mock_quota = MagicMock(spec=AIUsageQuota)
    mock_quota.usage_count = settings.AI_MAX_USAGE_QUOTA / 2
    mock_quota.last_reset_time = (
        datetime.now(timezone.utc) 
        - timedelta(days=settings.AI_QUOTA_TIME_RANGE_DAYS / 2)
    )
    test_session.exec.return_value.first.return_value = mock_quota
    ai_usage_quota = get_usage_quota(test_session, test_user["id"])
    assert ai_usage_quota.percentage_used == 50
    assert (
        ai_usage_quota.reset_date 
        >= datetime.now(timezone.utc) 
        + timedelta(days=settings.AI_QUOTA_TIME_RANGE_DAYS / 2)
        - timedelta(milliseconds=10) # little bit of tolerance
    )
