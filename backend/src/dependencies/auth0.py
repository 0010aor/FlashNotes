from typing import Annotated, Any

from fastapi import Depends, HTTPException, Request
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlmodel import Session

from src.core.db import get_db
from src.services.auth0 import Auth0Service, UserInfo
from src.users.auth0 import get_or_create_user_from_auth0, get_user_by_auth0_id
from src.users.models import User

from functools import lru_cache

security = HTTPBearer()


# Initialize Auth0Service
# This is a singleton instance of Auth0Service
# to be reused across requests.
@lru_cache()
def get_auth0_service() -> Auth0Service:
    """
    Provides a singleton Auth0Service instance using lru_cache.
    This is the recommended way in FastAPI for services that should be reused.
    """
    return Auth0Service()


async def get_token_from_header(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(security)]
) -> str:
    """
    Extract and return the JWT token from Authorization header.
    """
    return credentials.credentials


async def get_current_user_claims(
    token: Annotated[str, Depends(get_token_from_header)],
    auth_service: Annotated[Auth0Service, Depends(get_auth0_service)]
) -> dict[str, Any]:
    """
    Validate token and return the user claims.
    """
    claims = await auth_service.validate_token(token)

    return claims


async def get_current_user_info(
    request: Request,
    token: Annotated[str, Depends(get_token_from_header)],
    claims: Annotated[dict[str, Any], Depends(get_current_user_claims)],
    auth_service: Annotated[Auth0Service, Depends(get_auth0_service)]
) -> UserInfo:
    """
    Get user information from Auth0.
    """
    # Access token should be available in the request's session 
    # after the callback flow
    access_token = request.session.get("access_token")
    if not access_token:
        # If not in session, use the token from header
        access_token = token

    return await auth_service.get_user_info(access_token)


async def get_current_user(
    request: Request,
    session: Annotated[Session, Depends(get_db)],
    user_info: Annotated[UserInfo, Depends(get_current_user_info)]
) -> User:
    """
    Get the current user from the database.
    """
    try:
        # Check if user_id is in session
        user_id = request.session.get("user_id")
        if user_id:
            # Use the user ID from the session
            user = session.get(User, user_id)
            if user:
                return user

        # If no valid user in session, look up by Auth0 ID
        auth0_id = user_info.get("sub")
        if not auth0_id:
            raise ValueError("Missing Auth0 user ID")

        # Try to find by Auth0 ID
        user = await get_user_by_auth0_id(session, auth0_id)
        if user:
            # Store user ID in session for future requests
            request.session["user_id"] = str(user.id)
            return user

        # Create or link user if not found
        user = await get_or_create_user_from_auth0(session, user_info)

        # Store user ID in session for future requests
        request.session["user_id"] = str(user.id)
        return user

    except Exception as e:
        raise HTTPException(
            status_code=401,
            detail=f"User integration failed: {str(e)}"
        )
