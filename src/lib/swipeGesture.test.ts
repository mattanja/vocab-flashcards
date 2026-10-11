import { describe, expect, it } from 'vitest'
import { decideAxis, decideSwipe, shouldSuppressClick } from './swipeGesture'

describe('swipeGesture', () => {
  it('locks to the dominant axis after a small movement', () => {
    expect(decideAxis(4, 3)).toBe('undecided')
    expect(decideAxis(20, 5)).toBe('horizontal')
    expect(decideAxis(5, 20)).toBe('vertical')
  })

  it('grades only past the threshold', () => {
    expect(decideSwipe(99, 100)).toBeNull()
    expect(decideSwipe(100, 100)).toBe('known')
    expect(decideSwipe(-100, 100)).toBe('unknown')
  })

  it('suppresses clicks after a meaningful drag', () => {
    expect(shouldSuppressClick(2)).toBe(false)
    expect(shouldSuppressClick(12)).toBe(true)
  })
})
