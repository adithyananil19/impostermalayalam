import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import PageLayout from '../components/PageLayout'
import Button from '../components/Button'
import styles from './DiscussionPage.module.css'

const MOCK_WORD = 'Porotta'

export default function DiscussionPage() {
  const navigate = useNavigate()
  const [timeLeft, setTimeLeft] = useState(120)
  const [running, setRunning] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!running) return
    intervalRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(intervalRef.current!)
          setRunning(false)
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(intervalRef.current!)
  }, [running])

  function formatTime(s: number) {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  return (
    <PageLayout
      footer={
        <Button variant="primary" size="lg" fullWidth onClick={() => navigate('/voting')}>
          Start Voting
        </Button>
      }
    >
      <div className={styles.content}>
        <div className={styles.stepBadge}>Discussion</div>
        <div className={styles.wordBox}>
          <p className={styles.wordLabel}>Secret word</p>
          <p className={styles.word}>{MOCK_WORD}</p>
          <p className={styles.wordHint}>
            Players discuss — find the imposter before voting.
          </p>
        </div>

        <div className={styles.timerSection}>
          <div className={styles.timerDisplay}>{formatTime(timeLeft)}</div>
          <div className={styles.timerBtns}>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setRunning(r => !r)}
            >
              {running ? 'Pause' : timeLeft === 120 ? 'Start Timer' : 'Resume'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setRunning(false)
                setTimeLeft(120)
              }}
            >
              Reset
            </Button>
          </div>
          <p className={styles.timerNote}>Timer is optional. Phase 3 connects this to settings.</p>
        </div>
      </div>
    </PageLayout>
  )
}
