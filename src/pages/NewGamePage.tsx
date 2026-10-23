import { useNavigate } from 'react-router-dom'
import PageLayout from '../components/PageLayout'
import BackButton from '../components/BackButton'
import Button from '../components/Button'
import Card from '../components/Card'
import styles from './NewGamePage.module.css'

interface SetupStep {
  id: string
  title: string
  description: string
  to: string
  badge?: string
}

const steps: SetupStep[] = [
  {
    id: 'players',
    title: 'Players',
    description: 'Add player names (3–20)',
    to: '/players',
  },
  {
    id: 'categories',
    title: 'Categories',
    description: 'Choose word categories',
    to: '/categories',
  },
  {
    id: 'settings',
    title: 'Game Settings',
    description: 'Imposters, timer, and rules',
    to: '/settings',
  },
]

export default function NewGamePage() {
  const navigate = useNavigate()

  return (
    <PageLayout
      header={<BackButton to="/" label="Home" />}
      footer={
        <Button variant="primary" size="lg" fullWidth onClick={() => navigate('/players')}>
          Start Setup
        </Button>
      }
    >
      <div className={styles.intro}>
        <h2 className={styles.heading}>New Game</h2>
        <p className={styles.sub}>Configure your game in three quick steps.</p>
      </div>

      <ul className={styles.steps}>
        {steps.map((step, idx) => (
          <li key={step.id}>
            <Card className={styles.stepCard} onClick={() => navigate(step.to)}>
              <div className={styles.stepNum}>{idx + 1}</div>
              <div className={styles.stepBody}>
                <span className={styles.stepTitle}>{step.title}</span>
                <span className={styles.stepDesc}>{step.description}</span>
              </div>
              <svg
                className={styles.chevron}
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M7 5L11 9L7 13"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Card>
          </li>
        ))}
      </ul>
    </PageLayout>
  )
}
