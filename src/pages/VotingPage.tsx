import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageLayout from '../components/PageLayout'
import Button from '../components/Button'
import { useGame } from '../hooks/useGame'
import styles from './VotingPage.module.css'

export default function VotingPage() {
  const navigate = useNavigate()
  const { state, submitVote, finishVoting } = useGame()

  const players = state.players
  const currentRound = state.currentRound

  // Index of which player is currently holding the phone to cast their vote
  const [voterIndex, setVoterIndex] = useState(0)
  const [selectedTargetId, setSelectedTargetId] = useState<string | null>(null)
  const [hasConfirmed, setHasConfirmed] = useState(false)
  const [voteError, setVoteError] = useState<string | null>(null)

  // Guard against missing game state
  if (!currentRound || players.length === 0) {
    return (
      <PageLayout centered>
        <div className={styles.submitted}>
          <h2 className={styles.heading}>No Active Game</h2>
          <Button variant="primary" size="lg" onClick={() => navigate('/new-game')}>
            Setup New Game
          </Button>
        </div>
      </PageLayout>
    )
  }

  const currentVoter = players[voterIndex]
  const isLastVoter = voterIndex + 1 >= players.length

  function handleConfirmVote() {
    if (!selectedTargetId || !currentVoter) return

    setVoteError(null)
    const result = submitVote(currentVoter.id, selectedTargetId)
    if (!result.success) {
      setVoteError(result.error || 'Failed to submit vote.')
      return
    }

    setHasConfirmed(true)
  }

  function handlePassToNext() {
    setSelectedTargetId(null)
    setHasConfirmed(false)
    setVoteError(null)

    if (isLastVoter) {
      // All players voted: finish voting and navigate to results!
      const finishResult = finishVoting()
      if (finishResult.success) {
        navigate('/results')
      } else {
        setVoteError(finishResult.error || 'Failed to tally votes.')
      }
    } else {
      setVoterIndex(i => i + 1)
    }
  }

  // Intermediary "Pass to next voter" privacy screen
  if (hasConfirmed) {
    const nextVoter = players[voterIndex + 1]
    return (
      <PageLayout centered>
        <div className={styles.submitted}>
          <div className={styles.submitIcon}>✓</div>
          <h2 className={styles.heading}>Vote Recorded!</h2>
          <p className={styles.submitText}>
            {isLastVoter
              ? 'All players have submitted their votes. Ready to reveal the outcome!'
              : `Pass the phone to ${nextVoter?.name} to cast their vote.`}
          </p>
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={handlePassToNext}
          >
            {isLastVoter ? 'Reveal Final Results →' : `Hand Phone to ${nextVoter?.name} →`}
          </Button>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout
      footer={
        <div className={styles.footerActions}>
          {voteError && <p className={styles.errorText}>⚠️ {voteError}</p>}
          <Button
            variant="primary"
            size="lg"
            fullWidth
            disabled={!selectedTargetId}
            onClick={handleConfirmVote}
          >
            Confirm Vote as {currentVoter.name}
          </Button>
        </div>
      }
    >
      <div className={styles.intro}>
        <div className={styles.stepBadge}>
          Voting {voterIndex + 1} of {players.length}
        </div>
        <div className={styles.voterBox}>
          <span className={styles.voterLabel}>Current Voter</span>
          <h2 className={styles.voterName}>{currentVoter.name}</h2>
        </div>
        <p className={styles.sub}>
          Who do you believe is the imposter? Select one player.
        </p>
      </div>

      <ul className={styles.list}>
        {players.map(p => {
          const isSelected = selectedTargetId === p.id
          const isSelf = p.id === currentVoter.id

          return (
            <li key={p.id}>
              <button
                type="button"
                className={[styles.playerBtn, isSelected ? styles.selected : ''].filter(Boolean).join(' ')}
                onClick={() => setSelectedTargetId(p.id)}
                aria-pressed={isSelected}
              >
                <span className={styles.avatar}>{p.name[0]}</span>
                <div className={styles.playerInfo}>
                  <span className={styles.playerName}>{p.name}</span>
                  {isSelf && <span className={styles.selfTag}>(You)</span>}
                </div>
                {isSelected && (
                  <span className={styles.check} aria-hidden="true">
                    <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
                      <path
                        d="M3 8L6.5 11.5L13 5"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                )}
              </button>
            </li>
          )
        })}
      </ul>
    </PageLayout>
  )
}
