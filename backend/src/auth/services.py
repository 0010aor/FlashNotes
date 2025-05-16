from datetime import datetime, timedelta, timezone
from typing import Annotated, Any

import jwt
from fastapi import Depends, HTTPException, Request
from fastapi.security import OAuth2PasswordBearer
from jwt.exceptions import InvalidTokenError
from passlib.context import CryptContext
from pydantic import ValidationError
from sqlmodel import Session, select

from src.auth.schemas import TokenPayload
from src.core.config import settings
from src.core.db import get_db
from src.users.models import User
from src.users.schemas import UserPublic

ALGORITHM = "HS256"

reusable_oauth2 = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/tokens")
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

SessionDep = Annotated[Session, Depends(get_db)]
TokenDep = Annotated[str, Depends(reusable_oauth2)]


def get_user_from_session(request: Request, session: SessionDep) -> User:
    session_user = request.session.get("user")
    if not session_user:
        raise HTTPException(status_code=401, detail="Not authenticated (no session)")

    user = session.exec(select(User).where(User.email == session_user["email"])).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="Invalid session user")
    return UserPublic.model_validate(user)


def get_user_from_token(
    session: SessionDep,
    token: Annotated[str, Depends(reusable_oauth2)],
) -> User:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
        token_data = TokenPayload(**payload)

        user = session.get(User, token_data.sub)

        if not user or not user.is_active:
            raise HTTPException(status_code=401, detail="Invalid user")

        return user

    except (InvalidTokenError, ValidationError):
        raise HTTPException(status_code=403, detail="Invalid token")


def get_current_user(
    request: Request,
    session: SessionDep,
    token: Annotated[
        str | None,
        Depends(
            OAuth2PasswordBearer(
                tokenUrl=f"{settings.API_V1_STR}/tokens", auto_error=False
            )
        ),
    ] = None,
) -> User:
    session_user = request.session.get("user")
    if session_user:
        return get_user_from_session(request, session)
    if token:
        return get_user_from_token(session, token)

    raise HTTPException(status_code=401, detail="Not authenticated")


CurrentUser = Annotated[User, Depends(get_current_user)]


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def authenticate(*, session: Session, email: str, password: str) -> User | None:
    from src.users.services import get_user_by_email

    db_user = get_user_by_email(session=session, email=email)
    if not db_user:
        return None

    # Auth0 users may not have a password
    if not db_user.hashed_password:
        # Return None for users without a password when using password authentication
        return None

    if not verify_password(password, db_user.hashed_password):
        return None

    return db_user


def create_access_token(subject: str | Any, expires_delta: timedelta) -> str:
    expire = datetime.now(timezone.utc) + expires_delta
    to_encode = {"exp": expire, "sub": str(subject)}
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def get_or_create_user_by_email(
    session: Session,
    email: str,
    defaults: dict | None = None,
) -> User:
    user = session.exec(select(User).where(User.email == email)).first()
    if user:
        return user
    user = User(email=email, **defaults)
    session.add(user)
    session.commit()
    session.refresh(user)
    return user
