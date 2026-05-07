import { format, isToday, isYesterday, parseISO } from 'date-fns'
import { DAY_COLORS } from './constants'
import { Session } from '../types'

export function formatDateLabel(dateStr: string): string {
  const date = parseISO(dateStr)
  if (isToday(date)) return 'Today'
  if (isYesterday(date)) return 'Yesterday'
  return format(date, 'MMM d, yyyy')
}

export function getTodayString(): string {
  return format(new Date(), 'yyyy-MM-dd')
}

export function getDayColor(colorName: string): string {
  return DAY_COLORS[colorName] ?? '#8a8a8a'
}

export function getDayColorClass(colorName: string): string {
  const map: Record<string, string> = {
    pull:      'text-pull',
    push:      'text-push',
    shoulders: 'text-shoulders',
    legs:      'text-legs',
  }
  return map[colorName] ?? 'text-muted'
}

export function getDayBorderColorClass(colorName: string): string {
  const map: Record<string, string> = {
    pull:      'border-pull',
    push:      'border-push',
    shoulders: 'border-shoulders',
    legs:      'border-legs',
  }
  return map[colorName] ?? 'border-muted'
}

export function getDayBgClass(colorName: string): string {
  const map: Record<string, string> = {
    pull:      'bg-pull/10',
    push:      'bg-push/10',
    shoulders: 'bg-shoulders/10',
    legs:      'bg-legs/10',
  }
  return map[colorName] ?? 'bg-surface3'
}

export function getPRsFromSessions(sessions: Session[]): Record<string, number> {
  const prs: Record<string, number> = {}
  for (const session of sessions) {
    for (const exercise of session.exercises) {
      for (const set of exercise.sets) {
        const w = parseFloat(set.weight)
        if (!isNaN(w) && w > 0) {
          if (!prs[exercise.id] || w > prs[exercise.id]) {
            prs[exercise.id] = w
          }
        }
      }
    }
  }
  return prs
}

export function getPreviousSetsForExercise(
  sessions: Session[],
  dayId: string,
  exerciseId: string
): { weight: string; reps: string }[] | null {
  const daySessions = sessions
    .filter((s) => s.day_id === dayId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  for (const session of daySessions) {
    const ex = session.exercises.find((e) => e.id === exerciseId)
    if (ex && ex.sets.length > 0) {
      return ex.sets
    }
  }
  return null
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}
