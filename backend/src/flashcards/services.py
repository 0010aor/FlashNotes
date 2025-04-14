import json
import random
import uuid
from datetime import datetime, timezone
from typing import Literal

from google import genai
from pydantic import ValidationError
from sqlmodel import Session, func, select

from src.ai_models.gemini.exceptions import AIGenerationError

from .ai_config import get_flashcard_config
from .exceptions import EmptyCollectionError
from .models import Card, Collection, PracticeCard, PracticeSession
from .schemas import (
    AIFlashcardCollection,
    CardCreate,
    CardUpdate,
    CollectionCreate,
    CollectionUpdate,
)


def get_collections(
    session: Session, user_id: uuid.UUID, skip: int = 0, limit: int = 100
) -> tuple[list[Collection], int]:
    count_statement = select(func.count()).where(Collection.user_id == user_id)
    count = session.exec(count_statement).one()
    statement = (
        select(Collection)
        .where(Collection.user_id == user_id)
        .order_by(Collection.updated_at.desc())
        .offset(skip)
        .limit(limit)
    )
    collections = session.exec(statement).all()
    return collections, count


def get_collection(
    session: Session, id: uuid.UUID, user_id: uuid.UUID
) -> Collection | None:
    statement = select(Collection).where(
        Collection.id == id, Collection.user_id == user_id
    )
    return session.exec(statement).first()


def create_collection(
    session: Session, collection_in: CollectionCreate, user_id: uuid.UUID
) -> Collection:
    collection = Collection.model_validate(collection_in, update={"user_id": user_id})
    collection.user_id = user_id
    session.add(collection)
    session.commit()
    session.refresh(collection)
    return collection


def update_collection(
    session: Session, collection: Collection, collection_in: CollectionUpdate
) -> Collection:
    collection_data = collection_in.model_dump(exclude_unset=True)
    for key, value in collection_data.items():
        setattr(collection, key, value)
    collection.updated_at = datetime.now(timezone.utc)
    session.add(collection)
    session.commit()
    session.refresh(collection)
    return collection


def delete_collection(session: Session, collection: Collection) -> None:
    session.delete(collection)
    session.commit()


def get_cards(
    session: Session, collection_id: uuid.UUID, skip: int = 0, limit: int = 100
) -> tuple[list[Card], int]:
    count_statement = select(func.count()).where(Card.collection_id == collection_id)
    count = session.exec(count_statement).one()
    statement = (
        select(Card)
        .where(Card.collection_id == collection_id)
        .order_by(Card.updated_at.desc())
        .offset(skip)
        .limit(limit)
    )
    cards = session.exec(statement).all()
    return cards, count


def get_card(session: Session, card_id: uuid.UUID) -> Card | None:
    return session.get(Card, card_id)


def get_card_with_collection(
    session: Session, card_id: uuid.UUID, user_id: uuid.UUID
) -> Card | None:
    statement = (
        select(Card)
        .join(Collection)
        .where(Card.id == card_id, Collection.user_id == user_id)
    )
    return session.exec(statement).first()


def _add_card_to_ongoing_sessions(session: Session, card: Card) -> None:
    statement = select(PracticeSession).where(
        PracticeSession.collection_id == card.collection_id,
        PracticeSession.is_completed.is_not(True),
    )
    practice_session = session.exec(statement).first()

    if practice_session:
        practice_card = PracticeCard(
            session_id=practice_session.id,
            card_id=card.id,
        )
        session.add(practice_card)
        practice_session.total_cards += 1
        practice_session.updated_at = datetime.now(timezone.utc)
        session.add(practice_session)


def create_card(
    session: Session, collection_id: uuid.UUID, card_in: CardCreate
) -> Card:
    card = Card(collection_id=collection_id, **card_in.model_dump())
    session.add(card)
    session.flush()

    _add_card_to_ongoing_sessions(session, card)

    session.commit()
    session.refresh(card)
    return card


def update_card(session: Session, card: Card, card_in: CardUpdate) -> Card:
    card_data = card_in.model_dump(exclude_unset=True)
    for key, value in card_data.items():
        setattr(card, key, value)
    card.updated_at = datetime.now(timezone.utc)
    session.add(card)
    session.commit()
    session.refresh(card)
    return card


def _remove_incomplete_practice_sessions(session: Session, card: Card) -> None:
    statement = (
        select(PracticeSession)
        .join(PracticeCard, PracticeCard.session_id == PracticeSession.id)
        .where(
            PracticeCard.card_id == card.id,
            PracticeSession.is_completed.is_not(True),
        )
        .distinct()
    )
    affected_sessions = session.exec(statement).all()

    for practice_session in affected_sessions:
        session.delete(practice_session)


def delete_card(session: Session, card: Card) -> None:
    _remove_incomplete_practice_sessions(session, card)

    session.delete(card)
    session.commit()


def check_collection_access(
    session: Session, collection_id: uuid.UUID, user_id: uuid.UUID
) -> bool:
    statement = select(Collection).where(
        Collection.id == collection_id, Collection.user_id == user_id
    )
    collection = session.exec(statement).first()
    return collection is not None


def get_practice_sessions(
    session: Session, user_id: uuid.UUID, skip: int = 0, limit: int = 100
) -> tuple[list["PracticeSession"], int]:
    count_statement = select(func.count()).where(PracticeSession.user_id == user_id)
    count = session.exec(count_statement).one()
    statement = (
        select(PracticeSession)
        .where(PracticeSession.user_id == user_id)
        .order_by(PracticeSession.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    practice_sessions = session.exec(statement).all()
    return practice_sessions, count


def get_practice_session(
    session: Session, session_id: uuid.UUID, user_id: uuid.UUID
) -> PracticeSession | None:
    statement = select(PracticeSession).where(
        PracticeSession.id == session_id, PracticeSession.user_id == user_id
    )
    return session.exec(statement).first()


def _get_uncompleted_session(
    session: Session, collection_id: uuid.UUID, user_id: uuid.UUID
) -> PracticeSession | None:
    statement = select(PracticeSession).where(
        PracticeSession.collection_id == collection_id,
        PracticeSession.user_id == user_id,
        PracticeSession.is_completed.is_not(True),
    )
    return session.exec(statement).first()


def _get_collection_cards(session: Session, collection_id: uuid.UUID) -> list[Card]:
    statement = select(Card).where(Card.collection_id == collection_id)
    return session.exec(statement).all()


def _create_practice_cards(
    session: Session, practice_session: PracticeSession, cards: list[Card]
) -> None:
    random_cards = random.sample(cards, len(cards))
    for card in random_cards:
        practice_card = PracticeCard(
            session_id=practice_session.id,
            card_id=card.id,
        )
        session.add(practice_card)


def get_or_create_practice_session(
    session: Session, collection_id: uuid.UUID, user_id: uuid.UUID
) -> PracticeSession:
    existing_session = _get_uncompleted_session(session, collection_id, user_id)
    if existing_session:
        if existing_session.cards_practiced == 0:
            session.delete(existing_session)
            session.commit()
        else:
            return existing_session

    cards = _get_collection_cards(session, collection_id)
    if not cards:
        raise EmptyCollectionError(
            "Cannot create practice session for empty collection"
        )

    practice_session = PracticeSession(
        collection_id=collection_id,
        user_id=user_id,
        total_cards=len(cards),
    )
    session.add(practice_session)
    session.flush()

    _create_practice_cards(session, practice_session, cards)

    session.commit()
    session.refresh(practice_session)
    return practice_session


def get_practice_cards(
    session: Session,
    practice_session_id: uuid.UUID,
    status: Literal["pending", "completed", "all"] | None = None,
    limit: int | None = None,
    order: Literal["asc", "desc", "random"] | None = None,
) -> tuple[list[PracticeCard], int]:
    """Get practice cards for a session, optionally filtering, ordering, and limiting."""
    base_statement = select(PracticeCard).where(
        PracticeCard.session_id == practice_session_id
    )

    if status == "pending":
        statement = base_statement.where(PracticeCard.is_practiced.is_not(True))
    elif status == "completed":
        statement = base_statement.where(PracticeCard.is_practiced.is_(True))
    else:
        statement = base_statement

    count_statement = select(func.count()).select_from(statement.subquery())
    count = session.exec(count_statement).one()

    if order == "asc":
        statement = statement.order_by(PracticeCard.created_at.asc())
    elif order == "desc":
        statement = statement.order_by(PracticeCard.created_at.desc())
    elif order != "random":
        if status == "pending":
            statement = statement.order_by(PracticeCard.created_at)
        else:
            statement = statement.order_by(PracticeCard.updated_at.desc())

    if order == "random":
        practice_cards = session.exec(statement).all()
        random.shuffle(practice_cards)

        if limit is not None:
            practice_cards = practice_cards[:limit]
    else:
        if limit is not None:
            statement = statement.limit(limit)
        practice_cards = session.exec(statement).all()

    return practice_cards, count


def get_next_card(
    session: Session, practice_session_id: uuid.UUID
) -> tuple[Card, PracticeCard] | None:
    statement = (
        select(PracticeCard, Card)
        .join(Card, PracticeCard.card_id == Card.id)
        .where(
            PracticeCard.session_id == practice_session_id,
            PracticeCard.is_practiced.is_not(True),
        )
        .limit(1)
    )
    result = session.exec(statement).first()
    if result:
        return result[1], result[0]


def get_practice_card(
    session: Session,
    practice_session_id: uuid.UUID,
    card_id: uuid.UUID,
) -> PracticeCard | None:
    statement = select(PracticeCard).where(
        PracticeCard.session_id == practice_session_id,
        PracticeCard.card_id == card_id,
    )
    return session.exec(statement).first()


def record_practice_card_result(
    session: Session,
    practice_card: PracticeCard,
    is_correct: bool,
) -> PracticeCard:
    was_practiced = practice_card.is_practiced

    practice_card.is_correct = is_correct
    practice_card.is_practiced = True
    practice_card.updated_at = datetime.now(timezone.utc)
    session.add(practice_card)

    practice_session = session.get(PracticeSession, practice_card.session_id)
    if practice_session:
        if not was_practiced:
            practice_session.cards_practiced += 1
            if is_correct:
                practice_session.correct_answers += 1

            if practice_session.cards_practiced == practice_session.total_cards:
                practice_session.is_completed = True

        practice_session.updated_at = datetime.now(timezone.utc)
        session.add(practice_session)

    session.commit()
    session.refresh(practice_card)
    return practice_card


def get_session_statistics(
    session: Session, practice_session_id: uuid.UUID
) -> PracticeSession:
    return session.get(PracticeSession, practice_session_id)


def get_card_by_id(session: Session, card_id: uuid.UUID) -> Card | None:
    statement = select(Card).where(Card.id == card_id)
    return session.exec(statement).first()


async def _generate_ai_flashcards(provider, prompt: str) -> AIFlashcardCollection:
    content_config = get_flashcard_config(genai.types)
    raw_response = await provider.run_model(content_config, prompt)

    try:
        json_data = json.loads(raw_response)
        if "collection" not in json_data:
            raise AIGenerationError("AI response missing 'collection' field")
        collection = AIFlashcardCollection.model_validate(json_data["collection"])
        if not collection.cards:
            raise AIGenerationError("AI generated an empty collection with no cards")

        return collection
    except json.JSONDecodeError:
        raise AIGenerationError("Failed to parse AI response as JSON")
    except ValidationError as e:
        raise AIGenerationError(f"Invalid AI response format: {str(e)}")
    except Exception as e:
        raise AIGenerationError(f"Error processing AI response: {str(e)}")


def _save_ai_collection(
    session: Session, user_id: uuid.UUID, flashcard_collection: AIFlashcardCollection
) -> Collection:
    collection = Collection(
        name=flashcard_collection.name,
        user_id=user_id,
    )
    session.add(collection)
    session.commit()
    session.refresh(collection)

    for card_data in flashcard_collection.cards:
        card = Card(
            front=card_data.front,
            back=card_data.back,
            collection_id=collection.id,
        )
        session.add(card)

    session.commit()
    session.refresh(collection)
    return collection


async def generate_ai_collection(
    session: Session, user_id: uuid.UUID, prompt: str, provider
) -> Collection:
    """Generate a collection of flashcards using AI and save it to the database."""
    flashcard_collection = await _generate_ai_flashcards(provider, prompt)
    return _save_ai_collection(session, user_id, flashcard_collection)
