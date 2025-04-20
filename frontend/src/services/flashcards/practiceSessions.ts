import { FlashcardsService } from '@/client'
import { isGuest } from '../../hooks/useAuth'
import * as practiceSessions from '../localDB/practiceSessions'

export const startPracticeSession = async (collectionId: string) => {
  if (isGuest()) {
    return await practiceSessions.startLocalPracticeSession(collectionId)
  }
  return await FlashcardsService.startPracticeSession({
    requestBody: { collection_id: collectionId },
  })
}

export const getPracticeSessions = async (collectionId: string) => {
  if (isGuest()) {
    return await practiceSessions.getLocalPracticeSessions(collectionId)
  }
  const res = await FlashcardsService.listPracticeSessions()
  return res.data.filter((s) => s.collection_id === collectionId)
}
