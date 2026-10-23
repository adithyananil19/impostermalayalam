import { createContext, useContext, useState, type ReactNode } from 'react'
import type { GameState, Player, GameSettings, WordEntry } from '../types'
import { DEFAULT_SETTINGS } from '../types'
import { gameReducer, createInitialState, type GameAction } from '../game/stateMachine'
import { INITIAL_WORDS } from '../data/words'

interface GameContextValue {
  state: GameState;
  allWords: WordEntry[];
  setPlayers: (players: Player[]) => void;
  updateSettings: (settings: Partial<GameSettings>) => void;
  startGame: () => { success: boolean; error?: string };
  advanceReveal: () => { success: boolean; error?: string };
  startVoting: () => { success: boolean; error?: string };
  submitVote: (voterId: string, targetId: string) => { success: boolean; error?: string };
  finishVoting: () => { success: boolean; error?: string };
  quickVerdict: (imposterCaught: boolean) => { success: boolean; error?: string };
  skipWord: () => { success: boolean; error?: string };
  nextRound: () => { success: boolean; error?: string };
  restartGame: () => void;
  cancelGame: () => void;
}

const GameContext = createContext<GameContextValue | null>(null)

export function GameProvider({ children }: { children: ReactNode }) {
  const [allWords] = useState<WordEntry[]>(INITIAL_WORDS)
  const [state, setState] = useState<GameState>(() => createInitialState([], DEFAULT_SETTINGS))

  function dispatch(action: GameAction): { success: boolean; error?: string } {
    let resultError: string | undefined
    setState(prev => {
      const result = gameReducer(prev, action)
      if (result.error) {
        resultError = result.error
        return prev
      }
      return result.state
    })
    return { success: !resultError, error: resultError }
  }

  function setPlayers(players: Player[]) {
    setState(prev => ({
      ...prev,
      players,
      scores: players.map(p => {
        const existing = prev.scores.find(s => s.playerId === p.id)
        return existing || { playerId: p.id, points: 0 }
      }),
    }))
  }

  function updateSettings(settings: Partial<GameSettings>) {
    setState(prev => ({
      ...prev,
      settings: { ...prev.settings, ...settings },
    }))
  }

  function startGame() {
    return dispatch({ type: 'START_GAME', payload: { allWords } })
  }

  function advanceReveal() {
    return dispatch({ type: 'ADVANCE_REVEAL' })
  }

  function startVoting() {
    return dispatch({ type: 'START_VOTING' })
  }

  function submitVote(voterId: string, targetId: string) {
    return dispatch({ type: 'SUBMIT_VOTE', payload: { voterId, targetId } })
  }

  function finishVoting() {
    return dispatch({ type: 'FINISH_VOTING' })
  }

  function quickVerdict(imposterCaught: boolean) {
    return dispatch({ type: 'QUICK_VERDICT', payload: { imposterCaught } })
  }

  function skipWord() {
    return dispatch({ type: 'SKIP_WORD', payload: { allWords } })
  }

  function nextRound() {
    return dispatch({ type: 'NEXT_ROUND', payload: { allWords } })
  }

  function restartGame() {
    dispatch({ type: 'RESTART_GAME' })
  }

  function cancelGame() {
    dispatch({ type: 'CANCEL_GAME' })
  }

  return (
    <GameContext.Provider
      value={{
        state,
        allWords,
        setPlayers,
        updateSettings,
        startGame,
        advanceReveal,
        startVoting,
        submitVote,
        finishVoting,
        quickVerdict,
        skipWord,
        nextRound,
        restartGame,
        cancelGame,
      }}
    >
      {children}
    </GameContext.Provider>
  )
}

export function useGame() {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error('useGame must be used inside <GameProvider>')
  return ctx
}
