from typing import Annotated, Any

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlmodel import Session
from starlette.responses import RedirectResponse

from src.core.db import get_db
from src.dependencies.auth0 import (
    get_auth0_service,
    get_current_user,
    get_current_user_claims
)
from src.services.auth0 import Auth0Service
from src.users.auth0 import get_or_create_user_from_auth0
from src.users.models import User
from src.users.schemas import UserPublic

router = APIRouter(prefix="/auth0", tags=["auth0"])


@router.get("/login")
async def login(
    request: Request,
    auth_service: Annotated[Auth0Service, Depends(get_auth0_service)]
) -> RedirectResponse:
    return await auth_service.login(request)


@router.get("/callback")
async def callback(
    request: Request,
    session: Annotated[Session, Depends(get_db)],
    auth_service: Annotated[Auth0Service, Depends(get_auth0_service)]
) -> RedirectResponse:
    try:
        # Exchange auth code for tokens
        token_response = await auth_service.callback(request)
        access_token = token_response.get("access_token")

        # Store access token in session for later use
        request.session["access_token"] = access_token

        # Get user info from Auth0
        user_info = await auth_service.get_user_info(access_token)

        # Get or create user in our database
        db_user = await get_or_create_user_from_auth0(session, user_info)

        # Store user ID in session
        request.session["user_id"] = str(db_user.id)

        # Redirect to the frontend after successful authentication
        return RedirectResponse(url="/")
    except Exception as e:
        # Log the error and redirect to error page
        return RedirectResponse(url=f"/auth0/error?message={str(e)}")


@router.get("/logout")
async def logout(
    auth_service: Annotated[Auth0Service, Depends(get_auth0_service)]
) -> RedirectResponse:
    return auth_service.logout()


@router.get("/me", response_model=UserPublic)
async def read_users_me(
    current_user: Annotated[User, Depends(get_current_user)]
) -> User:
    return current_user


@router.get("/validate")
async def validate_token(
    claims: Annotated[dict[str, Any], Depends(get_current_user_claims)]
) -> dict[str, Any]:
    return claims


@router.get("/error")
async def auth_error(message: str = "Authentication error"):
    raise HTTPException(
        status_code=401,
        detail=message
    )
