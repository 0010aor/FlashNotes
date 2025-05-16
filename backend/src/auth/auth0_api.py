from authlib.integrations.starlette_client import OAuth
from fastapi import APIRouter, Request
from fastapi.responses import RedirectResponse

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
async def login(request: Request):
    redirect_uri = request.url_for("auth0_callback")
    return await oauth.auth0.authorize_redirect(
        request,
        redirect_uri,
        prompt="select_account",
        connection="google-oauth2"
    )


@router.get("/callback", name="auth0_callback")
async def auth0_callback(request: Request):
    token = await oauth.auth0.authorize_access_token(request)

    user = token.get("userinfo") or await oauth.auth0.userinfo(token=token)

    # Create or get the user from database
    db = next(get_db())
    db_user = get_or_create_user_by_email(
        session=db,
        email=user["email"],
        defaults={
            "auth0_id": user["sub"],
            "full_name": user.get("name"),
            "picture": user.get("picture"),
            "is_active": True,
        },
    )

    # Store in session
    request.session["user"] = {
        "email": user["email"],
        "name": user.get("name"),
        "picture": user.get("picture"),
        "sub": user.get("sub"),
    }
    request.session["user_id"] = str(db_user.id)

    return RedirectResponse(url="http://localhost:5173/collections")


@router.get("/logout", name="auth0_logout")
async def logout(request: Request):
    request.session.clear()
    return {"detail": "Logged out"}
