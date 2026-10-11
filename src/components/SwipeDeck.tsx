import { useRef, useState, type PointerEvent, type ReactNode } from 'react'

type Props = {
  enabled: boolean
  onKnown: () => void
  onUnknown: () => void
  children: ReactNode
}

const THRESHOLD = 100

export function SwipeDeck({ enabled, onKnown, onUnknown, children }: Props) {
  const startX = useRef<number | null>(null)
  const [offsetX, setOffsetX] = useState(0)
  const [dragging, setDragging] = useState(false)

  const reset = () => {
    startX.current = null
    setOffsetX(0)
    setDragging(false)
  }

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!enabled) return
    startX.current = event.clientX
    setDragging(true)
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!enabled || startX.current === null) return
    setOffsetX(event.clientX - startX.current)
  }

  const onPointerUp = () => {
    if (!enabled || startX.current === null) {
      reset()
      return
    }

    if (offsetX > THRESHOLD) {
      onKnown()
    } else if (offsetX < -THRESHOLD) {
      onUnknown()
    }
    reset()
  }

  const rotation = offsetX / 28
  const knownOpacity = Math.min(Math.max(offsetX / THRESHOLD, 0), 1)
  const unknownOpacity = Math.min(Math.max(-offsetX / THRESHOLD, 0), 1)

  return (
    <div
      className="relative touch-pan-y"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={reset}
    >
      <div
        className="pointer-events-none absolute left-3 top-3 z-10 rounded-full bg-[var(--unknown)] px-3 py-1 text-xs font-semibold text-white"
        style={{ opacity: unknownOpacity }}
      >
        ←
      </div>
      <div
        className="pointer-events-none absolute right-3 top-3 z-10 rounded-full bg-[var(--known)] px-3 py-1 text-xs font-semibold text-white"
        style={{ opacity: knownOpacity }}
      >
        →
      </div>
      <div
        style={{
          transform: `translateX(${offsetX}px) rotate(${rotation}deg)`,
          transition: dragging ? 'none' : 'transform 180ms ease-out',
        }}
      >
        {children}
      </div>
    </div>
  )
}
