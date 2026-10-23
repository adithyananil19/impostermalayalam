import { describe, it, expect, beforeEach } from 'vitest'
import {
  validatePlayers,
  validateImposterCount,
  validateGameConfig,
} from '../game/validator'
import { assignRoles, getPlayerPrivateInfo, updateRolesForNewWord } from '../game/roles'
import { selectSecretWord, skipCurrentWord } from '../game/wordSelector'
import { tallyVotes, resolveVotes, validateVote } from '../game/voting'
import {
  saveToStorage,
  loadFromStorage,
  validateAndParseCustomData,
  exportCustomData,
} from '../storage/localStorage'
import { INITIAL_WORDS } from '../data/words'
import { DEFAULT_CATEGORIES } from '../data/categories'
import { DEFAULT_SETTINGS } from '../types'
import type { Player, WordEntry } from '../types'

function makePlayers(count: number): Player[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `player-${i + 1}`,
    name: `Player ${i + 1}`,
  }))
}

describe('PHASE 6 — Comprehensive QA & Robustness Test Suite', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  // ─── 1. Player Group Configurations ──────────────────────────────────────────
  describe('Group Configurations (3 to 20 players)', () => {
    it('supports minimum 3 players with 1 imposter', () => {
      const players = makePlayers(3)
      expect(validatePlayers(players).isValid).toBe(true)
      expect(validateImposterCount(3, 1).isValid).toBe(true)

      const word = INITIAL_WORDS[0]
      const roles = assignRoles(players, 1, word, 'vague_hint')
      const imposters = roles.filter(r => r.role === 'imposter')
      const regulars = roles.filter(r => r.role === 'regular')

      expect(imposters).toHaveLength(1)
      expect(regulars).toHaveLength(2)
    })

    it('supports maximum 20 players with multiple imposters', () => {
      const players = makePlayers(20)
      expect(validatePlayers(players).isValid).toBe(true)
      expect(validateImposterCount(20, 4).isValid).toBe(true)

      const word = INITIAL_WORDS[5]
      const roles = assignRoles(players, 4, word, 'no_word')
      const imposters = roles.filter(r => r.role === 'imposter')
      const regulars = roles.filter(r => r.role === 'regular')

      expect(imposters).toHaveLength(4)
      expect(regulars).toHaveLength(16)
    })

    it('rejects invalid player bounds and duplicate names', () => {
      expect(validatePlayers(makePlayers(2)).isValid).toBe(false)
      expect(validatePlayers(makePlayers(21)).isValid).toBe(false)

      const dupes: Player[] = [
        { id: '1', name: 'Rahul' },
        { id: '2', name: 'rahul' },
        { id: '3', name: 'Anjali' },
      ]
      expect(validatePlayers(dupes).isValid).toBe(false)
    })

    it('validates entire game configuration safely', () => {
      const valid = validateGameConfig(
        makePlayers(4),
        {
          ...DEFAULT_SETTINGS,
          enabledCategories: ['food-bakery'],
        },
        INITIAL_WORDS
      )
      expect(valid.isValid).toBe(true)

      const noCats = validateGameConfig(
        makePlayers(4),
        {
          ...DEFAULT_SETTINGS,
          enabledCategories: [],
        },
        INITIAL_WORDS
      )
      expect(noCats.isValid).toBe(false)
      expect(noCats.errors[0]).toMatch(/category/i)
    })
  })

  // ─── 2. All Imposter Information Modes ─────────────────────────────────────────
  describe('Imposter Information Modes', () => {
    const sampleWord: WordEntry = {
      id: 'test-qa-01',
      word: 'Neyyappam',
      hint: 'Sweet round fried snack',
      relatedWord: 'Unniyappam',
      category: 'food-bakery',
    }
    const players = makePlayers(4)

    it('accurately delivers "no_word" mode', () => {
      const roles = assignRoles(players, 1, sampleWord, 'no_word')
      const imposterRole = roles.find(r => r.role === 'imposter')!
      const regularRole = roles.find(r => r.role === 'regular')!

      expect(imposterRole.displayInfo).toBe('')
      expect(regularRole.displayInfo).toBe('Neyyappam')
    })

    it('accurately delivers "vague_hint" mode', () => {
      const roles = assignRoles(players, 1, sampleWord, 'vague_hint')
      const imposterRole = roles.find(r => r.role === 'imposter')!
      const regularRole = roles.find(r => r.role === 'regular')!

      expect(imposterRole.displayInfo).toBe('Sweet round fried snack')
      expect(regularRole.displayInfo).toBe('Neyyappam')
    })

    it('accurately delivers "category_reveal" mode', () => {
      const roles = assignRoles(players, 1, sampleWord, 'category_reveal')
      const imposterRole = roles.find(r => r.role === 'imposter')!
      const regularRole = roles.find(r => r.role === 'regular')!

      expect(imposterRole.displayInfo).toBe('Food & Bakery')
      expect(regularRole.displayInfo).toBe('Neyyappam')
    })

    it('falls back to category id in "category_reveal" mode if category name is not in defaults', () => {
      const customCatWord: WordEntry = {
        id: 'test-qa-02',
        word: 'Sadya',
        hint: 'Grand feast on banana leaf',
        category: 'custom-fest',
      }
      const roles = assignRoles(players, 1, customCatWord, 'category_reveal')
      const imposterRole = roles.find(r => r.role === 'imposter')!

      expect(imposterRole.displayInfo).toBe('custom-fest')
    })

    it('ensures getPlayerPrivateInfo isolates player info securely', () => {
      const roles = assignRoles(players, 1, sampleWord, 'vague_hint')
      const p1Info = getPlayerPrivateInfo(roles, players[0].id)

      expect(p1Info).toBeDefined()
      expect(p1Info?.role).toBeDefined()
      expect(p1Info?.displayInfo).toBeDefined()
    })
  })

  // ─── 3. Word Selection, Categories & Skip Word ─────────────────────────────────
  describe('Word Selection and Dynamic Skipping', () => {
    it('restricts words strictly to selected categories', () => {
      const selected = selectSecretWord(INITIAL_WORDS, ['malayalam-movies'], [])
      expect(selected).not.toBeNull()
      expect(selected?.category).toBe('malayalam-movies')
    })

    it('seamlessly integrates custom words into category selection', () => {
      const customWord: WordEntry = {
        id: 'cw-fest-99',
        word: 'Onam Celebrations',
        hint: 'Pookkalam and Maveli',
        category: 'custom-fest',
        isCustom: true,
      }
      const pool = [...INITIAL_WORDS, customWord]
      const selected = selectSecretWord(pool, ['custom-fest'], [])

      expect(selected).not.toBeNull()
      expect(selected?.id).toBe('cw-fest-99')
      expect(selected?.word).toBe('Onam Celebrations')
    })

    it('skips current word without changing imposter role assignments', () => {
      const players = makePlayers(4)
      const wordA: WordEntry = {
        id: 'word-a',
        word: 'Chaya',
        hint: 'Morning brew',
        category: 'food-bakery',
      }
      const wordB: WordEntry = {
        id: 'word-b',
        word: 'Kaapi',
        hint: 'Filter roast',
        category: 'food-bakery',
      }

      const originalRoles = assignRoles(players, 1, wordA, 'vague_hint')
      const originalImposter = originalRoles.find(r => r.role === 'imposter')!

      const updatedRoles = updateRolesForNewWord(originalRoles, wordB, 'vague_hint')
      const updatedImposter = updatedRoles.find(r => r.role === 'imposter')!
      const updatedRegular = updatedRoles.find(r => r.role === 'regular')!

      expect(updatedImposter.playerId).toBe(originalImposter.playerId)
      expect(updatedImposter.displayInfo).toBe('Filter roast')
      expect(updatedRegular.displayInfo).toBe('Kaapi')
    })

    it('skipCurrentWord helper picks a new word excluding current word', () => {
      const cats = DEFAULT_CATEGORIES.map(c => c.id)
      const current = INITIAL_WORDS[0]
      const next = skipCurrentWord(INITIAL_WORDS, cats, current.id, [])

      expect(next).not.toBeNull()
      expect(next?.id).not.toBe(current.id)
    })
  })

  // ─── 4. Voting Outcomes & Edge Cases ──────────────────────────────────────────
  describe('Voting Resolutions & Edge Cases', () => {
    const players = makePlayers(4)
    const [p1, p2, p3, p4] = players
    const word = INITIAL_WORDS[0]
    const roles = [
      { playerId: p1.id, role: 'regular' as const, displayInfo: word.word },
      { playerId: p2.id, role: 'regular' as const, displayInfo: word.word },
      { playerId: p3.id, role: 'regular' as const, displayInfo: word.word },
      { playerId: p4.id, role: 'imposter' as const, displayInfo: word.hint },
    ]

    it('validates vote rules strictly (no duplicate votes, active players only)', () => {
      const existing = [{ voterId: p1.id, targetId: p4.id }]
      const dup = validateVote(p1.id, p2.id, existing, players)
      expect(dup.isValid).toBe(false)
      expect(dup.error).toMatch(/already submitted/i)

      const unknownVoter = validateVote('stranger', p4.id, [], players)
      expect(unknownVoter.isValid).toBe(false)

      const unknownTarget = validateVote(p2.id, 'ghost', [], players)
      expect(unknownTarget.isValid).toBe(false)
    })

    it('tallies votes accurately in descending order', () => {
      const votes = [
        { voterId: p1.id, targetId: p4.id },
        { voterId: p2.id, targetId: p4.id },
        { voterId: p3.id, targetId: p2.id },
      ]
      const tally = tallyVotes(votes, players)
      expect(tally[0].targetId).toBe(p4.id)
      expect(tally[0].count).toBe(2)
    })

    it('awards victory to regular players when imposter is voted out', () => {
      const votes = [
        { voterId: p1.id, targetId: p4.id },
        { voterId: p2.id, targetId: p4.id },
        { voterId: p3.id, targetId: p4.id },
        { voterId: p4.id, targetId: p1.id },
      ]
      const outcome = resolveVotes(votes, players, roles)

      expect(outcome.imposterWon).toBe(false) // Regulars win!
      expect(outcome.eliminatedPlayerId).toBe(p4.id)
      expect(outcome.isTie).toBe(false)
    })

    it('awards victory to imposter when innocent regular player is voted out', () => {
      const votes = [
        { voterId: p1.id, targetId: p2.id },
        { voterId: p3.id, targetId: p2.id },
        { voterId: p4.id, targetId: p2.id },
        { voterId: p2.id, targetId: p4.id },
      ]
      const outcome = resolveVotes(votes, players, roles)

      expect(outcome.imposterWon).toBe(true)
      expect(outcome.eliminatedPlayerId).toBe(p2.id)
    })

    it('resolves tied vote deadlocks in favor of imposter', () => {
      const votes = [
        { voterId: p1.id, targetId: p4.id },
        { voterId: p2.id, targetId: p4.id },
        { voterId: p3.id, targetId: p1.id },
        { voterId: p4.id, targetId: p1.id },
      ]
      const outcome = resolveVotes(votes, players, roles)

      expect(outcome.isTie).toBe(true)
      expect(outcome.imposterWon).toBe(true)
    })
  })

  // ─── 5. Storage Error Resilience & Recovery ──────────────────────────────────
  describe('Storage Resilience & Recovery', () => {
    it('gracefully recovers from corrupted JSON without throwing errors', () => {
      localStorage.setItem('corrupted_key', '{not_valid_json}')
      const val = loadFromStorage('corrupted_key', { fallback: true })
      expect(val).toEqual({ fallback: true })
    })

    it('saves and loads cleanly from local storage', () => {
      saveToStorage('test_store_key', { gameActive: true, score: 42 })
      const val = loadFromStorage<{ gameActive: boolean; score: number }>('test_store_key', { gameActive: false, score: 0 })
      expect(val.gameActive).toBe(true)
      expect(val.score).toBe(42)
    })

    it('validates and rejects corrupted custom word JSON import payloads', () => {
      const res = validateAndParseCustomData('not json at all')
      expect(res.isValid).toBe(false)
      expect(res.errors.length).toBeGreaterThan(0)
    })

    it('successfully serializes and parses valid custom packages without difficulty', () => {
      const exported = exportCustomData(
        [{ id: 'test-cat', name: 'Test Cat', enabled: true, isCustom: true }],
        [{ id: 'cw-1', word: 'Aluva', hint: 'Sweet halwa town', category: 'test-cat', isCustom: true }]
      )

      const jsonStr = JSON.stringify(exported)
      const parsed = validateAndParseCustomData(jsonStr)

      expect(parsed.isValid).toBe(true)
      expect(parsed.importedCategories).toHaveLength(1)
      expect(parsed.importedWords).toHaveLength(1)
      expect(parsed.importedWords[0].word).toBe('Aluva')
    })
  })
})
