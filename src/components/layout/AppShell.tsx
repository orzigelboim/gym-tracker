import { Outlet, useLocation } from 'react-router-dom'
import { format } from 'date-fns'
import { Sidebar } from './Sidebar'
import { BottomNav } from './BottomNav'

const PAGE_TITLES: Record<string, string> = {
  '/': 'Log Workout',
  '/diet': 'Diet',
  '/history': 'History',
  '/sets': 'Weekly Sets',
  '/progress': 'Progress',
  '/settings': 'Settings',
}

export function AppShell() {
  const location = useLocation()
  const pageTitle = PAGE_TITLES[location.pathname] ?? 'Gym Tracker'
  const today = format(new Date(), 'EEEE, MMMM d')

  return (
    <div className="min-h-screen bg-bg text-text font-sans">
      <Sidebar />
      <BottomNav />

      <main className="md:ml-[240px] min-h-screen flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-bg/90 backdrop-blur border-b border-border px-4 md:px-8 py-4 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-text">{pageTitle}</h1>
          <span className="text-sm text-muted hidden sm:block">{today}</span>
        </header>

        {/* Content */}
        <div className="flex-1 px-4 md:px-8 py-6 pb-24 md:pb-8">
          <div className="max-w-4xl mx-auto">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  )
}
