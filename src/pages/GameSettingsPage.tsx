import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGame } from '../hooks/useGame'
import PageLayout from '../components/PageLayout'
import BackButton from '../components/BackButton'
import Button from '../components/Button'
import Toggle from '../components/Toggle'
import Divider from '../components/Divider'
import styles from './GameSettingsPage.module.css'
import type { ImposterMode, RevealStyle, VoteOutcome } from '../types'

const IMPOSTER_MODES: { value: ImposterMode; label: string; desc: string }[] = [
  { value: 'no_word', label: 'No Word', desc: 'Imposter gets nothing' },
  { value: 'vague_hint', label: 'Vague Hint', desc: 'Imposter gets an indirect clue' },
  { value: 'related_word', label: 'Related Word', desc: 'Imposter gets a different but related word' },
]

const REVEAL_STYLES: { value: RevealStyle; label: string; desc: string }[] = [
  { value: 'tap', label: 'Tap to Reveal', desc: 'Tap once to show, tap again to hide' },
  { value: 'hold', label: 'Hold to Reveal', desc: 'Hold down to see, release to hide' },
]

const VOTE_OUTCOMES: { value: VoteOutcome; label: string; desc: string }[] = [
  { value: 'reveal_and_end', label: 'Reveal & End', desc: 'Show result and end the round' },
  {
    value: 'eliminate_and_continue',
    label: 'Eliminate & Continue',
    desc: 'Remove player and keep playing',
  },
]

export default function GameSettingsPage() {
  const navigate = useNavigate()
  const { state, updateSettings } = useGame()
  const s = state.settings

  const [imposterCount, setImposterCount] = useState(s.imposterCount)
  const [imposterMode, setImposterMode] = useState<ImposterMode>(s.imposterMode)
  const [timerEnabled, setTimerEnabled] = useState(s.timerEnabled)
  const [timerSeconds, setTimerSeconds] = useState(s.timerSeconds)
  const [revealStyle, setRevealStyle] = useState<RevealStyle>(s.revealStyle)
  const [voteOutcome, setVoteOutcome] = useState<VoteOutcome>(s.voteOutcome)
  const [trackScores, setTrackScores] = useState(s.trackScores)
  const [roundCount, setRoundCount] = useState(s.roundCount)

  const maxImposters = Math.max(1, Math.floor((state.players.length - 1) / 2))

  function handleSave() {
    updateSettings({
      imposterCount,
      imposterMode,
      timerEnabled,
      timerSeconds,
      revealStyle,
      voteOutcome,
      trackScores,
      roundCount,
    })
    // In Phase 3 this will navigate to /reveal to start the game.
    // For now, go back to home.
    navigate('/')
  }

  return (
    <PageLayout
      header={<BackButton to="/categories" />}
      footer={
        <Button variant="primary" size="lg" fullWidth onClick={handleSave}>
          Save & Start Game
        </Button>
      }
    >
      <div className={styles.intro}>
        <h2 className={styles.heading}>Game Settings</h2>
      </div>

      {/* Imposters */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Imposters</h3>
        <div className={styles.counter}>
          <span className={styles.counterLabel}>
            Imposter count
            <span className={styles.counterSub}>Max {maxImposters} for {state.players.length} players</span>
          </span>
          <div className={styles.stepper}>
            <button
              className={styles.stepBtn}
              onClick={() => setImposterCount(c => Math.max(1, c - 1))}
              disabled={imposterCount <= 1}
              aria-label="Decrease imposters"
            >
              −
            </button>
            <span className={styles.stepValue}>{imposterCount}</span>
            <button
              className={styles.stepBtn}
              onClick={() => setImposterCount(c => Math.min(maxImposters, c + 1))}
              disabled={imposterCount >= maxImposters}
              aria-label="Increase imposters"
            >
              +
            </button>
          </div>
        </div>

        <div className={styles.optGroup}>
          <p className={styles.optLabel}>Imposter information</p>
          {IMPOSTER_MODES.map(m => (
            <button
              key={m.value}
              className={[styles.optCard, imposterMode === m.value ? styles.optSelected : '']
                .filter(Boolean)
                .join(' ')}
              onClick={() => setImposterMode(m.value)}
              aria-pressed={imposterMode === m.value}
            >
              <span className={styles.optTitle}>{m.label}</span>
              <span className={styles.optDesc}>{m.desc}</span>
            </button>
          ))}
        </div>
      </section>

      <Divider />

      {/* Timer */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Discussion Timer</h3>
        <Toggle
          label="Enable timer"
          description="Set a countdown for discussion"
          checked={timerEnabled}
          onChange={setTimerEnabled}
        />
        {timerEnabled && (
          <div className={styles.counter}>
            <span className={styles.counterLabel}>Duration (seconds)</span>
            <div className={styles.stepper}>
              <button
                className={styles.stepBtn}
                onClick={() => setTimerSeconds(t => Math.max(30, t - 30))}
                disabled={timerSeconds <= 30}
                aria-label="Decrease timer"
              >
                −
              </button>
              <span className={styles.stepValue}>{timerSeconds}s</span>
              <button
                className={styles.stepBtn}
                onClick={() => setTimerSeconds(t => Math.min(600, t + 30))}
                disabled={timerSeconds >= 600}
                aria-label="Increase timer"
              >
                +
              </button>
            </div>
          </div>
        )}
      </section>

      <Divider />

      {/* Reveal style */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Reveal Style</h3>
        <div className={styles.optGroup}>
          {REVEAL_STYLES.map(r => (
            <button
              key={r.value}
              className={[styles.optCard, revealStyle === r.value ? styles.optSelected : '']
                .filter(Boolean)
                .join(' ')}
              onClick={() => setRevealStyle(r.value)}
              aria-pressed={revealStyle === r.value}
            >
              <span className={styles.optTitle}>{r.label}</span>
              <span className={styles.optDesc}>{r.desc}</span>
            </button>
          ))}
        </div>
      </section>

      <Divider />

      {/* Voting */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Voting</h3>
        <div className={styles.optGroup}>
          {VOTE_OUTCOMES.map(v => (
            <button
              key={v.value}
              className={[styles.optCard, voteOutcome === v.value ? styles.optSelected : '']
                .filter(Boolean)
                .join(' ')}
              onClick={() => setVoteOutcome(v.value)}
              aria-pressed={voteOutcome === v.value}
            >
              <span className={styles.optTitle}>{v.label}</span>
              <span className={styles.optDesc}>{v.desc}</span>
            </button>
          ))}
        </div>
      </section>

      <Divider />

      {/* Rounds & scoring */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Rounds & Scoring</h3>
        <Toggle
          label="Track scores"
          description="Accumulate points across rounds"
          checked={trackScores}
          onChange={setTrackScores}
        />
        {trackScores && (
          <div className={styles.counter}>
            <span className={styles.counterLabel}>
              Rounds
              <span className={styles.counterSub}>0 = play until you stop</span>
            </span>
            <div className={styles.stepper}>
              <button
                className={styles.stepBtn}
                onClick={() => setRoundCount(r => Math.max(0, r - 1))}
                disabled={roundCount <= 0}
                aria-label="Decrease round count"
              >
                −
              </button>
              <span className={styles.stepValue}>{roundCount === 0 ? '∞' : roundCount}</span>
              <button
                className={styles.stepBtn}
                onClick={() => setRoundCount(r => Math.min(20, r + 1))}
                disabled={roundCount >= 20}
                aria-label="Increase round count"
              >
                +
              </button>
            </div>
          </div>
        )}
      </section>
    </PageLayout>
  )
}
