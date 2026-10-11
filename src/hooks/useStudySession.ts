import { useCallback, useEffect, useMemo, useReducer } from 'react'
import {
  createEmptyProgress,
  currentCardId,
  fromProgress,
  reduceSession,
  toProgress,
  type SessionState,
} from '../lib/session'
import * as storage from '../lib/storage'
import type { StudyDirection, VocabCard, VocabSet } from '../types'

type Action =
  | { type: 'hydrate'; set: VocabSet; resume: boolean }
  | { type: 'grade'; grade: 'known' | 'unknown' }
  | { type: 'dismissRoundBanner' }
  | { type: 'restartAll' }
  | { type: 'setDirection'; direction: StudyDirection }

type HookState = {
  set: VocabSet | null
  session: SessionState
  direction: StudyDirection
}

const initialState: HookState = {
  set: null,
  session: fromProgress(createEmptyProgress()),
  direction: 'de-fr',
}

function reducer(state: HookState, action: Action): HookState {
  switch (action.type) {
    case 'hydrate': {
      const cardIds = action.set.cards.map((card) => card.id)
      const saved = storage.getProgress(action.set.id)
      const session =
        action.resume && saved
          ? fromProgress(saved)
          : reduceSession(state.session, { type: 'start', cardIds })
      storage.setActiveSetId(action.set.id)
      storage.setProgress(action.set.id, toProgress(session))
      return {
        set: action.set,
        session,
        direction: storage.getDirection('de-fr'),
      }
    }
    case 'grade': {
      const nextSession = reduceSession(state.session, {
        type: 'grade',
        grade: action.grade,
      })
      if (state.set) {
        storage.setProgress(state.set.id, toProgress(nextSession))
      }
      return { ...state, session: nextSession }
    }
    case 'dismissRoundBanner':
      return {
        ...state,
        session: reduceSession(state.session, { type: 'dismissRoundBanner' }),
      }
    case 'restartAll': {
      if (!state.set) return state
      const cardIds = state.set.cards.map((card) => card.id)
      const session = reduceSession(state.session, { type: 'restartAll', cardIds })
      storage.setProgress(state.set.id, toProgress(session))
      return { ...state, session }
    }
    case 'setDirection':
      storage.setDirection(action.direction)
      return { ...state, direction: action.direction }
    default:
      return state
  }
}

export function useStudySession() {
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    document.documentElement.lang = storage.getLocale('de')
  }, [])

  const cardsById = useMemo(() => {
    const map = new Map<string, VocabCard>()
    state.set?.cards.forEach((card) => map.set(card.id, card))
    return map
  }, [state.set])

  const currentCard = useMemo(() => {
    const id = currentCardId(state.session)
    return id ? cardsById.get(id) : undefined
  }, [cardsById, state.session])

  const knownCards = useMemo(
    () =>
      state.session.knownIds
        .map((id) => cardsById.get(id))
        .filter((card): card is VocabCard => Boolean(card)),
    [cardsById, state.session.knownIds],
  )

  const start = useCallback((set: VocabSet, resume: boolean) => {
    dispatch({ type: 'hydrate', set, resume })
  }, [])

  const grade = useCallback((value: 'known' | 'unknown') => {
    dispatch({ type: 'grade', grade: value })
  }, [])

  const dismissRoundBanner = useCallback(() => {
    dispatch({ type: 'dismissRoundBanner' })
  }, [])

  const restartAll = useCallback(() => {
    dispatch({ type: 'restartAll' })
  }, [])

  const setDirection = useCallback((direction: StudyDirection) => {
    dispatch({ type: 'setDirection', direction })
  }, [])

  return {
    set: state.set,
    session: state.session,
    direction: state.direction,
    currentCard,
    knownCards,
    cardsById,
    start,
    grade,
    dismissRoundBanner,
    restartAll,
    setDirection,
  }
}
