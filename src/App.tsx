import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { GameProvider } from './hooks/useGame'
import HomePage from './pages/HomePage'
import NewGamePage from './pages/NewGamePage'
import PlayerEntryPage from './pages/PlayerEntryPage'
import CategorySelectionPage from './pages/CategorySelectionPage'
import GameSettingsPage from './pages/GameSettingsPage'
import RoleRevealPage from './pages/RoleRevealPage'
import DiscussionPage from './pages/DiscussionPage'
import QuickVerdictPage from './pages/QuickVerdictPage'
import VotingPage from './pages/VotingPage'
import ResultsPage from './pages/ResultsPage'
import ScorePage from './pages/ScorePage'
import CustomWordsPage from './pages/CustomWordsPage'
import PreferencesPage from './pages/PreferencesPage'

export default function App() {
  return (
    <GameProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/new-game" element={<NewGamePage />} />
          <Route path="/players" element={<PlayerEntryPage />} />
          <Route path="/categories" element={<CategorySelectionPage />} />
          <Route path="/settings" element={<GameSettingsPage />} />
          <Route path="/reveal" element={<RoleRevealPage />} />
          <Route path="/discussion" element={<DiscussionPage />} />
          <Route path="/quick-verdict" element={<QuickVerdictPage />} />
          <Route path="/verdict" element={<QuickVerdictPage />} />
          <Route path="/voting" element={<VotingPage />} />
          <Route path="/results" element={<ResultsPage />} />
          <Route path="/score" element={<ScorePage />} />
          <Route path="/custom-words" element={<CustomWordsPage />} />
          <Route path="/preferences" element={<PreferencesPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </GameProvider>
  )
}
