import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageLayout from '../components/PageLayout'
import Button from '../components/Button'
import Badge from '../components/Badge'
import { useGame } from '../hooks/useGame'
import { getPlayerPrivateInfo } from '../game/roles'
import styles from './RoleRevealPage.module.css'

export default function RoleRevealPage() {
  const navigate = useNavigate()
  const { state, advanceReveal } = useGame()
  const [isRevealed, setIsRevealed] = useState(false)

  const currentRound = state.currentRound
  const players = state.players

  // If no round or players initialized, send back to setup
  if (!currentRound || players.length === 0) {
    return (
      <PageLayout centered>
        <div className={styles.content}>
          <h2 className={styles.heading}>No Game in Progress</h2>
          <p className={styles.body}>Please set up players and settings to begin.</p>
          <Button variant="primary" size="lg" onClick={() => navigate('/new-game')}>
            Go to Setup
          </Button>
        </div>
      </PageLayout>
    )
  }

  const revealIndex = currentRound.revealIndex
  const currentPlayer = players[revealIndex]

  // If all players have revealed, transition to discussion
  if (!currentPlayer || revealIndex >= players.length) {
    return (
      <PageLayout centered>
        <div className={styles.content}>
          <div className={styles.badge}>Roles Assigned</div>
          <h2 className={styles.heading}>All Players Ready!</h2>
          <p className={styles.body}>
            Every player has privately checked their role. Place the device in the center for the group discussion.
          </p>
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={() => {
              advanceReveal()
              navigate('/discussion')
            }}
          >
            Start Discussion Round →
          </Button>
        </div>
      </PageLayout>
    )
  }

  const privateInfo = getPlayerPrivateInfo(currentRound.roles, currentPlayer.id)
  const isImposter = privateInfo?.role === 'imposter'
  const displaySecret = privateInfo?.displayInfo || ''

  const isHoldMode = state.settings.revealStyle === 'hold'

  function handleNextPlayer() {
    setIsRevealed(false)
    const result = advanceReveal()
    if (revealIndex + 1 >= players.length || (result.success && state.phase === 'discussion')) {
      navigate('/discussion')
    }
  }

  return (
    <PageLayout
      footer={
        <div className={styles.footerActions}>
          {isRevealed ? (
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={handleNextPlayer}
            >
              {revealIndex + 1 < players.length
                ? `Hide & Pass to ${players[revealIndex + 1].name} →`
                : 'Hide & Begin Discussion →'}
            </Button>
          ) : (
            !isHoldMode && (
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={() => setIsRevealed(true)}
              >
                Reveal Role for {currentPlayer.name}
              </Button>
            )
          )}
        </div>
      }
    >
      <div className={styles.content}>
        <div className={styles.topProgress}>
          <span className={styles.badge}>
            Player {revealIndex + 1} of {players.length}
          </span>
          <span className={styles.progressPill}>
            {revealIndex + 1} / {players.length}
          </span>
        </div>

        <div className={styles.playerHeadingBox}>
          <p className={styles.passToText}>Hand the phone to</p>
          <h2 className={styles.currentPlayerName}>{currentPlayer.name}</h2>
          <div className={styles.privacyNotice}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 13.5997 2.37562 15.1116 3.04346 16.4525C3.22094 16.8088 3.28001 17.2161 3.17712 17.6006L2.58151 19.8267C2.32295 20.793 3.20701 21.677 4.17335 21.4185L6.39939 20.8229C6.78393 20.72 7.19121 20.7791 7.54753 20.9565C8.88837 21.6244 10.4003 22 12 22Z"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
            <span>Keep your screen hidden from others</span>
          </div>
        </div>

        {/* ── CARD SURFACES ── */}
        {!isRevealed ? (
          <div className={styles.hiddenCard}>
            <div className={styles.lockIconWrap}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" strokeWidth="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <p className={styles.secretCoverSub}>
              {isHoldMode
                ? 'Press and hold the button below to see your secret role.'
                : 'Tap reveal when you are alone looking at the screen.'}
            </p>

            {isHoldMode && (
              <button
                type="button"
                className={styles.holdButton}
                onMouseDown={() => setIsRevealed(true)}
                onMouseUp={() => setIsRevealed(false)}
                onTouchStart={() => setIsRevealed(true)}
                onTouchEnd={() => setIsRevealed(false)}
                onKeyDown={(e) => {
                  if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault()
                    setIsRevealed(true)
                  }
                }}
                onKeyUp={(e) => {
                  if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault()
                    setIsRevealed(false)
                  }
                }}
                aria-label="Hold to reveal your secret role"
              >
                Hold to Reveal Role
              </button>
            )}
          </div>
        ) : (
          <div className={[styles.revealedCard, isImposter ? styles.imposterCard : styles.regularCard].join(' ')}>
            <div className={styles.roleHeader}>
              <span className={styles.roleLabel}>Your Secret Role</span>
              <Badge variant={isImposter ? 'danger' : 'success'}>
                {isImposter ? '🕵️ IMPOSTER' : '🛡️ CITIZEN'}
              </Badge>
            </div>

            <div className={styles.secretWordWrap}>
              <span className={styles.wordLabel}>
                {isImposter
                  ? state.settings.imposterMode === 'no_word'
                    ? 'Information'
                    : state.settings.imposterMode === 'vague_hint'
                    ? 'Your Vague Hint'
                    : 'Category Hint'
                  : 'Secret Word'}
              </span>

              <h3 className={styles.secretWordText}>
                {isImposter && state.settings.imposterMode === 'no_word'
                  ? 'NO WORD GIVEN'
                  : displaySecret}
              </h3>
            </div>

            <p className={styles.roleInstruction}>
              {isImposter
                ? "You don't know the exact word! Blend in, listen carefully, and bluff your way through."
                : 'Give clever, subtle clues to prove yourself without giving the word away to the imposter.'}
            </p>
          </div>
        )}
      </div>
    </PageLayout>
  )
}
