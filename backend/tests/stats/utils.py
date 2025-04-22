from src.flashcards.models import Card, PracticeCard, PracticeSession


def create_cards(db, collection, num_cards):
    cards = [
        Card(front=f"Front {i}", back=f"Back {i}", collection_id=collection.id)
        for i in range(num_cards)
    ]
    db.add_all(cards)
    db.flush()
    return cards


def create_sessions(db, user_id, collection, num_sessions, num_cards):
    sessions = [
        PracticeSession(
            user_id=user_id,
            collection_id=collection.id,
            total_cards=num_cards,
            cards_practiced=num_cards,
            correct_answers=3,
            is_completed=True,
        )
        for _ in range(num_sessions)
    ]
    db.add_all(sessions)
    db.flush()
    return sessions


def create_practice_cards(db, sessions, cards):
    practice_cards = [
        PracticeCard(
            session_id=session.id,
            card_id=card.id,
            is_practiced=True,
            is_correct=(card_idx % 2 == 0),
        )
        for session in sessions
        for card_idx, card in enumerate(cards)
    ]
    db.add_all(practice_cards)
    db.commit()
