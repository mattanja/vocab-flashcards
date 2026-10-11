export type SwipeAxis = 'undecided' | 'horizontal' | 'vertical'

export type SwipeDecision = 'known' | 'unknown' | null

const AXIS_LOCK_PX = 10

export function decideAxis(deltaX: number, deltaY: number): SwipeAxis {
  const absX = Math.abs(deltaX)
  const absY = Math.abs(deltaY)
  if (absX < AXIS_LOCK_PX && absY < AXIS_LOCK_PX) return 'undecided'
  return absX >= absY ? 'horizontal' : 'vertical'
}

export function decideSwipe(offsetX: number, threshold: number): SwipeDecision {
  if (offsetX >= threshold) return 'known'
  if (offsetX <= -threshold) return 'unknown'
  return null
}

export function shouldSuppressClick(totalDistance: number, dragThreshold = 8): boolean {
  return totalDistance > dragThreshold
}
