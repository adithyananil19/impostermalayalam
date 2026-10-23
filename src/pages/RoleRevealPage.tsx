import { useNavigate } from 'react-router-dom'
import PageLayout from '../components/PageLayout'
import Button from '../components/Button'
import styles from './RoleRevealPage.module.css'

export default function RoleRevealPage() {
  const navigate = useNavigate()

  return (
    <PageLayout centered>
      <div className={styles.content}>
        <div className={styles.badge}>Step 1 of 4</div>
        <h2 className={styles.heading}>Role Reveal</h2>
        <p className={styles.body}>
          Pass the phone to each player privately. They will tap to reveal their secret role.
        </p>
        <div className={styles.card}>
          <p className={styles.playerLabel}>Player 1's turn</p>
          <p className={styles.instruction}>Keep the screen private, then tap to reveal your role.</p>
          <Button variant="primary" size="lg" fullWidth>
            Reveal My Role
          </Button>
        </div>
        <p className={styles.note}>
          Full role reveal implemented in Phase 3.
        </p>
        <Button variant="ghost" onClick={() => navigate('/discussion')}>
          Skip to Discussion →
        </Button>
      </div>
    </PageLayout>
  )
}
