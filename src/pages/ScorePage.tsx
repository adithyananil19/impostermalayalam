import { useNavigate } from 'react-router-dom'
import PageLayout from '../components/PageLayout'
import Button from '../components/Button'
import styles from './ScorePage.module.css'

const MOCK_SCORES = [
  { name: 'Arjun', points: 4 },
  { name: 'Rohan', points: 3 },
  { name: 'Meera', points: 3 },
  { name: 'Sneha', points: 1 },
]

export default function ScorePage() {
  const navigate = useNavigate()

  const sorted = [...MOCK_SCORES].sort((a, b) => b.points - a.points)

  return (
    <PageLayout
      footer={
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <Button variant="primary" size="lg" fullWidth onClick={() => navigate('/reveal')}>
            Next Round
          </Button>
          <Button variant="secondary" size="md" fullWidth onClick={() => navigate('/')}>
            End Session
          </Button>
        </div>
      }
    >
      <div className={styles.intro}>
        <p className={styles.round}>Round 1 of 3</p>
        <h2 className={styles.heading}>Leaderboard</h2>
      </div>

      <ol className={styles.list}>
        {sorted.map((entry, idx) => (
          <li key={entry.name} className={[styles.row, idx === 0 ? styles.first : ''].filter(Boolean).join(' ')}>
            <span className={styles.rank}>
              {idx === 0 ? '🏆' : `#${idx + 1}`}
            </span>
            <span className={styles.name}>{entry.name}</span>
            <span className={styles.points}>{entry.points} pts</span>
          </li>
        ))}
      </ol>
    </PageLayout>
  )
}
