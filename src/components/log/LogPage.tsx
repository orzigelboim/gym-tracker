import { useState, useCallback } from 'react'
import { useProgram } from '../../hooks/useProgram'
import { useSessions } from '../../hooks/useSessions'
import { Button } from '../ui/Button'
import { DashboardSummary } from '../dashboard/DashboardSummary'
import { ExercisePicker } from './ExercisePicker'
import { LoggedExercise } from '../../types'
import { getLastSetsForExercise, getPRsFromSessions } from '../../lib/utils'
import { DAY_COLORS } from '../../lib/constants'
import { Plus, X, Trash2, Save, Loader2, Dumbbell } from 'lucide-react'
import toast from 'react-hot-toast'

interface ActiveSet {
  weight: string
  reps: string
}

interface ActiveExercise {
  id: string
  name: string
  dayColor: string
  sets: ActiveSet[]
}

const inputCls = [
  'rounded-lg px-2 py-1.5 text-sm text-center font-mono',
  'bg-surface2 border border-border2 text-text',
  'focus:outline-none focus:border-lime focus:ring-2 focus:ring-lime/20',
  'transition-colors duration-150 w-full',
].join(' ')

function SetRow({
  index,
  set,
  prevSet,
  prWeight,
  onChange,
  onDelete,
}: {
  index: number
  set: ActiveSet
  prevSet?: { weight: string; reps: string }
  prWeight: number
  onChange: (field: 'weight' | 'reps', value: string) => void
  onDelete: () => void
}) {
  const w = parseFloat(set.weight)
  const isPR = !isNaN(w) && w > 0 && w > prWeight

  return (
    <div className="grid grid-cols-[28px_1fr_1fr_28px] gap-2 items-center">
      <span className="text-xs text-muted2 text-center font-mono">{index + 1}</span>
      <div className="relative">
        <input
          type="number"
          inputMode="decimal"
          value={set.weight}
          onChange={(e) => onChange('weight', e.target.value)}
          placeholder={prevSet?.weight || '0'}
          className={inputCls}
        />
        {isPR && (
          <span className="absolute -top-1.5 -right-1.5 text-[9px] font-bold bg-gold text-black rounded-full px-1 leading-4">PR</span>
        )}
      </div>
      <input
        type="number"
        inputMode="numeric"
        value={set.reps}
        onChange={(e) => onChange('reps', e.target.value)}
        placeholder={prevSet?.reps || '0'}
        className={inputCls}
      />
      <button
        onClick={onDelete}
        className="w-7 h-7 flex items-center justify-center rounded-lg text-muted2 hover:text-danger hover:bg-danger/10 transition-colors"
      >
        <X size={13} />
      </button>
    </div>
  )
}

function ExerciseBlock({
  exercise,
  lastSets,
  prWeight,
  onChange,
  onAddSet,
  onDeleteSet,
  onRemove,
}: {
  exercise: ActiveExercise
  lastSets: { weight: string; reps: string }[] | null
  prWeight: number
  onChange: (setIndex: number, field: 'weight' | 'reps', value: string) => void
  onAddSet: () => void
  onDeleteSet: (setIndex: number) => void
  onRemove: () => void
}) {
  const accentColor = DAY_COLORS[exercise.dayColor] ?? '#8a8a8a'

  // Compact "last session" summary
  const lastSummary = lastSets
    ? lastSets
        .filter((s) => s.weight && s.reps)
        .map((s) => `${s.weight}×${s.reps}`)
        .join('  ')
    : null

  return (
    <div
      className="bg-surface rounded-xl border border-border overflow-hidden"
      style={{ borderLeftColor: accentColor, borderLeftWidth: 3 }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
        <p className="flex-1 text-sm font-semibold text-text">{exercise.name}</p>
        {lastSummary && (
          <p className="text-xs text-muted2 font-mono hidden sm:block">{lastSummary}</p>
        )}
        <button
          onClick={onRemove}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-muted2 hover:text-danger hover:bg-danger/10 transition-colors shrink-0"
        >
          <Trash2 size={13} />
        </button>
      </div>

      {/* Last session hint on mobile */}
      {lastSummary && (
        <div className="px-4 pt-2 sm:hidden">
          <p className="text-xs text-muted2 font-mono">Last: {lastSummary}</p>
        </div>
      )}

      {/* Sets */}
      <div className="px-4 py-3 flex flex-col gap-2">
        {/* Column labels */}
        {exercise.sets.length > 0 && (
          <div className="grid grid-cols-[28px_1fr_1fr_28px] gap-2">
            <span />
            <span className="text-xs text-muted2 text-center">kg</span>
            <span className="text-xs text-muted2 text-center">reps</span>
            <span />
          </div>
        )}

        {exercise.sets.map((set, i) => (
          <SetRow
            key={i}
            index={i}
            set={set}
            prevSet={lastSets?.[i]}
            prWeight={prWeight}
            onChange={(field, val) => onChange(i, field, val)}
            onDelete={() => onDeleteSet(i)}
          />
        ))}

        <button
          onClick={onAddSet}
          className="mt-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-dashed border-border2 text-muted2 text-xs hover:border-lime/50 hover:text-lime transition-colors"
        >
          <Plus size={12} /> Add set
        </button>
      </div>
    </div>
  )
}

export function LogPage() {
  const { program, isLoading: programLoading } = useProgram()
  const { sessions, addSession, isSaving } = useSessions()

  const [activeExercises, setActiveExercises] = useState<ActiveExercise[]>([])
  const [pickerOpen, setPickerOpen] = useState(false)
  const [note, setNote] = useState('')

  const prs = getPRsFromSessions(sessions)

  // ── Exercise management ──────────────────────────────────────

  function addExercise(ex: { id: string; name: string; dayColor: string }) {
    const lastSets = getLastSetsForExercise(sessions, ex.id)
    // Pre-fill first set with last session's first set weight
    const firstSet: ActiveSet = {
      weight: lastSets?.[0]?.weight ?? '',
      reps: lastSets?.[0]?.reps ?? '',
    }
    setActiveExercises((prev) => [
      ...prev,
      { id: ex.id, name: ex.name, dayColor: ex.dayColor, sets: [firstSet] },
    ])
  }

  function removeExercise(exerciseIndex: number) {
    setActiveExercises((prev) => prev.filter((_, i) => i !== exerciseIndex))
  }

  const handleSetChange = useCallback(
    (exerciseIndex: number, setIndex: number, field: 'weight' | 'reps', value: string) => {
      setActiveExercises((prev) => {
        const next = prev.map((ex, ei) => {
          if (ei !== exerciseIndex) return ex
          const sets = ex.sets.map((s, si) =>
            si === setIndex ? { ...s, [field]: value } : s
          )
          return { ...ex, sets }
        })
        return next
      })
    },
    []
  )

  function addSet(exerciseIndex: number) {
    setActiveExercises((prev) =>
      prev.map((ex, i) => {
        if (i !== exerciseIndex) return ex
        const last = ex.sets[ex.sets.length - 1]
        return { ...ex, sets: [...ex.sets, { weight: last?.weight ?? '', reps: last?.reps ?? '' }] }
      })
    )
  }

  function deleteSet(exerciseIndex: number, setIndex: number) {
    setActiveExercises((prev) =>
      prev.map((ex, i) => {
        if (i !== exerciseIndex) return ex
        const sets = ex.sets.filter((_, si) => si !== setIndex)
        return { ...ex, sets }
      })
    )
  }

  // ── Save session ─────────────────────────────────────────────

  function handleSave() {
    if (activeExercises.length === 0) {
      toast.error('Add at least one exercise')
      return
    }

    const exercises: LoggedExercise[] = activeExercises
      .filter((ex) => ex.sets.some((s) => s.weight || s.reps))
      .map((ex) => ({
        id: ex.id,
        name: ex.name,
        sets: ex.sets.filter((s) => s.weight || s.reps),
      }))

    if (exercises.length === 0) {
      toast.error('Log at least one set before saving')
      return
    }

    addSession({
      day_id: '',
      day_name: 'Custom',
      day_color: 'pull',
      exercises,
      note,
    })

    setActiveExercises([])
    setNote('')
    toast.success('Session saved!')
  }

  if (programLoading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="animate-spin text-muted" size={32} />
      </div>
    )
  }

  return (
    <>
      {/* Exercise picker overlay */}
      {pickerOpen && (
        <ExercisePicker
          program={program}
          alreadyAdded={activeExercises.map((e) => e.id)}
          onSelect={addExercise}
          onClose={() => setPickerOpen(false)}
        />
      )}

      <div className="flex flex-col gap-6 max-w-2xl">
        {/* Dashboard summary */}
        <DashboardSummary />

        {/* Session builder */}
        <div className="flex flex-col gap-4">
          {activeExercises.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-10 text-center bg-surface rounded-xl border border-dashed border-border2">
              <div className="w-12 h-12 rounded-full bg-surface3 flex items-center justify-center">
                <Dumbbell size={20} className="text-muted" />
              </div>
              <div>
                <p className="text-sm font-medium text-text">No exercises yet</p>
                <p className="text-xs text-muted2 mt-0.5">Tap below to start building your session</p>
              </div>
            </div>
          ) : (
            activeExercises.map((ex, exerciseIndex) => (
              <ExerciseBlock
                key={ex.id + exerciseIndex}
                exercise={ex}
                lastSets={getLastSetsForExercise(sessions, ex.id)}
                prWeight={prs[ex.id] ?? 0}
                onChange={(si, field, val) => handleSetChange(exerciseIndex, si, field, val)}
                onAddSet={() => addSet(exerciseIndex)}
                onDeleteSet={(si) => deleteSet(exerciseIndex, si)}
                onRemove={() => removeExercise(exerciseIndex)}
              />
            ))
          )}

          {/* Add exercise button */}
          <button
            onClick={() => setPickerOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-dashed border-border2 text-muted2 text-sm hover:border-lime/50 hover:text-lime transition-colors"
          >
            <Plus size={15} /> Add exercise
          </button>
        </div>

        {/* Note + save — only show when there's something to save */}
        {activeExercises.length > 0 && (
          <>
            <div className="flex flex-col gap-2">
              <label htmlFor="session-note" className="text-sm font-medium text-muted">
                Session note (optional)
              </label>
              <textarea
                id="session-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="How did it feel? Any PRs or highlights…"
                rows={2}
                className="w-full rounded-lg px-3 py-2 text-sm resize-none bg-surface2 border border-border2 text-text placeholder:text-muted2 focus:outline-none focus:border-lime focus:ring-2 focus:ring-lime/20 transition-colors"
              />
            </div>

            <Button variant="primary" size="lg" onClick={handleSave} disabled={isSaving} className="w-full">
              {isSaving ? (
                <><Loader2 size={16} className="animate-spin" /> Saving…</>
              ) : (
                <><Save size={16} /> Save Session</>
              )}
            </Button>
          </>
        )}
      </div>
    </>
  )
}
