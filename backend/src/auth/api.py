from datetime import timedelta
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.security import OAuth2PasswordRequestForm

from src.auth.schemas import Token
from src.auth.services import SessionDep
from src.core.config import settings

from . import services

router = APIRouter()


@router.post("/tokens")
def login_access_token(
    request: Request,
    session: SessionDep,
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
) -> Token:
    user = services.authenticate(
        session=session, email=form_data.username, password=form_data.password
    )
    if not user:
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    elif not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    # Create token
    token = services.create_access_token(user.id, expires_delta=access_token_expires)

    # Also store user in session for consistency with Auth0 flow
    request.session["user"] = {
        "email": user.email,
        "id": str(user.id),
    }
    request.session["user_id"] = str(user.id)

    return Token(access_token=token)
