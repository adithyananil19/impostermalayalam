import type { Vote, VoteTally, VoteResolution, PlayerRole, Player } from '../types'

/**
 * Validates whether a vote can be submitted.
 * - Voter must be an active eligible player.
 * - Target must be an active eligible player.
 * - Voter cannot vote more than once in the same voting round.
 */
export function validateVote(
  voterId: string,
  targetId: string,
  existingVotes: Vote[],
  eligiblePlayers: Player[]
): { isValid: boolean; error?: string } {
  const eligibleIds = new Set(eligiblePlayers.map(p => p.id))

  if (!eligibleIds.has(voterId)) {
    return { isValid: false, error: 'Voter is not an active player in this game.' }
  }

  if (!eligibleIds.has(targetId)) {
    return { isValid: false, error: 'Vote target is not an eligible player in this game.' }
  }

  const alreadyVoted = existingVotes.some(v => v.voterId === voterId)
  if (alreadyVoted) {
    return { isValid: false, error: 'Player has already submitted a vote for this round.' }
  }

  return { isValid: true }
}

/**
 * Tallies a list of votes and returns sorted results.
 */
export function tallyVotes(votes: Vote[], allPlayers: Player[]): VoteTally[] {
  const counts: Record<string, number> = {}

  allPlayers.forEach(p => {
    counts[p.id] = 0
  })

  votes.forEach(v => {
    counts[v.targetId] = (counts[v.targetId] || 0) + 1
  })

  return allPlayers
    .map(p => ({
      targetId: p.id,
      count: counts[p.id] || 0,
    }))
    .sort((a, b) => b.count - a.count)
}

/**
 * Resolves the final outcome of voting:
 * - Detects vote ties explicitly.
 * - Determines eliminated player (if any).
 * - Evaluates victory condition:
 *   Regular players win ONLY if all imposters are successfully identified & eliminated.
 *   Default imposter victory occurs if:
 *     - Votes result in a tie (no majority winner).
 *     - An innocent regular player is eliminated.
 *     - Not all required imposters have been eliminated.
 */
export function resolveVotes(
  votes: Vote[],
  players: Player[],
  roles: PlayerRole[]
): VoteResolution {
  const tallies = tallyVotes(votes, players)

  if (tallies.length === 0 || tallies[0].count === 0) {
    return {
      tallies,
      maxVotes: 0,
      isTie: true,
      tiedPlayerIds: players.map(p => p.id),
      eliminatedPlayerId: undefined,
      imposterWon: true,
    }
  }

  const maxVotes = tallies[0].count
  const topCandidates = tallies.filter(t => t.count === maxVotes)
  const isTie = topCandidates.length > 1
  const tiedPlayerIds = topCandidates.map(t => t.targetId)

  // In case of a tie, no single candidate is eliminated
  if (isTie) {
    return {
      tallies,
      maxVotes,
      isTie: true,
      tiedPlayerIds,
      eliminatedPlayerId: undefined,
      imposterWon: true, // Imposter wins on vote deadlock
    }
  }

  // Clear single elimination candidate
  const eliminatedPlayerId = topCandidates[0].targetId

  // Determine if the eliminated player is an imposter
  const imposterIds = new Set(
    roles.filter(r => r.role === 'imposter').map(r => r.playerId)
  )

  const eliminatedIsImposter = imposterIds.has(eliminatedPlayerId)

  // In standard single-elimination mode:
  // If only 1 imposter exists and was eliminated, players win (imposterWon = false).
  // If multiple imposters exist, all must be eliminated.
  const imposterWon = !eliminatedIsImposter || imposterIds.size > 1

  return {
    tallies,
    maxVotes,
    isTie: false,
    tiedPlayerIds: [],
    eliminatedPlayerId,
    imposterWon,
  }
}
