import PageLayout from '../components/PageLayout'
import BackButton from '../components/BackButton'
import Button from '../components/Button'
import styles from './CustomWordsPage.module.css'

export default function CustomWordsPage() {

  return (
    <PageLayout
      header={<BackButton to="/" label="Home" />}
      footer={
        <Button variant="primary" size="lg" fullWidth onClick={() => {}}>
          Create Category
        </Button>
      }
    >
      <div className={styles.intro}>
        <h2 className={styles.heading}>Custom Words</h2>
        <p className={styles.sub}>Create your own word categories and hints.</p>
      </div>

      <div className={styles.empty}>
        <div className={styles.emptyIcon} aria-hidden="true">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <rect x="6" y="8" width="28" height="24" rx="4" stroke="currentColor" strokeWidth="1.5" />
            <path d="M13 16H27M13 20H22M13 24H19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
        <p className={styles.emptyTitle}>No custom categories yet</p>
        <p className={styles.emptyBody}>
          Tap "Create Category" to add your own words and hints. Full management UI arrives in Phase 4.
        </p>
      </div>
    </PageLayout>
  )
}
