import { describe, expect, it } from 'vitest'
import { createCardId, createEmptySet, parseVocabSet } from './vocabSet'

describe('vocabSet', () => {
  it('parses a valid set', () => {
    const result = parseVocabSet({
      id: 'demo',
      title: 'Demo',
      sourceLanguage: 'fr',
      targetLanguage: 'de',
      cards: [{ id: 'a', source: 'la mer', target: 'das Meer', phonetic: 'lamɛʀ' }],
    })
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.set.cards).toHaveLength(1)
      expect(result.set.cards[0].phonetic).toBe('lamɛʀ')
    }
  })

  it('rejects empty card lists and invalid cards', () => {
    expect(parseVocabSet({ title: 'X', cards: [] }).ok).toBe(false)
    expect(
      parseVocabSet({
        title: 'X',
        cards: [{ id: 'a', source: '', target: 'y' }],
      }).ok,
    ).toBe(false)
  })

  it('creates empty sets and card ids', () => {
    const set = createEmptySet('Meine Liste')
    expect(set.cards).toEqual([])
    expect(set.id).toContain('meine-liste')
    expect(createCardId('une ville', 'eine Stadt')).toMatch(/une-ville-eine-stadt-/)
  })
})
