import { useRef } from 'react'
import { useI18n } from '../i18n'
import * as storage from '../lib/storage'
import { downloadVocabSet } from '../lib/vocabSet'
import type { VocabSet } from '../types'
import { InstallPrompt } from './InstallPrompt'

type Props = {
  builtinSet: VocabSet | null
  customSets: VocabSet[]
  activeSet: VocabSet | null
  loading: boolean
  error: string | null
  onSelectSet: (set: VocabSet) => void
  onStart: (resume: boolean) => void
  onBrowseKnown: () => void
  onRestartAll: () => void
  onCreateSet: () => void
  onEditSet: () => void
  onDeleteSet: () => void
  onImportSet: (file: File) => void
}

function SetCard({
  set,
  active,
  builtin,
  onSelect,
}: {
  set: VocabSet
  active: boolean
  builtin?: boolean
  onSelect: () => void
}) {
  const { t } = useI18n()
  const progress = storage.getProgress(set.id)
  const known = progress?.knownIds.length ?? 0

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full rounded-2xl border px-4 py-3 text-left ${
        active
          ? 'border-[var(--accent)] bg-[var(--accent)]/10'
          : 'border-black/10 bg-white/80'
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="font-semibold">{set.title}</p>
        {builtin && (
          <span className="text-[10px] font-semibold uppercase tracking-wide text-[var(--accent)]">
            {t('exampleSetLabel')}
          </span>
        )}
      </div>
      <p className="mt-1 text-sm text-[var(--muted)]">
        {set.cards.length} {t('cards')}
        {progress ? ` · ${t('progressSummary', { known, total: set.cards.length })}` : ''}
      </p>
    </button>
  )
}

export function HomeScreen({
  builtinSet,
  customSets,
  activeSet,
  loading,
  error,
  onSelectSet,
  onStart,
  onBrowseKnown,
  onRestartAll,
  onCreateSet,
  onEditSet,
  onDeleteSet,
  onImportSet,
}: Props) {
  const { t, locale, setLocale } = useI18n()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const progress = activeSet ? storage.getProgress(activeSet.id) : null
  const knownCount = progress?.knownIds.length ?? 0
  const total = activeSet?.cards.length ?? 0
  const canResume = Boolean(
    progress &&
      (progress.queueIds.length > 0 ||
        progress.unknownIds.length > 0 ||
        (progress.knownIds.length > 0 && progress.knownIds.length < total)),
  )
  const allDone = Boolean(progress && progress.knownIds.length === total && total > 0)
  const canBrowseKnown = knownCount > 0
  const isCustomActive = Boolean(activeSet && customSets.some((set) => set.id === activeSet.id))

  return (
    <div className="flex min-h-dvh flex-col px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1.25rem,env(safe-area-inset-top))]">
      <header className="mb-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <a
            href="https://www.kern.services/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)] hover:text-[var(--accent)]"
          >
            kern.services
          </a>
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

      <InstallPrompt />

      <section className="rounded-3xl border border-black/5 bg-[var(--card)] p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
            {t('yourSets')}
          </h2>
        </div>

        {loading && <p className="mt-4 text-[var(--muted)]">{t('loading')}</p>}
        {error && <p className="mt-4 text-[var(--unknown)]">{error}</p>}

        <div className="mt-4 space-y-2">
          {builtinSet && (
            <SetCard
              set={builtinSet}
              active={activeSet?.id === builtinSet.id}
              builtin
              onSelect={() => onSelectSet(builtinSet)}
            />
          )}
          {customSets.map((set) => (
            <SetCard
              key={set.id}
              set={set}
              active={activeSet?.id === set.id}
              onSelect={() => onSelectSet(set)}
            />
          ))}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onCreateSet}
            className="rounded-2xl border border-black/10 bg-white px-3 py-3 text-sm font-semibold"
          >
            {t('createSet')}
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="rounded-2xl border border-black/10 bg-white px-3 py-3 text-sm font-semibold"
          >
            {t('importSet')}
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0]
            if (file) onImportSet(file)
            event.target.value = ''
          }}
        />
      </section>

      {activeSet && (
        <section className="mt-4 rounded-3xl border border-black/5 bg-[var(--card)] p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
            {t('activeSet')}
          </p>
          <h2 className="mt-2 text-2xl font-semibold">{activeSet.title}</h2>
          {activeSet.description && (
            <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
              {activeSet.description}
            </p>
          )}
          <p className="mt-4 text-sm text-[var(--ink)]">
            {total} {t('cards')}
            {progress ? ` · ${t('progressSummary', { known: knownCount, total })}` : ''}
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
            <button
              type="button"
              onClick={() => downloadVocabSet(activeSet)}
              className="rounded-2xl border border-black/10 bg-white px-4 py-3.5 font-semibold text-[var(--ink)]"
            >
              {t('exportSet')}
            </button>
            {isCustomActive && (
              <>
                <button
                  type="button"
                  onClick={onEditSet}
                  className="rounded-2xl border border-black/10 bg-white px-4 py-3.5 font-semibold text-[var(--ink)]"
                >
                  {t('editSet')}
                </button>
                <button
                  type="button"
                  onClick={onDeleteSet}
                  className="text-sm text-[var(--unknown)] underline-offset-2 hover:underline"
                >
                  {t('deleteSet')}
                </button>
              </>
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
        </section>
      )}
    </div>
  )
}
