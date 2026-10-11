import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Locale } from '../types'
import * as storage from '../lib/storage'
import { messagesDe, type MessageKey } from './messages.de'
import { messagesEn } from './messages.en'

const catalogs = {
  de: messagesDe,
  en: messagesEn,
} as const

type Vars = Record<string, string | number>

type I18nContextValue = {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: MessageKey, vars?: Vars) => string
}

const I18nContext = createContext<I18nContextValue | null>(null)

function format(template: string, vars?: Vars): string {
  if (!vars) return template
  return template.replace(/\{(\w+)\}/g, (_, name: string) => String(vars[name] ?? ''))
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => storage.getLocale('de'))

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next)
    storage.setLocale(next)
    document.documentElement.lang = next
  }, [])

  const t = useCallback(
    (key: MessageKey, vars?: Vars) => format(catalogs[locale][key], vars),
    [locale],
  )

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext)
  if (!ctx) {
    throw new Error('useI18n must be used within I18nProvider')
  }
  return ctx
}

export function translate(locale: Locale, key: MessageKey, vars?: Vars): string {
  return format(catalogs[locale][key], vars)
}
