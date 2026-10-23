import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageLayout from '../components/PageLayout'
import Button from '../components/Button'
import styles from './VotingPage.module.css'

const MOCK_PLAYERS = [
  { id: '1', name: 'Arjun' },
  { id: '2', name: 'Sneha' },
  { id: '3', name: 'Rohan' },
  { id: '4', name: 'Meera' },
]

export default function VotingPage() {
  const navigate = useNavigate()
  const [vote, setVote] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  if (submitted) {
    return (
      <PageLayout centered>
        <div className={styles.submitted}>
          <div className={styles.submitIcon}>✓</div>
          <p className={styles.submitText}>Vote recorded. Pass the phone.</p>
          <Button variant="primary" size="lg" onClick={() => navigate('/results')}>
            See Results
          </Button>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout
      footer={
        <Button
          variant="primary"
          size="lg"
          fullWidth
          disabled={!vote}
          onClick={() => setSubmitted(true)}
        >
          Confirm Vote
        </Button>
      }
    >
      <div className={styles.intro}>
        <div className={styles.stepBadge}>Voting</div>
        <h2 className={styles.heading}>Who is the imposter?</h2>
        <p className={styles.sub}>Select one player. You cannot change your vote once confirmed.</p>
      </div>

      <ul className={styles.list}>
        {MOCK_PLAYERS.map(p => (
          <li key={p.id}>
            <button
              className={[styles.playerBtn, vote === p.id ? styles.selected : '']
                .filter(Boolean)
                .join(' ')}
              onClick={() => setVote(p.id)}
              aria-pressed={vote === p.id}
            >
              <span className={styles.avatar}>{p.name[0]}</span>
              <span className={styles.playerName}>{p.name}</span>
              {vote === p.id && (
                <span className={styles.check} aria-hidden="true">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M3 8L6.5 11.5L13 5"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>
    </PageLayout>
  )
}
