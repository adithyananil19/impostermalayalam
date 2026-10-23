import PageLayout from '../components/PageLayout'
import BackButton from '../components/BackButton'
import Toggle from '../components/Toggle'
import Divider from '../components/Divider'
import styles from './PreferencesPage.module.css'

export default function PreferencesPage() {

  return (
    <PageLayout header={<BackButton to="/" label="Home" />}>
      <div className={styles.intro}>
        <h2 className={styles.heading}>Settings</h2>
        <p className={styles.sub}>App-wide preferences. Persisted in Phase 4.</p>
      </div>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Accessibility</h3>
        <Toggle
          label="Reduce motion"
          description="Minimise animations throughout the app"
          checked={false}
          onChange={() => {}}
        />
      </section>

      <Divider />

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>About</h3>
        <div className={styles.aboutRow}>
          <span className={styles.aboutLabel}>App version</span>
          <span className={styles.aboutValue}>0.1.0</span>
        </div>
        <div className={styles.aboutRow}>
          <span className={styles.aboutLabel}>Phase</span>
          <span className={styles.aboutValue}>1 — UI foundation</span>
        </div>
      </section>
    </PageLayout>
  )
}
