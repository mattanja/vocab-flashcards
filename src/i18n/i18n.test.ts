import { describe, expect, it } from 'vitest'
import { translate } from './index'

describe('i18n', () => {
  it('returns German and English strings with interpolation', () => {
    expect(translate('de', 'progressSummary', { known: 2, total: 5 })).toBe(
      '2 von 5 gelernt',
    )
    expect(translate('en', 'progressSummary', { known: 2, total: 5 })).toBe(
      '2 of 5 learned',
    )
    expect(translate('de', 'gradeKnown')).toBe('Kann ich')
    expect(translate('en', 'gradeKnown')).toBe('I know')
  })
})
