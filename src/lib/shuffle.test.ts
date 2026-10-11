import { describe, expect, it } from 'vitest'
import { createSeededRandom, shuffle } from './shuffle'

describe('shuffle', () => {
  it('is deterministic with a seeded RNG', () => {
    const a = shuffle([1, 2, 3, 4, 5], createSeededRandom(123))
    const b = shuffle([1, 2, 3, 4, 5], createSeededRandom(123))
    expect(a).toEqual(b)
    expect(a).not.toEqual([1, 2, 3, 4, 5])
  })

  it('keeps all items', () => {
    const input = ['a', 'b', 'c']
    expect(shuffle(input, createSeededRandom(1)).sort()).toEqual(input)
  })
})
