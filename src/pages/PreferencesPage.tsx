import { useState } from 'react'
import PageLayout from '../components/PageLayout'
import BackButton from '../components/BackButton'
import Button from '../components/Button'
import Toggle from '../components/Toggle'
import Divider from '../components/Divider'
import { useGame } from '../hooks/useGame'
import styles from './PreferencesPage.module.css'

export default function PreferencesPage() {
  const { preferences, updatePreferences, resetPreferences, stats, resetStats, resetAllData } = useGame()
  const [resetMsg, setResetMsg] = useState<string | null>(null)

  function handleResetAll() {
    if (window.confirm('Are you sure you want to reset all preferences, custom words, and game statistics? This cannot be undone.')) {
      resetAllData()
      setResetMsg('All app data has been reset to factory defaults.')
      setTimeout(() => setResetMsg(null), 4000)
    }
  }

  function handleResetStats() {
    if (window.confirm('Reset all lifetime play statistics?')) {
      resetStats()
      setResetMsg('Game statistics reset.')
      setTimeout(() => setResetMsg(null), 3000)
    }
  }

  const winRate =
    stats.roundsPlayed > 0
      ? `${Math.round((stats.imposterWins / stats.roundsPlayed) * 100)}%`
      : '—'

  return (
    <PageLayout header={<BackButton to="/" label="Home" />}>
      <div className={styles.intro}>
        <h2 className={styles.heading}>Settings</h2>
        <p className={styles.sub}>Manage app accessibility, review statistics, and storage.</p>
      </div>

      {resetMsg && (
        <div style={{ background: 'var(--clr-accent-subtle)', border: '1px solid var(--clr-accent)', color: 'var(--clr-accent)', padding: '10px 14px', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-xs)', marginBottom: 'var(--space-4)' }}>
          ✓ {resetMsg}
        </div>
      )}

      {/* ── 1. ACCESSIBILITY & PREFERENCES ── */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Accessibility & Display</h3>
        <Toggle
          label="Reduce motion"
          description="Minimises animations and transitions throughout the app"
          checked={preferences.reduceMotion}
          onChange={checked => updatePreferences({ reduceMotion: checked })}
        />
        <Toggle
          label="Sound effects"
          description="Play subtle cues for timers and reveals"
          checked={preferences.soundEnabled}
          onChange={checked => updatePreferences({ soundEnabled: checked })}
        />
        <Toggle
          label="Haptic feedback"
          description="Vibrate device on key game actions (supported mobile devices)"
          checked={preferences.hapticFeedback}
          onChange={checked => updatePreferences({ hapticFeedback: checked })}
        />
      </section>

      <Divider />

      {/* ── 2. GAME STATISTICS ── */}
      <section className={styles.section}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 className={styles.sectionTitle}>Lifetime Statistics</h3>
          {stats.roundsPlayed > 0 && (
            <button
              type="button"
              onClick={handleResetStats}
              style={{ background: 'none', border: 'none', color: 'var(--clr-text-muted)', fontSize: '0.72rem', fontFamily: 'var(--font-mono)', cursor: 'pointer' }}
            >
              Reset Stats
            </button>
          )}
        </div>

        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Rounds Played</span>
            <span className={styles.statValue}>{stats.roundsPlayed}</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Games Completed</span>
            <span className={styles.statValue}>{stats.gamesPlayed}</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Imposter Wins</span>
            <span className={styles.statValue}>{stats.imposterWins}</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Imposter Win Rate</span>
            <span className={styles.statValue}>{winRate}</span>
          </div>
        </div>
      </section>

      <Divider />

      {/* ── 3. DATA & STORAGE MANAGEMENT ── */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Storage & Reset</h3>
        <div className={styles.dangerBox}>
          <div>
            <h4 className={styles.dangerTitle}>Factory Reset</h4>
            <p className={styles.dangerDesc}>
              Erase all saved players, custom words, settings, and gameplay records from local storage.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <Button variant="danger" size="sm" onClick={handleResetAll}>
              Reset All Storage
            </Button>
            <Button variant="ghost" size="sm" onClick={resetPreferences}>
              Reset Settings Only
            </Button>
          </div>
        </div>
      </section>

      <Divider />

      {/* ── 4. ABOUT ── */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>About App</h3>
        <div className={styles.aboutRow}>
          <span className={styles.aboutLabel}>Version</span>
          <span className={styles.aboutValue}>0.4.0 (Phase 4)</span>
        </div>
        <div className={styles.aboutRow}>
          <span className={styles.aboutLabel}>Platform</span>
          <span className={styles.aboutValue}>100% Offline · Local Storage</span>
        </div>
        <div className={styles.aboutRow}>
          <span className={styles.aboutLabel}>Theme</span>
          <span className={styles.aboutValue}>Kerala Malayalam Party Edition</span>
        </div>
      </section>
    </PageLayout>
  )
}
