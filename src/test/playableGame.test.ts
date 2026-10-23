import { describe, it, expect } from 'vitest'
import { gameReducer, createInitialState } from '../game/stateMachine'
import { INITIAL_WORDS } from '../data/words'
import type { Player, GameSettings } from '../types'
import { DEFAULT_SETTINGS } from '../types'
import { getLeaderboard } from '../game/scoring'
import { tallyVotes } from '../game/voting'
import { DEFAULT_CATEGORIES } from '../data/categories'

const ALL_CATEGORY_IDS = DEFAULT_CATEGORIES.map(c => c.id)

function makePlayers(count: number): Player[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `p-${i + 1}`,
    name: `Player ${i + 1}`,
  }))
}

describe('Phase 3: Playable Game Integration Tests', () => {
  describe('Full 3-Player Playthrough (Minimum Players) with Formal Voting', () => {
    it('executes a complete game loop from setup through voting to results and score', () => {
      const players = makePlayers(3)
      const settings: GameSettings = {
        ...DEFAULT_SETTINGS,
        enabledCategories: ALL_CATEGORY_IDS,
        gameMode: 'single',
        imposterCount: 1,
        timerEnabled: true,
        timerSeconds: 60,
      }

      // 1. Initial setup
      let state = createInitialState(players, settings)
      expect(state.phase).toBe('setup')
      expect(state.players).toHaveLength(3)

      // 2. Start game -> role_reveal
      let res = gameReducer(state, { type: 'START_GAME', payload: { allWords: INITIAL_WORDS } })
      expect(res.error).toBeUndefined()
      state = res.state
      expect(state.phase).toBe('role_reveal')
      expect(state.currentRound).toBeDefined()
      expect(state.currentRound?.revealIndex).toBe(0)

      // 3. Pass-the-phone: Player 1, 2, 3 reveal their roles
      for (let i = 0; i < 3; i++) {
        expect(state.currentRound?.revealIndex).toBe(i)
        res = gameReducer(state, { type: 'ADVANCE_REVEAL' })
        expect(res.error).toBeUndefined()
        state = res.state
      }

      // After last player advances, phase moves to discussion
      expect(state.phase).toBe('discussion')

      // 4. Discussion to Voting
      res = gameReducer(state, { type: 'START_VOTING' })
      expect(res.error).toBeUndefined()
      state = res.state
      expect(state.phase).toBe('voting')

      // Find the imposter
      const imposterRole = state.currentRound?.roles.find(r => r.role === 'imposter')!
      expect(imposterRole).toBeDefined()
      const regularRoles = state.currentRound?.roles.filter(r => r.role === 'regular')!
      expect(regularRoles).toHaveLength(2)

      // 5. Pass-the-phone Voting: Each player casts a vote
      // Regular players vote for the imposter; imposter votes for a regular
      res = gameReducer(state, {
        type: 'SUBMIT_VOTE',
        payload: { voterId: regularRoles[0].playerId, targetId: imposterRole.playerId },
      })
      expect(res.error).toBeUndefined()
      state = res.state

      res = gameReducer(state, {
        type: 'SUBMIT_VOTE',
        payload: { voterId: regularRoles[1].playerId, targetId: imposterRole.playerId },
      })
      expect(res.error).toBeUndefined()
      state = res.state

      res = gameReducer(state, {
        type: 'SUBMIT_VOTE',
        payload: { voterId: imposterRole.playerId, targetId: regularRoles[0].playerId },
      })
      expect(res.error).toBeUndefined()
      state = res.state

      expect(state.currentRound?.votes).toHaveLength(3)

      // 6. Finish voting -> vote_result
      res = gameReducer(state, { type: 'FINISH_VOTING' })
      expect(res.error).toBeUndefined()
      state = res.state
      expect(state.phase).toBe('vote_result')
      expect(state.currentRound?.eliminatedPlayerId).toBe(imposterRole.playerId)
      expect(state.currentRound?.imposterWon).toBe(false)
      expect(state.completedRounds).toHaveLength(1)

      // Verify vote tally
      const tallies = tallyVotes(state.currentRound!.votes, state.players)
      const imposterTally = tallies.find(t => t.targetId === imposterRole.playerId)
      expect(imposterTally?.count).toBe(2)

      // Verify leaderboard
      const leaderboard = getLeaderboard(state.players, state.scores)
      expect(leaderboard).toHaveLength(3)
    })
  })

  describe('Full 4-Player Playthrough with Quick Verdict (Consensus)', () => {
    it('handles quick verdict: imposter caught', () => {
      const players = makePlayers(4)
      const settings: GameSettings = {
        ...DEFAULT_SETTINGS,
        enabledCategories: ALL_CATEGORY_IDS,
      }
      let state = createInitialState(players, settings)

      state = gameReducer(state, {
        type: 'START_GAME',
        payload: { allWords: INITIAL_WORDS },
      }).state

      // Fast reveal
      for (let i = 0; i < 4; i++) {
        state = gameReducer(state, { type: 'ADVANCE_REVEAL' }).state
      }
      expect(state.phase).toBe('discussion')

      // Group agrees they caught the imposter
      const res = gameReducer(state, {
        type: 'QUICK_VERDICT',
        payload: { imposterCaught: true },
      })
      expect(res.error).toBeUndefined()
      state = res.state
      expect(state.phase).toBe('round_result')
      expect(state.currentRound?.imposterWon).toBe(false)
      expect(state.completedRounds).toHaveLength(1)

      const imposter = state.currentRound?.roles.find(r => r.role === 'imposter')
      expect(state.currentRound?.eliminatedPlayerId).toBe(imposter?.playerId)
    })

    it('handles quick verdict: imposter got away', () => {
      const players = makePlayers(4)
      const settings: GameSettings = {
        ...DEFAULT_SETTINGS,
        enabledCategories: ALL_CATEGORY_IDS,
      }
      let state = createInitialState(players, settings)

      state = gameReducer(state, {
        type: 'START_GAME',
        payload: { allWords: INITIAL_WORDS },
      }).state

      for (let i = 0; i < 4; i++) {
        state = gameReducer(state, { type: 'ADVANCE_REVEAL' }).state
      }

      const res = gameReducer(state, {
        type: 'QUICK_VERDICT',
        payload: { imposterCaught: false },
      })
      expect(res.error).toBeUndefined()
      state = res.state
      expect(state.phase).toBe('round_result')
      expect(state.currentRound?.imposterWon).toBe(true)
      expect(state.currentRound?.eliminatedPlayerId).toBeUndefined()
    })
  })

  describe('Full 10-Player Multi-Round Session (3 Rounds)', () => {
    it('progresses through 3 complete rounds and accumulates points', () => {
      const players = makePlayers(10)
      const settings: GameSettings = {
        ...DEFAULT_SETTINGS,
        enabledCategories: ALL_CATEGORY_IDS,
        gameMode: 'multi',
        roundCount: 3,
        trackScores: true,
        imposterCount: 2,
      }

      let state = createInitialState(players, settings)

      // Round 1
      state = gameReducer(state, { type: 'START_GAME', payload: { allWords: INITIAL_WORDS } }).state
      expect(state.phase).toBe('role_reveal')
      expect(state.currentRound?.roundNumber).toBe(1)
      expect(state.currentRound?.roles.filter(r => r.role === 'imposter')).toHaveLength(2)

      // Fast reveal all 10 players
      for (let i = 0; i < 10; i++) {
        state = gameReducer(state, { type: 'ADVANCE_REVEAL' }).state
      }
      expect(state.phase).toBe('discussion')

      // Quick verdict for round 1: imposter caught
      state = gameReducer(state, { type: 'QUICK_VERDICT', payload: { imposterCaught: true } }).state
      expect(state.phase).toBe('round_result')
      expect(state.completedRounds).toHaveLength(1)

      // Round 2
      let nextRes = gameReducer(state, { type: 'NEXT_ROUND', payload: { allWords: INITIAL_WORDS } })
      expect(nextRes.error).toBeUndefined()
      state = nextRes.state
      expect(state.phase).toBe('role_reveal')
      expect(state.currentRound?.roundNumber).toBe(2)

      for (let i = 0; i < 10; i++) {
        state = gameReducer(state, { type: 'ADVANCE_REVEAL' }).state
      }
      expect(state.phase).toBe('discussion')

      // Quick verdict for round 2: imposter got away
      state = gameReducer(state, { type: 'QUICK_VERDICT', payload: { imposterCaught: false } }).state
      expect(state.completedRounds).toHaveLength(2)

      // Round 3
      nextRes = gameReducer(state, { type: 'NEXT_ROUND', payload: { allWords: INITIAL_WORDS } })
      expect(nextRes.error).toBeUndefined()
      state = nextRes.state
      expect(state.phase).toBe('role_reveal')
      expect(state.currentRound?.roundNumber).toBe(3)

      for (let i = 0; i < 10; i++) {
        state = gameReducer(state, { type: 'ADVANCE_REVEAL' }).state
      }
      expect(state.phase).toBe('discussion')

      // Quick verdict for round 3: imposter caught
      state = gameReducer(state, { type: 'QUICK_VERDICT', payload: { imposterCaught: true } }).state
      expect(state.completedRounds).toHaveLength(3)

      // Calling NEXT_ROUND after round 3 finishes session -> game_over
      nextRes = gameReducer(state, { type: 'NEXT_ROUND', payload: { allWords: INITIAL_WORDS } })
      expect(nextRes.state.phase).toBe('game_over')

      // Leaderboard contains all 10 players with non-negative scores
      const leaderboard = getLeaderboard(nextRes.state.players, nextRes.state.scores)
      expect(leaderboard).toHaveLength(10)
      leaderboard.forEach(entry => {
        expect(entry.points).toBeGreaterThanOrEqual(0)
      })
      // Sorted descending
      for (let i = 0; i < leaderboard.length - 1; i++) {
        expect(leaderboard[i].points).toBeGreaterThanOrEqual(leaderboard[i + 1].points)
      }
    })
  })

  describe('Full 20-Player Playthrough (Maximum Scale)', () => {
    it('smoothly scales to 20 players without errors or performance issues', () => {
      const players = makePlayers(20)
      const settings: GameSettings = {
        ...DEFAULT_SETTINGS,
        enabledCategories: ALL_CATEGORY_IDS,
        gameMode: 'single',
        imposterCount: 3,
        trackScores: true,
      }

      let state = createInitialState(players, settings)
      state = gameReducer(state, { type: 'START_GAME', payload: { allWords: INITIAL_WORDS } }).state

      expect(state.currentRound?.roles.filter(r => r.role === 'imposter')).toHaveLength(3)
      expect(state.currentRound?.roles.filter(r => r.role === 'regular')).toHaveLength(17)

      // Reveal all 20 players
      for (let i = 0; i < 20; i++) {
        expect(state.currentRound?.revealIndex).toBe(i)
        state = gameReducer(state, { type: 'ADVANCE_REVEAL' }).state
      }
      expect(state.phase).toBe('discussion')

      // Start voting
      state = gameReducer(state, { type: 'START_VOTING' }).state
      expect(state.phase).toBe('voting')

      // All 20 players cast votes
      const targetId = players[0].id
      players.forEach(voter => {
        const res = gameReducer(state, {
          type: 'SUBMIT_VOTE',
          payload: { voterId: voter.id, targetId },
        })
        expect(res.error).toBeUndefined()
        state = res.state
      })
      expect(state.currentRound?.votes).toHaveLength(20)

      // Finish voting
      state = gameReducer(state, { type: 'FINISH_VOTING' }).state
      expect(state.phase).toBe('vote_result')
      expect(state.currentRound?.eliminatedPlayerId).toBe(targetId)

      // Check tallies
      const tallies = tallyVotes(state.currentRound!.votes, state.players)
      const topTally = tallies.find(t => t.targetId === targetId)
      expect(topTally?.count).toBe(20)

      const leaderboard = getLeaderboard(state.players, state.scores)
      expect(leaderboard).toHaveLength(20)
    })
  })

  describe('Skip Word & Error Handling in Round', () => {
    it('allows host to skip word during discussion and updates roles with new word', () => {
      const players = makePlayers(4)
      const settings: GameSettings = {
        ...DEFAULT_SETTINGS,
        enabledCategories: ALL_CATEGORY_IDS,
      }
      let state = createInitialState(players, settings)
      state = gameReducer(state, { type: 'START_GAME', payload: { allWords: INITIAL_WORDS } }).state

      const originalWord = state.currentRound?.word

      for (let i = 0; i < 4; i++) {
        state = gameReducer(state, { type: 'ADVANCE_REVEAL' }).state
      }
      expect(state.phase).toBe('discussion')

      // Skip word
      const skipRes = gameReducer(state, {
        type: 'SKIP_WORD',
        payload: { allWords: INITIAL_WORDS },
      })
      expect(skipRes.error).toBeUndefined()
      state = skipRes.state

      expect(state.currentRound?.word.id).not.toBe(originalWord?.id)
      expect(state.phase).toBe('discussion')
    })
  })
})
