import { useI18n } from '../i18n'

type Props = {
  knownCount: number
  onRestartAll: () => void
  onBrowseKnown: () => void
  onHome: () => void
}

export function DoneScreen({ knownCount, onRestartAll, onBrowseKnown, onHome }: Props) {
  const { t } = useI18n()

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--known)]">
        {t('known')}: {knownCount}
      </p>
      <h1 className="mt-4 text-3xl font-semibold">{t('doneTitle')}</h1>
      <p className="mt-3 max-w-sm text-[var(--muted)]">{t('doneBody')}</p>
      <div className="mt-8 flex w-full max-w-sm flex-col gap-3">
        <button
          type="button"
          onClick={onRestartAll}
          className="rounded-2xl bg-[var(--ink)] px-4 py-3.5 font-semibold text-white"
        >
          {t('restartAll')}
        </button>
        <button
          type="button"
          onClick={onBrowseKnown}
          className="rounded-2xl border border-black/10 bg-white px-4 py-3.5 font-semibold"
        >
          {t('browseKnown')}
        </button>
        <button
          type="button"
          onClick={onHome}
          className="text-sm text-[var(--muted)] underline-offset-2 hover:underline"
        >
          {t('backHome')}
        </button>
      </div>
    </div>
  )
}
