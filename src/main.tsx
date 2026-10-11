import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import App from './App.tsx'
import { I18nProvider } from './i18n'
import './index.css'

/** Check for a new service worker roughly once per hour while the app stays open. */
const SW_UPDATE_INTERVAL_MS = 60 * 60 * 1000

registerSW({
  immediate: true,
  onRegisteredSW(swUrl, registration) {
    if (!registration) return

    window.setInterval(async () => {
      if (registration.installing || !navigator.onLine) return

      try {
        const response = await fetch(swUrl, {
          cache: 'no-store',
          headers: { 'cache-control': 'no-cache' },
        })
        if (response?.status === 200) {
          await registration.update()
        }
      } catch {
        // Offline or unreachable — try again on the next interval.
      }
    }, SW_UPDATE_INTERVAL_MS)
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <I18nProvider>
      <App />
    </I18nProvider>
  </StrictMode>,
)
