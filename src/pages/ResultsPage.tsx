import { useNavigate } from 'react-router-dom'
import PageLayout from '../components/PageLayout'
import Button from '../components/Button'
import Badge from '../components/Badge'
import styles from './ResultsPage.module.css'

const MOCK_RESULT = {
  imposterWon: false,
  secretWord: 'Porotta',
  imposterName: 'Sneha',
  eliminated: 'Sneha',
  votes: [
    { name: 'Arjun', count: 0 },
    { name: 'Sneha', count: 3 },
    { name: 'Rohan', count: 1 },
    { name: 'Meera', count: 0 },
  ],
}

export default function ResultsPage() {
  const navigate = useNavigate()
  const { imposterWon, secretWord, imposterName, eliminated, votes } = MOCK_RESULT

  return (
    <PageLayout
      footer={
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <Button variant="primary" size="lg" fullWidth onClick={() => navigate('/')}>
            Back to Home
          </Button>
          <Button variant="secondary" size="md" fullWidth onClick={() => navigate('/reveal')}>
            Play Again
          </Button>
        </div>
      }
    >
      <div className={styles.content}>
        <div className={[styles.outcome, imposterWon ? styles.imposterWins : styles.regularWins].join(' ')}>
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
            {imposterName} was the imposter
          </Badge>
        </div>

        <div className={styles.voteSection}>
          <p className={styles.sectionTitle}>Vote Tally</p>
          <ul className={styles.voteList}>
            {votes
              .sort((a, b) => b.count - a.count)
              .map(v => (
                <li key={v.name} className={styles.voteRow}>
                  <span
                    className={[styles.voteName, v.name === eliminated ? styles.eliminated : '']
                      .filter(Boolean)
                      .join(' ')}
                  >
                    {v.name}
                    {v.name === eliminated && (
                      <Badge variant="danger">Eliminated</Badge>
                    )}
                  </span>
                  <span className={styles.voteCount}>{v.count} votes</span>
                </li>
              ))}
          </ul>
        </div>
      </div>
    </PageLayout>
  )
}
