import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from '../App'
import { I18nProvider } from '../i18n'
import type { VocabSet } from '../types'

const fixtureSet: VocabSet = {
  id: 'fixture',
  title: 'Fixture Set',
  sourceLanguage: 'fr',
  targetLanguage: 'de',
  cards: [
    {
      id: 'c1',
      source: 'une ville',
      target: 'eine Stadt',
      phonetic: 'ynvil',
    },
    {
      id: 'c2',
      source: 'la mer',
      target: 'das Meer',
      phonetic: 'lamɛʀ',
    },
  ],
}

function renderApp() {
  return render(
    <I18nProvider>
      <App />
    </I18nProvider>,
  )
}

describe('study flow', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => fixtureSet,
      }),
    )
  })

  it('starts, flips, marks known, and opens known browse', async () => {
    const user = userEvent.setup()
    renderApp()

    expect(await screen.findByRole('button', { name: 'Lernen starten' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Lernen starten' }))

    const prompt = await screen.findByRole('button', { name: /eine Stadt|das Meer/ })
    await user.click(prompt)

    await user.click(screen.getByRole('button', { name: 'Kann ich' }))

    expect(screen.getByText(/Kann ich: 1/)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Kann ich: 1/ }))
    expect(await screen.findByText(/Stapel „Kann ich“/)).toBeInTheDocument()
  })
})
