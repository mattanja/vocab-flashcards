import { useEffect, useState } from 'react'
import { useI18n } from '../i18n'
import type { SessionState } from '../lib/session'
import type { StudyDirection, VocabCard } from '../types'
import { FlashCard } from './FlashCard'
import { SwipeDeck } from './SwipeDeck'

type Props = {
  card: VocabCard | undefined
  session: SessionState
  direction: StudyDirection
  total: number
  onGrade: (grade: 'known' | 'unknown') => void
  onDismissRoundBanner: () => void
  onRestartAll: () => void
  onBrowseKnown: () => void
  onDirectionChange: (direction: StudyDirection) => void
  onHome: () => void
}

export function StudyScreen({
  card,
  session,
  direction,
  total,
  onGrade,
  onDismissRoundBanner,
  onRestartAll,
  onBrowseKnown,
  onDirectionChange,
  onHome,
}: Props) {
  const { t, locale, setLocale } = useI18n()
  const [flipped, setFlipped] = useState(false)

  useEffect(() => {
    setFlipped(false)
  }, [card?.id])

  if (session.showRoundBanner) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
          {t('sessionLabel', { session: session.session })}
        </p>
        <h2 className="mt-4 text-2xl font-semibold">{t('roundBanner')}</h2>
        <button
          type="button"
          onClick={onDismissRoundBanner}
          className="mt-8 rounded-2xl bg-[var(--ink)] px-6 py-3.5 font-semibold text-white"
        >
          {t('roundBannerContinue')}
        </button>
      </div>
    )
  }

  if (!card) {
    return null
  }

  return (
    <div className="flex min-h-dvh flex-col overflow-x-hidden px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))]">
      <header className="mb-4 flex items-start justify-between gap-3">
        <button type="button" onClick={onHome} className="text-sm text-[var(--muted)]">
          ← {t('backHome')}
        </button>
        <div className="flex gap-2">
          <select
            value={locale}
            onChange={(event) => setLocale(event.target.value as 'de' | 'en')}
            className="rounded-full border border-black/10 bg-white/80 px-2 py-1 text-xs"
            aria-label={t('language')}
          >
            <option value="de">DE</option>
            <option value="en">EN</option>
          </select>
          <select
            value={direction}
            onChange={(event) => onDirectionChange(event.target.value as StudyDirection)}
            className="rounded-full border border-black/10 bg-white/80 px-2 py-1 text-xs"
            aria-label={t('direction')}
          >
            <option value="de-fr">{t('directionDeFr')}</option>
            <option value="fr-de">{t('directionFrDe')}</option>
          </select>
        </div>
      </header>

      <div className="mb-4 flex flex-wrap gap-2 text-xs font-semibold">
        <span className="rounded-full bg-white/80 px-3 py-1.5 text-[var(--ink)]">
          {t('queue')}: {session.queueIds.length}
        </span>
        <button
          type="button"
          onClick={onBrowseKnown}
          className="rounded-full bg-[var(--known)]/15 px-3 py-1.5 text-[var(--known)]"
        >
          {t('known')}: {session.knownIds.length}
        </button>
        <span className="rounded-full bg-[var(--unknown)]/15 px-3 py-1.5 text-[var(--unknown)]">
          {t('unknown')}: {session.unknownIds.length}
        </span>
        <span className="rounded-full bg-white/80 px-3 py-1.5 text-[var(--muted)]">
          {t('progressSummary', { known: session.knownIds.length, total })}
        </span>
      </div>

      <SwipeDeck
        enabled={flipped}
        onKnown={() => onGrade('known')}
        onUnknown={() => onGrade('unknown')}
      >
        <FlashCard
          card={card}
          direction={direction}
          flipped={flipped}
          onFlip={() => setFlipped((value) => !value)}
        />
      </SwipeDeck>

      <p className="mt-3 text-center text-xs text-[var(--muted)]">{t('swipeHint')}</p>

      <div className="mt-auto grid grid-cols-2 gap-3 pt-6">
        <button
          type="button"
          disabled={!flipped}
          onClick={() => onGrade('unknown')}
          className="rounded-2xl bg-[var(--unknown)] px-3 py-4 font-semibold text-white disabled:opacity-40"
        >
          {t('gradeUnknown')}
        </button>
        <button
          type="button"
          disabled={!flipped}
          onClick={() => onGrade('known')}
          className="rounded-2xl bg-[var(--known)] px-3 py-4 font-semibold text-white disabled:opacity-40"
        >
          {t('gradeKnown')}
        </button>
      </div>

      <button
        type="button"
        onClick={onRestartAll}
        className="mt-4 pb-2 text-center text-sm text-[var(--muted)] underline-offset-2 hover:underline"
      >
        {t('restartAll')}
      </button>
    </div>
  )
}
