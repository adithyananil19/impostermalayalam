import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import PageLayout from '../components/PageLayout'
import Button from '../components/Button'
import { useGame } from '../hooks/useGame'
import styles from './DiscussionPage.module.css'

export default function DiscussionPage() {
  const navigate = useNavigate()
  const { state, startVoting } = useGame()

  const timerEnabled = state.settings.timerEnabled
  const initialSeconds = state.settings.timerSeconds || 120

  const [timeLeft, setTimeLeft] = useState(initialSeconds)
  const [running, setRunning] = useState(timerEnabled)
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
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [running])

  function formatTime(s: number) {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  function handleStartVoting() {
    startVoting()
    navigate('/voting')
  }

  return (
    <PageLayout
      footer={
        <div className={styles.footerActions}>
          <Button variant="primary" size="lg" fullWidth onClick={handleStartVoting}>
            Start Voting →
          </Button>
          <Button
            variant="secondary"
            size="md"
            fullWidth
            onClick={() => navigate('/quick-verdict')}
          >
            Skip Voting (Quick Verdict)
          </Button>
        </div>
      }
    >
      <div className={styles.content}>
        <div className={styles.statusBox}>
          <div className={styles.statusIcon} aria-hidden="true">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 13.5997 2.37562 15.1116 3.04346 16.4525C3.22094 16.8088 3.28001 17.2161 3.17712 17.6006L2.58151 19.8267C2.32295 20.793 3.20701 21.677 4.17335 21.4185L6.39939 20.8229C6.78393 20.72 7.19121 20.7791 7.54753 20.9565C8.88837 21.6244 10.4003 22 12 22Z"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M8 12H8.01M12 12H12.01M16 12H16.01"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h2 className={styles.statusTitle}>Discussion in Progress</h2>
          <p className={styles.statusHint}>
            Take turns giving subtle clues. Ask questions, spot hesitation, and find the liar!
          </p>
          <div className={styles.shieldNotice}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path
                d="M8 1.5L2 4V7.5C2 11.2 4.6 14.6 8 15.5C11.4 14.6 14 11.2 14 7.5V4L8 1.5Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>Secret word is hidden for screen privacy</span>
          </div>
        </div>

        {/* ── TIMER SECTION (IF ENABLED) ── */}
        {timerEnabled && (
          <div className={styles.timerSection}>
            <div
              className={styles.timerDisplay}
              role="timer"
              aria-label={`Discussion timer: ${formatTime(timeLeft)}`}
            >
              {formatTime(timeLeft)}
            </div>
            <div className={styles.timerBtns}>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setRunning(r => !r)}
              >
                {running ? 'Pause' : timeLeft === 0 ? 'Restart' : 'Resume'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setRunning(false)
                  setTimeLeft(initialSeconds)
                }}
              >
                Reset
              </Button>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  )
}
