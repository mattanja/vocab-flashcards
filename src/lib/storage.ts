import type { Locale, StudyDirection, StudyProgress, VocabSet } from '../types'

const PREFIX = 'vocab-flashcards:'

function key(suffix: string): string {
  return `${PREFIX}${suffix}`
}

function readJson<T>(storageKey: string): T | null {
  try {
    const raw = localStorage.getItem(storageKey)
    if (!raw) return null
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

function writeJson(storageKey: string, value: unknown): void {
  localStorage.setItem(storageKey, JSON.stringify(value))
}

export function getLocale(defaultLocale: Locale = 'de'): Locale {
  const value = localStorage.getItem(key('locale'))
  return value === 'en' || value === 'de' ? value : defaultLocale
}

export function setLocale(locale: Locale): void {
  localStorage.setItem(key('locale'), locale)
}

export function getDirection(defaultDirection: StudyDirection = 'de-fr'): StudyDirection {
  const value = localStorage.getItem(key('direction'))
  return value === 'fr-de' || value === 'de-fr' ? value : defaultDirection
}

export function setDirection(direction: StudyDirection): void {
  localStorage.setItem(key('direction'), direction)
}

export function getActiveSetId(): string | null {
  return localStorage.getItem(key('activeSetId'))
}

export function setActiveSetId(setId: string): void {
  localStorage.setItem(key('activeSetId'), setId)
}

export function getProgress(setId: string): StudyProgress | null {
  return readJson<StudyProgress>(key(`progress:${setId}`))
}

export function setProgress(setId: string, progress: StudyProgress): void {
  writeJson(key(`progress:${setId}`), progress)
}

export function clearProgress(setId: string): void {
  localStorage.removeItem(key(`progress:${setId}`))
}

export function hasResumeableProgress(progress: StudyProgress | null): boolean {
  if (!progress) return false
  return (
    progress.queueIds.length > 0 ||
    progress.unknownIds.length > 0 ||
    progress.knownIds.length > 0
  )
}

export function getCustomSets(): VocabSet[] {
  const sets = readJson<VocabSet[]>(key('customSets'))
  return Array.isArray(sets) ? sets : []
}

export function saveCustomSet(set: VocabSet): void {
  const sets = getCustomSets().filter((item) => item.id !== set.id)
  sets.unshift(set)
  writeJson(key('customSets'), sets)
}

export function deleteCustomSet(setId: string): void {
  writeJson(
    key('customSets'),
    getCustomSets().filter((item) => item.id !== setId),
  )
  clearProgress(setId)
  if (getActiveSetId() === setId) {
    localStorage.removeItem(key('activeSetId'))
  }
}
