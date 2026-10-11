import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react'
import { decideAxis, decideSwipe, shouldSuppressClick, type SwipeAxis } from '../lib/swipeGesture'

type Props = {
  enabled: boolean
  onKnown: () => void
  onUnknown: () => void
  children: ReactNode
}

const THRESHOLD = 100

export function SwipeDeck({ enabled, onKnown, onUnknown, children }: Props) {
  const rootRef = useRef<HTMLDivElement>(null)
  const startX = useRef(0)
  const startY = useRef(0)
  const offsetX = useRef(0)
  const axis = useRef<SwipeAxis>('undecided')
  const activePointer = useRef<number | null>(null)
  const suppressClick = useRef(false)
  const [renderOffset, setRenderOffset] = useState(0)
  const [dragging, setDragging] = useState(false)

  const resetVisual = () => {
    offsetX.current = 0
    axis.current = 'undecided'
    activePointer.current = null
    setRenderOffset(0)
    setDragging(false)
  }

  const finish = () => {
    const decision = decideSwipe(offsetX.current, THRESHOLD)
    if (shouldSuppressClick(Math.abs(offsetX.current))) {
      suppressClick.current = true
    }
    resetVisual()
    if (decision === 'known') onKnown()
    if (decision === 'unknown') onUnknown()
  }

  useEffect(() => {
    const node = rootRef.current
    if (!node || !enabled) return

    const onTouchMove = (event: TouchEvent) => {
      if (activePointer.current === null) return
      if (axis.current === 'horizontal') {
        event.preventDefault()
      }
    }

    node.addEventListener('touchmove', onTouchMove, { passive: false })
    return () => node.removeEventListener('touchmove', onTouchMove)
  }, [enabled])

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!enabled || event.button !== 0) return
    suppressClick.current = false
    activePointer.current = event.pointerId
    startX.current = event.clientX
    startY.current = event.clientY
    offsetX.current = 0
    axis.current = 'undecided'
    setDragging(true)
    setRenderOffset(0)
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!enabled || activePointer.current !== event.pointerId) return

    const deltaX = event.clientX - startX.current
    const deltaY = event.clientY - startY.current

    if (axis.current === 'undecided') {
      axis.current = decideAxis(deltaX, deltaY)
      if (axis.current === 'vertical') {
        activePointer.current = null
        setDragging(false)
        setRenderOffset(0)
        try {
          event.currentTarget.releasePointerCapture(event.pointerId)
        } catch {
          /* already released */
        }
        return
      }
    }

    if (axis.current !== 'horizontal') return

    offsetX.current = deltaX
    setRenderOffset(deltaX)
  }

  const onPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (activePointer.current !== event.pointerId) return
    if (axis.current === 'horizontal') {
      finish()
      return
    }
    resetVisual()
  }

  const onPointerCancel = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (activePointer.current !== event.pointerId) return
    if (axis.current === 'horizontal' && Math.abs(offsetX.current) >= THRESHOLD) {
      finish()
      return
    }
    resetVisual()
  }

  const onClickCapture = (event: React.MouseEvent<HTMLDivElement>) => {
    if (suppressClick.current || shouldSuppressClick(Math.abs(renderOffset)) || dragging) {
      event.preventDefault()
      event.stopPropagation()
      suppressClick.current = false
    }
  }

  const rotation = renderOffset / 28
  const knownOpacity = Math.min(Math.max(renderOffset / THRESHOLD, 0), 1)
  const unknownOpacity = Math.min(Math.max(-renderOffset / THRESHOLD, 0), 1)

  return (
    <div
      ref={rootRef}
      className={`relative ${enabled ? 'touch-none' : 'touch-pan-y'}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      onClickCapture={onClickCapture}
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
          transform: `translateX(${renderOffset}px) rotate(${rotation}deg)`,
          transition: dragging ? 'none' : 'transform 180ms ease-out',
          willChange: dragging ? 'transform' : undefined,
        }}
      >
        {children}
      </div>
    </div>
  )
}
