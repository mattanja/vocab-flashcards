import type { VocabCard, VocabSet } from '../types'

export type ParseSetResult =
  | { ok: true; set: VocabSet }
  | { ok: false; error: string }

function asTrimmedString(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48)
}

export function createSetId(title: string): string {
  const slug = slugify(title) || 'vocab-set'
  return `${slug}-${Date.now().toString(36)}`
}

export function createCardId(source: string, target: string): string {
  const base = slugify(`${source}-${target}`) || 'card'
  return `${base}-${Math.random().toString(36).slice(2, 8)}`
}

export function createEmptySet(title = ''): VocabSet {
  return {
    id: createSetId(title || 'new-set'),
    title,
    description: '',
    sourceLanguage: 'fr',
    targetLanguage: 'de',
    cards: [],
  }
}

export function normalizeCard(raw: unknown, index: number): VocabCard | null {
  if (!raw || typeof raw !== 'object') return null
  const card = raw as Record<string, unknown>
  const source = asTrimmedString(card.source)
  const target = asTrimmedString(card.target)
  if (!source || !target) return null

  const id = asTrimmedString(card.id) ?? `card-${index + 1}`
  return {
    id,
    source,
    target,
    phonetic: asTrimmedString(card.phonetic),
    explanation: asTrimmedString(card.explanation),
    forms: asTrimmedString(card.forms),
  }
}

export function parseVocabSet(raw: unknown): ParseSetResult {
  if (!raw || typeof raw !== 'object') {
    return { ok: false, error: 'invalidJson' }
  }

  const data = raw as Record<string, unknown>
  const title = asTrimmedString(data.title)
  if (!title) {
    return { ok: false, error: 'missingTitle' }
  }

  if (!Array.isArray(data.cards)) {
    return { ok: false, error: 'missingCards' }
  }

  const cards: VocabCard[] = []
  for (let i = 0; i < data.cards.length; i += 1) {
    const card = normalizeCard(data.cards[i], i)
    if (!card) {
      return { ok: false, error: 'invalidCard' }
    }
    cards.push(card)
  }

  if (cards.length === 0) {
    return { ok: false, error: 'emptyCards' }
  }

  const ids = new Set<string>()
  for (const card of cards) {
    if (ids.has(card.id)) {
      return { ok: false, error: 'duplicateCardId' }
    }
    ids.add(card.id)
  }

  return {
    ok: true,
    set: {
      id: asTrimmedString(data.id) ?? createSetId(title),
      title,
      description: asTrimmedString(data.description),
      sourceLanguage: asTrimmedString(data.sourceLanguage) ?? 'fr',
      targetLanguage: asTrimmedString(data.targetLanguage) ?? 'de',
      cards,
    },
  }
}

export async function parseVocabSetFile(file: File): Promise<ParseSetResult> {
  try {
    const text = await file.text()
    return parseVocabSet(JSON.parse(text) as unknown)
  } catch {
    return { ok: false, error: 'invalidJson' }
  }
}

export function downloadVocabSet(set: VocabSet): void {
  const blob = new Blob([`${JSON.stringify(set, null, 2)}\n`], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `${slugify(set.id) || 'vocab-set'}.json`
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}
