import { useNavigate } from 'react-router-dom'
import PageLayout from '../components/PageLayout'
import Button from '../components/Button'
import Divider from '../components/Divider'
import styles from './HomePage.module.css'

export default function HomePage() {
  const navigate = useNavigate()

  return (
    <PageLayout
      centered
      footer={
        <div className={styles.footerLinks}>
          <Button variant="ghost" size="sm" onClick={() => navigate('/custom-words')}>
            Custom Words
          </Button>
          <Button variant="ghost" size="sm" onClick={() => navigate('/preferences')}>
            Settings
          </Button>
        </div>
      }
    >
      <div className={styles.hero}>
        <div className={styles.logoWrap}>
          <span className={styles.logoMark}>I</span>
        </div>
        <h1 className={styles.title}>IMPOSTER</h1>
        <p className={styles.subtitle}>One word. One liar. No trust.</p>
      </div>

      <Divider />

      <div className={styles.actions}>
        <Button variant="primary" size="lg" fullWidth onClick={() => navigate('/new-game')}>
          New Game
        </Button>
      </div>

      <StatsSection />
    </PageLayout>
  )
}

function StatsSection() {
  // Phase 4 will load real stats from localStorage.
  // For now show nothing if no stats exist.
  return null
}
