import { Navigate, Route, Routes } from 'react-router-dom'
import { AppStateProvider, useAppState } from './ui/app/AppState'
import { LevelLadder } from './ui/screens/LevelLadder'
import { Practice } from './ui/screens/Practice'
import { ProfilePicker } from './ui/screens/ProfilePicker'
import { SetResult } from './ui/screens/SetResult'
import { Settings } from './ui/screens/Settings'
import { TopicGrid } from './ui/screens/TopicGrid'

function Routed() {
  const { ready } = useAppState()
  if (!ready) return null

  return (
    <Routes>
      <Route path="/" element={<ProfilePicker />} />
      <Route path="/t" element={<TopicGrid />} />
      <Route path="/t/:topicId" element={<LevelLadder />} />
      <Route path="/t/:topicId/:level" element={<Practice />} />
      <Route path="/t/:topicId/:level/done" element={<SetResult />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export function App() {
  return (
    <AppStateProvider>
      <Routed />
    </AppStateProvider>
  )
}
