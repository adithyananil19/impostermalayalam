import { describe, it, expect } from 'vitest'
import {
  validatePlayers,
  validateImposterCount,
  validateGameConfig,
  selectSecretWord,
  skipCurrentWord,
  assignRoles,
  updateRolesForNewWord,
  getPlayerPrivateInfo,
  validateVote,
  tallyVotes,
  resolveVotes,
  calculateRoundScores,
  accumulateScores,
  getLeaderboard,
  createInitialState,
  gameReducer,
} from '../game'
import { INITIAL_WORDS } from '../data/words'
import { DEFAULT_SETTINGS } from '../types'
import type { Player, WordEntry, GameSettings } from '../types'

const MOCK_PLAYERS: Player[] = [
  { id: 'p1', name: 'Rahul' },
  { id: 'p2', name: 'Anjali' },
  { id: 'p3', name: 'Sneha' },
  { id: 'p4', name: 'Akhil' },
]

const SAMPLE_WORD: WordEntry = {
  id: 'test-001',
  word: 'Porotta',
  hint: 'Layered addiction',
  relatedWord: 'Beef fry',
  category: 'food-bakery',
}

describe('PHASE 2 — Game Engine & Rules Unit Tests', () => {
  // ─── 1. Player Validation Tests ──────────────────────────────────────────
  describe('Player validation', () => {
    it('accepts valid 4-player configuration', () => {
      const res = validatePlayers(MOCK_PLAYERS)
      expect(res.isValid).toBe(true)
      expect(res.errors).toHaveLength(0)
    })

    it('rejects less than 3 players', () => {
      const res = validatePlayers([
        { id: 'p1', name: 'Rahul' },
        { id: 'p2', name: 'Anjali' },
      ])
      expect(res.isValid).toBe(false)
      expect(res.errors[0]).toMatch(/at least 3 players/i)
    })

    it('rejects more than 20 players', () => {
      const tooMany: Player[] = Array.from({ length: 21 }, (_, i) => ({
        id: `p${i + 1}`,
        name: `Player ${i + 1}`,
      }))
      const res = validatePlayers(tooMany)
      expect(res.isValid).toBe(false)
      expect(res.errors[0]).toMatch(/maximum 20 players/i)
    })

    it('rejects empty or whitespace-only player names', () => {
      const res = validatePlayers([
        { id: 'p1', name: 'Rahul' },
        { id: 'p2', name: '   ' },
        { id: 'p3', name: 'Sneha' },
      ])
      expect(res.isValid).toBe(false)
      expect(res.errors.some(e => e.includes('empty name'))).toBe(true)
    })

    it('rejects duplicate player names (case-insensitive)', () => {
      const res = validatePlayers([
        { id: 'p1', name: 'Rahul' },
        { id: 'p2', name: 'rahul' },
        { id: 'p3', name: 'Sneha' },
      ])
      expect(res.isValid).toBe(false)
      expect(res.errors.some(e => e.includes('Duplicate player name'))).toBe(true)
    })

    it('rejects duplicate player IDs', () => {
      const res = validatePlayers([
        { id: 'dup-id', name: 'Rahul' },
        { id: 'dup-id', name: 'Anjali' },
        { id: 'p3', name: 'Sneha' },
      ])
      expect(res.isValid).toBe(false)
      expect(res.errors.some(e => e.includes('Duplicate player ID'))).toBe(true)
    })

    it('validateGameConfig validates full configuration and categories', () => {
      const validConfig = validateGameConfig(MOCK_PLAYERS, {
        ...DEFAULT_SETTINGS,
        enabledCategories: ['food-bakery'],
      }, INITIAL_WORDS)
      expect(validConfig.isValid).toBe(true)

      const invalidCategories = validateGameConfig(MOCK_PLAYERS, {
        ...DEFAULT_SETTINGS,
        enabledCategories: [],
      }, INITIAL_WORDS)
      expect(invalidCategories.isValid).toBe(false)
      expect(invalidCategories.errors.some(e => e.includes('At least one word category'))).toBe(true)
    })
  })

  // ─── 2. Imposter Count Validation ────────────────────────────────────────
  describe('Imposter count validation', () => {
    it('accepts 1 imposter for 4 players', () => {
      const res = validateImposterCount(4, 1)
      expect(res.isValid).toBe(true)
    })

    it('rejects 0 imposters', () => {
      const res = validateImposterCount(4, 0)
      expect(res.isValid).toBe(false)
      expect(res.errors[0]).toMatch(/at least 1 imposter/i)
    })

    it('rejects impossible configuration where imposterCount >= playerCount', () => {
      const res = validateImposterCount(3, 3)
      expect(res.isValid).toBe(false)
      expect(res.errors.some(e => e.includes('Impossible configuration'))).toBe(true)
    })

    it('rejects disproportionately high imposter count', () => {
      // 4 players with 2 imposters exceeds Math.floor((4 - 1) / 2) = 1
      const res = validateImposterCount(4, 2)
      expect(res.isValid).toBe(false)
      expect(res.errors.some(e => e.includes('Too many imposters'))).toBe(true)
    })
  })

  // ─── 3. Secret Word Selection & Category Restrictions ───────────────────
  describe('Secret word selection & Category restrictions', () => {
    it('selects a word only from enabled categories', () => {
      const enabled = ['college-life']
      const word = selectSecretWord(INITIAL_WORDS, enabled)
      expect(word).not.toBeNull()
      expect(word?.category).toBe('college-life')
    })

    it('returns null if enabled categories have no words', () => {
      const word = selectSecretWord(INITIAL_WORDS, ['non-existent-category'])
      expect(word).toBeNull()
    })

    it('avoids used words in session when alternatives exist', () => {
      const collegeWords = INITIAL_WORDS.filter(w => w.category === 'college-life')
      const firstWordId = collegeWords[0].id

      const nextWord = selectSecretWord(INITIAL_WORDS, ['college-life'], [firstWordId])
      expect(nextWord).not.toBeNull()
      expect(nextWord?.id).not.toBe(firstWordId)
    })

    it('recycles word pool when all words in category have been used', () => {
      const allCollegeIds = INITIAL_WORDS.filter(w => w.category === 'college-life').map(w => w.id)
      const recycledWord = selectSecretWord(INITIAL_WORDS, ['college-life'], allCollegeIds)
      expect(recycledWord).not.toBeNull()
      expect(recycledWord?.category).toBe('college-life')
    })

    it('skips current word and selects a different valid word', () => {
      const current = INITIAL_WORDS.find(w => w.category === 'food-bakery')!
      const skipped = skipCurrentWord(INITIAL_WORDS, ['food-bakery'], current.id)
      expect(skipped).not.toBeNull()
      expect(skipped?.id).not.toBe(current.id)
      expect(skipped?.category).toBe('food-bakery')
    })
  })

  // ─── 4. Imposter Role Assignment & Information Modes ─────────────────────
  describe('Imposter assignment & Information modes', () => {
    it('assigns exact number of imposters', () => {
      const roles = assignRoles(MOCK_PLAYERS, 1, SAMPLE_WORD, 'vague_hint')
      const imposters = roles.filter(r => r.role === 'imposter')
      const regulars = roles.filter(r => r.role === 'regular')

      expect(imposters).toHaveLength(1)
      expect(regulars).toHaveLength(3)
    })

    it('supports 2 imposters for larger groups', () => {
      const eightPlayers: Player[] = Array.from({ length: 8 }, (_, i) => ({
        id: `p${i + 1}`,
        name: `Player ${i + 1}`,
      }))

      const roles = assignRoles(eightPlayers, 2, SAMPLE_WORD, 'vague_hint')
      expect(roles.filter(r => r.role === 'imposter')).toHaveLength(2)
      expect(roles.filter(r => r.role === 'regular')).toHaveLength(6)
    })

    it('Mode 1 (no_word): imposter receives empty string', () => {
      const roles = assignRoles(MOCK_PLAYERS, 1, SAMPLE_WORD, 'no_word')
      const imposter = roles.find(r => r.role === 'imposter')!
      const regular = roles.find(r => r.role === 'regular')!

      expect(imposter.displayInfo).toBe('')
      expect(regular.displayInfo).toBe('Porotta')
    })

    it('Mode 2 (vague_hint): imposter receives vague hint', () => {
      const roles = assignRoles(MOCK_PLAYERS, 1, SAMPLE_WORD, 'vague_hint')
      const imposter = roles.find(r => r.role === 'imposter')!
      const regular = roles.find(r => r.role === 'regular')!

      expect(imposter.displayInfo).toBe('Layered addiction')
      expect(regular.displayInfo).toBe('Porotta')
    })

    it('Mode 3 (category_reveal): imposter receives category name', () => {
      const roles = assignRoles(MOCK_PLAYERS, 1, SAMPLE_WORD, 'category_reveal')
      const imposter = roles.find(r => r.role === 'imposter')!
      const regular = roles.find(r => r.role === 'regular')!

      expect(imposter.displayInfo).toBe('Food & Bakery')
      expect(regular.displayInfo).toBe('Porotta')
    })

    it('updateRolesForNewWord updates display info while strictly preserving roles', () => {
      const roles = assignRoles(MOCK_PLAYERS, 1, SAMPLE_WORD, 'vague_hint')
      const originalImposterId = roles.find(r => r.role === 'imposter')!.playerId

      const newWord: WordEntry = {
        id: 'new-001',
        word: 'Puttu',
        hint: 'Breakfast tower',
        relatedWord: 'Kadala',
        category: 'food-bakery',
      }

      const updated = updateRolesForNewWord(roles, newWord, 'vague_hint')
      const updatedImposter = updated.find(r => r.role === 'imposter')!
      const updatedRegular = updated.find(r => r.role === 'regular')!

      expect(updatedImposter.playerId).toBe(originalImposterId)
      expect(updatedImposter.displayInfo).toBe('Breakfast tower')
      expect(updatedRegular.displayInfo).toBe('Puttu')
    })

    it('getPlayerPrivateInfo returns role & info for the requested player only', () => {
      const roles = assignRoles(MOCK_PLAYERS, 1, SAMPLE_WORD, 'vague_hint')
      const info = getPlayerPrivateInfo(roles, 'p1')
      expect(info).not.toBeNull()
      expect(['regular', 'imposter']).toContain(info?.role)
      expect(getPlayerPrivateInfo(roles, 'unknown-id')).toBeNull()
    })
  })

  // ─── 5. Voting Rules, Ties, Elimination & Victory ────────────────────────
  describe('Voting rules, Ties & Victory conditions', () => {
    it('validates legitimate votes', () => {
      const validation = validateVote('p1', 'p2', [], MOCK_PLAYERS)
      expect(validation.isValid).toBe(true)
    })

    it('rejects duplicate voting by same voter', () => {
      const existing = [{ voterId: 'p1', targetId: 'p2' }]
      const validation = validateVote('p1', 'p3', existing, MOCK_PLAYERS)
      expect(validation.isValid).toBe(false)
      expect(validation.error).toMatch(/already submitted a vote/i)
    })

    it('rejects votes for non-existent players', () => {
      const validation = validateVote('p1', 'ghost-player', [], MOCK_PLAYERS)
      expect(validation.isValid).toBe(false)
      expect(validation.error).toMatch(/not an eligible player/i)
    })

    it('tallies votes accurately in descending order', () => {
      const votes = [
        { voterId: 'p1', targetId: 'p2' },
        { voterId: 'p3', targetId: 'p2' },
        { voterId: 'p4', targetId: 'p2' },
        { voterId: 'p2', targetId: 'p1' },
      ]
      const tallies = tallyVotes(votes, MOCK_PLAYERS)
      expect(tallies[0]).toEqual({ targetId: 'p2', count: 3 })
      expect(tallies[1]).toEqual({ targetId: 'p1', count: 1 })
      expect(tallies[2].count).toBe(0)
    })

    it('detects vote ties explicitly and awards victory to imposter', () => {
      const roles = [
        { playerId: 'p1', role: 'regular' as const, displayInfo: 'Porotta' },
        { playerId: 'p2', role: 'regular' as const, displayInfo: 'Porotta' },
        { playerId: 'p3', role: 'regular' as const, displayInfo: 'Porotta' },
        { playerId: 'p4', role: 'imposter' as const, displayInfo: 'Beef fry' },
      ]

      // 2 votes for p1, 2 votes for p4 (tied)
      const tiedVotes = [
        { voterId: 'p1', targetId: 'p4' },
        { voterId: 'p2', targetId: 'p4' },
        { voterId: 'p3', targetId: 'p1' },
        { voterId: 'p4', targetId: 'p1' },
      ]

      const resolution = resolveVotes(tiedVotes, MOCK_PLAYERS, roles)
      expect(resolution.isTie).toBe(true)
      expect(resolution.eliminatedPlayerId).toBeUndefined()
      expect(resolution.imposterWon).toBe(true)
    })

    it('declares players victorious when the only imposter is eliminated', () => {
      const roles = [
        { playerId: 'p1', role: 'regular' as const, displayInfo: 'Porotta' },
        { playerId: 'p2', role: 'regular' as const, displayInfo: 'Porotta' },
        { playerId: 'p3', role: 'regular' as const, displayInfo: 'Porotta' },
        { playerId: 'p4', role: 'imposter' as const, displayInfo: 'Beef fry' },
      ]

      // p4 (imposter) gets 3 votes
      const votes = [
        { voterId: 'p1', targetId: 'p4' },
        { voterId: 'p2', targetId: 'p4' },
        { voterId: 'p3', targetId: 'p4' },
        { voterId: 'p4', targetId: 'p1' },
      ]

      const resolution = resolveVotes(votes, MOCK_PLAYERS, roles)
      expect(resolution.isTie).toBe(false)
      expect(resolution.eliminatedPlayerId).toBe('p4')
      expect(resolution.imposterWon).toBe(false) // Players win!
    })

    it('declares imposter victorious when an innocent regular player is eliminated', () => {
      const roles = [
        { playerId: 'p1', role: 'regular' as const, displayInfo: 'Porotta' },
        { playerId: 'p2', role: 'regular' as const, displayInfo: 'Porotta' },
        { playerId: 'p3', role: 'regular' as const, displayInfo: 'Porotta' },
        { playerId: 'p4', role: 'imposter' as const, displayInfo: 'Beef fry' },
      ]

      // p1 (regular) gets 3 votes (wrong accusation)
      const votes = [
        { voterId: 'p1', targetId: 'p4' },
        { voterId: 'p2', targetId: 'p1' },
        { voterId: 'p3', targetId: 'p1' },
        { voterId: 'p4', targetId: 'p1' },
      ]

      const resolution = resolveVotes(votes, MOCK_PLAYERS, roles)
      expect(resolution.eliminatedPlayerId).toBe('p1')
      expect(resolution.imposterWon).toBe(true)
    })

    it('handles multiple imposters: imposter wins if not all imposters are eliminated', () => {
      const roles = [
        { playerId: 'p1', role: 'regular' as const, displayInfo: 'Porotta' },
        { playerId: 'p2', role: 'regular' as const, displayInfo: 'Porotta' },
        { playerId: 'p3', role: 'imposter' as const, displayInfo: 'Beef fry' },
        { playerId: 'p4', role: 'imposter' as const, displayInfo: 'Beef fry' },
      ]

      // p3 gets 3 votes, p1 gets 1 vote -> p3 is eliminated
      const votes = [
        { voterId: 'p1', targetId: 'p3' },
        { voterId: 'p2', targetId: 'p3' },
        { voterId: 'p4', targetId: 'p3' },
        { voterId: 'p3', targetId: 'p1' },
      ]

      const resolution = resolveVotes(votes, MOCK_PLAYERS, roles)
      expect(resolution.eliminatedPlayerId).toBe('p3')
      expect(resolution.imposterWon).toBe(true) // Surviving imposter p4 secures imposter win
    })
  })

  // ─── 6. Scoring Calculations ─────────────────────────────────────────────
  describe('Scoring calculations', () => {
    it('awards points to imposter on imposter victory', () => {
      const roles = [
        { playerId: 'p1', role: 'regular' as const, displayInfo: 'Porotta' },
        { playerId: 'p2', role: 'regular' as const, displayInfo: 'Porotta' },
        { playerId: 'p3', role: 'regular' as const, displayInfo: 'Porotta' },
        { playerId: 'p4', role: 'imposter' as const, displayInfo: 'Beef fry' },
      ]

      const resolution = {
        tallies: [],
        maxVotes: 3,
        isTie: false,
        tiedPlayerIds: [],
        eliminatedPlayerId: 'p1',
        imposterWon: true,
      }

      const scores = calculateRoundScores(MOCK_PLAYERS, roles, [], resolution)
      const p4Score = scores.find(s => s.playerId === 'p4')!
      const p1Score = scores.find(s => s.playerId === 'p1')!

      expect(p4Score.points).toBe(3)
      expect(p1Score.points).toBe(0)
    })

    it('awards victory points and bonus to regular players who voted correctly', () => {
      const roles = [
        { playerId: 'p1', role: 'regular' as const, displayInfo: 'Porotta' },
        { playerId: 'p2', role: 'regular' as const, displayInfo: 'Porotta' },
        { playerId: 'p3', role: 'regular' as const, displayInfo: 'Porotta' },
        { playerId: 'p4', role: 'imposter' as const, displayInfo: 'Beef fry' },
      ]

      const votes = [
        { voterId: 'p1', targetId: 'p4' }, // Voted correctly (+2 +1 = 3)
        { voterId: 'p2', targetId: 'p4' }, // Voted correctly (+2 +1 = 3)
        { voterId: 'p3', targetId: 'p2' }, // Voted wrong player (+2 +0 = 2)
        { voterId: 'p4', targetId: 'p1' }, // Imposter
      ]

      const resolution = {
        tallies: [],
        maxVotes: 2,
        isTie: false,
        tiedPlayerIds: [],
        eliminatedPlayerId: 'p4',
        imposterWon: false,
      }

      const scores = calculateRoundScores(MOCK_PLAYERS, roles, votes, resolution)
      expect(scores.find(s => s.playerId === 'p1')?.points).toBe(3)
      expect(scores.find(s => s.playerId === 'p2')?.points).toBe(3)
      expect(scores.find(s => s.playerId === 'p3')?.points).toBe(2)
      expect(scores.find(s => s.playerId === 'p4')?.points).toBe(0)
    })

    it('accumulates scores across multiple rounds and ranks leaderboard correctly', () => {
      const initialScores = [
        { playerId: 'p1', points: 3 },
        { playerId: 'p2', points: 1 },
      ]
      const roundScores = [
        { playerId: 'p1', points: 2 },
        { playerId: 'p2', points: 5 },
      ]

      const accumulated = accumulateScores(initialScores, roundScores)
      expect(accumulated.find(s => s.playerId === 'p1')?.points).toBe(5)
      expect(accumulated.find(s => s.playerId === 'p2')?.points).toBe(6)

      const leaderboard = getLeaderboard(MOCK_PLAYERS, accumulated)
      expect(leaderboard[0].player.id).toBe('p2')
      expect(leaderboard[0].rank).toBe(1)
      expect(leaderboard[1].player.id).toBe('p1')
      expect(leaderboard[1].rank).toBe(2)
    })
  })

  // ─── 7. State Machine Transitions ────────────────────────────────────────
  describe('State Machine & Phase Transitions', () => {
    const testSettings: GameSettings = {
      ...DEFAULT_SETTINGS,
      roundCount: 3,
      enabledCategories: ['food-bakery'],
    }

    it('completes a full end-to-end game transition flow', () => {
      // 1. Initial setup state
      let state = createInitialState(MOCK_PLAYERS, testSettings)
      expect(state.phase).toBe('setup')

      // 2. Start Game -> role_reveal
      let result = gameReducer(state, {
        type: 'START_GAME',
        payload: { allWords: INITIAL_WORDS },
      })
      expect(result.error).toBeUndefined()
      state = result.state
      expect(state.phase).toBe('role_reveal')
      expect(state.currentRound?.word).toBeDefined()
      expect(state.currentRound?.roles).toHaveLength(4)

      // 3. Advance reveals until discussion
      for (let i = 0; i < MOCK_PLAYERS.length; i++) {
        result = gameReducer(state, { type: 'ADVANCE_REVEAL' })
        state = result.state
      }
      expect(state.phase).toBe('discussion')

      // 4. Start voting -> voting
      result = gameReducer(state, { type: 'START_VOTING' })
      state = result.state
      expect(state.phase).toBe('voting')

      // 5. Submit votes for all players
      const imposterId = state.currentRound!.roles.find(r => r.role === 'imposter')!.playerId
      MOCK_PLAYERS.forEach(p => {
        result = gameReducer(state, {
          type: 'SUBMIT_VOTE',
          payload: { voterId: p.id, targetId: imposterId },
        })
        state = result.state
      })
      expect(state.currentRound?.votes).toHaveLength(4)

      // 6. Finish voting -> vote_result
      result = gameReducer(state, { type: 'FINISH_VOTING' })
      state = result.state
      expect(state.phase).toBe('vote_result')
      expect(state.currentRound?.eliminatedPlayerId).toBe(imposterId)
      expect(state.currentRound?.imposterWon).toBe(false)
      expect(state.completedRounds).toHaveLength(1)

      // 7. Next round transition
      result = gameReducer(state, {
        type: 'NEXT_ROUND',
        payload: { allWords: INITIAL_WORDS },
      })
      state = result.state
      expect(state.phase).toBe('role_reveal')
      expect(state.currentRound?.roundNumber).toBe(2)
    })

    it('transitions to game_over when roundCount limit is reached', () => {
      const singleRoundSettings: GameSettings = {
        ...DEFAULT_SETTINGS,
        roundCount: 1,
        enabledCategories: ['food-bakery'],
      }

      let state = createInitialState(MOCK_PLAYERS, singleRoundSettings)
      state = gameReducer(state, {
        type: 'START_GAME',
        payload: { allWords: INITIAL_WORDS },
      }).state

      // Conclude round via quick verdict
      state = { ...state, phase: 'discussion' }
      state = gameReducer(state, {
        type: 'QUICK_VERDICT',
        payload: { imposterCaught: true },
      }).state

      expect(state.completedRounds).toHaveLength(1)

      // Try next round
      const result = gameReducer(state, {
        type: 'NEXT_ROUND',
        payload: { allWords: INITIAL_WORDS },
      })

      expect(result.state.phase).toBe('game_over')
    })

    it('supports quick verdict bypass directly from discussion', () => {
      let state = createInitialState(MOCK_PLAYERS, testSettings)
      state = gameReducer(state, {
        type: 'START_GAME',
        payload: { allWords: INITIAL_WORDS },
      }).state

      // Skip reveal straight to discussion for test
      state = { ...state, phase: 'discussion' }

      // Imposter got away via quick verdict
      const result = gameReducer(state, {
        type: 'QUICK_VERDICT',
        payload: { imposterCaught: false },
      })

      expect(result.state.phase).toBe('round_result')
      expect(result.state.currentRound?.imposterWon).toBe(true)
      expect(result.state.completedRounds).toHaveLength(1)
    })

    it('rejects invalid state transitions gracefully', () => {
      const state = createInitialState(MOCK_PLAYERS, testSettings)
      const invalidResult = gameReducer(state, { type: 'START_VOTING' })
      expect(invalidResult.error).toMatch(/cannot start voting outside of discussion phase/i)
      expect(invalidResult.state.phase).toBe('setup')
    })

    it('safely handles restart and cancellation', () => {
      let state = createInitialState(MOCK_PLAYERS, testSettings)
      state = gameReducer(state, {
        type: 'START_GAME',
        payload: { allWords: INITIAL_WORDS },
      }).state

      // Cancel game
      const cancelled = gameReducer(state, { type: 'CANCEL_GAME' })
      expect(cancelled.state.phase).toBe('setup')
      expect(cancelled.state.currentRound).toBeUndefined()

      // Restart game
      const restarted = gameReducer(state, { type: 'RESTART_GAME' })
      expect(restarted.state.phase).toBe('setup')
      expect(restarted.state.players).toEqual(MOCK_PLAYERS)
    })
  })
})
