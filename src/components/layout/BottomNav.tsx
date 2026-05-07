import { NavLink } from 'react-router-dom'
import {
  Dumbbell,
  UtensilsCrossed,
  ClipboardList,
  TrendingUp,
  Settings,
} from 'lucide-react'

interface NavItem {
  to: string
  label: string
  icon: React.ReactNode
}

const navItems: NavItem[] = [
  { to: '/', label: 'Log', icon: <Dumbbell size={20} /> },
  { to: '/diet', label: 'Diet', icon: <UtensilsCrossed size={20} /> },
  { to: '/history', label: 'History', icon: <ClipboardList size={20} /> },
  { to: '/progress', label: 'Progress', icon: <TrendingUp size={20} /> },
  { to: '/settings', label: 'Settings', icon: <Settings size={20} /> },
]

export function BottomNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-20 bg-surface border-t border-border">
      <div className="flex items-stretch">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              [
                'flex-1 flex flex-col items-center justify-center gap-1 py-2',
                'text-xs font-medium transition-colors duration-150',
                isActive ? 'text-lime' : 'text-muted',
              ].join(' ')
            }
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
