import { describe, expect, it } from 'vitest'
import { createSeededRandom } from './shuffle'
import {
  createEmptyProgress,
  fromProgress,
  reduceSession,
  startSession,
  toProgress,
} from './session'

describe('session', () => {
  it('starts with a shuffled queue and empty piles', () => {
    const random = createSeededRandom(42)
    const state = startSession(['a', 'b', 'c'], random)
    expect(state.queueIds).toHaveLength(3)
    expect(new Set(state.queueIds)).toEqual(new Set(['a', 'b', 'c']))
    expect(state.knownIds).toEqual([])
    expect(state.unknownIds).toEqual([])
    expect(state.finished).toBe(false)
  })

  it('moves graded cards into known or unknown piles', () => {
    let state = fromProgress({
      knownIds: [],
      unknownIds: [],
      queueIds: ['a', 'b'],
      session: 1,
    })

    state = reduceSession(state, { type: 'grade', grade: 'known' })
    expect(state.knownIds).toEqual(['a'])
    expect(state.queueIds).toEqual(['b'])

    state = reduceSession(state, { type: 'grade', grade: 'unknown' })
    expect(state.showRoundBanner).toBe(true)
    expect(state.session).toBe(2)
    expect(state.knownIds).toEqual(['a'])
    expect(state.unknownIds).toEqual([])
    expect(state.queueIds).toEqual(['b'])
  })

  it('finishes when the last card is known and no unknowns remain', () => {
    let state = fromProgress({
      knownIds: ['a'],
      unknownIds: [],
      queueIds: ['b'],
      session: 1,
    })
    state = reduceSession(state, { type: 'grade', grade: 'known' })
    expect(state.finished).toBe(true)
    expect(state.knownIds).toEqual(['a', 'b'])
    expect(state.queueIds).toEqual([])
  })

  it('restarts with all cards', () => {
    const random = createSeededRandom(7)
    let state = fromProgress({
      knownIds: ['a'],
      unknownIds: ['b'],
      queueIds: [],
      session: 3,
    })
    state = reduceSession(state, {
      type: 'restartAll',
      cardIds: ['a', 'b', 'c'],
      random,
    })
    expect(state.session).toBe(1)
    expect(state.knownIds).toEqual([])
    expect(state.unknownIds).toEqual([])
    expect(state.queueIds).toHaveLength(3)
    expect(state.finished).toBe(false)
  })

  it('serializes progress without UI flags', () => {
    const state = startSession(['x'], () => 0)
    expect(toProgress(state)).toEqual({
      knownIds: [],
      unknownIds: [],
      queueIds: ['x'],
      session: 1,
    })
    expect(createEmptyProgress().queueIds).toEqual([])
  })
})
