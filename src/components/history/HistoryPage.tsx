import { format, parseISO, startOfWeek, isAfter } from 'date-fns'
import { useSessions } from '../../hooks/useSessions'
import { Session } from '../../types'
import { DAY_COLORS } from '../../lib/constants'
import { Button } from '../ui/Button'
import { ClipboardList, Trash2, Loader2 } from 'lucide-react'

function getBestSets(session: Session): string[] {
  return session.exercises.map((ex) => {
    let bestWeight = 0
    let bestReps = ''
    for (const set of ex.sets) {
      const w = parseFloat(set.weight)
      if (!isNaN(w) && w > bestWeight) {
        bestWeight = w
        bestReps = set.reps
      }
    }
    if (bestWeight > 0) {
      return `${ex.name}: ${bestWeight}kg × ${bestReps}r`
    }
    return ex.name
  })
}

function getStatsFromSessions(sessions: Session[]) {
  const total = sessions.length
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 })
  const thisWeek = sessions.filter((s) =>
    isAfter(parseISO(s.created_at), weekStart)
  ).length
  const uniqueDays = new Set(sessions.map((s) => s.created_at.slice(0, 10))).size
  return { total, thisWeek, uniqueDays }
}

export function HistoryPage() {
  const { sessions, isLoading, deleteSession } = useSessions()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="animate-spin text-muted" size={32} />
      </div>
    )
  }

  const { total, thisWeek, uniqueDays } = getStatsFromSessions(sessions)

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-surface rounded-xl border border-border p-4 text-center">
          <p className="text-2xl font-bold font-mono text-text">{total}</p>
          <p className="text-xs text-muted mt-1">Total sessions</p>
        </div>
        <div className="bg-surface rounded-xl border border-border p-4 text-center">
          <p className="text-2xl font-bold font-mono text-lime">{thisWeek}</p>
          <p className="text-xs text-muted mt-1">This week</p>
        </div>
        <div className="bg-surface rounded-xl border border-border p-4 text-center">
          <p className="text-2xl font-bold font-mono text-text">{uniqueDays}</p>
          <p className="text-xs text-muted mt-1">Days trained</p>
        </div>
      </div>

      {/* Session list */}
      {sessions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
          <ClipboardList size={40} className="text-muted2" />
          <p className="text-muted text-sm">No sessions logged yet.</p>
          <p className="text-muted2 text-xs">Head to Log Workout to record your first session.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {sessions.map((session) => {
            const accentColor = DAY_COLORS[session.day_color] ?? '#8a8a8a'
            const bestSets = getBestSets(session)
            const dateLabel = format(parseISO(session.created_at), 'MMMM d, yyyy · h:mm a')

            return (
              <div
                key={session.id}
                className="bg-surface rounded-xl border border-border overflow-hidden"
                style={{ borderLeftColor: accentColor, borderLeftWidth: 3 }}
              >
                {/* Header */}
                <div className="px-4 pt-4 pb-2 flex items-center justify-between gap-3">
                  <div>
                    <span
                      className="text-sm font-semibold"
                      style={{ color: accentColor }}
                    >
                      {session.day_name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted2">{dateLabel}</span>
                    <Button
                      variant="icon"
                      size="sm"
                      onClick={() => {
                        if (window.confirm('Delete this session?')) {
                          deleteSession(session.id)
                        }
                      }}
                      aria-label="Delete session"
                      className="text-muted2 hover:text-danger"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>

                {/* Exercise summary */}
                <div className="px-4 pb-3 flex flex-col gap-0.5">
                  {bestSets.map((label, idx) => (
                    <p key={idx} className="text-xs text-muted">
                      {label}
                    </p>
                  ))}
                </div>

                {/* Note */}
                {session.note && (
                  <div className="px-4 pb-4 pt-2 border-t border-border">
                    <p className="text-xs text-muted italic">{session.note}</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
