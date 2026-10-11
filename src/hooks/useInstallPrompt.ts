import { useCallback, useEffect, useState } from 'react'

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

function isStandaloneDisplay(): boolean {
  if (typeof window === 'undefined') return false
  const media = window.matchMedia?.('(display-mode: standalone)')?.matches ?? false
  const iosStandalone =
    'standalone' in navigator &&
    Boolean((navigator as Navigator & { standalone?: boolean }).standalone)
  return media || iosStandalone
}

export function useInstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)
  const [installed, setInstalled] = useState(() => isStandaloneDisplay())

  useEffect(() => {
    const onBeforeInstall = (event: Event) => {
      event.preventDefault()
      setDeferred(event as BeforeInstallPromptEvent)
    }
    const onInstalled = () => {
      setDeferred(null)
      setInstalled(true)
    }

    window.addEventListener('beforeinstallprompt', onBeforeInstall)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  const canInstall = Boolean(deferred) && !installed
  const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent)
  const showIosHint = isIos && !installed

  const install = useCallback(async () => {
    if (!deferred) return false
    await deferred.prompt()
    const choice = await deferred.userChoice
    setDeferred(null)
    return choice.outcome === 'accepted'
  }, [deferred])

  return {
    canInstall,
    showIosHint,
    installed,
    install,
  }
}
