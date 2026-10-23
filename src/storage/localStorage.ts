import { STORAGE_KEYS, STORAGE_PREFIX } from './keys'
import type {
  GameSettings,
  Player,
  Category,
  WordEntry,
  UserPreferences,
  GameStats,
  CustomDataExport,
} from '../types'
import { DEFAULT_SETTINGS, DEFAULT_PREFERENCES } from '../types'

/**
 * Safely loads and parses JSON from localStorage with fallback on missing or corrupt data.
 */
export function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return defaultValue
    }
    const item = window.localStorage.getItem(key)
    if (item === null || item === undefined || item === '') {
      return defaultValue
    }
    const parsed = JSON.parse(item)
    return parsed as T
  } catch (err) {
    console.warn(`[storage] Failed to parse key "${key}", using default.`, err)
    return defaultValue
  }
}

/**
 * Safely saves data as JSON into localStorage.
 */
export function saveToStorage<T>(key: string, data: T): boolean {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return false
    }
    const serialized = JSON.stringify(data)
    window.localStorage.setItem(key, serialized)
    return true
  } catch (err) {
    console.error(`[storage] Failed to save key "${key}".`, err)
    return false
  }
}

/**
 * Removes a specific key from localStorage.
 */
export function removeFromStorage(key: string): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(key)
    }
  } catch (err) {
    console.warn(`[storage] Failed to remove key "${key}".`, err)
  }
}

/**
 * Clears all imposter party game keys from localStorage.
 */
export function clearAllStorage(): void {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return
    const keysToRemove: string[] = []
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i)
      if (k && k.startsWith(STORAGE_PREFIX)) {
        keysToRemove.push(k)
      }
    }
    keysToRemove.forEach(k => window.localStorage.removeItem(k))
  } catch (err) {
    console.warn('[storage] Failed to clear app storage.', err)
  }
}

// ─── Domain Specific Loaders & Savers ────────────────────────────────────────

export function loadStoredSettings(): GameSettings {
  const loaded = loadFromStorage<Partial<GameSettings>>(STORAGE_KEYS.SETTINGS, {})
  return {
    ...DEFAULT_SETTINGS,
    ...loaded,
  }
}

export function saveStoredSettings(settings: GameSettings): boolean {
  return saveToStorage(STORAGE_KEYS.SETTINGS, settings)
}

export function loadStoredPlayers(): Player[] {
  const players = loadFromStorage<Player[]>(STORAGE_KEYS.PLAYERS, [])
  if (!Array.isArray(players)) return []
  return players.filter(p => p && typeof p.id === 'string' && typeof p.name === 'string' && p.name.trim())
}

export function saveStoredPlayers(players: Player[]): boolean {
  return saveToStorage(STORAGE_KEYS.PLAYERS, players)
}

export function loadStoredPreferences(): UserPreferences {
  const loaded = loadFromStorage<Partial<UserPreferences>>(STORAGE_KEYS.PREFERENCES, {})
  return {
    ...DEFAULT_PREFERENCES,
    ...loaded,
  }
}

export function saveStoredPreferences(prefs: UserPreferences): boolean {
  return saveToStorage(STORAGE_KEYS.PREFERENCES, prefs)
}

export const DEFAULT_STATS: GameStats = {
  gamesPlayed: 0,
  roundsPlayed: 0,
  imposterWins: 0,
  regularWins: 0,
}

export function loadStoredStats(): GameStats {
  const loaded = loadFromStorage<Partial<GameStats>>(STORAGE_KEYS.STATS, {})
  return {
    ...DEFAULT_STATS,
    ...loaded,
  }
}

export function saveStoredStats(stats: GameStats): boolean {
  return saveToStorage(STORAGE_KEYS.STATS, stats)
}

export function recordRoundCompletion(imposterWon: boolean): GameStats {
  const current = loadStoredStats()
  const updated: GameStats = {
    ...current,
    roundsPlayed: current.roundsPlayed + 1,
    imposterWins: current.imposterWins + (imposterWon ? 1 : 0),
    regularWins: current.regularWins + (imposterWon ? 0 : 1),
    lastPlayedAt: new Date().toISOString(),
  }
  saveStoredStats(updated)
  return updated
}

export function recordGameCompletion(): GameStats {
  const current = loadStoredStats()
  const updated: GameStats = {
    ...current,
    gamesPlayed: current.gamesPlayed + 1,
    lastPlayedAt: new Date().toISOString(),
  }
  saveStoredStats(updated)
  return updated
}

export function loadStoredCustomCategories(): Category[] {
  const cats = loadFromStorage<Category[]>(STORAGE_KEYS.CUSTOM_CATEGORIES, [])
  if (!Array.isArray(cats)) return []
  return cats.filter(c => c && typeof c.id === 'string' && typeof c.name === 'string')
}

export function saveStoredCustomCategories(cats: Category[]): boolean {
  return saveToStorage(STORAGE_KEYS.CUSTOM_CATEGORIES, cats)
}

export function loadStoredCustomWords(): WordEntry[] {
  const words = loadFromStorage<WordEntry[]>(STORAGE_KEYS.CUSTOM_WORDS, [])
  if (!Array.isArray(words)) return []
  return words.filter(
    w =>
      w &&
      typeof w.id === 'string' &&
      typeof w.word === 'string' &&
      typeof w.hint === 'string' &&
      typeof w.category === 'string'
  )
}

export function saveStoredCustomWords(words: WordEntry[]): boolean {
  return saveToStorage(STORAGE_KEYS.CUSTOM_WORDS, words)
}

// ─── Import / Export Validation ──────────────────────────────────────────────

export interface ImportValidationResult {
  isValid: boolean;
  errors: string[];
  importedCategories: Category[];
  importedWords: WordEntry[];
}

export function validateAndParseCustomData(jsonString: string): ImportValidationResult {
  const errors: string[] = []

  let parsed: unknown
  try {
    parsed = JSON.parse(jsonString)
  } catch {
    return {
      isValid: false,
      errors: ['Invalid JSON format. Please verify the file contents.'],
      importedCategories: [],
      importedWords: [],
    }
  }

  if (!parsed || typeof parsed !== 'object') {
    return {
      isValid: false,
      errors: ['Imported data must be a JSON object containing categories and words.'],
      importedCategories: [],
      importedWords: [],
    }
  }

  const data = parsed as Record<string, unknown>

  // Validate categories
  const importedCategories: Category[] = []
  if (data.categories) {
    if (!Array.isArray(data.categories)) {
      errors.push('"categories" must be an array of category objects.')
    } else {
      data.categories.forEach((c, idx) => {
        if (!c || typeof c !== 'object') {
          errors.push(`Category at index ${idx} is not a valid object.`)
          return
        }
        const catObj = c as Record<string, unknown>
        if (!catObj.id || typeof catObj.id !== 'string') {
          errors.push(`Category at index ${idx} is missing a valid "id".`)
        }
        if (!catObj.name || typeof catObj.name !== 'string') {
          errors.push(`Category at index ${idx} is missing a valid "name".`)
        }
        if (catObj.id && catObj.name) {
          importedCategories.push({
            id: String(catObj.id).trim().toLowerCase(),
            name: String(catObj.name).trim(),
            description: catObj.description ? String(catObj.description).trim() : '',
            isCustom: true,
            enabled: catObj.enabled !== false,
          })
        }
      })
    }
  }

  // Validate words
  const importedWords: WordEntry[] = []
  if (data.words) {
    if (!Array.isArray(data.words)) {
      errors.push('"words" must be an array of word objects.')
    } else {
      data.words.forEach((w, idx) => {
        if (!w || typeof w !== 'object') {
          errors.push(`Word at index ${idx} is not a valid object.`)
          return
        }
        const wordObj = w as Record<string, unknown>
        const word = typeof wordObj.word === 'string' ? wordObj.word.trim() : ''
        const hint = typeof wordObj.hint === 'string' ? wordObj.hint.trim() : ''
        const category = typeof wordObj.category === 'string' ? wordObj.category.trim() : ''

        if (!word) {
          errors.push(`Word entry at index ${idx} has an empty or missing "word".`)
        }
        if (!hint) {
          errors.push(`Word entry at index ${idx} ("${word || idx}") has an empty or missing "hint".`)
        }
        if (!category) {
          errors.push(`Word entry at index ${idx} ("${word || idx}") has an empty or missing "category".`)
        }

        if (word && hint && category) {
          const id =
            typeof wordObj.id === 'string' && wordObj.id.trim()
              ? wordObj.id.trim()
              : `custom-${Date.now()}-${idx}`
          const difficulty =
            wordObj.difficulty === 'easy' || wordObj.difficulty === 'medium' || wordObj.difficulty === 'hard'
              ? wordObj.difficulty
              : 'easy'
          const relatedWord =
            typeof wordObj.relatedWord === 'string' && wordObj.relatedWord.trim()
              ? wordObj.relatedWord.trim()
              : undefined

          importedWords.push({
            id,
            word,
            hint,
            relatedWord,
            category: category.toLowerCase(),
            difficulty,
            tags: Array.isArray(wordObj.tags) ? wordObj.tags.map(String) : ['custom'],
            isCustom: true,
          })
        }
      })
    }
  }

  if (importedCategories.length === 0 && importedWords.length === 0 && errors.length === 0) {
    errors.push('No valid categories or words found in the import file.')
  }

  return {
    isValid: errors.length === 0,
    errors,
    importedCategories,
    importedWords,
  }
}

export function exportCustomData(categories: Category[], words: WordEntry[]): CustomDataExport {
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    categories: categories.filter(c => c.isCustom),
    words: words.filter(w => w.isCustom),
  }
}
