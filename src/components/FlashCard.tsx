import type { StudyDirection, VocabCard } from '../types'
import { useI18n } from '../i18n'

type Props = {
  card: VocabCard
  direction: StudyDirection
  flipped: boolean
  onFlip: () => void
  interactive?: boolean
}

export function FlashCard({
  card,
  direction,
  flipped,
  onFlip,
  interactive = true,
}: Props) {
  const { t } = useI18n()
  const prompt = direction === 'de-fr' ? card.target : card.source
  const answer = direction === 'de-fr' ? card.source : card.target

  return (
    <button
      type="button"
      onClick={interactive ? onFlip : undefined}
      disabled={!interactive}
      aria-label={flipped ? answer : prompt}
      className="relative block h-80 w-full touch-none select-none rounded-3xl text-left perspective-[1200px] disabled:cursor-default"
    >
      <div
        className={`relative h-full w-full transition-transform duration-300 [transform-style:preserve-3d] ${
          flipped ? '[transform:rotateY(180deg)]' : ''
        }`}
      >
        <div className="absolute inset-0 flex flex-col items-center justify-center rounded-3xl border border-black/5 bg-[var(--card)] px-6 py-8 shadow-lg [backface-visibility:hidden]">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
            {direction === 'de-fr' ? 'Deutsch' : 'Français'}
          </p>
          <p className="text-center text-3xl font-semibold leading-snug text-[var(--ink)]">
            {prompt}
          </p>
          {!flipped && (
            <p className="mt-8 text-sm text-[var(--muted)]">{t('flipHint')}</p>
          )}
        </div>

        <div className="absolute inset-0 flex flex-col justify-center overflow-hidden rounded-3xl border border-black/5 bg-[var(--card)] px-5 py-5 shadow-lg [transform:rotateY(180deg)] [backface-visibility:hidden]">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
            {direction === 'de-fr' ? 'Français' : 'Deutsch'}
          </p>
          <p className="text-2xl font-semibold leading-snug text-[var(--ink)] sm:text-3xl">{answer}</p>

          {card.phonetic && (
            <p className="mt-2 font-mono text-base text-[var(--accent)]">[{card.phonetic}]</p>
          )}

          {card.forms && (
            <div className="mt-3 rounded-2xl bg-[var(--bg-accent)] px-3 py-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                {t('forms')}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-[var(--ink)]">{card.forms}</p>
            </div>
          )}

          {card.explanation && (
            <div className="mt-2 rounded-2xl border border-black/5 bg-white/70 px-3 py-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                {t('explanation')}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-[var(--ink)]">{card.explanation}</p>
            </div>
          )}
        </div>
      </div>
    </button>
  )
}
