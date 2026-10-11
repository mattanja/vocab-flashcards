import { useI18n } from '../i18n'
import * as storage from '../lib/storage'
import type { VocabSet } from '../types'

type Props = {
  vocabSet: VocabSet | null
  loading: boolean
  error: string | null
  onStart: (resume: boolean) => void
  onBrowseKnown: () => void
  onRestartAll: () => void
}

export function HomeScreen({
  vocabSet,
  loading,
  error,
  onStart,
  onBrowseKnown,
  onRestartAll,
}: Props) {
  const { t, locale, setLocale } = useI18n()
  const progress = vocabSet ? storage.getProgress(vocabSet.id) : null
  const knownCount = progress?.knownIds.length ?? 0
  const total = vocabSet?.cards.length ?? 0
  const canResume = Boolean(
    progress &&
      (progress.queueIds.length > 0 ||
        progress.unknownIds.length > 0 ||
        (progress.knownIds.length > 0 && progress.knownIds.length < total)),
  )
  const allDone = Boolean(progress && progress.knownIds.length === total && total > 0)
  const canBrowseKnown = knownCount > 0

  return (
    <div className="flex min-h-dvh flex-col px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1.25rem,env(safe-area-inset-top))]">
      <header className="mb-8">
        <div className="mb-4 flex items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
            kern.services
          </p>
          <label className="flex items-center gap-2 text-sm text-[var(--muted)]">
            <span className="sr-only">{t('language')}</span>
            <select
              value={locale}
              onChange={(event) => setLocale(event.target.value as 'de' | 'en')}
              className="rounded-full border border-black/10 bg-white/80 px-3 py-1.5 text-sm text-[var(--ink)]"
            >
              <option value="de">DE</option>
              <option value="en">EN</option>
            </select>
          </label>
        </div>
        <h1 className="text-3xl font-semibold tracking-tight">{t('appTitle')}</h1>
        <p className="mt-2 text-[var(--muted)]">{t('appSubtitle')}</p>
      </header>

      <section className="rounded-3xl border border-black/5 bg-[var(--card)] p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
          {t('exampleSetLabel')}
        </p>
        {loading && <p className="mt-4 text-[var(--muted)]">{t('loading')}</p>}
        {error && <p className="mt-4 text-[var(--unknown)]">{error}</p>}
        {vocabSet && (
          <>
            <h2 className="mt-2 text-2xl font-semibold">{vocabSet.title}</h2>
            {vocabSet.description && (
              <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
                {vocabSet.description}
              </p>
            )}
            <p className="mt-4 text-sm text-[var(--ink)]">
              {total} {t('cards')}
              {progress
                ? ` · ${t('progressSummary', { known: knownCount, total })}`
                : ''}
            </p>

            <div className="mt-6 flex flex-col gap-3">
              {canResume && !allDone ? (
                <button
                  type="button"
                  onClick={() => onStart(true)}
                  className="rounded-2xl bg-[var(--accent)] px-4 py-3.5 text-center font-semibold text-white"
                >
                  {t('resume')}
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => onStart(false)}
                className="rounded-2xl bg-[var(--ink)] px-4 py-3.5 text-center font-semibold text-white"
              >
                {allDone || canResume ? t('restartAll') : t('start')}
              </button>
              {canBrowseKnown && (
                <button
                  type="button"
                  onClick={onBrowseKnown}
                  className="rounded-2xl border border-black/10 bg-white px-4 py-3.5 font-semibold text-[var(--ink)]"
                >
                  {t('browseKnown')} ({knownCount})
                </button>
              )}
              {canResume && (
                <button
                  type="button"
                  onClick={onRestartAll}
                  className="text-sm text-[var(--muted)] underline-offset-2 hover:underline"
                >
                  {t('restartAll')}
                </button>
              )}
            </div>
          </>
        )}
      </section>
    </div>
  )
}
