import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useGame } from '../hooks/useGame'
import PageLayout from '../components/PageLayout'
import BackButton from '../components/BackButton'
import Button from '../components/Button'
import styles from './PlayerEntryPage.module.css'
import type { Player } from '../types'

const MIN_PLAYERS = 3
const MAX_PLAYERS = 20

const RANDOM_NAMES = [
  'Alex', 'Maya', 'Sam', 'Sneha', 'Leo', 'Arya', 'Chris', 'Nimisha',
  'Noah', 'Sandra', 'Emma', 'Gopika', 'Ryan', 'Zoe', 'Favas', 'Riya',
  'Luke', 'Tara', 'Amal', 'Ananya', 'Max', 'Pooja', 'Kevin', 'Deepa',
  'Arjun', 'Elena', 'Nikhil', 'Chloe', 'Rohan', 'Sara', 'Natasha', 'Ashwin',
  'Dev', 'Athira', 'Neil', 'Devika', 'Gokul', 'Mira', 'Manu', 'Swathi'
]

function generateId() {
  return Math.random().toString(36).slice(2, 10)
}

function getRandomNames(count: number): string[] {
  const shuffled = [...RANDOM_NAMES].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

export default function PlayerEntryPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { state, setPlayers } = useGame()

  // Target count requested from previous page
  const requestedCount = parseInt(searchParams.get('count') || '0', 10)

  const [names, setNames] = useState<{ id: string; name: string }[]>(() => {
    const targetLength = requestedCount >= MIN_PLAYERS && requestedCount <= MAX_PLAYERS
      ? requestedCount
      : state.players.length >= MIN_PLAYERS
      ? state.players.length
      : 4

    if (state.players.length === targetLength) {
      return state.players.map(p => ({ id: p.id, name: p.name }))
    }

    return Array.from({ length: targetLength }, (_, i) => ({
      id: generateId(),
      name: state.players[i]?.name || ''
    }))
  })

  // Ensure row count reflects requestedCount if changed
  useEffect(() => {
    if (requestedCount >= MIN_PLAYERS && requestedCount <= MAX_PLAYERS && names.length !== requestedCount) {
      setNames(prev => {
        if (prev.length < requestedCount) {
          const needed = requestedCount - prev.length
          const additions = Array.from({ length: needed }, () => ({ id: generateId(), name: '' }))
          return [...prev, ...additions]
        } else {
          return prev.slice(0, requestedCount)
        }
      })
    }
  }, [requestedCount])

  const validNames = names.map(n => n.name.trim()).filter(Boolean)
  const hasDupes = new Set(validNames.map(n => n.toLowerCase())).size !== validNames.length
  const canContinue = validNames.length >= MIN_PLAYERS && validNames.length === names.length && !hasDupes

  function updateName(id: string, value: string) {
    setNames(prev => prev.map(n => (n.id === id ? { ...n, name: value } : n)))
  }

  function handleFillRandomNames() {
    const randomPicks = getRandomNames(names.length)
    setNames(prev =>
      prev.map((item, idx) => ({
        ...item,
        name: randomPicks[idx] || `Player ${idx + 1}`
      }))
    )
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
    navigate('/settings')
  }

  return (
    <PageLayout
      header={<BackButton to="/new-game" label="Player Count" />}
      footer={
        <div>
          {hasDupes && (
            <p className={styles.error} role="alert">
              ⚠️ Player names must be unique.
            </p>
          )}
          {validNames.length < names.length && (
            <p className={styles.hint}>
              Please enter a name for each player (or tap random button above).
            </p>
          )}
          <Button
            variant="primary"
            size="lg"
            fullWidth
            disabled={!canContinue}
            onClick={handleContinue}
          >
            Continue to Game Settings ({validNames.length} Ready) →
          </Button>
        </div>
      }
    >
      <div className={styles.intro}>
        <div className={styles.topHeaderRow}>
          <div>
            <span className={styles.stepBadge}>Step 2 of 3</span>
            <h2 className={styles.heading}>Player Names</h2>
          </div>
          <span className={styles.countBadge}>{names.length} Players</span>
        </div>
        <p className={styles.sub}>
          Enter names or auto-fill with random party names.
        </p>
      </div>

      <div className={styles.quickActionBox}>
        <button
          type="button"
          className={styles.randomFillBtn}
          onClick={handleFillRandomNames}
        >
          <span className={styles.diceIcon}>🎲</span>
          <span>Fill Random Names</span>
        </button>
      </div>

      <ul className={styles.list}>
        {names.map((player, idx) => (
          <li key={player.id} className={styles.row}>
            <span className={styles.num}>{idx + 1}</span>
            <input
              className={styles.input}
              type="text"
              placeholder={`Player ${idx + 1} name`}
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
                  strokeWidth="1.75"
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
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          Add Another Player
        </button>
      )}
    </PageLayout>
  )
}
