import { NavLink } from 'react-router-dom'
import { format } from 'date-fns'
import {
  LayoutDashboard,
  UtensilsCrossed,
  BarChart2,
  TrendingUp,
  Settings,
} from 'lucide-react'

interface NavItem {
  to: string
  label: string
  icon: React.ReactNode
}

const navItems: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
  { to: '/diet', label: 'Diet', icon: <UtensilsCrossed size={18} /> },
  { to: '/sets', label: 'Sets', icon: <BarChart2 size={18} /> },
  { to: '/progress', label: 'Progress', icon: <TrendingUp size={18} /> },
  { to: '/settings', label: 'Settings', icon: <Settings size={18} /> },
]

export function Sidebar() {
  const today = format(new Date(), 'EEEE, MMMM d')

  return (
    <aside className="hidden md:flex flex-col w-[240px] h-screen fixed left-0 top-0 bg-surface border-r border-border px-3 py-5 z-20">
      {/* Brand */}
      <div className="px-3 mb-6">
        <p className="font-mono text-xs tracking-widest uppercase text-muted2 font-medium">
          Gym Tracker
        </p>
        <p className="text-text font-semibold text-lg mt-0.5">Your Program</p>
        <p className="text-muted2 text-xs mt-1">{today}</p>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-0.5">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              [
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium',
                'transition-colors duration-150',
                isActive
                  ? 'text-lime bg-lime/10'
                  : 'text-muted hover:text-text hover:bg-surface3',
              ].join(' ')
            }
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
