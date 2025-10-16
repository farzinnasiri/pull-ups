import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useStore } from './store'
import { Toaster } from 'sonner'
import HomePage from './pages/HomePage'
import WorkoutPage from './pages/WorkoutPage'
import HistoryPage from './pages/HistoryPage'
import ProgressPage from './pages/ProgressPage'
import SettingsPage from './pages/SettingsPage'
import Navigation from './components/Navigation'

function App() {
  const { loadData } = useStore()

  useEffect(() => {
    loadData()
  }, [loadData])

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <div className="max-w-md mx-auto min-h-screen">
          <main className="pt-safe pb-24">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/workout" element={<WorkoutPage />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/progress" element={<ProgressPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Routes>
          </main>
          <Navigation />
        </div>
      </div>
      <Toaster position="bottom-center" offset={112} />
    </BrowserRouter>
  )
}

export default App
