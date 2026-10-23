import type {
  GameState,
  GameSettings,
  Player,
  WordEntry,
  Vote,
  VoteResolution,
} from '../types'
import { validateGameConfig } from './validator'
import { selectSecretWord, skipCurrentWord } from './wordSelector'
import { assignRoles, updateRolesForNewWord } from './roles'
import { resolveVotes, validateVote } from './voting'
import { calculateRoundScores, accumulateScores } from './scoring'

export type GameAction =
  | { type: 'START_GAME'; payload: { allWords: WordEntry[]; settings?: Partial<GameSettings> } }
  | { type: 'ADVANCE_REVEAL' }
  | { type: 'START_VOTING' }
  | { type: 'SUBMIT_VOTE'; payload: { voterId: string; targetId: string } }
  | { type: 'FINISH_VOTING' }
  | { type: 'QUICK_VERDICT'; payload: { imposterCaught: boolean } }
  | { type: 'SKIP_WORD'; payload: { allWords: WordEntry[] } }
  | { type: 'NEXT_ROUND'; payload: { allWords: WordEntry[] } }
  | { type: 'RESTART_GAME' }
  | { type: 'CANCEL_GAME' }

export interface StateMachineResult {
  state: GameState
  error?: string
}

/**
 * Creates an initial clean GameState.
 */
export function createInitialState(
  players: Player[] = [],
  settings: GameSettings
): GameState {
  return {
    phase: 'setup',
    players,
    settings,
    scores: players.map(p => ({ playerId: p.id, points: 0 })),
    completedRounds: [],
    usedWordIds: [],
  }
}

/**
 * Pure state machine reducer for game transitions.
 * Enforces valid state transitions and guarantees immutability.
 */
export function gameReducer(
  state: GameState,
  action: GameAction
): StateMachineResult {
  switch (action.type) {
    // ─── START_GAME ──────────────────────────────────────────────────────────
    case 'START_GAME': {
      const currentSettings: GameSettings = action.payload.settings
        ? { ...state.settings, ...action.payload.settings }
        : state.settings

      const validation = validateGameConfig(
        state.players,
        currentSettings,
        action.payload.allWords
      )
      if (!validation.isValid) {
        return {
          state,
          error: validation.errors.join(' '),
        }
      }

      const word = selectSecretWord(
        action.payload.allWords,
        currentSettings.enabledCategories,
        state.usedWordIds
      )
      if (!word) {
        return {
          state,
          error: 'No secret word could be selected for the enabled categories.',
        }
      }

      const roles = assignRoles(
        state.players,
        currentSettings.imposterCount,
        word,
        currentSettings.imposterMode
      )

      const roundNumber = (state.completedRounds.length || 0) + 1

      return {
        state: {
          ...state,
          settings: currentSettings,
          phase: 'role_reveal',
          usedWordIds: [...state.usedWordIds, word.id],
          currentRound: {
            roundNumber,
            word,
            roles,
            revealIndex: 0,
            votes: [],
          },
        },
      }
    }

    // ─── ADVANCE_REVEAL ──────────────────────────────────────────────────────
    case 'ADVANCE_REVEAL': {
      if (state.phase !== 'role_reveal' || !state.currentRound) {
        return {
          state,
          error: 'Cannot advance reveal outside of role_reveal phase.',
        }
      }

      const nextIndex = state.currentRound.revealIndex + 1
      if (nextIndex >= state.players.length) {
        // All players have viewed their role: move to discussion
        return {
          state: {
            ...state,
            phase: 'discussion',
            currentRound: {
              ...state.currentRound,
              revealIndex: nextIndex,
            },
          },
        }
      }

      return {
        state: {
          ...state,
          currentRound: {
            ...state.currentRound,
            revealIndex: nextIndex,
          },
        },
      }
    }

    // ─── START_VOTING ────────────────────────────────────────────────────────
    case 'START_VOTING': {
      if (state.phase !== 'discussion' || !state.currentRound) {
        return {
          state,
          error: 'Cannot start voting outside of discussion phase.',
        }
      }

      return {
        state: {
          ...state,
          phase: 'voting',
          currentRound: {
            ...state.currentRound,
            votes: [],
          },
        },
      }
    }

    // ─── SUBMIT_VOTE ─────────────────────────────────────────────────────────
    case 'SUBMIT_VOTE': {
      if (state.phase !== 'voting' || !state.currentRound) {
        return {
          state,
          error: 'Cannot submit vote outside of voting phase.',
        }
      }

      const { voterId, targetId } = action.payload
      const voteValidation = validateVote(
        voterId,
        targetId,
        state.currentRound.votes,
        state.players
      )

      if (!voteValidation.isValid) {
        return {
          state,
          error: voteValidation.error,
        }
      }

      const updatedVotes: Vote[] = [
        ...state.currentRound.votes,
        { voterId, targetId },
      ]

      return {
        state: {
          ...state,
          currentRound: {
            ...state.currentRound,
            votes: updatedVotes,
          },
        },
      }
    }

    // ─── FINISH_VOTING ───────────────────────────────────────────────────────
    case 'FINISH_VOTING': {
      if (state.phase !== 'voting' || !state.currentRound) {
        return {
          state,
          error: 'Cannot finish voting outside of voting phase.',
        }
      }

      const resolution = resolveVotes(
        state.currentRound.votes,
        state.players,
        state.currentRound.roles
      )

      const roundScores = calculateRoundScores(
        state.players,
        state.currentRound.roles,
        state.currentRound.votes,
        resolution
      )

      const updatedScores = accumulateScores(state.scores, roundScores)

      const completedRound = {
        ...state.currentRound,
        eliminatedPlayerId: resolution.eliminatedPlayerId,
        imposterWon: resolution.imposterWon,
      }

      return {
        state: {
          ...state,
          phase: 'vote_result',
          scores: state.settings.trackScores ? updatedScores : state.scores,
          currentRound: completedRound,
          completedRounds: [...state.completedRounds, completedRound],
        },
      }
    }

    // ─── QUICK_VERDICT ───────────────────────────────────────────────────────
    case 'QUICK_VERDICT': {
      if (state.phase !== 'discussion' || !state.currentRound) {
        return {
          state,
          error: 'Quick verdict is only available during discussion.',
        }
      }

      const { imposterCaught } = action.payload
      const imposterWon = !imposterCaught

      const imposterRole = state.currentRound.roles.find(r => r.role === 'imposter')
      const eliminatedPlayerId = imposterCaught ? imposterRole?.playerId : undefined

      const resolution: VoteResolution = {
        tallies: [],
        maxVotes: 0,
        isTie: false,
        tiedPlayerIds: [],
        eliminatedPlayerId,
        imposterWon,
      }

      const roundScores = calculateRoundScores(
        state.players,
        state.currentRound.roles,
        [],
        resolution
      )

      const updatedScores = accumulateScores(state.scores, roundScores)

      const completedRound = {
        ...state.currentRound,
        eliminatedPlayerId,
        imposterWon,
      }

      return {
        state: {
          ...state,
          phase: 'round_result',
          scores: state.settings.trackScores ? updatedScores : state.scores,
          currentRound: completedRound,
          completedRounds: [...state.completedRounds, completedRound],
        },
      }
    }

    // ─── SKIP_WORD ───────────────────────────────────────────────────────────
    case 'SKIP_WORD': {
      if (
        (state.phase !== 'role_reveal' && state.phase !== 'discussion') ||
        !state.currentRound
      ) {
        return {
          state,
          error: 'Word can only be skipped during role_reveal or discussion phase.',
        }
      }

      const newWord = skipCurrentWord(
        action.payload.allWords,
        state.settings.enabledCategories,
        state.currentRound.word.id,
        state.usedWordIds
      )

      if (!newWord) {
        return {
          state,
          error: 'No alternative word available in selected categories to skip to.',
        }
      }

      const updatedRoles = updateRolesForNewWord(
        state.currentRound.roles,
        newWord,
        state.settings.imposterMode
      )

      return {
        state: {
          ...state,
          usedWordIds: [...state.usedWordIds, newWord.id],
          currentRound: {
            ...state.currentRound,
            word: newWord,
            roles: updatedRoles,
          },
        },
      }
    }

    // ─── NEXT_ROUND ──────────────────────────────────────────────────────────
    case 'NEXT_ROUND': {
      if (
        state.phase !== 'vote_result' &&
        state.phase !== 'round_result' &&
        state.phase !== 'next_round'
      ) {
        return {
          state,
          error: 'Cannot start next round before concluding current round.',
        }
      }

      // Check if session reached roundCount limit
      const currentRoundNumber = state.completedRounds.length
      if (
        state.settings.roundCount > 0 &&
        currentRoundNumber >= state.settings.roundCount
      ) {
        return {
          state: {
            ...state,
            phase: 'game_over',
          },
        }
      }

      // Automatically initialize next round
      return gameReducer(
        {
          ...state,
          phase: 'next_round',
          currentRound: undefined,
        },
        {
          type: 'START_GAME',
          payload: { allWords: action.payload.allWords },
        }
      )
    }

    // ─── RESTART_GAME ────────────────────────────────────────────────────────
    case 'RESTART_GAME': {
      return {
        state: createInitialState(state.players, state.settings),
      }
    }

    // ─── CANCEL_GAME ─────────────────────────────────────────────────────────
    case 'CANCEL_GAME': {
      return {
        state: {
          ...state,
          phase: 'setup',
          currentRound: undefined,
        },
      }
    }

    default:
      return { state }
  }
}
