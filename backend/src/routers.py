from fastapi import APIRouter

from src.auth.api import router as auth_router
from src.auth.auth0_api import router as auth0_router
from src.flashcards.api import router as flashcards_router
from src.stats.api import router as stats_router
from src.users.api import router as user_router

api_router = APIRouter()

api_router.include_router(auth_router, tags=["login"])
api_router.include_router(user_router, prefix="/users", tags=["users"])
api_router.include_router(flashcards_router, tags=["flashcards"])
api_router.include_router(stats_router, tags=["stats"])
api_router.include_router(auth0_router, prefix="/auth0", tags=["auth0"])
