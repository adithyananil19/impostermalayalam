import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageLayout from '../components/PageLayout'
import BackButton from '../components/BackButton'
import Button from '../components/Button'
import { useGame } from '../hooks/useGame'
import styles from './NewGamePage.module.css'

const PRESETS = [3, 4, 5, 6, 7, 8, 10, 12, 16, 20]

export default function NewGamePage() {
  const navigate = useNavigate()
  const { state } = useGame()
  
  // Default to existing players count or 4
  const [count, setCount] = useState<number>(
    state.players.length >= 3 && state.players.length <= 20 ? state.players.length : 4
  )

  function handleDecrement() {
    setCount(c => Math.max(3, c - 1))
  }

  function handleIncrement() {
    setCount(c => Math.min(20, c + 1))
  }

  function handleContinue() {
    navigate(`/players?count=${count}`)
  }

  return (
    <PageLayout
      header={<BackButton to="/" label="Home" />}
      footer={
        <Button variant="primary" size="lg" fullWidth onClick={handleContinue}>
          Continue to Player Names ({count} Players) →
        </Button>
      }
    >
      <div className={styles.content}>
        <div className={styles.intro}>
          <span className={styles.stepBadge}>Step 1 of 3</span>
          <h2 className={styles.heading}>How many players?</h2>
          <p className={styles.sub}>Choose between 3 and 20 players for this round.</p>
        </div>

        <div className={styles.counterCard}>
          <div className={styles.displayArea}>
            <span className={styles.countNumber}>{count}</span>
            <span className={styles.countLabel}>Players</span>
          </div>

          <div className={styles.stepperControls}>
            <button
              className={styles.stepperBtn}
              onClick={handleDecrement}
              disabled={count <= 3}
              aria-label="Decrease players"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M5 12H19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </button>

            <span className={styles.stepperDivider} />

            <button
              className={styles.stepperBtn}
              onClick={handleIncrement}
              disabled={count >= 20}
              aria-label="Increase players"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>

        <div className={styles.presetsSection}>
          <span className={styles.presetLabel}>Quick Select</span>
          <div className={styles.presetPills}>
            {PRESETS.map(p => (
              <button
                key={p}
                className={[styles.pill, count === p ? styles.pillActive : ''].filter(Boolean).join(' ')}
                onClick={() => setCount(p)}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.infoBanner}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.75" />
            <path d="M12 16V12M12 8H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <span>
            {count <= 4
              ? 'Ideal for intimate, high-suspicion bluffing rounds.'
              : count <= 8
              ? 'Sweet spot for college gangs & house party chaos.'
              : 'Large party mode: expect wild accusations & heated debates!'}
          </span>
        </div>
      </div>
    </PageLayout>
  )
}
