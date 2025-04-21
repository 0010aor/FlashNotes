from unittest.mock import patch

from fastapi.testclient import TestClient
from sqlmodel import Session, select

from src.auth.services import verify_password
from src.core.config import settings
from src.users import services
from src.users.models import User
from src.users.schemas import (
    UserCreate,
)
from tests.utils.utils import random_email, random_lower_string


def test_get_users_superuser_me(
    client: TestClient, superuser_token_headers: dict[str, str]
) -> None:
    r = client.get(f"{settings.API_V1_STR}/users/me", headers=superuser_token_headers)
    current_user = r.json()
    assert current_user
    assert current_user["is_active"] is True
    assert current_user["is_superuser"]
    assert current_user["email"] == settings.FIRST_SUPERUSER


def test_get_users_normal_user_me(
    client: TestClient, normal_user_token_headers: dict[str, str]
) -> None:
    r = client.get(f"{settings.API_V1_STR}/users/me", headers=normal_user_token_headers)
    current_user = r.json()
    assert current_user
    assert current_user["is_active"] is True
    assert current_user["is_superuser"] is False
    assert current_user["email"] == settings.EMAIL_TEST_USER


def test_get_existing_user_current_user(client: TestClient, db: Session) -> None:
    username = random_email()
    password = random_lower_string()
    user_in = UserCreate(email=username, password=password)
    services.create_user(session=db, user_create=user_in)

    login_data = {
        "username": username,
        "password": password,
    }
    r = client.post(f"{settings.API_V1_STR}/tokens", data=login_data)
    tokens = r.json()
    a_token = tokens["access_token"]
    headers = {"Authorization": f"Bearer {a_token}"}

    r = client.get(f"{settings.API_V1_STR}/users/me", headers=headers)
    assert 200 <= r.status_code < 300
    api_user = r.json()
    existing_user = services.get_user_by_email(session=db, email=username)
    assert existing_user
    assert existing_user.email == api_user["email"]


def test_register_user(client: TestClient, db: Session) -> None:
    with patch("src.core.config.settings.USERS_OPEN_REGISTRATION", True):
        username = random_email()
        password = random_lower_string()
        full_name = random_lower_string()
        data = {"email": username, "password": password, "full_name": full_name}
        r = client.post(
            f"{settings.API_V1_STR}/users",
            json=data,
        )
        assert r.status_code == 200
        created_user = r.json()
        assert created_user["email"] == username
        assert created_user["full_name"] == full_name

        user_query = select(User).where(User.email == username)
        user_db = db.exec(user_query).first()
        assert user_db
        assert user_db.email == username
        assert user_db.full_name == full_name
        assert verify_password(password, user_db.hashed_password)


def test_register_user_forbidden_error(client: TestClient) -> None:
    with patch("src.core.config.settings.USERS_OPEN_REGISTRATION", False):
        username = random_email()
        password = random_lower_string()
        full_name = random_lower_string()
        data = {"email": username, "password": password, "full_name": full_name}
        r = client.post(
            f"{settings.API_V1_STR}/users",
            json=data,
        )
        assert r.status_code == 403
        assert (
            r.json()["detail"] == "Open user registration is forbidden on this server"
        )


def test_register_user_already_exists_error(client: TestClient) -> None:
    with patch("src.core.config.settings.USERS_OPEN_REGISTRATION", True):
        password = random_lower_string()
        full_name = random_lower_string()
        data = {
            "email": settings.FIRST_SUPERUSER,
            "password": password,
            "full_name": full_name,
        }
        client.post(f"{settings.API_V1_STR}/users", json=data)
        r = client.post(f"{settings.API_V1_STR}/users", json=data)
        assert r.status_code == 409
        assert (
            r.json()["detail"]
            == "The user with this email already exists in the system"
        )
