import type { ScoreEntry, Player, PlayerRole, Vote, VoteResolution } from '../types'

export const POINTS_IMPOSTER_VICTORY = 3
export const POINTS_REGULAR_VICTORY = 2
export const POINTS_CORRECT_VOTE_BONUS = 1

/**
 * Calculates scores earned in a completed round.
 */
export function calculateRoundScores(
  players: Player[],
  roles: PlayerRole[],
  votes: Vote[],
  resolution: VoteResolution
): ScoreEntry[] {
  const imposterIds = new Set(roles.filter(r => r.role === 'imposter').map(r => r.playerId))

  return players.map(player => {
    let earned = 0
    const isImposter = imposterIds.has(player.id)

    if (resolution.imposterWon) {
      // Imposter won the round
      if (isImposter) {
        earned += POINTS_IMPOSTER_VICTORY
      }
    } else {
      // Regular players won the round
      if (!isImposter) {
        earned += POINTS_REGULAR_VICTORY

        // Bonus for voting for the eliminated imposter
        const playerVote = votes.find(v => v.voterId === player.id)
        if (
          playerVote &&
          resolution.eliminatedPlayerId &&
          playerVote.targetId === resolution.eliminatedPlayerId
        ) {
          earned += POINTS_CORRECT_VOTE_BONUS
        }
      }
    }

    return {
      playerId: player.id,
      points: earned,
    }
  })
}

/**
 * Accumulates new round scores into total session scores.
 */
export function accumulateScores(
  currentScores: ScoreEntry[],
  roundScores: ScoreEntry[]
): ScoreEntry[] {
  const map: Record<string, number> = {}

  currentScores.forEach(entry => {
    map[entry.playerId] = (map[entry.playerId] || 0) + entry.points
  })

  roundScores.forEach(entry => {
    map[entry.playerId] = (map[entry.playerId] || 0) + entry.points
  })

  return Object.entries(map).map(([playerId, points]) => ({
    playerId,
    points,
  }))
}

/**
 * Returns a leaderboard sorted by highest score first.
 */
export function getLeaderboard(
  players: Player[],
  scores: ScoreEntry[]
): { player: Player; points: number; rank: number }[] {
  const scoreMap = new Map(scores.map(s => [s.playerId, s.points]))

  const ranked = players
    .map(p => ({
      player: p,
      points: scoreMap.get(p.id) || 0,
    }))
    .sort((a, b) => b.points - a.points)

  return ranked.map((item, idx) => ({
    ...item,
    rank: idx + 1,
  }))
}
