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
import { getLastBestForExercise } from '../../lib/utils'
import { Loader2, TrendingUp, Star, TrendingDown, Minus as Minus2 } from 'lucide-react'

interface ChartDataPoint {
  date: string
  weight: number
}

interface PREntry {
  id: string
  name: string
  weight: number   // all-time PR
}

function getPRsWithNames(sessions: Session[]): PREntry[] {
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
  const sorted = [...sessions].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  )
  for (const session of sorted) {
    const ex = session.exercises.find((e) => e.id === exerciseId)
    if (!ex) continue
    const dateKey = session.created_at.slice(0, 10)
    for (const set of ex.sets) {
      const w = parseFloat(set.weight)
      if (!isNaN(w) && w > 0) {
        if (!byDate[dateKey] || w > byDate[dateKey]) byDate[dateKey] = w
      }
    }
  }
  return Object.entries(byDate).map(([date, weight]) => ({ date, weight }))
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-surface2 border border-border2 rounded-lg px-3 py-2 shadow-lg">
      <p className="text-xs text-muted mb-1">{label ? format(parseISO(label), 'MMM d, yyyy') : ''}</p>
      <p className="text-sm font-semibold font-mono text-lime">{payload[0].value}kg</p>
    </div>
  )
}

function PRCard({ pr, sessions }: { pr: PREntry; sessions: Session[] }) {
  const last = getLastBestForExercise(sessions, pr.id)
  const pct = last ? Math.min((last.weight / pr.weight) * 100, 100) : 0
  const isAtPR = last?.weight === pr.weight
  const diff = last ? last.weight - pr.weight : null

  return (
    <div className="bg-surface rounded-xl border border-border p-4 flex flex-col gap-3">
      {/* Exercise name */}
      <div className="flex items-center gap-2">
        <Star size={13} className="text-gold shrink-0" />
        <p className="text-sm font-semibold text-text truncate">{pr.name}</p>
      </div>

      {/* Last vs PR row */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-col">
          <span className="text-xs text-muted2 uppercase tracking-widest">Last</span>
          <span className="text-base font-mono font-bold text-text">
            {last ? `${last.weight}kg` : '—'}
            {last && <span className="text-xs font-normal text-muted ml-1">× {last.reps}</span>}
          </span>
        </div>
        {/* Trend indicator */}
        <div className="flex flex-col items-center">
          {diff === null ? null : isAtPR ? (
            <Star size={16} className="text-gold" />
          ) : diff < 0 ? (
            <TrendingDown size={16} className="text-danger" />
          ) : (
            <Minus2 size={16} className="text-muted2" />
          )}
          {diff !== null && !isAtPR && (
            <span className={`text-xs font-mono ${diff < 0 ? 'text-danger' : 'text-muted2'}`}>
              {diff < 0 ? diff.toFixed(1) : `+${diff.toFixed(1)}`}
            </span>
          )}
        </div>
        <div className="flex flex-col items-end">
          <span className="text-xs text-muted2 uppercase tracking-widest">PR</span>
          <span className="text-base font-mono font-bold text-gold">{pr.weight}kg</span>
        </div>
      </div>

      {/* Progress bar toward PR */}
      {last && (
        <div>
          <div className="h-1.5 bg-surface3 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${pct}%`,
                backgroundColor: isAtPR ? '#b6f36a' : pct >= 90 ? '#fb923c' : '#60a5fa',
              }}
            />
          </div>
          <p className="text-xs text-muted2 mt-1 text-right">
            {isAtPR ? '🏆 At your PR!' : `${pct.toFixed(0)}% of PR`}
          </p>
        </div>
      )}
    </div>
  )
}

export function ProgressPage() {
  const { sessions, isLoading: sessionsLoading } = useSessions()
  const { program, isLoading: programLoading } = useProgram()
  const [selectedExerciseId, setSelectedExerciseId] = useState('')

  const allExercises = useMemo(
    () => program.flatMap((day) => day.exercises.map((ex) => ({ ...ex, dayColor: day.color }))),
    [program]
  )

  const prs = useMemo(() => getPRsWithNames(sessions), [sessions])

  const chartData = useMemo(
    () => (selectedExerciseId ? getChartData(sessions, selectedExerciseId) : []),
    [sessions, selectedExerciseId]
  )

  if (sessionsLoading || programLoading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="animate-spin text-muted" size={32} />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8 max-w-2xl">

      {/* ── Personal Records ────────────────────────────── */}
      <section>
        <h2 className="text-base font-semibold text-text mb-4">Personal Records</h2>
        {prs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3 text-center bg-surface rounded-xl border border-border">
            <Star size={32} className="text-muted2" />
            <p className="text-sm text-muted">No records yet.</p>
            <p className="text-xs text-muted2">Log sessions to see your personal records here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {prs.map((pr) => (
              <PRCard key={pr.id} pr={pr} sessions={sessions} />
            ))}
          </div>
        )}
      </section>

      {/* ── Weight Progression Chart ─────────────────────── */}
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
            className="w-full rounded-lg px-3 py-2 text-sm bg-surface2 border border-border2 text-text focus:outline-none focus:border-lime focus:ring-2 focus:ring-lime/20 transition-colors"
          >
            <option value="">Choose an exercise…</option>
            {allExercises.map((ex) => (
              <option key={ex.id} value={ex.id}>{ex.name}</option>
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
