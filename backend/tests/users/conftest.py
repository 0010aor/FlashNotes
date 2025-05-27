from typing import Any

import pytest
from sqlmodel import Session

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

    return user
