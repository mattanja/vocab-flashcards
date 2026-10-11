export type VocabCard = {
  id: string
  source: string
  target: string
  phonetic?: string
  explanation?: string
  forms?: string
}

export type VocabSet = {
  id: string
  title: string
  description?: string
  sourceLanguage: string
  targetLanguage: string
  cards: VocabCard[]
}

export type StudyDirection = 'de-fr' | 'fr-de'

export type Locale = 'de' | 'en'

export type StudyProgress = {
  knownIds: string[]
  unknownIds: string[]
  queueIds: string[]
  session: number
}

export type Screen = 'home' | 'study' | 'known' | 'done' | 'editSet'

export type SetEditorMode = 'create' | 'edit'
