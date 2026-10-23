import { describe, it, expect, beforeEach } from 'vitest'
import {
  loadFromStorage,
  saveToStorage,
  removeFromStorage,
  clearAllStorage,
  loadStoredSettings,
  saveStoredSettings,
  loadStoredPlayers,
  saveStoredPlayers,
  loadStoredPreferences,
  saveStoredPreferences,
  loadStoredStats,
  recordRoundCompletion,
  recordGameCompletion,
  loadStoredCustomCategories,
  saveStoredCustomCategories,
  loadStoredCustomWords,
  saveStoredCustomWords,
  validateAndParseCustomData,
  exportCustomData,
} from '../storage/localStorage'
import { STORAGE_KEYS } from '../storage/keys'
import type { GameSettings, Player, Category, WordEntry, UserPreferences } from '../types'
import { DEFAULT_SETTINGS, DEFAULT_PREFERENCES } from '../types'

describe('Phase 4: Persistence, Settings, and Custom Words', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  describe('Core localStorage Wrapper', () => {
    it('saves and loads data cleanly', () => {
      const data = { foo: 'bar', numbers: [1, 2, 3] }
      expect(saveToStorage('test_key', data)).toBe(true)
      const loaded = loadFromStorage('test_key', null)
      expect(loaded).toEqual(data)
    })

    it('returns default value if key does not exist', () => {
      const def = { defaultVal: 42 }
      const loaded = loadFromStorage('non_existent_key', def)
      expect(loaded).toEqual(def)
    })

    it('recovers gracefully from corrupted JSON in storage without throwing', () => {
      window.localStorage.setItem('corrupt_key', '{ invalid JSON string ...')
      const fallback = { fallback: true }
      const loaded = loadFromStorage('corrupt_key', fallback)
      expect(loaded).toEqual(fallback)
    })

    it('removes specific keys', () => {
      saveToStorage('key1', 'abc')
      removeFromStorage('key1')
      expect(loadFromStorage('key1', null)).toBeNull()
    })

    it('clears only imposter app keys on clearAllStorage', () => {
      saveToStorage(STORAGE_KEYS.SETTINGS, { foo: 'bar' })
      saveToStorage(STORAGE_KEYS.PREFERENCES, { reduceMotion: true })
      window.localStorage.setItem('other_app_key', 'should_remain')

      clearAllStorage()

      expect(loadFromStorage(STORAGE_KEYS.SETTINGS, null)).toBeNull()
      expect(loadFromStorage(STORAGE_KEYS.PREFERENCES, null)).toBeNull()
      expect(window.localStorage.getItem('other_app_key')).toBe('should_remain')
    })
  })

  describe('Settings & Players Persistence', () => {
    it('persists and loads game settings merged with defaults', () => {
      const customSettings: Partial<GameSettings> = {
        imposterCount: 2,
        timerEnabled: true,
        timerSeconds: 90,
      }
      saveStoredSettings(customSettings as GameSettings)

      const loaded = loadStoredSettings()
      expect(loaded.imposterCount).toBe(2)
      expect(loaded.timerEnabled).toBe(true)
      expect(loaded.timerSeconds).toBe(90)
      expect(loaded.gameMode).toBe(DEFAULT_SETTINGS.gameMode)
    })

    it('persists player rosters and filters out empty entries', () => {
      const players: Player[] = [
        { id: 'p1', name: 'Arjun' },
        { id: 'p2', name: 'Sneha' },
        { id: 'p3', name: '   ' }, // invalid empty name
      ]
      saveStoredPlayers(players)

      const loaded = loadStoredPlayers()
      expect(loaded).toHaveLength(2)
      expect(loaded[0].name).toBe('Arjun')
      expect(loaded[1].name).toBe('Sneha')
    })
  })

  describe('Preferences & Lifetime Statistics', () => {
    it('persists user preferences', () => {
      const prefs: UserPreferences = {
        reduceMotion: true,
        soundEnabled: false,
        hapticFeedback: true,
      }
      saveStoredPreferences(prefs)

      const loaded = loadStoredPreferences()
      expect(loaded.reduceMotion).toBe(true)
      expect(loaded.soundEnabled).toBe(false)
      expect(loaded.hapticFeedback).toBe(true)
    })

    it('falls back to default preferences when storage is empty', () => {
      const loaded = loadStoredPreferences()
      expect(loaded).toEqual(DEFAULT_PREFERENCES)
    })

    it('records round results and accumulates stats', () => {
      const s1 = recordRoundCompletion(true) // imposter won
      expect(s1.roundsPlayed).toBe(1)
      expect(s1.imposterWins).toBe(1)
      expect(s1.regularWins).toBe(0)
      expect(s1.lastPlayedAt).toBeDefined()

      const s2 = recordRoundCompletion(false) // regular won
      expect(s2.roundsPlayed).toBe(2)
      expect(s2.imposterWins).toBe(1)
      expect(s2.regularWins).toBe(1)

      const g = recordGameCompletion()
      expect(g.gamesPlayed).toBe(1)
      expect(g.roundsPlayed).toBe(2)

      const stored = loadStoredStats()
      expect(stored.roundsPlayed).toBe(2)
      expect(stored.gamesPlayed).toBe(1)
    })
  })

  describe('Custom Words & Categories Management', () => {
    it('persists custom categories', () => {
      const cats: Category[] = [
        { id: 'custom-fest', name: 'Fest Vibes', description: 'Campus fest memories', enabled: true, isCustom: true },
      ]
      saveStoredCustomCategories(cats)

      const loaded = loadStoredCustomCategories()
      expect(loaded).toHaveLength(1)
      expect(loaded[0].name).toBe('Fest Vibes')
    })

    it('persists custom words', () => {
      const words: WordEntry[] = [
        {
          id: 'custom-1',
          word: 'Chaya Kadi',
          hint: 'Evening combo',
          category: 'custom-fest',
          isCustom: true,
        },
      ]
      saveStoredCustomWords(words)

      const loaded = loadStoredCustomWords()
      expect(loaded).toHaveLength(1)
      expect(loaded[0].word).toBe('Chaya Kadi')
      expect(loaded[0].hint).toBe('Evening combo')
    })

    it('builds a structured export payload', () => {
      const cats: Category[] = [
        { id: 'default-cat', name: 'Default', enabled: true },
        { id: 'custom-cat', name: 'Custom', enabled: true, isCustom: true },
      ]
      const words: WordEntry[] = [
        { id: 'w1', word: 'DefaultWord', hint: 'H1', category: 'default-cat' },
        { id: 'w2', word: 'CustomWord', hint: 'H2', category: 'custom-cat', isCustom: true },
      ]

      const payload = exportCustomData(cats, words)
      expect(payload.version).toBe(1)
      expect(payload.exportedAt).toBeDefined()
      expect(payload.categories).toHaveLength(1)
      expect(payload.categories[0].id).toBe('custom-cat')
      expect(payload.words).toHaveLength(1)
      expect(payload.words[0].id).toBe('w2')
    })

    it('validates and rejects non-JSON import strings', () => {
      const res = validateAndParseCustomData('This is not JSON')
      expect(res.isValid).toBe(false)
      expect(res.errors[0]).toMatch(/Invalid JSON format/)
    })

    it('validates and parses valid custom JSON word packs', () => {
      const validPayload = JSON.stringify({
        categories: [
          { id: 'campus-fest', name: 'Campus Fest', description: 'Cultural events' },
        ],
        words: [
          {
            word: 'Stage Play',
            hint: 'Curtain call',
            category: 'campus-fest',
          },
          {
            word: 'Tug of War',
            hint: 'Rope blister',
            category: 'campus-fest',
          },
        ],
      })

      const res = validateAndParseCustomData(validPayload)
      expect(res.isValid).toBe(true)
      expect(res.errors).toHaveLength(0)
      expect(res.importedCategories).toHaveLength(1)
      expect(res.importedCategories[0].id).toBe('campus-fest')
      expect(res.importedWords).toHaveLength(2)
      expect(res.importedWords[0].word).toBe('Stage Play')
      expect(res.importedWords[1].word).toBe('Tug of War')
    })

    it('rejects words with missing secret word or hint', () => {
      const invalidPayload = JSON.stringify({
        words: [
          { word: '', hint: 'Hint only', category: 'test' },
          { word: 'Word only', hint: '', category: 'test' },
        ],
      })

      const res = validateAndParseCustomData(invalidPayload)
      expect(res.isValid).toBe(false)
      expect(res.errors.length).toBeGreaterThan(0)
    })
  })
})
