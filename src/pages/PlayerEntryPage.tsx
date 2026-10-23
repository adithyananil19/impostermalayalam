import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGame } from '../hooks/useGame'
import PageLayout from '../components/PageLayout'
import BackButton from '../components/BackButton'
import Button from '../components/Button'
import styles from './PlayerEntryPage.module.css'
import type { Player } from '../types'

const MIN_PLAYERS = 3
const MAX_PLAYERS = 20

function generateId() {
  return Math.random().toString(36).slice(2, 10)
}

export default function PlayerEntryPage() {
  const navigate = useNavigate()
  const { state, setPlayers } = useGame()

  const [names, setNames] = useState<{ id: string; name: string }[]>(
    state.players.length >= MIN_PLAYERS
      ? state.players.map(p => ({ id: p.id, name: p.name }))
      : Array.from({ length: 4 }, () => ({ id: generateId(), name: '' })),
  )

  const validNames = names.map(n => n.name.trim()).filter(Boolean)
  const hasDupes = new Set(validNames.map(n => n.toLowerCase())).size !== validNames.length
  const canContinue = validNames.length >= MIN_PLAYERS && !hasDupes

  function updateName(id: string, value: string) {
    setNames(prev => prev.map(n => (n.id === id ? { ...n, name: value } : n)))
  }

  function addPlayer() {
    if (names.length < MAX_PLAYERS) {
      setNames(prev => [...prev, { id: generateId(), name: '' }])
    }
  }

  function removePlayer(id: string) {
    if (names.length > MIN_PLAYERS) {
      setNames(prev => prev.filter(n => n.id !== id))
    }
  }

  function handleContinue() {
    const players: Player[] = names
      .filter(n => n.name.trim())
      .map(n => ({ id: n.id, name: n.name.trim() }))
    setPlayers(players)
    navigate('/categories')
  }

  return (
    <PageLayout
      header={<BackButton to="/new-game" />}
      footer={
        <div>
          {hasDupes && (
            <p className={styles.error} role="alert">
              Player names must be unique.
            </p>
          )}
          {validNames.length < MIN_PLAYERS && (
            <p className={styles.hint}>
              Add at least {MIN_PLAYERS} players ({MIN_PLAYERS - validNames.length} more needed).
            </p>
          )}
          <Button
            variant="primary"
            size="lg"
            fullWidth
            disabled={!canContinue}
            onClick={handleContinue}
          >
            Continue
          </Button>
        </div>
      }
    >
      <div className={styles.intro}>
        <h2 className={styles.heading}>Players</h2>
        <p className={styles.sub}>
          {validNames.length} / {MAX_PLAYERS} players
        </p>
      </div>

      <ul className={styles.list}>
        {names.map((player, idx) => (
          <li key={player.id} className={styles.row}>
            <span className={styles.num}>{idx + 1}</span>
            <input
              className={styles.input}
              type="text"
              placeholder={`Player ${idx + 1}`}
              value={player.name}
              onChange={e => updateName(player.id, e.target.value)}
              maxLength={24}
              autoComplete="off"
              spellCheck={false}
              aria-label={`Player ${idx + 1} name`}
            />
            <button
              className={styles.remove}
              onClick={() => removePlayer(player.id)}
              disabled={names.length <= MIN_PLAYERS}
              aria-label={`Remove player ${idx + 1}`}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path
                  d="M12 4L4 12M4 4L12 12"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </li>
        ))}
      </ul>

      {names.length < MAX_PLAYERS && (
        <button className={styles.addBtn} onClick={addPlayer}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path
              d="M8 2V14M2 8H14"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
            />
          </svg>
          Add Player
        </button>
      )}
    </PageLayout>
  )
}
