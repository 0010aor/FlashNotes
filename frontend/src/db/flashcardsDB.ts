import Dexie, { type Table } from 'dexie'

export interface LocalCollection {
  id: string
  name: string
  prompt?: string | null
  createdAt: number
  updatedAt: number
  synced?: boolean
}

export interface LocalCard {
  id: string
  collectionId: string
  front: string
  back: string
  createdAt: number
  updatedAt: number
  synced?: boolean
}

export interface LocalPracticeSession {
  id: string
  collectionId: string
  startedAt: number
  completedAt?: number
  isCompleted: boolean
  totalCards: number
  cardsPracticed: number
  correctAnswers: number
  synced?: boolean
}

export interface LocalPracticeCard {
  id: string
  sessionId: string
  cardId: string
  isCorrect?: boolean
  isPracticed: boolean
  practicedAt?: number
  synced?: boolean
}

export class FlashcardsDB extends Dexie {
  collections!: Table<LocalCollection, string>
  cards!: Table<LocalCard, string>
  practice_sessions!: Table<LocalPracticeSession, string>
  practice_cards!: Table<LocalPracticeCard, string>

  constructor() {
    super('FlashcardsDB')
    this.version(2).stores({
      collections: 'id, name, updatedAt, synced',
      cards: 'id, collectionId, updatedAt, synced',
      practice_sessions: 'id, collectionId, startedAt, isCompleted, synced',
      practice_cards: 'id, sessionId, cardId, isPracticed, practicedAt, synced',
    })
  }
}

export const db = new FlashcardsDB()
