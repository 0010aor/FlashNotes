from datetime import datetime, timezone
from unittest.mock import patch

from fastapi.encoders import jsonable_encoder
from sqlmodel import Session

from src.auth.services import verify_password
from src.core.config import settings
from src.users.models import AIUsageQuota, User
from src.users.schemas import UserCreate, UserUpdate
from src.users.services import (
    check_and_increment_ai_usage_quota,
    create_user,
    get_ai_usage_quota_for_user,
    get_user_by_email,
    update_user,
)
from tests.utils.utils import random_email, random_lower_string


def test_create_user(db: Session) -> None:
    email = random_email()
    password = random_lower_string()
    user_in = UserCreate(email=email, password=password)
    user = create_user(session=db, user_create=user_in)
    assert user.email == email
    assert hasattr(user, "hashed_password")


def test_check_if_user_is_active(db: Session) -> None:
    email = random_email()
    password = random_lower_string()
    user_in = UserCreate(email=email, password=password)
    user = create_user(session=db, user_create=user_in)
    assert user.is_active is True


def test_check_if_user_is_active_inactive(db: Session) -> None:
    email = random_email()
    password = random_lower_string()
    user_in = UserCreate(email=email, password=password, disabled=True)
    user = create_user(session=db, user_create=user_in)
    assert user.is_active


def test_check_if_user_is_superuser(db: Session) -> None:
    email = random_email()
    password = random_lower_string()
    user_in = UserCreate(email=email, password=password, is_superuser=True)
    user = create_user(session=db, user_create=user_in)
    assert user.is_superuser is True


def test_check_if_user_is_superuser_normal_user(db: Session) -> None:
    username = random_email()
    password = random_lower_string()
    user_in = UserCreate(email=username, password=password)
    user = create_user(session=db, user_create=user_in)
    assert user.is_superuser is False


def test_get_user(db: Session) -> None:
    password = random_lower_string()
    username = random_email()
    user_in = UserCreate(email=username, password=password, is_superuser=True)
    user = create_user(session=db, user_create=user_in)
    user_2 = db.get(User, user.id)
    assert user_2
    assert user.email == user_2.email
    assert jsonable_encoder(user) == jsonable_encoder(user_2)


def test_get_user_by_email(db: Session) -> None:
    email = random_email()
    password = random_lower_string()
    user_in = UserCreate(email=email, password=password)
    create_user(session=db, user_create=user_in)
    user = get_user_by_email(session=db, email=email)
    assert user is not None
    assert user.email == email


def test_update_user(db: Session) -> None:
    password = random_lower_string()
    email = random_email()
    user_in = UserCreate(email=email, password=password, is_superuser=True)
    user = create_user(session=db, user_create=user_in)
    new_password = random_lower_string()
    user_in_update = UserUpdate(password=new_password, is_superuser=True)
    if user.id is not None:
        update_user(session=db, db_user=user, user_in=user_in_update)
    user_2 = db.get(User, user.id)
    assert user_2
    assert user.email == user_2.email
    assert verify_password(new_password, user_2.hashed_password)


def test_get_ai_usage_quota_for_user_no_quota(test_user):
    test_user.ai_usage_quota = None
    with patch("src.users.services.datetime") as mock_datetime:
        mock_datetime.now.return_value = datetime(2025, 1, 1, tzinfo=timezone.utc)
        quota = get_ai_usage_quota_for_user(test_user)
        assert quota.usage_count == 0
        assert quota.reset_date == datetime(2025, 1, 31, tzinfo=timezone.utc)


def test_get_ai_usage_quota_for_user_with_quota(test_user):
    test_user.ai_usage_quota = AIUsageQuota(
        usage_count=50, last_reset_time=datetime(2025, 1, 1, tzinfo=timezone.utc)
    )
    with patch("src.users.services.settings.AI_MAX_USAGE_QUOTA", 100):
        with patch("src.users.services.datetime") as mock_datetime:
            mock_datetime.now.return_value = datetime(2025, 1, 1, tzinfo=timezone.utc)
            quota = get_ai_usage_quota_for_user(test_user)
            assert quota.usage_count == 50
            assert quota.reset_date == datetime(2025, 1, 31, tzinfo=timezone.utc)


def test_check_and_increment_ai_usage_quota_first_time(db, test_user):
    within_quota = check_and_increment_ai_usage_quota(db, test_user)
    assert within_quota is True


def test_check_and_increment_ai_usage_quota_max_count_reached(db, test_user):
    from src.users.models import AIUsageQuota as AIUsageQuotaModel

    quota = AIUsageQuotaModel(
        user_id=test_user.id,
        usage_count=settings.AI_MAX_USAGE_QUOTA,
        last_reset_time=datetime.now(timezone.utc),
    )
    db.add(quota)
    db.commit()
    db.refresh(test_user)

    within_quota = check_and_increment_ai_usage_quota(db, test_user)
    assert within_quota is False


def test_check_and_increment_ai_usage_quota_reset_count(db, test_user):
    from src.users.models import AIUsageQuota as AIUsageQuotaModel

    old_reset_time = datetime(2025, 1, 1, tzinfo=timezone.utc)
    quota = AIUsageQuotaModel(
        user_id=test_user.id,
        usage_count=10,
        last_reset_time=old_reset_time,
    )
    db.add(quota)
    db.commit()
    db.refresh(test_user)

    with patch("src.users.services.datetime") as mock_datetime:
        mock_datetime.now.return_value = datetime(2025, 2, 1, tzinfo=timezone.utc)
        within_quota = check_and_increment_ai_usage_quota(db, test_user)
        assert within_quota is True

        db.refresh(quota)
        assert quota.usage_count == 1
        assert quota.last_reset_time == datetime(2025, 2, 1, tzinfo=timezone.utc)


def test_check_and_increment_ai_usage_quota_near_limit(db, test_user):
    """Test that quota checking works correctly near the limit."""
    from src.users.models import AIUsageQuota as AIUsageQuotaModel

    quota = AIUsageQuotaModel(
        user_id=test_user.id,
        usage_count=settings.AI_MAX_USAGE_QUOTA - 1,
        last_reset_time=datetime.now(timezone.utc),
    )
    db.add(quota)
    db.commit()
    db.refresh(test_user)

    within_quota = check_and_increment_ai_usage_quota(db, test_user)
    assert within_quota is True

    db.refresh(quota)
    assert quota.usage_count == settings.AI_MAX_USAGE_QUOTA

    within_quota = check_and_increment_ai_usage_quota(db, test_user)
    assert within_quota is False

    db.refresh(quota)
    assert quota.usage_count == settings.AI_MAX_USAGE_QUOTA
