import type { StudyProgress } from '../types'
import { shuffle } from './shuffle'

export type Grade = 'known' | 'unknown'

export type SessionEvent =
  | { type: 'start'; cardIds: string[]; random?: () => number }
  | { type: 'resume'; progress: StudyProgress }
  | { type: 'grade'; grade: Grade; random?: () => number }
  | { type: 'dismissRoundBanner' }
  | { type: 'restartAll'; cardIds: string[]; random?: () => number }

export type SessionState = StudyProgress & {
  showRoundBanner: boolean
  finished: boolean
}

export function createEmptyProgress(): StudyProgress {
  return {
    knownIds: [],
    unknownIds: [],
    queueIds: [],
    session: 1,
  }
}

export function startSession(
  cardIds: string[],
  random: () => number = Math.random,
): SessionState {
  return {
    knownIds: [],
    unknownIds: [],
    queueIds: shuffle(cardIds, random),
    session: 1,
    showRoundBanner: false,
    finished: cardIds.length === 0,
  }
}

export function fromProgress(progress: StudyProgress): SessionState {
  const finished =
    progress.queueIds.length === 0 &&
    progress.unknownIds.length === 0 &&
    progress.knownIds.length > 0

  return {
    ...progress,
    showRoundBanner: false,
    finished,
  }
}

function afterGrade(state: SessionState, grade: Grade, random: () => number): SessionState {
  const [current, ...rest] = state.queueIds
  if (!current) {
    return state
  }

  const knownIds =
    grade === 'known' ? [...state.knownIds, current] : state.knownIds.filter((id) => id !== current)
  const unknownIds =
    grade === 'unknown'
      ? [...state.unknownIds, current]
      : state.unknownIds.filter((id) => id !== current)

  if (rest.length > 0) {
    return {
      ...state,
      knownIds,
      unknownIds,
      queueIds: rest,
      showRoundBanner: false,
      finished: false,
    }
  }

  if (unknownIds.length > 0) {
    return {
      knownIds,
      unknownIds: [],
      queueIds: shuffle(unknownIds, random),
      session: state.session + 1,
      showRoundBanner: true,
      finished: false,
    }
  }

  return {
    knownIds,
    unknownIds: [],
    queueIds: [],
    session: state.session,
    showRoundBanner: false,
    finished: true,
  }
}

export function reduceSession(state: SessionState, event: SessionEvent): SessionState {
  switch (event.type) {
    case 'start':
      return startSession(event.cardIds, event.random)
    case 'resume':
      return fromProgress(event.progress)
    case 'grade':
      return afterGrade(state, event.grade, event.random ?? Math.random)
    case 'dismissRoundBanner':
      return { ...state, showRoundBanner: false }
    case 'restartAll':
      return startSession(event.cardIds, event.random)
    default:
      return state
  }
}

export function toProgress(state: SessionState): StudyProgress {
  return {
    knownIds: state.knownIds,
    unknownIds: state.unknownIds,
    queueIds: state.queueIds,
    session: state.session,
  }
}

export function currentCardId(state: SessionState): string | undefined {
  return state.queueIds[0]
}
