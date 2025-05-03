from typing import Any, TypedDict
import logging

from authlib.integrations.starlette_client import OAuth
from authlib.jose import jwt
from fastapi import HTTPException, Request
from starlette.responses import RedirectResponse
import httpx

from src.core.config import settings

logger = logging.getLogger(__name__)


class TokenResponse(TypedDict):
    access_token: str
    id_token: str
    token_type: str
    expires_in: int


class UserInfo(TypedDict):
    sub: str
    email: str
    name: str
    picture: str | None


class Auth0Service:
    def __init__(self):
        self.oauth = OAuth()
        self.oauth.register(
            'auth0',
            client_id=settings.AUTH0_CLIENT_ID,
            client_secret=settings.AUTH0_CLIENT_SECRET,
            server_metadata_url=(
                f'https://{settings.AUTH0_DOMAIN}/'
                '.well-known/openid-configuration'
            ),
            client_kwargs={
                'scope': 'openid profile email',
                'audience': settings.AUTH0_AUDIENCE,
            },
        )
        self._jwks = None

    async def _get_jwks(self) -> dict[str, Any]:
        if self._jwks is None:
            try:
                jwks_url = (
                    f"https://{settings.AUTH0_DOMAIN}/.well-known/jwks.json"
                )
                async with httpx.AsyncClient() as client:
                    response = await client.get(jwks_url)
                    response.raise_for_status()
                    self._jwks = response.json()
                    logger.info("JWKS fetched successfully")
            except Exception as e:
                logger.error(f"Failed to fetch JWKS: {str(e)}")
                raise HTTPException(
                    status_code=500, 
                    detail="Authentication configuration error"
                )
        return self._jwks

    async def login(self, request: Request) -> RedirectResponse:
        try:
            logger.info("Initiating Auth0 login flow")
            return await self.oauth.auth0.authorize_redirect(
                request,
                settings.AUTH0_CALLBACK_URL,
            )
        except Exception as e:
            logger.error(f"Failed to initiate login: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail="Failed to initiate login. Please try again."
            )

    async def callback(self, request: Request) -> TokenResponse:
        try:
            logger.info("Processing Auth0 callback")
            token = await self.oauth.auth0.authorize_access_token(request)
            return token
        except Exception as e:
            logger.error(f"Failed to exchange code for token: {str(e)}")
            raise HTTPException(
                status_code=401,
                detail="Authentication failed. Please try again."
            )

    async def validate_token(self, token: str) -> dict[str, Any]:
        try:
            # Get the JWKS from Auth0
            jwks = await self._get_jwks()

            # Decode and validate the token
            claims = jwt.decode(
                token,
                jwks,
                claims_options={
                    "iss": {"essential": True, "value": settings.AUTH0_ISSUER},
                    "aud": {
                        "essential": True,
                        "value": settings.AUTH0_AUDIENCE
                    },
                    "exp": {"essential": True},
                }
            )
            jwt.validate_claims(
                claims,
                {
                    "iss": {"essential": True, "value": settings.AUTH0_ISSUER},
                    "aud": {
                        "essential": True,
                        "value": settings.AUTH0_AUDIENCE
                    },
                    "exp": {"essential": True},
                }
            )

            # Additional validation
            if not claims.get('sub'):
                logger.warning("Token validation failed: missing subject")
                raise HTTPException(
                    status_code=401,
                    detail="Invalid token: missing subject"
                )

            return claims
        except jwt.ExpiredTokenError:
            logger.warning("Token has expired")
            raise HTTPException(
                status_code=401,
                detail="Token has expired"
            )
        except jwt.InvalidTokenError as e:
            logger.warning(f"Invalid token: {str(e)}")
            raise HTTPException(
                status_code=401,
                detail="Invalid token"
            )
        except Exception as e:
            logger.error(f"Token validation failed: {str(e)}")
            raise HTTPException(
                status_code=401,
                detail="Invalid token"
            )

    async def get_user_info(self, access_token: str) -> UserInfo:
        try:
            logger.info("Fetching user info from Auth0")
            token_dict = {"access_token": access_token}
            user_info = await self.oauth.auth0.userinfo(token=token_dict)
            return user_info
        except Exception as e:
            logger.error(f"Failed to get user info: {str(e)}")
            raise HTTPException(
                status_code=401,
                detail="Failed to retrieve user information"
            )

    def logout(self) -> RedirectResponse:
        logger.info("Initiating Auth0 logout")
        return RedirectResponse(
            url=(
                f"https://{settings.AUTH0_DOMAIN}/v2/logout?"
                f"client_id={settings.AUTH0_CLIENT_ID}&"
                f"returnTo={settings.AUTH0_LOGOUT_URL}"
            )
        )
