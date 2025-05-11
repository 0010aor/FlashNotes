from fastapi import APIRouter, Request
from fastapi.responses import RedirectResponse
from authlib.integrations.starlette_client import OAuth
from src.core.config import settings

router = APIRouter(tags=["auth"])

oauth = OAuth()
oauth.register(
    name="auth0",
    client_id=settings.AUTH0_CLIENT_ID,
    client_secret=settings.AUTH0_CLIENT_SECRET,
    server_metadata_url=f"https://{settings.AUTH0_DOMAIN}/.well-known/openid-configuration",
    client_kwargs={"scope": "openid profile email"},
)


@router.get("/login")
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

    request.session["user"] = {
        "email": user["email"],
        "name": user.get("name"),
        "picture": user.get("picture"),
        "sub": user.get("sub"),
    }

    return RedirectResponse(url="http://localhost:5173/collections")


@router.get("/logout")
async def logout(request: Request):
    request.session.clear()
    return RedirectResponse(
        url=f"https://{settings.AUTH0_DOMAIN}/v2/logout"
            f"?client_id={settings.AUTH0_CLIENT_ID}"
            f"&returnTo=http://localhost:5173"
    )


@router.get("/me")
async def me(request: Request):
    user = request.session.get("user")
    return {"authenticated": bool(user), "user": user}