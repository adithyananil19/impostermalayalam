import { createContext, useContext, useState, type ReactNode } from 'react'
import type { GameState, Player, GameSettings } from '../types'
import { DEFAULT_SETTINGS } from '../types'

interface GameContextValue {
  state: GameState;
  setPlayers: (players: Player[]) => void;
  updateSettings: (settings: Partial<GameSettings>) => void;
  resetGame: () => void;
}

const initialState: GameState = {
  phase: 'setup',
  players: [],
  settings: DEFAULT_SETTINGS,
  scores: [],
  completedRounds: [],
  usedWordIds: [],
}

const GameContext = createContext<GameContextValue | null>(null)

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<GameState>(initialState)

  function setPlayers(players: Player[]) {
    setState(prev => ({ ...prev, players }))
  }

  function updateSettings(settings: Partial<GameSettings>) {
    setState(prev => ({
      ...prev,
      settings: { ...prev.settings, ...settings },
    }))
  }

  function resetGame() {
    setState(initialState)
  }

  return (
    <GameContext.Provider value={{ state, setPlayers, updateSettings, resetGame }}>
      {children}
    </GameContext.Provider>
  )
}

export function useGame() {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error('useGame must be used inside <GameProvider>')
  return ctx
}
