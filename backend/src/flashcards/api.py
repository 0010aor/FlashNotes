import asyncio
import uuid
from typing import Any, Literal

from fastapi import APIRouter, HTTPException

from src.ai_models.gemini import GeminiProviderDep
from src.ai_models.gemini.exceptions import AIGenerationError
from src.auth.services import CurrentUser, SessionDep

from . import services
from .exceptions import EmptyCollectionError
from .schemas import (
    Card,
    CardCreate,
    CardList,
    CardUpdate,
    Collection,
    CollectionCreate,
    CollectionList,
    CollectionUpdate,
    PracticeCardListResponse,
    PracticeCardResponse,
    PracticeCardResultPatch,
    PracticeSession,
    PracticeSessionCreate,
    PracticeSessionList,
)

router = APIRouter()


@router.get("/collections/", response_model=CollectionList)
def read_collections(
    session: SessionDep, current_user: CurrentUser, skip: int = 0, limit: int = 100
) -> Any:
    collections, count = services.get_collections(
        session=session, user_id=current_user.id, skip=skip, limit=limit
    )
    return CollectionList(data=collections, count=count)


@router.post("/collections/", response_model=Collection)
async def create_collection(
    session: SessionDep,
    current_user: CurrentUser,
    collection_in: CollectionCreate,
    provider: GeminiProviderDep,
) -> Any:
    name = collection_in.name
    cards = None

    if collection_in.prompt:
        try:
            flashcard_collection = await services.generate_ai_collection(
                provider, collection_in.prompt
            )
            name = flashcard_collection.name
            cards = flashcard_collection.cards
        except EmptyCollectionError:
            raise HTTPException(
                status_code=400, detail="Failed to generate flashcards from the prompt"
            )
        except AIGenerationError as e:
            raise HTTPException(status_code=500, detail=str(e))

    return await asyncio.to_thread(
        lambda: services.create_collection(
            session=session, user_id=current_user.id, name=name, cards=cards
        )
    )


@router.get("/collections/{collection_id}", response_model=Collection)
def read_collection(
    session: SessionDep, current_user: CurrentUser, collection_id: uuid.UUID
) -> Any:
    collection = services.get_collection(
        session=session, id=collection_id, user_id=current_user.id
    )
    if not collection:
        raise HTTPException(status_code=404, detail="Collection not found")
    return collection


@router.put("/collections/{collection_id}", response_model=Collection)
def update_collection(
    session: SessionDep,
    current_user: CurrentUser,
    collection_id: uuid.UUID,
    collection_in: CollectionUpdate,
) -> Any:
    collection = services.get_collection(
        session=session, id=collection_id, user_id=current_user.id
    )
    if not collection:
        raise HTTPException(status_code=404, detail="Collection not found")
    return services.update_collection(
        session=session, collection=collection, collection_in=collection_in
    )


@router.delete("/collections/{collection_id}", status_code=204)
def delete_collection(
    session: SessionDep, current_user: CurrentUser, collection_id: uuid.UUID
) -> None:
    collection = services.get_collection(
        session=session, id=collection_id, user_id=current_user.id
    )
    if not collection:
        raise HTTPException(status_code=404, detail="Collection not found")
    services.delete_collection(session=session, collection=collection)
    return


@router.get("/collections/{collection_id}/cards/", response_model=CardList)
def read_cards(
    session: SessionDep,
    current_user: CurrentUser,
    collection_id: uuid.UUID,
    skip: int = 0,
    limit: int = 100,
) -> Any:
    if not services.check_collection_access(session, collection_id, current_user.id):
        raise HTTPException(status_code=404, detail="Collection not found")
    cards, count = services.get_cards(
        session=session, collection_id=collection_id, skip=skip, limit=limit
    )
    return CardList(data=cards, count=count)


@router.post("/collections/{collection_id}/cards/", response_model=Card)
async def create_card(
    session: SessionDep,
    current_user: CurrentUser,
    collection_id: uuid.UUID,
    card_in: CardCreate,
    provider: GeminiProviderDep,
) -> Any:
    access_checked = await asyncio.to_thread(
        lambda: services.check_collection_access(
            session, collection_id, current_user.id
        )
    )
    if not access_checked:
        raise HTTPException(status_code=404, detail="Collection not found")
    if card_in.prompt:
        card_base = await services.generate_ai_flashcard(card_in.prompt, provider)
        card_in.front = card_base.front
        card_in.back = card_base.back
    return await asyncio.to_thread(
        lambda: services.create_card(
            session=session, collection_id=collection_id, card_in=card_in
        )
    )


@router.get("/collections/{collection_id}/cards/{card_id}", response_model=Card)
def read_card(
    session: SessionDep,
    current_user: CurrentUser,
    collection_id: uuid.UUID,
    card_id: uuid.UUID,
) -> Any:
    if not services.check_collection_access(session, collection_id, current_user.id):
        raise HTTPException(status_code=404, detail="Collection not found")
    card = services.get_card_with_collection(
        session=session, card_id=card_id, user_id=current_user.id
    )
    if not card or card.collection_id != collection_id:
        raise HTTPException(status_code=404, detail="Card not found")
    return card


@router.put("/collections/{collection_id}/cards/{card_id}", response_model=Card)
def update_card(
    session: SessionDep,
    current_user: CurrentUser,
    collection_id: uuid.UUID,
    card_id: uuid.UUID,
    card_in: CardUpdate,
) -> Any:
    if not services.check_collection_access(session, collection_id, current_user.id):
        raise HTTPException(status_code=404, detail="Collection not found")
    card = services.get_card_with_collection(
        session=session, card_id=card_id, user_id=current_user.id
    )
    if not card or card.collection_id != collection_id:
        raise HTTPException(status_code=404, detail="Card not found")
    return services.update_card(session=session, card=card, card_in=card_in)


@router.delete("/collections/{collection_id}/cards/{card_id}", status_code=204)
def delete_card(
    session: SessionDep,
    current_user: CurrentUser,
    collection_id: uuid.UUID,
    card_id: uuid.UUID,
) -> None:
    if not services.check_collection_access(session, collection_id, current_user.id):
        raise HTTPException(status_code=404, detail="Collection not found")
    card = services.get_card_with_collection(
        session=session, card_id=card_id, user_id=current_user.id
    )
    if not card or card.collection_id != collection_id:
        raise HTTPException(status_code=404, detail="Card not found")
    services.delete_card(session=session, card=card)
    return


@router.post("/practice-sessions", response_model=PracticeSession)
def start_practice_session(
    session: SessionDep,
    current_user: CurrentUser,
    practice_session_in: PracticeSessionCreate,
) -> Any:
    """Start a new practice session for a collection"""
    if not services.check_collection_access(
        session, practice_session_in.collection_id, current_user.id
    ):
        raise HTTPException(status_code=404, detail="Collection not found")

    try:
        return services.get_or_create_practice_session(
            session=session,
            collection_id=practice_session_in.collection_id,
            user_id=current_user.id,
        )
    except EmptyCollectionError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/practice-sessions", response_model=PracticeSessionList)
def list_practice_sessions(
    session: SessionDep,
    current_user: CurrentUser,
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """List all practice sessions for the current user"""
    practice_sessions, count = services.get_practice_sessions(
        session=session,
        user_id=current_user.id,
        skip=skip,
        limit=limit,
    )
    return PracticeSessionList(data=practice_sessions, count=count)


@router.get("/practice-sessions/{practice_session_id}", response_model=PracticeSession)
def get_practice_session_status(
    session: SessionDep,
    current_user: CurrentUser,
    practice_session_id: uuid.UUID,
) -> Any:
    """Get practice session status and statistics"""
    practice_session = services.get_practice_session(
        session=session,
        session_id=practice_session_id,
        user_id=current_user.id,
    )
    if not practice_session:
        raise HTTPException(status_code=404, detail="Practice session not found")

    return practice_session


@router.get(
    "/practice-sessions/{practice_session_id}/cards",
    response_model=PracticeCardListResponse,
)
def list_practice_cards(
    session: SessionDep,
    current_user: CurrentUser,
    practice_session_id: uuid.UUID,
    status: Literal["pending", "completed", "all"] | None = None,
    limit: int = 100,
    order: Literal["asc", "desc", "random"] | None = None,
) -> Any:
    """List practice cards for a session, optionally filtering and ordering."""
    practice_session = services.get_practice_session(
        session=session,
        session_id=practice_session_id,
        user_id=current_user.id,
    )
    if not practice_session:
        raise HTTPException(status_code=404, detail="Practice session not found")

    practice_cards, count = services.get_practice_cards(
        session=session,
        practice_session_id=practice_session_id,
        status=status,
        limit=limit,
        order=order,
    )

    response_data = [
        PracticeCardResponse(
            card=pc.card,
            is_practiced=pc.is_practiced,
            is_correct=pc.is_correct,
        )
        for pc in practice_cards
    ]

    return PracticeCardListResponse(data=response_data, count=count)


@router.patch(
    "/practice-sessions/{practice_session_id}/cards/{card_id}",
    response_model=PracticeCardResponse,
)
def update_practice_card_result(
    session: SessionDep,
    current_user: CurrentUser,
    practice_session_id: uuid.UUID,
    card_id: uuid.UUID,
    result_in: PracticeCardResultPatch,
) -> Any:
    """Update the result (is_correct) for a practiced card."""
    practice_session = services.get_practice_session(
        session=session,
        session_id=practice_session_id,
        user_id=current_user.id,
    )
    if not practice_session:
        raise HTTPException(status_code=404, detail="Practice session not found")

    if practice_session.is_completed:
        raise HTTPException(status_code=400, detail="Practice session is completed")

    practice_card = services.get_practice_card(
        session=session,
        practice_session_id=practice_session_id,
        card_id=card_id,
    )
    if not practice_card:
        raise HTTPException(status_code=404, detail="Practice card not found")

    practice_card = services.record_practice_card_result(
        session=session,
        practice_card=practice_card,
        is_correct=result_in.is_correct,
    )

    card = services.get_card_by_id(session=session, card_id=practice_card.card_id)
    if not card:
        raise HTTPException(status_code=500, detail="Associated card not found")

    return PracticeCardResponse(
        card=card,
        is_practiced=practice_card.is_practiced,
        is_correct=practice_card.is_correct,
    )
