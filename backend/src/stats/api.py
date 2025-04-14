import uuid
from typing import Any

from fastapi import APIRouter, HTTPException, Query

from src.auth.services import CurrentUser, SessionDep
from src.flashcards.services import check_collection_access

from .schemas import CollectionStats
from .services import get_collection_stats

router = APIRouter()


@router.get("/collections/{collection_id}", response_model=CollectionStats)
def get_collection_statistics_endpoint(
    session: SessionDep,
    current_user: CurrentUser,
    collection_id: uuid.UUID,
    days: int = Query(
        30, description="Number of days of history to include", ge=1, le=90
    ),
) -> Any:
    if not check_collection_access(session, collection_id, current_user.id):
        raise HTTPException(status_code=404, detail="Collection not found")

    try:
        statistics = get_collection_stats(
            session=session,
            collection_id=collection_id,
            max_days=days,
        )
        return statistics
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception:
        raise HTTPException(
            status_code=500, detail="Error retrieving collection statistics"
        )
