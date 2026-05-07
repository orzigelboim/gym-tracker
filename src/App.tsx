import { useEffect } from 'react'
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { AppShell } from './components/layout/AppShell'
import { LogPage } from './components/log/LogPage'
import { DietPage } from './components/diet/DietPage'
import { HistoryPage } from './components/history/HistoryPage'
import { ProgressPage } from './components/progress/ProgressPage'
import { SettingsPage } from './components/settings/SettingsPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

const PAGE_TITLES: Record<string, string> = {
  '/': 'Log Workout — Gym Tracker',
  '/diet': 'Diet — Gym Tracker',
  '/history': 'History — Gym Tracker',
  '/progress': 'Progress — Gym Tracker',
  '/settings': 'Settings — Gym Tracker',
}

function TitleUpdater() {
  const location = useLocation()

  useEffect(() => {
    document.title = PAGE_TITLES[location.pathname] ?? 'Gym Tracker'
  }, [location.pathname])

  return null
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <HashRouter>
        <TitleUpdater />
        <Routes>
          <Route element={<AppShell />}>
            <Route index element={<LogPage />} />
            <Route path="/diet" element={<DietPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/progress" element={<ProgressPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </HashRouter>
      <Toaster
        position="bottom-center"
        toastOptions={{
          style: {
            background: '#1c1c1c',
            color: '#f5f5f5',
            border: '1px solid #2e2e2e',
            borderRadius: '10px',
            fontSize: '13px',
          },
          success: {
            iconTheme: {
              primary: '#b6f36a',
              secondary: '#111111',
            },
          },
          error: {
            iconTheme: {
              primary: '#f87171',
              secondary: '#111111',
            },
          },
        }}
      />
    </QueryClientProvider>
  )
}
