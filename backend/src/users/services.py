import uuid
from datetime import datetime, timedelta, timezone
from typing import Any

from sqlalchemy.exc import IntegrityError
from sqlmodel import Session, select, update

from src.auth.services import get_password_hash
from src.core.config import settings
from src.users.models import AIUsageQuota as AIUsageQuotaModel
from src.users.models import User
from src.users.schemas import AIUsageQuota, UserCreate, UserUpdate


def create_user(*, session: Session, user_create: UserCreate) -> User:
    db_obj = User.model_validate(
        user_create, update={"hashed_password": get_password_hash(user_create.password)}
    )
    session.add(db_obj)
    session.commit()
    session.refresh(db_obj)
    return db_obj


def update_user(*, session: Session, db_user: User, user_in: UserUpdate) -> Any:
    user_data = user_in.model_dump(exclude_unset=True)
    extra_data = {}
    if "password" in user_data:
        password = user_data["password"]
        hashed_password = get_password_hash(password)
        extra_data["hashed_password"] = hashed_password
    db_user.sqlmodel_update(user_data, update=extra_data)
    session.add(db_user)
    session.commit()
    session.refresh(db_user)
    return db_user


def get_user_by_id(*, session: Session, user_id: uuid.UUID) -> User | None:
    statement = select(User).where(User.id == user_id)
    session_user = session.exec(statement).first()
    return session_user


def get_user_by_email(*, session: Session, email: str) -> User | None:
    statement = select(User).where(User.email == email)
    session_user = session.exec(statement).first()
    return session_user


def get_ai_usage_quota_for_user(user: User) -> AIUsageQuota:
    quota = user.ai_usage_quota
    if not quota:
        return AIUsageQuota(
            usage_count=0,
            max_usage_allowed=settings.AI_MAX_USAGE_QUOTA,
            reset_date=(
                datetime.now(timezone.utc)
                + timedelta(days=settings.AI_QUOTA_TIME_RANGE_DAYS)
            ),
        )
    return AIUsageQuota(
        usage_count=quota.usage_count,
        max_usage_allowed=settings.AI_MAX_USAGE_QUOTA,
        reset_date=(
            quota.last_reset_time + timedelta(days=settings.AI_QUOTA_TIME_RANGE_DAYS)
        ),
    )


def check_and_increment_ai_usage_quota(session: Session, user: User) -> bool:
    now = datetime.now(timezone.utc)
    reset_threshold = now - timedelta(days=settings.AI_QUOTA_TIME_RANGE_DAYS)

    if not user.ai_usage_quota:
        try:
            quota = AIUsageQuotaModel(
                user_id=user.id, usage_count=1, last_reset_time=now
            )
            session.add(quota)
            session.commit()
            return True
        except IntegrityError:
            session.rollback()

            session.refresh(user)

    result_reset = session.exec(
        update(AIUsageQuotaModel)
        .where(
            (AIUsageQuotaModel.user_id == user.id)
            & (AIUsageQuotaModel.last_reset_time <= reset_threshold)
        )
        .values(usage_count=1, last_reset_time=now)
    )

    if result_reset.rowcount > 0:
        session.commit()
        return True

    result_increment = session.exec(
        update(AIUsageQuotaModel)
        .where(
            (AIUsageQuotaModel.user_id == user.id)
            & (AIUsageQuotaModel.last_reset_time > reset_threshold)
            & (AIUsageQuotaModel.usage_count < settings.AI_MAX_USAGE_QUOTA)
        )
        .values(usage_count=AIUsageQuotaModel.usage_count + 1)
    )

    session.commit()
    return result_increment.rowcount > 0
