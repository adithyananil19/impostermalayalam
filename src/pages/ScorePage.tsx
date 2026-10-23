import { useNavigate } from 'react-router-dom'
import PageLayout from '../components/PageLayout'
import Button from '../components/Button'
import { useGame } from '../hooks/useGame'
import { getLeaderboard } from '../game/scoring'
import styles from './ScorePage.module.css'

export default function ScorePage() {
  const navigate = useNavigate()
  const { state, nextRound, startGame, restartGame } = useGame()

  if (state.players.length === 0) {
    return (
      <PageLayout centered>
        <div className={styles.emptyState}>
          <p className={styles.emptyText}>No active game session found.</p>
          <Button variant="primary" onClick={() => navigate('/players')}>
            Start New Game
          </Button>
        </div>
      </PageLayout>
    )
  }

  const leaderboard = getLeaderboard(state.players, state.scores)
  const completedCount = state.completedRounds.length
  const totalRounds = state.settings.roundCount
  const isMulti = state.settings.gameMode === 'multi' && totalRounds > 1
  const isGameOver =
    state.phase === 'game_over' || (totalRounds > 0 && completedCount >= totalRounds)

  const roundText =
    isMulti && totalRounds > 0
      ? isGameOver
        ? `Session Complete · All ${totalRounds} Rounds Played`
        : `Round ${completedCount} of ${totalRounds}`
      : `Session Leaderboard (${completedCount} ${completedCount === 1 ? 'round' : 'rounds'})`

  function handleNextRound() {
    if (isMulti && !isGameOver) {
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
            {isMulti && !isGameOver
              ? `Next Round (${completedCount + 1} of ${totalRounds}) →`
              : 'Play Again'}
          </Button>
          <Button variant="ghost" size="sm" fullWidth onClick={handleHome}>
            Back to Home
          </Button>
        </div>
      }
    >
      <div className={styles.intro}>
        <p className={styles.round}>{roundText}</p>
        <h2 className={styles.heading}>Leaderboard</h2>
      </div>

      <ol className={styles.list}>
        {leaderboard.map((entry, idx) => (
          <li
            key={entry.player.id}
            className={[styles.row, idx === 0 ? styles.first : ''].filter(Boolean).join(' ')}
          >
            <span className={styles.rank}>
              {idx === 0 ? '🏆' : `#${entry.rank}`}
            </span>
            <span className={styles.name}>{entry.player.name}</span>
            <span className={styles.points}>{entry.points} pts</span>
          </li>
        ))}
      </ol>
    </PageLayout>
  )
}
