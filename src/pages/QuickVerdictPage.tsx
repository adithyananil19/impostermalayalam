import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageLayout from '../components/PageLayout'
import BackButton from '../components/BackButton'
import Button from '../components/Button'
import Badge from '../components/Badge'
import Card from '../components/Card'
import { useGame } from '../hooks/useGame'
import styles from './QuickVerdictPage.module.css'

export default function QuickVerdictPage() {
  const navigate = useNavigate()
  const { state, quickVerdict, nextRound, startGame, restartGame } = useGame()
  // null = pending choice, 'no' = imposter escaped, 'yes' = imposter caught
  const [verdict, setVerdict] = useState<'yes' | 'no' | null>(null)

  const round = state.currentRound || state.completedRounds[state.completedRounds.length - 1]

  if (!round) {
    return (
      <PageLayout centered>
        <div style={{ textAlign: 'center', padding: 'var(--space-6)' }}>
          <p style={{ color: 'var(--clr-text-secondary)', marginBottom: 'var(--space-4)' }}>
            No active round found.
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
  const category = round.word.category
  const imposterHint =
    round.word.hint ||
    (imposterRoles[0]?.displayInfo && imposterRoles[0]?.displayInfo !== 'IMPOSTER'
      ? imposterRoles[0].displayInfo
      : 'None')

  const isMulti = state.settings.gameMode === 'multi' && state.settings.roundCount > 1
  const isFinished = state.settings.roundCount > 0 && state.completedRounds.length >= state.settings.roundCount

  function handleCaught() {
    quickVerdict(true)
    navigate('/results')
  }

  function handleEscaped() {
    quickVerdict(false)
    setVerdict('no')
  }

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

  // --- View: Imposter Got Away Reveal ---
  if (verdict === 'no') {
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
        <div className={styles.escapedContent}>
          <div className={styles.escapedBadge}>
            <span className={styles.escapedIcon}>🕵️</span>
            <span className={styles.escapedTitle}>Imposter Got Away!</span>
            <p className={styles.escapedSub}>The group failed to catch the imposter.</p>
          </div>

          <div className={styles.revealCard}>
            <p className={styles.cardHeader}>The Imposter Was</p>
            <div className={styles.imposterHero}>
              <div className={styles.imposterAvatar}>
                {imposterNames ? imposterNames[0].toUpperCase() : '?'}
              </div>
              <span className={styles.imposterName}>{imposterNames}</span>
              <Badge variant="danger">Imposter</Badge>
            </div>

            <div className={styles.divider} />

            <div className={styles.detailsGrid}>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Secret Word</span>
                <span className={styles.detailValueAccent}>{secretWord}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Imposter's Clue</span>
                <span className={styles.detailValue}>{imposterHint}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Category</span>
                <span className={styles.detailValue}>{category}</span>
              </div>
            </div>
          </div>
        </div>
      </PageLayout>
    )
  }

  // --- View: Verdict Decision Prompt ---
  return (
    <PageLayout header={<BackButton to="/discussion" label="Discussion" />}>
      <div className={styles.content}>
        <div className={styles.intro}>
          <span className={styles.stepBadge}>Quick Verdict</span>
          <h2 className={styles.heading}>Was the imposter caught?</h2>
          <p className={styles.sub}>
            Skip formal voting by agreeing on the outcome of your group's discussion.
          </p>
        </div>

        <div className={styles.choiceList}>
          <Card
            className={`${styles.choiceCard} ${styles.choiceCaught}`}
            onClick={handleCaught}
          >
            <div className={styles.choiceIconCaught} aria-hidden="true">
              ✓
            </div>
            <div className={styles.choiceBody}>
              <span className={styles.choiceTitle}>Yes, Caught!</span>
              <span className={styles.choiceDesc}>
                The group pointed out the imposter correctly. View results & vote tally.
              </span>
            </div>
            <svg className={styles.chevron} width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path
                d="M7 5L11 9L7 13"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Card>

          <Card
            className={`${styles.choiceCard} ${styles.choiceEscaped}`}
            onClick={handleEscaped}
          >
            <div className={styles.choiceIconEscaped} aria-hidden="true">
              🕵️
            </div>
            <div className={styles.choiceBody}>
              <span className={styles.choiceTitle}>No, Got Away!</span>
              <span className={styles.choiceDesc}>
                The imposter fooled the group or wrong player was accused. Reveal the liar.
              </span>
            </div>
            <svg className={styles.chevron} width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path
                d="M7 5L11 9L7 13"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Card>
        </div>
      </div>
    </PageLayout>
  )
}
