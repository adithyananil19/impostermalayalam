import type { Player, WordEntry, ImposterMode, PlayerRole } from '../types'
import { DEFAULT_CATEGORIES } from '../data/categories'

/**
 * Randomly assigns imposter and regular roles to players,
 * and sets the private display info according to the configured ImposterMode.
 */
export function assignRoles(
  players: Player[],
  imposterCount: number,
  word: WordEntry,
  mode: ImposterMode,
  randomizer: () => number = Math.random,
  categoryName?: string
): PlayerRole[] {
  if (!players || players.length === 0 || !word) {
    return []
  }

  const clampedImposterCount = Math.max(1, Math.min(imposterCount, players.length - 1))

  // Pick random distinct indices for imposters
  const indices = players.map((_, i) => i)
  // Fisher-Yates shuffle
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(randomizer() * (i + 1))
    ;[indices[i], indices[j]] = [indices[j], indices[i]]
  }

  const imposterIndices = new Set(indices.slice(0, clampedImposterCount))

  return players.map((player, index) => {
    const isImposter = imposterIndices.has(index)
    let displayInfo = ''

    if (isImposter) {
      if (mode === 'no_word') {
        displayInfo = ''
      } else if (mode === 'vague_hint') {
        displayInfo = word.hint
      } else if (mode === 'category_reveal') {
        const catObj = DEFAULT_CATEGORIES.find(c => c.id === word.category)
        displayInfo = categoryName || (catObj ? catObj.name : word.category)
      }
    } else {
      displayInfo = word.word
    }

    return {
      playerId: player.id,
      role: isImposter ? 'imposter' : 'regular',
      displayInfo,
    }
  })
}

/**
 * Updates private display info when the secret word is changed (e.g. Skip Word),
 * strictly preserving who is the imposter and who is regular.
 */
export function updateRolesForNewWord(
  currentRoles: PlayerRole[],
  newWord: WordEntry,
  mode: ImposterMode,
  categoryName?: string
): PlayerRole[] {
  return currentRoles.map(roleEntry => {
    let displayInfo = ''

    if (roleEntry.role === 'imposter') {
      if (mode === 'no_word') {
        displayInfo = ''
      } else if (mode === 'vague_hint') {
        displayInfo = newWord.hint
      } else if (mode === 'category_reveal') {
        const catObj = DEFAULT_CATEGORIES.find(c => c.id === newWord.category)
        displayInfo = categoryName || (catObj ? catObj.name : newWord.category)
      }
    } else {
      displayInfo = newWord.word
    }

    return {
      ...roleEntry,
      displayInfo,
    }
  })
}

/**
 * Securely gets only the private display info for a specific player ID.
 * Returns null if the player ID is invalid.
 */
export function getPlayerPrivateInfo(
  roles: PlayerRole[],
  playerId: string
): { role: 'regular' | 'imposter'; displayInfo: string } | null {
  const playerRole = roles.find(r => r.playerId === playerId)
  if (!playerRole) return null

  return {
    role: playerRole.role,
    displayInfo: playerRole.displayInfo,
  }
}
