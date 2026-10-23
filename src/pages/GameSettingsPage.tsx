import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGame } from '../hooks/useGame'
import PageLayout from '../components/PageLayout'
import BackButton from '../components/BackButton'
import Button from '../components/Button'
import Toggle from '../components/Toggle'
import Badge from '../components/Badge'
import Divider from '../components/Divider'
import styles from './GameSettingsPage.module.css'
import type { ImposterMode, RevealStyle, VoteOutcome, GameMode } from '../types'

const CATEGORIES = [
  { id: 'kerala-slang', name: 'Kerala Slang', description: 'Everyday Malayalam culture', count: 10 },
  { id: 'college-life', name: 'College Life', description: 'Campus struggles & wins', count: 10 },
  { id: 'food-bakery', name: 'Food & Bakery', description: 'Kerala eats and treats', count: 10 },
  { id: 'memes-trends', name: 'Memes & Trends', description: 'Viral internet culture', count: 10 },
  { id: 'places-kerala', name: 'Places in Kerala', description: 'Towns and cities', count: 10 },
  { id: 'everyday-objects', name: 'Everyday Objects', description: 'Things around you', count: 10 },
  { id: 'politics', name: 'Politics & Public Life', description: 'Playful political humour', count: 10 },
  { id: 'relationships', name: 'Relationships', description: 'Love, friendship, drama', count: 10 },
  { id: 'tricky-words', name: 'Tricky Words', description: 'Deceptively similar answers', count: 10 },
  { id: 'sports-games', name: 'Sports & Games', description: 'Football, cricket and more', count: 10 },
  { id: 'malayalam-movies', name: 'Malayalam Movies', description: 'Famous films & classics', count: 81 },
]

const IMPOSTER_MODES: { value: ImposterMode; label: string; desc: string }[] = [
  { value: 'no_word', label: 'No Word', desc: 'Imposter receives no secret word' },
  { value: 'vague_hint', label: 'Vague Hint (Recommended)', desc: 'Imposter receives an indirect clue' },
  { value: 'related_word', label: 'Related Word', desc: 'Imposter receives a different but related word' },
]

const REVEAL_STYLES: { value: RevealStyle; label: string; desc: string }[] = [
  { value: 'tap', label: 'Tap to Reveal', desc: 'Tap once to show, tap again to hide' },
  { value: 'hold', label: 'Hold to Reveal', desc: 'Hold down to see, release to hide' },
]

const VOTE_OUTCOMES: { value: VoteOutcome; label: string; desc: string }[] = [
  { value: 'reveal_and_end', label: 'Reveal & End', desc: 'Show result and conclude the round' },
  {
    value: 'eliminate_and_continue',
    label: 'Eliminate & Continue',
    desc: 'Eliminate candidate and continue if needed',
  },
]

export default function GameSettingsPage() {
  const navigate = useNavigate()
  const { state, updateSettings, startGame } = useGame()
  const s = state.settings

  const [gameMode, setGameMode] = useState<GameMode>(s.gameMode || 'single')
  const [imposterCount, setImposterCount] = useState(s.imposterCount)
  const [imposterMode, setImposterMode] = useState<ImposterMode>(s.imposterMode)
  const [timerEnabled, setTimerEnabled] = useState(s.timerEnabled)
  const [timerSeconds, setTimerSeconds] = useState(s.timerSeconds)
  const [revealStyle, setRevealStyle] = useState<RevealStyle>(s.revealStyle)
  const [voteOutcome, setVoteOutcome] = useState<VoteOutcome>(s.voteOutcome)
  const [roundCount, setRoundCount] = useState(s.roundCount || 3)
  const [trackScores] = useState(s.trackScores)
  const [configError, setConfigError] = useState<string | null>(null)

  // Default: all categories selected if none selected yet
  const [selectedCats, setSelectedCats] = useState<Set<string>>(() => {
    if (s.enabledCategories && s.enabledCategories.length > 0) {
      return new Set(s.enabledCategories)
    }
    return new Set(CATEGORIES.map(c => c.id))
  })

  const playerCount = Math.max(state.players.length, 3)
  const maxImposters = Math.max(1, Math.floor((playerCount - 1) / 2))

  function toggleCategory(id: string) {
    setSelectedCats(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function handleSelectAll() {
    setSelectedCats(new Set(CATEGORIES.map(c => c.id)))
  }

  function handleClearAll() {
    setSelectedCats(new Set())
  }

  function handleStartGame() {
    setConfigError(null)
    const effectiveRoundCount = gameMode === 'multi' ? Math.max(roundCount, 2) : 1
    const effectiveTrackScores = gameMode === 'multi' ? true : trackScores

    updateSettings({
      gameMode,
      imposterCount,
      imposterMode,
      timerEnabled,
      timerSeconds,
      revealStyle,
      voteOutcome,
      roundCount: effectiveRoundCount,
      trackScores: effectiveTrackScores,
      enabledCategories: [...selectedCats],
    })

    const result = startGame()
    if (!result.success) {
      setConfigError(result.error || 'Failed to start game.')
      return
    }

    navigate('/reveal')
  }

  const canStart = selectedCats.size > 0

  return (
    <PageLayout
      header={<BackButton to="/players" label="Player Names" />}
      footer={
        <div>
          {configError && <p className={styles.catWarning}>⚠️ {configError}</p>}
          {!canStart && (
            <p className={styles.catWarning}>⚠️ Please select at least one category to play.</p>
          )}
          <Button
            variant="primary"
            size="lg"
            fullWidth
            disabled={!canStart}
            onClick={handleStartGame}
          >
            Start Game ({selectedCats.size} Categories Active) →
          </Button>
        </div>
      }
    >
      <div className={styles.intro}>
        <span className={styles.stepBadge}>Step 3 of 3</span>
        <h2 className={styles.heading}>Game Setup</h2>
        <p className={styles.sub}>
          Review game rules, adjust settings, and pick your categories below.
        </p>
      </div>

      {/* ── 1. GAME MODE SELECTION ── */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>Game Mode</h3>
          <Badge variant="accent">Mode</Badge>
        </div>

        <div className={styles.modeGrid}>
          <div
            className={[styles.modeCard, gameMode === 'single' ? styles.modeActive : ''].join(' ')}
            onClick={() => setGameMode('single')}
            role="button"
          >
            <div className={styles.modeTop}>
              <span className={styles.modeTitle}>Single Round</span>
              {gameMode === 'single' && <span className={styles.activeDot} />}
            </div>
            <p className={styles.modeDesc}>
              Classic quick match. Discussion, voting, and instant imposter reveal.
            </p>
          </div>

          <div
            className={[styles.modeCard, gameMode === 'multi' ? styles.modeActive : ''].join(' ')}
            onClick={() => setGameMode('multi')}
            role="button"
          >
            <div className={styles.modeTop}>
              <span className={styles.modeTitle}>Multiple Rounds</span>
              {gameMode === 'multi' ? (
                <span className={styles.activeDot} />
              ) : (
                <Badge variant="accent">Session Mode</Badge>
              )}
            </div>
            <p className={styles.modeDesc}>
              Accumulate points across rounds and compete on the session leaderboard.
            </p>
          </div>
        </div>

        {gameMode === 'multi' && (
          <div className={styles.multiRoundControls}>
            <div className={styles.counterRow}>
              <div className={styles.counterInfo}>
                <span className={styles.counterTitle}>Total Rounds</span>
                <span className={styles.counterSubtitle}>Points tracked across all rounds</span>
              </div>
              <div className={styles.stepper}>
                <button
                  className={styles.stepBtn}
                  onClick={() => setRoundCount(r => Math.max(2, r - 1))}
                  disabled={roundCount <= 2}
                  type="button"
                >
                  −
                </button>
                <span className={styles.stepValue}>{roundCount}</span>
                <button
                  className={styles.stepBtn}
                  onClick={() => setRoundCount(r => Math.min(10, r + 1))}
                  disabled={roundCount >= 10}
                  type="button"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

      <Divider />

      {/* ── 2. IMPOSTERS CONFIG ── */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>Imposters</h3>
          <span className={styles.sectionHint}>{playerCount} Players Playing</span>
        </div>

        <div className={styles.counterRow}>
          <div className={styles.counterInfo}>
            <span className={styles.counterTitle}>Number of Imposters</span>
            <span className={styles.counterSubtitle}>
              Max {maxImposters} for {playerCount} players
            </span>
          </div>

          <div className={styles.stepper}>
            <button
              className={styles.stepBtn}
              onClick={() => setImposterCount(c => Math.max(1, c - 1))}
              disabled={imposterCount <= 1}
              aria-label="Decrease imposters"
              type="button"
            >
              −
            </button>
            <span className={styles.stepValue}>{imposterCount}</span>
            <button
              className={styles.stepBtn}
              onClick={() => setImposterCount(c => Math.min(maxImposters, c + 1))}
              disabled={imposterCount >= maxImposters}
              aria-label="Increase imposters"
              type="button"
            >
              +
            </button>
          </div>
        </div>

        <div className={styles.optGroup}>
          <p className={styles.optGroupLabel}>Imposter Information Mode</p>
          {IMPOSTER_MODES.map(m => (
            <button
              key={m.value}
              type="button"
              className={[styles.optCard, imposterMode === m.value ? styles.optSelected : '']
                .filter(Boolean)
                .join(' ')}
              onClick={() => setImposterMode(m.value)}
            >
              <span className={styles.optTitle}>{m.label}</span>
              <span className={styles.optDesc}>{m.desc}</span>
            </button>
          ))}
        </div>
      </section>

      <Divider />

      {/* ── 3. DISCUSSION TIMER ── */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Discussion Timer</h3>
        <Toggle
          label="Enable countdown timer"
          description="Displays a countdown during the discussion round"
          checked={timerEnabled}
          onChange={setTimerEnabled}
        />
        {timerEnabled && (
          <div className={styles.counterRow}>
            <span className={styles.counterTitle}>Timer Duration</span>
            <div className={styles.stepper}>
              <button
                className={styles.stepBtn}
                onClick={() => setTimerSeconds(t => Math.max(30, t - 30))}
                disabled={timerSeconds <= 30}
                type="button"
              >
                −
              </button>
              <span className={styles.stepValue}>{timerSeconds}s</span>
              <button
                className={styles.stepBtn}
                onClick={() => setTimerSeconds(t => Math.min(600, t + 30))}
                disabled={timerSeconds >= 600}
                type="button"
              >
                +
              </button>
            </div>
          </div>
        )}
      </section>

      <Divider />

      {/* ── 4. REVEAL STYLE ── */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Role Reveal Style</h3>
        <div className={styles.optGroup}>
          {REVEAL_STYLES.map(r => (
            <button
              key={r.value}
              type="button"
              className={[styles.optCard, revealStyle === r.value ? styles.optSelected : '']
                .filter(Boolean)
                .join(' ')}
              onClick={() => setRevealStyle(r.value)}
            >
              <span className={styles.optTitle}>{r.label}</span>
              <span className={styles.optDesc}>{r.desc}</span>
            </button>
          ))}
        </div>
      </section>

      <Divider />

      {/* ── 5. VOTING RULES ── */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Voting Outcome</h3>
        <div className={styles.optGroup}>
          {VOTE_OUTCOMES.map(v => (
            <button
              key={v.value}
              type="button"
              className={[styles.optCard, voteOutcome === v.value ? styles.optSelected : '']
                .filter(Boolean)
                .join(' ')}
              onClick={() => setVoteOutcome(v.value)}
            >
              <span className={styles.optTitle}>{v.label}</span>
              <span className={styles.optDesc}>{v.desc}</span>
            </button>
          ))}
        </div>
      </section>

      <Divider />

      {/* ── 6. WORD CATEGORIES SELECTION (EMBEDDED) ── */}
      <section className={styles.section}>
        <div className={styles.catHeaderRow}>
          <div>
            <h3 className={styles.sectionTitle}>Word Categories</h3>
            <p className={styles.catSub}>
              {selectedCats.size} of {CATEGORIES.length} categories enabled
            </p>
          </div>
          <div className={styles.catActionBtns}>
            <button type="button" className={styles.catActionBtn} onClick={handleSelectAll}>
              Select All
            </button>
            <button type="button" className={styles.catActionBtn} onClick={handleClearAll}>
              Clear
            </button>
          </div>
        </div>

        <div className={styles.catGrid}>
          {CATEGORIES.map(cat => {
            const isSelected = selectedCats.has(cat.id)
            return (
              <button
                key={cat.id}
                type="button"
                className={[styles.catCard, isSelected ? styles.catSelected : '']
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => toggleCategory(cat.id)}
              >
                <div className={styles.catCardTop}>
                  <span className={styles.catName}>{cat.name}</span>
                  <Badge variant={isSelected ? 'accent' : 'default'}>{cat.count} words</Badge>
                </div>
                <p className={styles.catDesc}>{cat.description}</p>
                {isSelected && (
                  <div className={styles.catCheckmark} aria-hidden="true">
                    <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                      <path
                        d="M2.5 7L5.5 10L11.5 4"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </section>
    </PageLayout>
  )
}
