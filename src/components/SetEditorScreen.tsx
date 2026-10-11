import { useState, type FormEvent } from 'react'
import { useI18n } from '../i18n'
import { createCardId, createSetId, downloadVocabSet } from '../lib/vocabSet'
import type { SetEditorMode, VocabCard, VocabSet } from '../types'

type Props = {
  mode: SetEditorMode
  initialSet?: VocabSet | null
  onSave: (set: VocabSet) => void
  onCancel: () => void
}

type CardDraft = {
  source: string
  target: string
  phonetic: string
  forms: string
  explanation: string
}

const emptyDraft = (): CardDraft => ({
  source: '',
  target: '',
  phonetic: '',
  forms: '',
  explanation: '',
})

export function SetEditorScreen({ mode, initialSet, onSave, onCancel }: Props) {
  const { t } = useI18n()
  const [title, setTitle] = useState(initialSet?.title ?? '')
  const [description, setDescription] = useState(initialSet?.description ?? '')
  const [cards, setCards] = useState<VocabCard[]>(initialSet?.cards ?? [])
  const [draft, setDraft] = useState<CardDraft>(emptyDraft)
  const [error, setError] = useState<string | null>(null)
  const [setId] = useState(() => initialSet?.id ?? createSetId('new-set'))

  const addCard = (event: FormEvent) => {
    event.preventDefault()
    const source = draft.source.trim()
    const target = draft.target.trim()
    if (!source || !target) {
      setError(t('cardRequiredFields'))
      return
    }

    const card: VocabCard = {
      id: createCardId(source, target),
      source,
      target,
      phonetic: draft.phonetic.trim() || undefined,
      forms: draft.forms.trim() || undefined,
      explanation: draft.explanation.trim() || undefined,
    }

    setCards((current) => [...current, card])
    setDraft(emptyDraft())
    setError(null)
  }

  const removeCard = (cardId: string) => {
    setCards((current) => current.filter((card) => card.id !== cardId))
  }

  const save = () => {
    if (!title.trim()) {
      setError(t('setTitleRequired'))
      return
    }
    if (cards.length === 0) {
      setError(t('setNeedsCards'))
      return
    }

    const set: VocabSet = {
      id: setId,
      title: title.trim(),
      description: description.trim() || undefined,
      sourceLanguage: initialSet?.sourceLanguage ?? 'fr',
      targetLanguage: initialSet?.targetLanguage ?? 'de',
      cards,
    }
    onSave(set)
  }

  const exportDraft = () => {
    if (!title.trim() || cards.length === 0) {
      setError(t('setNeedsCards'))
      return
    }
    downloadVocabSet({
      id: setId,
      title: title.trim(),
      description: description.trim() || undefined,
      sourceLanguage: initialSet?.sourceLanguage ?? 'fr',
      targetLanguage: initialSet?.targetLanguage ?? 'de',
      cards,
    })
  }

  return (
    <div className="flex min-h-dvh flex-col px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))]">
      <header className="mb-4 flex items-center justify-between gap-3">
        <button type="button" onClick={onCancel} className="text-sm text-[var(--muted)]">
          ← {t('backHome')}
        </button>
        <h1 className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">
          {mode === 'create' ? t('createSet') : t('editSet')}
        </h1>
        <span className="text-sm text-[var(--muted)]">
          {cards.length} {t('cards')}
        </span>
      </header>

      <section className="rounded-3xl border border-black/5 bg-[var(--card)] p-4 shadow-sm">
        <label className="block text-sm font-semibold">
          {t('setTitle')}
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="mt-1 w-full rounded-2xl border border-black/10 bg-white px-3 py-2.5 font-normal"
            placeholder={t('setTitlePlaceholder')}
          />
        </label>
        <label className="mt-3 block text-sm font-semibold">
          {t('setDescription')}
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={2}
            className="mt-1 w-full rounded-2xl border border-black/10 bg-white px-3 py-2.5 font-normal"
            placeholder={t('setDescriptionPlaceholder')}
          />
        </label>
      </section>

      <form
        onSubmit={addCard}
        className="mt-4 rounded-3xl border border-black/5 bg-[var(--card)] p-4 shadow-sm"
      >
        <h2 className="text-base font-semibold">{t('addCard')}</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">{t('addCardHint')}</p>

        <label className="mt-3 block text-sm font-semibold">
          {t('fieldSource')}
          <input
            value={draft.source}
            onChange={(event) => setDraft((current) => ({ ...current, source: event.target.value }))}
            className="mt-1 w-full rounded-2xl border border-black/10 bg-white px-3 py-2.5 font-normal"
            placeholder="une ville"
            required
          />
        </label>
        <label className="mt-3 block text-sm font-semibold">
          {t('fieldTarget')}
          <input
            value={draft.target}
            onChange={(event) => setDraft((current) => ({ ...current, target: event.target.value }))}
            className="mt-1 w-full rounded-2xl border border-black/10 bg-white px-3 py-2.5 font-normal"
            placeholder="eine Stadt"
            required
          />
        </label>
        <label className="mt-3 block text-sm font-semibold">
          {t('phonetic')}
          <input
            value={draft.phonetic}
            onChange={(event) =>
              setDraft((current) => ({ ...current, phonetic: event.target.value }))
            }
            className="mt-1 w-full rounded-2xl border border-black/10 bg-white px-3 py-2.5 font-normal"
            placeholder="ynvil"
          />
        </label>
        <label className="mt-3 block text-sm font-semibold">
          {t('forms')}
          <input
            value={draft.forms}
            onChange={(event) => setDraft((current) => ({ ...current, forms: event.target.value }))}
            className="mt-1 w-full rounded-2xl border border-black/10 bg-white px-3 py-2.5 font-normal"
          />
        </label>
        <label className="mt-3 block text-sm font-semibold">
          {t('explanation')}
          <textarea
            value={draft.explanation}
            onChange={(event) =>
              setDraft((current) => ({ ...current, explanation: event.target.value }))
            }
            rows={2}
            className="mt-1 w-full rounded-2xl border border-black/10 bg-white px-3 py-2.5 font-normal"
          />
        </label>

        <button
          type="submit"
          className="mt-4 w-full rounded-2xl bg-[var(--accent)] px-4 py-3 font-semibold text-white"
        >
          {t('addCardAction')}
        </button>
      </form>

      {cards.length > 0 && (
        <section className="mt-4 rounded-3xl border border-black/5 bg-white/70 p-4">
          <h2 className="text-base font-semibold">{t('cardList')}</h2>
          <ul className="mt-3 space-y-2">
            {cards.map((card) => (
              <li
                key={card.id}
                className="flex items-start justify-between gap-3 rounded-2xl border border-black/5 bg-[var(--card)] px-3 py-2"
              >
                <div>
                  <p className="font-semibold">{card.source}</p>
                  <p className="text-sm text-[var(--muted)]">{card.target}</p>
                </div>
                <button
                  type="button"
                  onClick={() => removeCard(card.id)}
                  className="text-sm text-[var(--unknown)]"
                >
                  {t('removeCard')}
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {error && <p className="mt-4 text-sm text-[var(--unknown)]">{error}</p>}

      <div className="mt-auto flex flex-col gap-3 pt-6">
        <button
          type="button"
          onClick={save}
          className="rounded-2xl bg-[var(--ink)] px-4 py-3.5 font-semibold text-white"
        >
          {t('saveSet')}
        </button>
        <button
          type="button"
          onClick={exportDraft}
          className="rounded-2xl border border-black/10 bg-white px-4 py-3.5 font-semibold"
        >
          {t('exportSet')}
        </button>
      </div>
    </div>
  )
}
