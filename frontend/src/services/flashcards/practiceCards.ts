import { FlashcardsService } from '@/client'
import { isGuest } from '../../hooks/useAuth'
import * as cards from '../localDB/cards'
import * as practiceCards from '../localDB/practiceCards'

export const listPracticeCards = async (sessionId: string) => {
  if (isGuest()) {
    const localPracticeCards = await practiceCards.getLocalPracticeCardsForSession(sessionId)
    const cardObjs = await Promise.all(
      localPracticeCards.map(async (pc) => {
        const card = await cards.getLocalCardById(pc.cardId)
        return card ? { card, is_practiced: pc.isPracticed, is_correct: pc.isCorrect } : null
      }),
    )
    return { data: cardObjs.filter(Boolean) }
  }
  return await FlashcardsService.listPracticeCards({
    practiceSessionId: sessionId,
    status: 'pending',
    limit: 1,
  })
}

export const updatePracticeCardResult = async (
  sessionId: string,
  cardId: string,
  isCorrect: boolean,
) => {
  if (isGuest()) {
    return { is_correct: isCorrect }
  }
  return await FlashcardsService.updatePracticeCardResult({
    practiceSessionId: sessionId,
    cardId,
    requestBody: { is_correct: isCorrect },
  })
}
