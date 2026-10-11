import { useState } from 'react'
import { useI18n } from '../i18n'
import type { StudyDirection, VocabCard } from '../types'
import { FlashCard } from './FlashCard'

type Props = {
  cards: VocabCard[]
  direction: StudyDirection
  onBack: () => void
}

export function KnownBrowseScreen({ cards, direction, onBack }: Props) {
  const { t } = useI18n()
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)

  if (cards.length === 0) {
    return (
      <div className="flex min-h-dvh flex-col px-4 pt-[max(1rem,env(safe-area-inset-top))]">
        <button type="button" onClick={onBack} className="mb-6 text-sm text-[var(--muted)]">
          ← {t('backStudy')}
        </button>
        <h1 className="text-2xl font-semibold">{t('knownBrowseTitle')}</h1>
        <p className="mt-4 text-[var(--muted)]">{t('knownEmpty')}</p>
      </div>
    )
  }

  const safeIndex = Math.min(index, cards.length - 1)
  const card = cards[safeIndex]

  return (
    <div className="flex min-h-dvh flex-col px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))]">
      <header className="mb-4 flex items-center justify-between gap-3">
        <button type="button" onClick={onBack} className="text-sm text-[var(--muted)]">
          ← {t('backStudy')}
        </button>
        <h1 className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--known)]">
          {t('knownBrowseTitle')}
        </h1>
        <span className="text-sm text-[var(--muted)]">
          {t('of', { current: safeIndex + 1, total: cards.length })}
        </span>
      </header>

      <FlashCard
        card={card}
        direction={direction}
        flipped={flipped}
        onFlip={() => setFlipped((value) => !value)}
      />

      <div className="mt-auto grid grid-cols-2 gap-3 pt-6">
        <button
          type="button"
          disabled={safeIndex === 0}
          onClick={() => {
            setIndex((value) => Math.max(0, value - 1))
            setFlipped(false)
          }}
          className="rounded-2xl border border-black/10 bg-white px-4 py-3.5 font-semibold disabled:opacity-40"
        >
          {t('prev')}
        </button>
        <button
          type="button"
          disabled={safeIndex >= cards.length - 1}
          onClick={() => {
            setIndex((value) => Math.min(cards.length - 1, value + 1))
            setFlipped(false)
          }}
          className="rounded-2xl bg-[var(--ink)] px-4 py-3.5 font-semibold text-white disabled:opacity-40"
        >
          {t('next')}
        </button>
      </div>
    </div>
  )
}
