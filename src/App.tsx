import { useCallback, useEffect, useState } from 'react'
import { DoneScreen } from './components/DoneScreen'
import { HomeScreen } from './components/HomeScreen'
import { KnownBrowseScreen } from './components/KnownBrowseScreen'
import { SetEditorScreen } from './components/SetEditorScreen'
import { StudyScreen } from './components/StudyScreen'
import { useStudySession } from './hooks/useStudySession'
import { useI18n } from './i18n'
import * as storage from './lib/storage'
import { parseVocabSetFile } from './lib/vocabSet'
import type { Screen, SetEditorMode, VocabSet } from './types'

const SET_URL = '/sets/bonjour-de-nice-unite-6.json'

const IMPORT_ERROR_KEYS = {
  invalidJson: 'importErrorInvalidJson',
  missingTitle: 'importErrorMissingTitle',
  missingCards: 'importErrorMissingCards',
  invalidCard: 'importErrorInvalidCard',
  emptyCards: 'importErrorEmptyCards',
  duplicateCardId: 'importErrorDuplicateCardId',
} as const

export default function App() {
  const { t } = useI18n()
  const {
    set,
    session,
    direction,
    currentCard,
    knownCards,
    start,
    grade,
    dismissRoundBanner,
    restartAll,
    setDirection,
  } = useStudySession()

  const [screen, setScreen] = useState<Screen>('home')
  const [builtinSet, setBuiltinSet] = useState<VocabSet | null>(null)
  const [customSets, setCustomSets] = useState<VocabSet[]>(() => storage.getCustomSets())
  const [activeSet, setActiveSet] = useState<VocabSet | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [knownReturnScreen, setKnownReturnScreen] = useState<Screen>('study')
  const [editorMode, setEditorMode] = useState<SetEditorMode>('create')

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const response = await fetch(SET_URL)
        if (!response.ok) throw new Error('bad status')
        const data = (await response.json()) as VocabSet
        if (cancelled) return

        setBuiltinSet(data)
        const customs = storage.getCustomSets()
        setCustomSets(customs)
        const savedId = storage.getActiveSetId()
        const selected =
          customs.find((item) => item.id === savedId) ??
          (savedId === data.id ? data : null) ??
          data
        setActiveSet(selected)
        storage.setActiveSetId(selected.id)
        setLoading(false)
      } catch {
        if (!cancelled) {
          setError(t('loadError'))
          setLoading(false)
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [t])

  useEffect(() => {
    if (session.finished && screen === 'study') {
      setScreen('done')
    }
  }, [session.finished, screen])

  const selectSet = useCallback((next: VocabSet) => {
    setActiveSet(next)
    storage.setActiveSetId(next.id)
    setError(null)
  }, [])

  const handleStart = useCallback(
    (resume: boolean) => {
      if (!activeSet) return
      start(activeSet, resume)
      setScreen('study')
    },
    [activeSet, start],
  )

  const handleRestartAll = useCallback(() => {
    if (!activeSet) return
    if (!set || set.id !== activeSet.id) {
      start(activeSet, false)
    } else {
      restartAll()
    }
    setScreen('study')
  }, [activeSet, restartAll, set, start])

  const openKnownBrowse = useCallback(
    (from: Screen) => {
      if (!activeSet) return
      if (!set || set.id !== activeSet.id) {
        start(activeSet, true)
      }
      setKnownReturnScreen(from)
      setScreen('known')
    },
    [activeSet, set, start],
  )

  const handleSaveSet = useCallback(
    (next: VocabSet) => {
      if (editorMode === 'edit') {
        storage.clearProgress(next.id)
      }
      storage.saveCustomSet(next)
      setCustomSets(storage.getCustomSets())
      setActiveSet(next)
      storage.setActiveSetId(next.id)
      setScreen('home')
    },
    [editorMode],
  )

  const handleDeleteSet = useCallback(() => {
    if (!activeSet) return
    if (!customSets.some((item) => item.id === activeSet.id)) return
    if (!window.confirm(t('deleteSetConfirm'))) return

    storage.deleteCustomSet(activeSet.id)
    const customs = storage.getCustomSets()
    setCustomSets(customs)
    const fallback = builtinSet
    setActiveSet(fallback)
    if (fallback) storage.setActiveSetId(fallback.id)
  }, [activeSet, builtinSet, customSets, t])

  const handleImportSet = useCallback(
    async (file: File) => {
      const result = await parseVocabSetFile(file)
      if (!result.ok) {
        setError(t(IMPORT_ERROR_KEYS[result.error as keyof typeof IMPORT_ERROR_KEYS] ?? 'importErrorInvalidJson'))
        return
      }

      // Avoid colliding with the built-in example id.
      const imported =
        builtinSet && result.set.id === builtinSet.id
          ? { ...result.set, id: `${result.set.id}-import-${Date.now().toString(36)}` }
          : result.set

      storage.saveCustomSet(imported)
      setCustomSets(storage.getCustomSets())
      setActiveSet(imported)
      storage.setActiveSetId(imported.id)
      setError(null)
    },
    [builtinSet, t],
  )

  return (
    <div className="mx-auto min-h-dvh w-full max-w-md">
      {screen === 'home' && (
        <HomeScreen
          builtinSet={builtinSet}
          customSets={customSets}
          activeSet={activeSet}
          loading={loading}
          error={error}
          onSelectSet={selectSet}
          onStart={handleStart}
          onBrowseKnown={() => openKnownBrowse('home')}
          onRestartAll={handleRestartAll}
          onCreateSet={() => {
            setEditorMode('create')
            setScreen('editSet')
          }}
          onEditSet={() => {
            setEditorMode('edit')
            setScreen('editSet')
          }}
          onDeleteSet={handleDeleteSet}
          onImportSet={(file) => void handleImportSet(file)}
        />
      )}

      {screen === 'editSet' && (
        <SetEditorScreen
          mode={editorMode}
          initialSet={editorMode === 'edit' ? activeSet : null}
          onSave={handleSaveSet}
          onCancel={() => setScreen('home')}
        />
      )}

      {screen === 'study' && (
        <StudyScreen
          card={currentCard}
          session={session}
          direction={direction}
          total={set?.cards.length ?? activeSet?.cards.length ?? 0}
          onGrade={grade}
          onDismissRoundBanner={dismissRoundBanner}
          onRestartAll={handleRestartAll}
          onBrowseKnown={() => openKnownBrowse('study')}
          onDirectionChange={setDirection}
          onHome={() => setScreen('home')}
        />
      )}

      {screen === 'known' && (
        <KnownBrowseScreen
          cards={knownCards}
          direction={direction}
          onBack={() => setScreen(knownReturnScreen === 'home' ? 'home' : 'study')}
        />
      )}

      {screen === 'done' && (
        <DoneScreen
          knownCount={session.knownIds.length}
          onRestartAll={handleRestartAll}
          onBrowseKnown={() => openKnownBrowse('done')}
          onHome={() => setScreen('home')}
        />
      )}
    </div>
  )
}
