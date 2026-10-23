import { describe, it, expect } from 'vitest'
import { INITIAL_WORDS } from '../data/words'
import { DEFAULT_CATEGORIES } from '../data/categories'
import { selectSecretWord, skipCurrentWord } from '../game/wordSelector'

describe('Phase 5: Word Bank and Content Quality Verification', () => {
  it('contains at least 171+ entries across the categories as required by the spec', () => {
    expect(INITIAL_WORDS.length).toBeGreaterThanOrEqual(171)
  })

  it('verifies every word entry has a unique ID', () => {
    const seenIds = new Set<string>()
    const duplicates: string[] = []

    INITIAL_WORDS.forEach(w => {
      if (seenIds.has(w.id)) {
        duplicates.push(w.id)
      }
      seenIds.add(w.id)
    })

    expect(duplicates).toEqual([])
  })

  it('verifies every word entry has non-empty required fields', () => {
    INITIAL_WORDS.forEach(w => {
      expect(w.id && w.id.trim().length > 0).toBe(true)
      expect(w.word && w.word.trim().length > 0).toBe(true)
      expect(w.hint && w.hint.trim().length > 0).toBe(true)
      expect(w.category && w.category.trim().length > 0).toBe(true)
      expect(['easy', 'medium', 'hard']).toContain(w.difficulty)
    })
  })

  it('verifies no hint is identical to the secret word', () => {
    INITIAL_WORDS.forEach(w => {
      expect(w.word.toLowerCase().trim()).not.toBe(w.hint.toLowerCase().trim())
    })
  })

  it('verifies every entry belongs to a known default category', () => {
    const validCategoryIds = new Set(DEFAULT_CATEGORIES.map(c => c.id))
    INITIAL_WORDS.forEach(w => {
      expect(validCategoryIds.has(w.category)).toBe(true)
    })
  })

  it('verifies all 11 categories have at least 10 words', () => {
    const counts: Record<string, number> = {}
    INITIAL_WORDS.forEach(w => {
      counts[w.category] = (counts[w.category] || 0) + 1
    })

    DEFAULT_CATEGORIES.forEach(cat => {
      const count = counts[cat.id] || 0
      expect(count).toBeGreaterThanOrEqual(10)
    })
  })

  it('verifies difficulty distribution includes easy, medium, and hard', () => {
    const difficulties = new Set(INITIAL_WORDS.map(w => w.difficulty))
    expect(difficulties.has('easy')).toBe(true)
    expect(difficulties.has('medium')).toBe(true)
    expect(difficulties.has('hard')).toBe(true)
  })

  it('verifies word selection accurately respects category filters', () => {
    const selected = selectSecretWord(INITIAL_WORDS, ['food-bakery'], [])
    expect(selected).not.toBeNull()
    expect(selected?.category).toBe('food-bakery')
  })

  it('verifies skipCurrentWord picks another word from enabled categories', () => {
    const firstWord = selectSecretWord(INITIAL_WORDS, ['food-bakery'], [])!
    const nextWord = skipCurrentWord(INITIAL_WORDS, ['food-bakery'], firstWord.id, [firstWord.id])

    expect(nextWord).not.toBeNull()
    expect(nextWord?.id).not.toBe(firstWord.id)
    expect(nextWord?.category).toBe('food-bakery')
  })

  it('outputs the verified distribution of entries per category', () => {
    const counts: Record<string, number> = {}
    INITIAL_WORDS.forEach(w => {
      counts[w.category] = (counts[w.category] || 0) + 1
    })

    // Log the exact category count table
    const table = DEFAULT_CATEGORIES.map(c => ({
      category: c.name,
      id: c.id,
      count: counts[c.id] || 0,
    }))

    expect(table.length).toBe(11)
    table.forEach(row => {
      expect(row.count).toBeGreaterThanOrEqual(10)
    })
  })
})
