import { useState, useEffect, useCallback } from 'react'
import { useProgram } from '../../hooks/useProgram'
import { useSessions } from '../../hooks/useSessions'
import { DayTabs } from './DayTabs'
import { ExerciseCard } from './ExerciseCard'
import { Button } from '../ui/Button'
import { DashboardSummary } from '../dashboard/DashboardSummary'
import { SetData, LoggedExercise } from '../../types'
import { getPRsFromSessions, getPreviousSetsForExercise } from '../../lib/utils'
import { Loader2, Save } from 'lucide-react'

type SetDataMap = Record<string, SetData[]>

function buildEmptySetData(exercises: { id: string; sets: number }[]): SetDataMap {
  const map: SetDataMap = {}
  for (const ex of exercises) {
    map[ex.id] = Array.from({ length: ex.sets }, () => ({ weight: '', reps: '' }))
  }
  return map
}

export function LogPage() {
  const { program, isLoading: programLoading } = useProgram()
  const { sessions, isLoading: sessionsLoading, addSession, isSaving } = useSessions()

  const [currentDayIndex, setCurrentDayIndex] = useState(0)
  const [setData, setSetData] = useState<SetDataMap>({})
  const [note, setNote] = useState('')

  const currentDay = program[currentDayIndex]

  // Initialize set data when day changes
  useEffect(() => {
    if (currentDay) {
      setSetData(buildEmptySetData(currentDay.exercises))
    }
  }, [currentDayIndex, currentDay?.id])

  const prs = getPRsFromSessions(sessions)

  const handleSetChange = useCallback(
    (exerciseId: string, setIndex: number, field: keyof SetData, value: string) => {
      setSetData((prev) => {
        const exerciseSets = [...(prev[exerciseId] ?? [])]
        exerciseSets[setIndex] = { ...exerciseSets[setIndex], [field]: value }
        return { ...prev, [exerciseId]: exerciseSets }
      })
    },
    []
  )

  const handleDayChange = (index: number) => {
    setCurrentDayIndex(index)
    setNote('')
  }

  const handleSave = () => {
    if (!currentDay) return

    const exercises: LoggedExercise[] = currentDay.exercises.map((ex) => ({
      id: ex.id,
      name: ex.name,
      sets: setData[ex.id] ?? [],
    }))

    addSession({
      day_id: currentDay.id,
      day_name: currentDay.name,
      day_color: currentDay.color,
      exercises,
      note,
    })

    // Reset form
    setSetData(buildEmptySetData(currentDay.exercises))
    setNote('')
  }

  if (programLoading || sessionsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="animate-spin text-muted" size={32} />
      </div>
    )
  }

  if (!currentDay) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] text-center">
        <p className="text-muted text-sm">No workout days found. Edit your program first.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      {/* Dashboard summary — today's nutrition + weekly sets */}
      <DashboardSummary />

      {/* Day tabs */}
      <DayTabs days={program} activeIndex={currentDayIndex} onChange={handleDayChange} />

      {/* Exercise cards */}
      <div className="flex flex-col gap-4">
        {currentDay.exercises.map((exercise, idx) => {
          const prevSets = getPreviousSetsForExercise(sessions, currentDay.id, exercise.id)
          const prWeight = prs[exercise.id] ?? 0

          return (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              exerciseNumber={idx + 1}
              dayColor={currentDay.color}
              sets={setData[exercise.id] ?? []}
              previousSets={prevSets}
              prWeight={prWeight}
              onChange={handleSetChange}
            />
          )
        })}
      </div>

      {/* Note */}
      <div className="flex flex-col gap-2">
        <label htmlFor="session-note" className="text-sm font-medium text-muted">
          Session note (optional)
        </label>
        <textarea
          id="session-note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="How did it feel? Any PRs or highlights…"
          rows={3}
          className={[
            'w-full rounded-lg px-3 py-2 text-sm resize-none',
            'bg-surface2 border border-border2 text-text',
            'placeholder:text-muted2',
            'transition-colors duration-150',
            'focus:outline-none focus:border-lime focus:ring-2 focus:ring-lime/20',
          ].join(' ')}
        />
      </div>

      {/* Save button */}
      <Button
        variant="primary"
        size="lg"
        onClick={handleSave}
        disabled={isSaving}
        className="w-full"
      >
        {isSaving ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Saving…
          </>
        ) : (
          <>
            <Save size={16} />
            Save Session
          </>
        )}
      </Button>
    </div>
  )
}
