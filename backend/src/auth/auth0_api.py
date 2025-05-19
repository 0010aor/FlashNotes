from authlib.integrations.starlette_client import OAuth
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import RedirectResponse
from sqlmodel import Session

from src.auth.services import get_or_create_user_by_email  # Fix the import path
from src.core.config import settings
from src.core.db import get_db

router = APIRouter(tags=["auth"])

oauth = OAuth()
oauth.register(
    name="auth0",
    client_id=settings.AUTH0_CLIENT_ID,
    client_secret=settings.AUTH0_CLIENT_SECRET,
    server_metadata_url=f"https://{settings.AUTH0_DOMAIN}/.well-known/openid-configuration",
    client_kwargs={"scope": "openid profile email"},
)


@router.get("/login", name="auth0_login")
async def login(request: Request, redirect_to: str = "/collections"):
    request.session["redirect_to"] = redirect_to
    redirect_uri = request.url_for("auth0_callback")
    return await oauth.auth0.authorize_redirect(
        request, redirect_uri, prompt="select_account", connection="google-oauth2"
    )


@router.get("/callback", name="auth0_callback")
async def auth0_callback(request: Request, db: Session = Depends(get_db)):
    # Exchange code for token
    token = await oauth.auth0.authorize_access_token(request)

    # Extract user info
    user_info = token.get("userinfo")
    if not user_info:
        user_info = await oauth.auth0.userinfo(token=token)

    if not user_info or "email" not in user_info:
        raise HTTPException(status_code=400, detail="Invalid user info from Auth0")

    # Create or get user in local DB
    db_user = get_or_create_user_by_email(
        session=db,
        email=user_info["email"],
        defaults={
            "auth0_id": user_info["sub"],
            "full_name": user_info.get("name"),
            "is_active": True,
        },
    )

    # Store user in session
    request.session["user_id"] = str(db_user.id)

    # Determine redirect target
    redirect_to = request.session.pop("redirect_to", "/collections")
    redirect_url = f"{settings.FRONTEND_URL}{redirect_to}"

    return RedirectResponse(url=redirect_url)


@router.get("/logout", name="auth0_logout")
async def logout(request: Request):
    request.session.clear()
    return {"detail": "Logged out"}
