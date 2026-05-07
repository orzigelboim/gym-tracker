import { WorkoutDay } from '../../types'
import { DAY_COLORS } from '../../lib/constants'

interface DayTabsProps {
  days: WorkoutDay[]
  activeIndex: number
  onChange: (index: number) => void
}

export function DayTabs({ days, activeIndex, onChange }: DayTabsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
      {days.map((day, index) => {
        const isActive = index === activeIndex
        const color = DAY_COLORS[day.color] ?? '#8a8a8a'

        return (
          <button
            key={day.id}
            onClick={() => onChange(index)}
            className={[
              'flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium',
              'transition-all duration-150 whitespace-nowrap',
              'outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-offset-bg',
            ].join(' ')}
            style={
              isActive
                ? {
                    backgroundColor: `${color}22`,
                    color: color,
                    borderWidth: 1,
                    borderColor: `${color}66`,
                    boxShadow: 'none',
                  }
                : {
                    backgroundColor: 'transparent',
                    color: '#8a8a8a',
                    borderWidth: 1,
                    borderColor: '#2e2e2e',
                  }
            }
          >
            {day.name}
          </button>
        )
      })}
    </div>
  )
}
