import { useNavigate } from 'react-router-dom'
import { Calendar, Plus, Minus, Settings } from 'lucide-react'
import { useWeeklySets } from '../../hooks/useWeeklySets'
import { MuscleGroup } from '../../types'

interface MuscleGroupCardProps {
  group: MuscleGroup
  done: number
  onIncrement: () => void
  onDecrement: () => void
}

function MuscleGroupCard({ group, done, onIncrement, onDecrement }: MuscleGroupCardProps) {
  const pct = group.weeklyTarget > 0
    ? Math.min((done / group.weeklyTarget) * 100, 100)
    : 0
  const barColor = pct >= 80 ? '#b6f36a' : pct >= 50 ? '#fb923c' : '#f87171'

  return (
    <div className="bg-surface rounded-xl border border-border p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-text">{group.name}</p>
        <p className="text-sm font-mono text-muted">
          <span className="text-text font-bold">{done}</span>
          <span> / {group.weeklyTarget} sets</span>
        </p>
      </div>

      <div className="h-1.5 bg-surface3 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${pct}%`, backgroundColor: barColor }}
        />
      </div>

      <div className="flex items-center gap-3 self-end">
        <button
          onClick={onDecrement}
          disabled={done <= 0}
          className="w-8 h-8 rounded-lg bg-surface3 text-text flex items-center justify-center hover:bg-surface2 disabled:opacity-30 transition-colors"
        >
          <Minus size={14} />
        </button>
        <span className="text-sm font-mono text-text w-4 text-center">{done}</span>
        <button
          onClick={onIncrement}
          className="w-8 h-8 rounded-lg bg-lime/20 text-lime flex items-center justify-center hover:bg-lime/30 transition-colors"
        >
          <Plus size={14} />
        </button>
      </div>
    </div>
  )
}

function EmptyState() {
  const navigate = useNavigate()
  return (
    <div className="flex flex-col items-center gap-4 py-16 text-center">
      <div className="w-12 h-12 rounded-full bg-surface3 flex items-center justify-center">
        <Settings size={20} className="text-muted" />
      </div>
      <div>
        <p className="text-sm font-medium text-text">No muscle groups configured</p>
        <p className="text-xs text-muted2 mt-1">Add muscle groups in Settings to start tracking weekly sets.</p>
      </div>
      <button
        onClick={() => navigate('/settings')}
        className="px-4 py-2 rounded-lg bg-lime/20 text-lime text-sm font-medium hover:bg-lime/30 transition-colors"
      >
        Go to Settings
      </button>
    </div>
  )
}

export function SetsPage() {
  const {
    muscleGroups,
    currentWeekLabel,
    setsThisWeek,
    incrementSets,
    decrementSets,
  } = useWeeklySets()

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div className="flex items-center gap-2">
        <Calendar size={15} className="text-muted" />
        <p className="text-sm text-muted">{currentWeekLabel}</p>
      </div>

      {muscleGroups.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="flex flex-col gap-3">
          {muscleGroups.map((group) => (
            <MuscleGroupCard
              key={group.id}
              group={group}
              done={setsThisWeek[group.id] ?? 0}
              onIncrement={() => incrementSets(group.id)}
              onDecrement={() => decrementSets(group.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
