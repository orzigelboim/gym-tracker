import { format } from 'date-fns'
import { useProtein } from '../../hooks/useProtein'
import { useSettings } from '../../hooks/useSettings'
import { useWeeklySets } from '../../hooks/useWeeklySets'

interface PillarCardProps {
  label: string
  value: number
  goal: number
  unit: string
  color: string
}

function PillarCard({ label, value, goal, unit, color }: PillarCardProps) {
  const pct = goal > 0 ? Math.min((value / goal) * 100, 100) : 0
  const done = pct >= 100

  return (
    <div className="bg-surface rounded-xl border border-border p-4 flex flex-col gap-2.5">
      <p className="text-xs font-semibold text-muted uppercase tracking-widest">{label}</p>
      <p className="text-xl font-bold font-mono text-text">
        {value.toLocaleString()}
        <span className="text-sm font-normal text-muted"> {unit}</span>
      </p>
      <div className="h-1.5 bg-surface3 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: done ? '#b6f36a' : color }}
        />
      </div>
      <p className="text-xs text-muted">
        {done
          ? <span className="text-lime font-medium">Goal reached!</span>
          : <>{(goal - value).toLocaleString()} {unit} left <span className="text-muted2">/ {goal.toLocaleString()}</span></>
        }
      </p>
    </div>
  )
}

function SetsWeekCard() {
  const { muscleGroups, setsThisWeek, currentWeekLabel } = useWeeklySets()

  if (muscleGroups.length === 0) return null

  const totalDone = muscleGroups.reduce((sum, mg) => sum + (setsThisWeek[mg.id] ?? 0), 0)
  const totalTarget = muscleGroups.reduce((sum, mg) => sum + mg.weeklyTarget, 0)
  const pct = totalTarget > 0 ? Math.min((totalDone / totalTarget) * 100, 100) : 0

  return (
    <div className="bg-surface rounded-xl border border-border p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-muted uppercase tracking-widest">Weekly Sets</p>
        <p className="text-xs text-muted2">{currentWeekLabel}</p>
      </div>

      {/* Overall bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-1.5 bg-surface3 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${pct}%`, backgroundColor: pct >= 100 ? '#b6f36a' : '#a78bfa' }}
          />
        </div>
        <p className="text-xs font-mono text-text shrink-0">
          <span className="font-bold">{totalDone}</span>
          <span className="text-muted"> / {totalTarget}</span>
        </p>
      </div>

      {/* Per-muscle rows (up to 4) */}
      <div className="flex flex-col gap-1.5">
        {muscleGroups.slice(0, 4).map(mg => {
          const done = setsThisWeek[mg.id] ?? 0
          const mgPct = mg.weeklyTarget > 0 ? Math.min((done / mg.weeklyTarget) * 100, 100) : 0
          const barColor = mgPct >= 80 ? '#b6f36a' : mgPct >= 50 ? '#fb923c' : '#f87171'
          return (
            <div key={mg.id} className="flex items-center gap-2">
              <p className="text-xs text-muted2 w-20 truncate shrink-0">{mg.name}</p>
              <div className="flex-1 h-1 bg-surface3 rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${mgPct}%`, backgroundColor: barColor }} />
              </div>
              <p className="text-xs font-mono text-muted shrink-0">{done}/{mg.weeklyTarget}</p>
            </div>
          )
        })}
        {muscleGroups.length > 4 && (
          <p className="text-xs text-muted2">+{muscleGroups.length - 4} more — see Sets page</p>
        )}
      </div>
    </div>
  )
}

export function DashboardSummary() {
  const today = format(new Date(), 'yyyy-MM-dd')
  const { entries } = useProtein(today)
  const { proteinGoal, calorieGoal } = useSettings()

  const totalProtein = entries.reduce((sum, e) => sum + e.grams, 0)
  const totalCalories = entries.reduce((sum, e) => sum + e.calories, 0)

  return (
    <div className="flex flex-col gap-3 pb-2 border-b border-border mb-2">
      <p className="text-xs font-semibold text-muted uppercase tracking-widest">
        Today — {format(new Date(), 'MMMM d')}
      </p>

      <div className="grid grid-cols-2 gap-3">
        <PillarCard
          label="Calories"
          value={totalCalories}
          goal={calorieGoal}
          unit="kcal"
          color="#fb923c"
        />
        <PillarCard
          label="Protein"
          value={totalProtein}
          goal={proteinGoal}
          unit="g"
          color="#60a5fa"
        />
      </div>

      <SetsWeekCard />
    </div>
  )
}
