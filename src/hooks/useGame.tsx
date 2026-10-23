import { createContext, useContext, useState, useMemo, useEffect, type ReactNode } from 'react'
import type {
  GameState,
  Player,
  GameSettings,
  WordEntry,
  Category,
  UserPreferences,
  GameStats,
  CustomDataExport,
} from '../types'
import { gameReducer, createInitialState, type GameAction } from '../game/stateMachine'
import { INITIAL_WORDS } from '../data/words'
import { DEFAULT_CATEGORIES } from '../data/categories'
import {
  loadStoredSettings,
  saveStoredSettings,
  loadStoredPlayers,
  saveStoredPlayers,
  loadStoredPreferences,
  saveStoredPreferences,
  loadStoredStats,
  saveStoredStats,
  loadStoredCustomCategories,
  saveStoredCustomCategories,
  loadStoredCustomWords,
  saveStoredCustomWords,
  recordRoundCompletion,
  recordGameCompletion,
  validateAndParseCustomData,
  exportCustomData as buildExportPayload,
  clearAllStorage,
  DEFAULT_STATS,
} from '../storage/localStorage'
import { DEFAULT_PREFERENCES } from '../types'

interface GameContextValue {
  state: GameState;
  allWords: WordEntry[];
  allCategories: Category[];
  customCategories: Category[];
  customWords: WordEntry[];
  preferences: UserPreferences;
  stats: GameStats;
  setPlayers: (players: Player[]) => void;
  updateSettings: (settings: Partial<GameSettings>) => void;
  startGame: () => { success: boolean; error?: string };
  advanceReveal: () => { success: boolean; error?: string };
  startVoting: () => { success: boolean; error?: string };
  submitVote: (voterId: string, targetId: string) => { success: boolean; error?: string };
  finishVoting: () => { success: boolean; error?: string };
  quickVerdict: (imposterCaught: boolean) => { success: boolean; error?: string };
  skipWord: () => { success: boolean; error?: string };
  nextRound: () => { success: boolean; error?: string };
  restartGame: () => void;
  cancelGame: () => void;
  // Custom Words & Categories
  addCustomCategory: (cat: { id: string; name: string; description?: string }) => { success: boolean; error?: string };
  deleteCustomCategory: (id: string) => void;
  addCustomWord: (word: { word: string; hint: string; category: string; relatedWord?: string; difficulty?: 'easy' | 'medium' | 'hard' }) => { success: boolean; error?: string };
  editCustomWord: (id: string, updates: Partial<WordEntry>) => { success: boolean; error?: string };
  deleteCustomWord: (id: string) => void;
  importCustomData: (jsonString: string) => { success: boolean; error?: string; count?: { categories: number; words: number } };
  exportCustomData: () => CustomDataExport;
  // Preferences & Stats
  updatePreferences: (partial: Partial<UserPreferences>) => void;
  resetPreferences: () => void;
  resetStats: () => void;
  resetAllData: () => void;
}

const GameContext = createContext<GameContextValue | null>(null)

export function GameProvider({ children }: { children: ReactNode }) {
  // Load initial persisted values
  const [preferences, setPreferences] = useState<UserPreferences>(() => loadStoredPreferences())
  const [stats, setStats] = useState<GameStats>(() => loadStoredStats())
  const [customCategories, setCustomCategories] = useState<Category[]>(() => loadStoredCustomCategories())
  const [customWords, setCustomWords] = useState<WordEntry[]>(() => loadStoredCustomWords())

  // Active game state
  const [state, setState] = useState<GameState>(() => {
    const initialPlayers = loadStoredPlayers()
    const initialSettings = loadStoredSettings()
    return createInitialState(initialPlayers, initialSettings)
  })

  // Combined words: standard seed words + custom user words
  const allWords = useMemo<WordEntry[]>(() => {
    return [...INITIAL_WORDS, ...customWords]
  }, [customWords])

  // Combined categories: default categories + custom categories
  const allCategories = useMemo<Category[]>(() => {
    return [...DEFAULT_CATEGORIES, ...customCategories]
  }, [customCategories])

  // Apply reduceMotion preference to document root for global CSS animations
  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (preferences.reduceMotion) {
        document.documentElement.setAttribute('data-reduced-motion', 'true')
      } else {
        document.documentElement.removeAttribute('data-reduced-motion')
      }
    }
  }, [preferences.reduceMotion])

  function dispatch(action: GameAction): { success: boolean; error?: string } {
    let resultError: string | undefined
    setState(prev => {
      const result = gameReducer(prev, action)
      if (result.error) {
        resultError = result.error
        return prev
      }

      // Check if a round finished to update lifetime statistics
      if (
        (action.type === 'FINISH_VOTING' || action.type === 'QUICK_VERDICT') &&
        result.state.currentRound &&
        typeof result.state.currentRound.imposterWon === 'boolean'
      ) {
        const updatedStats = recordRoundCompletion(result.state.currentRound.imposterWon)
        setStats(updatedStats)
      }

      // Check if session / game ended
      if (result.state.phase === 'game_over') {
        const updatedStats = recordGameCompletion()
        setStats(updatedStats)
      }

      return result.state
    })
    return { success: !resultError, error: resultError }
  }

  function setPlayers(players: Player[]) {
    saveStoredPlayers(players)
    setState(prev => ({
      ...prev,
      players,
      scores: players.map(p => {
        const existing = prev.scores.find(s => s.playerId === p.id)
        return existing || { playerId: p.id, points: 0 }
      }),
    }))
  }

  function updateSettings(settings: Partial<GameSettings>) {
    setState(prev => {
      const nextSettings = { ...prev.settings, ...settings }
      saveStoredSettings(nextSettings)
      return {
        ...prev,
        settings: nextSettings,
      }
    })
  }

  function startGame() {
    return dispatch({ type: 'START_GAME', payload: { allWords } })
  }

  function advanceReveal() {
    return dispatch({ type: 'ADVANCE_REVEAL' })
  }

  function startVoting() {
    return dispatch({ type: 'START_VOTING' })
  }

  function submitVote(voterId: string, targetId: string) {
    return dispatch({ type: 'SUBMIT_VOTE', payload: { voterId, targetId } })
  }

  function finishVoting() {
    return dispatch({ type: 'FINISH_VOTING' })
  }

  function quickVerdict(imposterCaught: boolean) {
    return dispatch({ type: 'QUICK_VERDICT', payload: { imposterCaught } })
  }

  function skipWord() {
    return dispatch({ type: 'SKIP_WORD', payload: { allWords } })
  }

  function nextRound() {
    return dispatch({ type: 'NEXT_ROUND', payload: { allWords } })
  }

  function restartGame() {
    dispatch({ type: 'RESTART_GAME' })
  }

  function cancelGame() {
    dispatch({ type: 'CANCEL_GAME' })
  }

  // ─── Custom Categories & Words CRUD ──────────────────────────────────────────

  function addCustomCategory(cat: { id: string; name: string; description?: string }) {
    const cleanId = cat.id.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-')
    const cleanName = cat.name.trim()

    if (!cleanId) return { success: false, error: 'Category ID cannot be empty.' }
    if (!cleanName) return { success: false, error: 'Category name cannot be empty.' }

    const exists = allCategories.some(c => c.id === cleanId)
    if (exists) {
      return { success: false, error: `A category with ID "${cleanId}" already exists.` }
    }

    const newCat: Category = {
      id: cleanId,
      name: cleanName,
      description: cat.description?.trim() || '',
      isCustom: true,
      enabled: true,
    }

    const updated = [...customCategories, newCat]
    setCustomCategories(updated)
    saveStoredCustomCategories(updated)
    return { success: true }
  }

  function deleteCustomCategory(id: string) {
    const updatedCats = customCategories.filter(c => c.id !== id)
    const updatedWords = customWords.filter(w => w.category !== id)

    setCustomCategories(updatedCats)
    setCustomWords(updatedWords)
    saveStoredCustomCategories(updatedCats)
    saveStoredCustomWords(updatedWords)

    // Remove from enabledCategories if active
    if (state.settings.enabledCategories.includes(id)) {
      updateSettings({
        enabledCategories: state.settings.enabledCategories.filter(c => c !== id),
      })
    }
  }

  function addCustomWord(entry: {
    word: string;
    hint: string;
    category: string;
    relatedWord?: string;
    difficulty?: 'easy' | 'medium' | 'hard';
  }) {
    const word = entry.word.trim()
    const hint = entry.hint.trim()
    const category = entry.category.trim()

    if (!word) return { success: false, error: 'Word cannot be empty.' }
    if (!hint) return { success: false, error: 'Hint cannot be empty.' }
    if (!category) return { success: false, error: 'Please select a category for this word.' }

    const newWord: WordEntry = {
      id: `custom-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      word,
      hint,
      relatedWord: entry.relatedWord?.trim() || undefined,
      category,
      difficulty: entry.difficulty || 'easy',
      tags: ['custom'],
      isCustom: true,
    }

    const updated = [...customWords, newWord]
    setCustomWords(updated)
    saveStoredCustomWords(updated)
    return { success: true }
  }

  function editCustomWord(id: string, updates: Partial<WordEntry>) {
    const index = customWords.findIndex(w => w.id === id)
    if (index === -1) {
      return { success: false, error: 'Custom word not found.' }
    }

    const updatedWords = [...customWords]
    updatedWords[index] = {
      ...updatedWords[index],
      ...updates,
      isCustom: true,
    }

    setCustomWords(updatedWords)
    saveStoredCustomWords(updatedWords)
    return { success: true }
  }

  function deleteCustomWord(id: string) {
    const updated = customWords.filter(w => w.id !== id)
    setCustomWords(updated)
    saveStoredCustomWords(updated)
  }

  function importCustomData(jsonString: string) {
    const result = validateAndParseCustomData(jsonString)
    if (!result.isValid) {
      return { success: false, error: result.errors.join(' ') }
    }

    // Merge categories without silently overwriting existing IDs
    const existingCatIds = new Set(allCategories.map(c => c.id))
    const newCats = result.importedCategories.filter(c => !existingCatIds.has(c.id))
    const updatedCats = [...customCategories, ...newCats]

    // Merge words
    const existingWordKeys = new Set(allWords.map(w => `${w.category}::${w.word.toLowerCase()}`))
    const newWords = result.importedWords.filter(
      w => !existingWordKeys.has(`${w.category}::${w.word.toLowerCase()}`)
    )
    const updatedWords = [...customWords, ...newWords]

    setCustomCategories(updatedCats)
    setCustomWords(updatedWords)
    saveStoredCustomCategories(updatedCats)
    saveStoredCustomWords(updatedWords)

    return {
      success: true,
      count: {
        categories: newCats.length,
        words: newWords.length,
      },
    }
  }

  function exportCustomData(): CustomDataExport {
    return buildExportPayload(allCategories, allWords)
  }

  // ─── Preferences & Stats ─────────────────────────────────────────────────────

  function updatePreferences(partial: Partial<UserPreferences>) {
    setPreferences(prev => {
      const updated = { ...prev, ...partial }
      saveStoredPreferences(updated)
      return updated
    })
  }

  function resetPreferences() {
    setPreferences(DEFAULT_PREFERENCES)
    saveStoredPreferences(DEFAULT_PREFERENCES)
  }

  function resetStats() {
    setStats(DEFAULT_STATS)
    saveStoredStats(DEFAULT_STATS)
  }

  function resetAllData() {
    clearAllStorage()
    setPreferences(DEFAULT_PREFERENCES)
    setStats(DEFAULT_STATS)
    setCustomCategories([])
    setCustomWords([])
    setState(createInitialState([], loadStoredSettings()))
  }

  return (
    <GameContext.Provider
      value={{
        state,
        allWords,
        allCategories,
        customCategories,
        customWords,
        preferences,
        stats,
        setPlayers,
        updateSettings,
        startGame,
        advanceReveal,
        startVoting,
        submitVote,
        finishVoting,
        quickVerdict,
        skipWord,
        nextRound,
        restartGame,
        cancelGame,
        addCustomCategory,
        deleteCustomCategory,
        addCustomWord,
        editCustomWord,
        deleteCustomWord,
        importCustomData,
        exportCustomData,
        updatePreferences,
        resetPreferences,
        resetStats,
        resetAllData,
      }}
    >
      {children}
    </GameContext.Provider>
  )
}

export function useGame() {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error('useGame must be used inside <GameProvider>')
  return ctx
}
