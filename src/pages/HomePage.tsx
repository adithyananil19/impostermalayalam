import { useNavigate } from 'react-router-dom'
import PageLayout from '../components/PageLayout'
import Button from '../components/Button'
import Badge from '../components/Badge'
import { useGame } from '../hooks/useGame'
import { usePWA } from '../hooks/usePWA'
import styles from './HomePage.module.css'

export default function HomePage() {
  const navigate = useNavigate()
  const { stats } = useGame()
  const { isOnline, canInstall, triggerInstall } = usePWA()

  return (
    <PageLayout
      centered
      footer={
        <div className={styles.footerLinks}>
          <Button variant="ghost" size="sm" onClick={() => navigate('/custom-words')}>
            Custom Words
          </Button>
          <span className={styles.footerDot} aria-hidden="true">•</span>
          <Button variant="ghost" size="sm" onClick={() => navigate('/preferences')}>
            Settings
          </Button>
        </div>
      }
    >
      <div className={styles.hero}>
        <div className={styles.topBadgeWrap}>
          {!isOnline ? (
            <Badge variant="warning">
              ⚡ Offline Mode Active • 100% Playable
            </Badge>
          ) : (
            <Badge variant="accent">
              <span className={styles.pulseDot} />
              Party Game • 3–20 Players
            </Badge>
          )}
        </div>

        <div className={styles.logoWrap}>
          <svg className={styles.logoSvg} width="36" height="36" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 4C16.41 4 20 7.59 20 12C20 13.88 19.34 15.61 18.24 17L15 13.76V11C15 9.34 13.66 8 12 8C10.34 8 9 9.34 9 11V13.76L5.76 17C4.66 15.61 4 13.88 4 12C4 7.59 7.59 4 12 4ZM11 11C11 10.45 11.45 10 12 10C12.55 10 13 10.45 13 11V14.59L11 12.59V11Z"
              fill="currentColor"
            />
          </svg>
        </div>

        <div className={styles.titleWrap}>
          <h1 className={styles.title}>
            IMPOSTER<span className={styles.accentDot}>.</span>MALAYALAM<span className={styles.accentDot}>.</span>
          </h1>
          <p className={styles.subtitle}>One word. One liar. No trust.</p>
        </div>

        {stats.roundsPlayed > 0 && (
          <div style={{ marginTop: 'var(--space-2)' }}>
            <Badge variant="default">
              🎯 {stats.roundsPlayed} {stats.roundsPlayed === 1 ? 'round' : 'rounds'} played · {stats.imposterWins} imposter {stats.imposterWins === 1 ? 'win' : 'wins'}
            </Badge>
          </div>
        )}
      </div>

      <div className={styles.actions}>
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={() => navigate('/new-game')}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path
              d="M4.167 10h11.666m-5.833-5.833L15.834 10l-5.834 5.833"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Start New Game
        </Button>

        {canInstall && (
          <Button
            variant="secondary"
            size="md"
            fullWidth
            onClick={triggerInstall}
          >
            📲 Install Imposter App
          </Button>
        )}
      </div>

      <div className={styles.pillRow}>
        <span className={styles.featurePill}>Pass-the-Phone</span>
        <span className={styles.featurePill}>Kerala Edition</span>
      </div>
    </PageLayout>
  )
}
