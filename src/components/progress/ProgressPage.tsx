import { useState, useMemo } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { format, parseISO } from 'date-fns'
import { useSessions } from '../../hooks/useSessions'
import { useProgram } from '../../hooks/useProgram'
import { Session } from '../../types'
import { Loader2, TrendingUp, Star } from 'lucide-react'

interface ChartDataPoint {
  date: string
  weight: number
}

function getPRsWithNames(sessions: Session[]): { id: string; name: string; weight: number }[] {
  const prs: Record<string, { name: string; weight: number }> = {}
  for (const session of sessions) {
    for (const exercise of session.exercises) {
      for (const set of exercise.sets) {
        const w = parseFloat(set.weight)
        if (!isNaN(w) && w > 0) {
          if (!prs[exercise.id] || w > prs[exercise.id].weight) {
            prs[exercise.id] = { name: exercise.name, weight: w }
          }
        }
      }
    }
  }
  return Object.entries(prs)
    .map(([id, val]) => ({ id, ...val }))
    .sort((a, b) => b.weight - a.weight)
}

function getChartData(sessions: Session[], exerciseId: string): ChartDataPoint[] {
  const byDate: Record<string, number> = {}
  const sessionsWithEx = [...sessions].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  )
  for (const session of sessionsWithEx) {
    const ex = session.exercises.find((e) => e.id === exerciseId)
    if (!ex) continue
    const dateKey = session.created_at.slice(0, 10)
    for (const set of ex.sets) {
      const w = parseFloat(set.weight)
      if (!isNaN(w) && w > 0) {
        if (!byDate[dateKey] || w > byDate[dateKey]) {
          byDate[dateKey] = w
        }
      }
    }
  }
  return Object.entries(byDate).map(([date, weight]) => ({
    date,
    weight,
  }))
}

interface CustomTooltipProps {
  active?: boolean
  payload?: { value: number }[]
  label?: string
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  const date = label ? format(parseISO(label), 'MMM d, yyyy') : ''
  return (
    <div className="bg-surface2 border border-border2 rounded-lg px-3 py-2 shadow-lg">
      <p className="text-xs text-muted mb-1">{date}</p>
      <p className="text-sm font-semibold font-mono text-lime">{payload[0].value}kg</p>
    </div>
  )
}

export function ProgressPage() {
  const { sessions, isLoading: sessionsLoading } = useSessions()
  const { program, isLoading: programLoading } = useProgram()
  const [selectedExerciseId, setSelectedExerciseId] = useState('')

  const allExercises = useMemo(() => {
    return program.flatMap((day) => day.exercises.map((ex) => ({ ...ex, dayColor: day.color })))
  }, [program])

  const prs = useMemo(() => getPRsWithNames(sessions), [sessions])

  const chartData = useMemo(
    () => (selectedExerciseId ? getChartData(sessions, selectedExerciseId) : []),
    [sessions, selectedExerciseId]
  )

  const isLoading = sessionsLoading || programLoading

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="animate-spin text-muted" size={32} />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8 max-w-2xl">
      {/* Personal Records */}
      <section>
        <h2 className="text-base font-semibold text-text mb-4">Personal Records</h2>
        {prs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3 text-center bg-surface rounded-xl border border-border">
            <Star size={32} className="text-muted2" />
            <p className="text-sm text-muted">No PRs yet.</p>
            <p className="text-xs text-muted2">Log sessions to see your personal records here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {prs.map((pr) => (
              <div
                key={pr.id}
                className="flex items-center justify-between gap-3 px-4 py-3 bg-surface rounded-lg border border-border"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Star size={14} className="text-gold flex-shrink-0" />
                  <span className="text-sm text-text truncate">{pr.name}</span>
                </div>
                <span className="text-sm font-mono font-semibold text-gold flex-shrink-0">
                  {pr.weight}kg
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Weight Progression Chart */}
      <section>
        <h2 className="text-base font-semibold text-text mb-4">Weight Progression</h2>

        <div className="mb-4">
          <label htmlFor="exercise-select" className="text-sm text-muted block mb-1.5">
            Select exercise
          </label>
          <select
            id="exercise-select"
            value={selectedExerciseId}
            onChange={(e) => setSelectedExerciseId(e.target.value)}
            className={[
              'w-full rounded-lg px-3 py-2 text-sm',
              'bg-surface2 border border-border2 text-text',
              'focus:outline-none focus:border-lime focus:ring-2 focus:ring-lime/20',
              'transition-colors duration-150',
            ].join(' ')}
          >
            <option value="">Choose an exercise…</option>
            {allExercises.map((ex) => (
              <option key={ex.id} value={ex.id}>
                {ex.name}
              </option>
            ))}
          </select>
        </div>

        {!selectedExerciseId ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-center bg-surface rounded-xl border border-border">
            <TrendingUp size={32} className="text-muted2" />
            <p className="text-sm text-muted">Select an exercise to view its progression.</p>
          </div>
        ) : chartData.length < 2 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-center bg-surface rounded-xl border border-border">
            <TrendingUp size={32} className="text-muted2" />
            <p className="text-sm text-muted">Not enough data yet.</p>
            <p className="text-xs text-muted2">Log at least 2 sessions with this exercise to see a chart.</p>
          </div>
        ) : (
          <div className="bg-surface rounded-xl border border-border p-4">
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid stroke="#2e2e2e" strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(v: string) => format(parseISO(v), 'MMM d')}
                  tick={{ fill: '#555555', fontSize: 11 }}
                  axisLine={{ stroke: '#2e2e2e' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#555555', fontSize: 11 }}
                  axisLine={{ stroke: '#2e2e2e' }}
                  tickLine={false}
                  unit="kg"
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke="#b6f36a"
                  strokeWidth={2}
                  dot={{ fill: '#b6f36a', r: 4, strokeWidth: 0 }}
                  activeDot={{ fill: '#b6f36a', r: 6, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>
    </div>
  )
}
