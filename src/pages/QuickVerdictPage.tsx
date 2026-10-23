import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageLayout from '../components/PageLayout'
import BackButton from '../components/BackButton'
import Button from '../components/Button'
import Badge from '../components/Badge'
import Card from '../components/Card'
import styles from './QuickVerdictPage.module.css'

const MOCK_GAME_DATA = {
  imposterName: 'Sneha',
  secretWord: 'Porotta',
  category: 'Food & Bakery',
  imposterHint: 'Gym enemy',
}

export default function QuickVerdictPage() {
  const navigate = useNavigate()
  // null = pending choice, 'no' = imposter escaped, 'yes' = imposter caught
  const [verdict, setVerdict] = useState<'yes' | 'no' | null>(null)

  function handleCaught() {
    // If caught, go straight to the Results screen where players won!
    navigate('/results')
  }

  function handleEscaped() {
    // If not caught, reveal the imposter right here
    setVerdict('no')
  }

  function handleResetVerdict() {
    setVerdict(null)
  }

  // --- View: Imposter Got Away Reveal ---
  if (verdict === 'no') {
    return (
      <PageLayout
        header={<BackButton label="Change" to="/quick-verdict" />}
        footer={
          <div className={styles.footerActions}>
            <Button variant="primary" size="lg" fullWidth onClick={() => navigate('/reveal')}>
              Play Again
            </Button>
            <Button variant="secondary" size="md" fullWidth onClick={() => navigate('/score')}>
              View Leaderboard
            </Button>
            <Button variant="ghost" size="sm" fullWidth onClick={() => navigate('/')}>
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
              <div className={styles.imposterAvatar}>{MOCK_GAME_DATA.imposterName[0]}</div>
              <span className={styles.imposterName}>{MOCK_GAME_DATA.imposterName}</span>
              <Badge variant="danger">Imposter</Badge>
            </div>

            <div className={styles.divider} />

            <div className={styles.detailsGrid}>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Secret Word</span>
                <span className={styles.detailValueAccent}>{MOCK_GAME_DATA.secretWord}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Imposter's Clue</span>
                <span className={styles.detailValue}>{MOCK_GAME_DATA.imposterHint}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Category</span>
                <span className={styles.detailValue}>{MOCK_GAME_DATA.category}</span>
              </div>
            </div>
          </div>

          <button className={styles.changeBtn} onClick={handleResetVerdict}>
            ← Change verdict / test again
          </button>
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
