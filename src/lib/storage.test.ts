import { beforeEach, describe, expect, it } from 'vitest'
import {
  clearProgress,
  getDirection,
  getLocale,
  getProgress,
  hasResumeableProgress,
  setDirection,
  setLocale,
  setProgress,
} from './storage'

describe('storage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('persists locale and direction', () => {
    expect(getLocale()).toBe('de')
    expect(getDirection()).toBe('de-fr')
    setLocale('en')
    setDirection('fr-de')
    expect(getLocale()).toBe('en')
    expect(getDirection()).toBe('fr-de')
  })

  it('persists and clears progress', () => {
    const progress = {
      knownIds: ['a'],
      unknownIds: ['b'],
      queueIds: ['c'],
      session: 2,
    }
    setProgress('demo', progress)
    expect(getProgress('demo')).toEqual(progress)
    expect(hasResumeableProgress(progress)).toBe(true)
    clearProgress('demo')
    expect(getProgress('demo')).toBeNull()
  })
})
