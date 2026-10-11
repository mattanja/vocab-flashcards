import { useState } from 'react'
import { useInstallPrompt } from '../hooks/useInstallPrompt'
import { useI18n } from '../i18n'

export function InstallPrompt() {
  const { t } = useI18n()
  const { canInstall, showIosHint, install } = useInstallPrompt()
  const [dismissed, setDismissed] = useState(false)

  if (dismissed || (!canInstall && !showIosHint)) {
    return null
  }

  return (
    <section className="mb-6 rounded-3xl border border-[var(--accent)]/20 bg-white/80 p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-[var(--ink)]">{t('installTitle')}</h2>
          <p className="mt-1 text-sm leading-relaxed text-[var(--muted)]">
            {showIosHint && !canInstall ? t('installIosHint') : t('installBody')}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="text-sm text-[var(--muted)]"
          aria-label={t('installDismiss')}
        >
          ✕
        </button>
      </div>
      {canInstall && (
        <button
          type="button"
          onClick={() => void install()}
          className="mt-3 w-full rounded-2xl bg-[var(--accent)] px-4 py-3 font-semibold text-white"
        >
          {t('installAction')}
        </button>
      )}
    </section>
  )
}
