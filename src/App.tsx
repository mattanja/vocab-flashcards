import { useCallback, useEffect, useState } from 'react'
import { DoneScreen } from './components/DoneScreen'
import { HomeScreen } from './components/HomeScreen'
import { KnownBrowseScreen } from './components/KnownBrowseScreen'
import { StudyScreen } from './components/StudyScreen'
import { useStudySession } from './hooks/useStudySession'
import { useI18n } from './i18n'
import type { Screen, VocabSet } from './types'

const SET_URL = '/sets/bonjour-de-nice-unite-6.json'

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
  const [vocabSet, setVocabSet] = useState<VocabSet | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [knownReturnScreen, setKnownReturnScreen] = useState<Screen>('study')

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const response = await fetch(SET_URL)
        if (!response.ok) throw new Error('bad status')
        const data = (await response.json()) as VocabSet
        if (!cancelled) {
          setVocabSet(data)
          setLoading(false)
        }
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

  const handleStart = useCallback(
    (resume: boolean) => {
      if (!vocabSet) return
      start(vocabSet, resume)
      setScreen('study')
    },
    [start, vocabSet],
  )

  const handleRestartAll = useCallback(() => {
    if (!vocabSet) return
    if (!set) {
      start(vocabSet, false)
    } else {
      restartAll()
    }
    setScreen('study')
  }, [restartAll, set, start, vocabSet])

  const openKnownBrowse = useCallback(
    (from: Screen) => {
      if (!set && vocabSet) {
        start(vocabSet, true)
      }
      setKnownReturnScreen(from)
      setScreen('known')
    },
    [set, start, vocabSet],
  )

  return (
    <div className="mx-auto min-h-dvh w-full max-w-md">
      {screen === 'home' && (
        <HomeScreen
          vocabSet={vocabSet}
          loading={loading}
          error={error}
          onStart={handleStart}
          onBrowseKnown={() => openKnownBrowse('home')}
          onRestartAll={handleRestartAll}
        />
      )}

      {screen === 'study' && (
        <StudyScreen
          card={currentCard}
          session={session}
          direction={direction}
          total={set?.cards.length ?? vocabSet?.cards.length ?? 0}
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
