import * as cards from './cards'
import * as collections from './collections'
import * as practiceSessions from './practiceSessions'

export async function getLocalCollectionStats(collectionId: string) {
  const collection = await collections.getLocalCollectionById(collectionId)
  const cardList = await cards.getLocalCardsForCollection(collectionId, 5)
  const sessionList = await practiceSessions.getLocalPracticeSessions(collectionId, 30)

  return {
    collection_info: {
      name: collection?.name || '',
      total_cards: cardList.length,
      total_practice_sessions: sessionList.length,
    },
    recent_sessions: sessionList.map((s) => ({
      id: s.id,
      created_at: new Date(s.startedAt).toISOString(),
      cards_practiced: s.cardsPracticed,
      correct_answers: s.correctAnswers,
      total_cards: s.totalCards,
      is_completed: s.isCompleted,
    })),
    difficult_cards: cardList.map((card) => ({
      id: card.id,
      front: card.front,
      total_attempts: 0,
      correct_answers: 0,
    })),
  }
}
