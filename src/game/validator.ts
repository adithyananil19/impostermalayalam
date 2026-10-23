import type { Player, GameSettings, WordEntry } from '../types'

export const MIN_PLAYERS = 3
export const MAX_PLAYERS = 20

export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

/**
 * Validates player list for count, emptiness, and uniqueness.
 */
export function validatePlayers(players: Player[]): ValidationResult {
  const errors: string[] = []

  if (!players || players.length < MIN_PLAYERS) {
    errors.push(`At least ${MIN_PLAYERS} players are required (currently ${players ? players.length : 0}).`)
  }

  if (players && players.length > MAX_PLAYERS) {
    errors.push(`Maximum ${MAX_PLAYERS} players allowed (currently ${players.length}).`)
  }

  if (players) {
    const seenIds = new Set<string>()
    const seenNames = new Set<string>()

    players.forEach((p, index) => {
      if (!p.id || !p.id.trim()) {
        errors.push(`Player at index ${index} has an empty or missing ID.`)
      } else if (seenIds.has(p.id)) {
        errors.push(`Duplicate player ID detected: "${p.id}".`)
      } else {
        seenIds.add(p.id)
      }

      const trimmedName = p.name ? p.name.trim() : ''
      if (!trimmedName) {
        errors.push(`Player ${index + 1} has an empty name.`)
      } else {
        const lower = trimmedName.toLowerCase()
        if (seenNames.has(lower)) {
          errors.push(`Duplicate player name detected: "${trimmedName}".`)
        } else {
          seenNames.add(lower)
        }
      }
    })
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Validates imposter configuration based on player count.
 * Rules:
 * - At least 1 imposter.
 * - At least 1 regular player (imposterCount < playerCount).
 * - Recommended: imposterCount <= Math.floor((playerCount - 1) / 2).
 */
export function validateImposterCount(playerCount: number, imposterCount: number): ValidationResult {
  const errors: string[] = []

  if (imposterCount < 1) {
    errors.push('Game must have at least 1 imposter.')
  }

  if (imposterCount >= playerCount) {
    errors.push(
      `Impossible configuration: cannot have ${imposterCount} imposters with ${playerCount} players. At least one regular player is required.`
    )
  }

  const maxRecommended = Math.max(1, Math.floor((playerCount - 1) / 2))
  if (imposterCount > maxRecommended) {
    errors.push(
      `Too many imposters for a fair game: maximum recommended for ${playerCount} players is ${maxRecommended}.`
    )
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Validates game settings and availability of words in selected categories.
 */
export function validateGameConfig(
  players: Player[],
  settings: GameSettings,
  availableWords: WordEntry[]
): ValidationResult {
  const errors: string[] = []

  // Validate players
  const playerValidation = validatePlayers(players)
  if (!playerValidation.isValid) {
    errors.push(...playerValidation.errors)
  }

  // Validate imposter count
  if (players && players.length > 0) {
    const imposterValidation = validateImposterCount(players.length, settings.imposterCount)
    if (!imposterValidation.isValid) {
      errors.push(...imposterValidation.errors)
    }
  }

  // Validate categories
  if (!settings.enabledCategories || settings.enabledCategories.length === 0) {
    errors.push('At least one word category must be selected.')
  } else {
    const matchingWords = availableWords.filter(w =>
      settings.enabledCategories.includes(w.category)
    )
    if (matchingWords.length === 0) {
      errors.push('No words available for the selected categories.')
    }
  }

  // Validate timer
  if (settings.timerEnabled && settings.timerSeconds <= 0) {
    errors.push('Discussion timer duration must be greater than 0 seconds.')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}
