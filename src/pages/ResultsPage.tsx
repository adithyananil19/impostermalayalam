import { useNavigate } from 'react-router-dom'
import PageLayout from '../components/PageLayout'
import Button from '../components/Button'
import Badge from '../components/Badge'
import { useGame } from '../hooks/useGame'
import { tallyVotes } from '../game/voting'
import styles from './ResultsPage.module.css'

export default function ResultsPage() {
  const navigate = useNavigate()
  const { state, nextRound, startGame, restartGame } = useGame()

  const round = state.currentRound || state.completedRounds[state.completedRounds.length - 1]

  if (!round) {
    return (
      <PageLayout centered>
        <div style={{ textAlign: 'center', padding: 'var(--space-6)' }}>
          <p style={{ color: 'var(--clr-text-secondary)', marginBottom: 'var(--space-4)' }}>
            No game results available.
          </p>
          <Button variant="primary" onClick={() => navigate('/players')}>
            Start New Game
          </Button>
        </div>
      </PageLayout>
    )
  }

  const imposterRoles = round.roles.filter(r => r.role === 'imposter')
  const imposterNames = imposterRoles
    .map(r => state.players.find(p => p.id === r.playerId)?.name || 'Unknown')
    .join(', ')

  const secretWord = round.word.word
  const imposterWon = Boolean(round.imposterWon)
  const eliminatedPlayer = state.players.find(p => p.id === round.eliminatedPlayerId)

  const hasVotes = Boolean(round.votes && round.votes.length > 0)
  const tallies = hasVotes ? tallyVotes(round.votes, state.players) : []
  const sortedVotes = tallies
    .map(t => ({
      id: t.targetId,
      name: state.players.find(p => p.id === t.targetId)?.name || 'Unknown',
      count: t.count,
      isEliminated: t.targetId === round.eliminatedPlayerId,
    }))
    .sort((a, b) => b.count - a.count)

  const isMulti = state.settings.gameMode === 'multi' && state.settings.roundCount > 1
  const isFinished = state.settings.roundCount > 0 && state.completedRounds.length >= state.settings.roundCount

  function handleNextRound() {
    if (isMulti && !isFinished) {
      const res = nextRound()
      if (res.success) {
        navigate('/reveal')
      } else {
        navigate('/score')
      }
    } else {
      const res = startGame()
      if (res.success) {
        navigate('/reveal')
      } else {
        navigate('/players')
      }
    }
  }

  function handleHome() {
    restartGame()
    navigate('/')
  }

  return (
    <PageLayout
      footer={
        <div className={styles.footerActions}>
          <Button variant="primary" size="lg" fullWidth onClick={handleNextRound}>
            {isMulti && !isFinished
              ? `Next Round (${state.completedRounds.length + 1} of ${state.settings.roundCount}) →`
              : 'Play Again'}
          </Button>
          {(isMulti || state.settings.trackScores) && (
            <Button variant="secondary" size="md" fullWidth onClick={() => navigate('/score')}>
              {isFinished ? 'View Final Leaderboard 🏆' : 'View Leaderboard'}
            </Button>
          )}
          <Button variant="ghost" size="sm" fullWidth onClick={handleHome}>
            Back to Home
          </Button>
        </div>
      }
    >
      <div className={styles.content}>
        <div
          className={[
            styles.outcome,
            imposterWon ? styles.imposterWins : styles.regularWins,
          ].join(' ')}
        >
          {imposterWon ? (
            <>
              <span className={styles.outcomeIcon}>🕵️</span>
              <p className={styles.outcomeText}>Imposter wins!</p>
            </>
          ) : (
            <>
              <span className={styles.outcomeIcon}>🎉</span>
              <p className={styles.outcomeText}>Players win!</p>
            </>
          )}
        </div>

        <div className={styles.reveal}>
          <p className={styles.revealLabel}>Secret word</p>
          <p className={styles.revealWord}>{secretWord}</p>
          <Badge variant={imposterWon ? 'danger' : 'success'}>
            {imposterNames} was the imposter
          </Badge>
        </div>

        {hasVotes ? (
          <div className={styles.voteSection}>
            <p className={styles.sectionTitle}>Vote Tally</p>
            <ul className={styles.voteList}>
              {sortedVotes.map(v => (
                <li key={v.id} className={styles.voteRow}>
                  <span
                    className={[
                      styles.voteName,
                      v.isEliminated ? styles.eliminated : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    {v.name}
                    {v.isEliminated && (
                      <Badge variant="danger">Eliminated</Badge>
                    )}
                  </span>
                  <span className={styles.voteCount}>{v.count} votes</span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className={styles.voteSection}>
            <p className={styles.sectionTitle}>Round Summary</p>
            <div className={styles.quickVerdictCard}>
              <p className={styles.quickVerdictText}>
                {imposterWon
                  ? 'Decided via Quick Verdict: Imposter escaped undetected!'
                  : `Decided via Quick Verdict: Group caught ${eliminatedPlayer ? eliminatedPlayer.name : imposterNames}!`}
              </p>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  )
}
