import { useState, useEffect } from 'react'
import { useProgram } from '../../hooks/useProgram'
import { WorkoutDay, Exercise } from '../../types'
import { Button } from '../ui/Button'
import { DAY_COLORS } from '../../lib/constants'
import { Plus, X, Save, Loader2, Trash2, Weight, LayoutGrid } from 'lucide-react'
import toast from 'react-hot-toast'

const BODY_WEIGHT_KEY = 'gym-body-weight'
const PROTEIN_GOAL_KEY = 'gym-protein-goal'
const PROTEIN_PER_KG = 2.2

const COLOR_OPTIONS = [
  { key: 'pull',      hex: '#34d399', label: 'Green'  },
  { key: 'push',      hex: '#a78bfa', label: 'Violet' },
  { key: 'shoulders', hex: '#fb923c', label: 'Orange' },
  { key: 'legs',      hex: '#60a5fa', label: 'Blue'   },
] as const

type DayColor = typeof COLOR_OPTIONS[number]['key']

function generateId(): string { return 'day-' + Math.random().toString(36).slice(2, 10) }
function generateExId(): string { return 'ex-' + Math.random().toString(36).slice(2, 10) }

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center gap-2 pb-2 border-b border-border">
        <span className="text-muted">{icon}</span>
        <h2 className="text-sm font-semibold text-text tracking-wide">{title}</h2>
      </div>
      {children}
    </section>
  )
}

function ColorPicker({ value, onChange }: { value: DayColor; onChange: (c: DayColor) => void }) {
  return (
    <div className="flex gap-1.5" role="radiogroup" aria-label="Day color">
      {COLOR_OPTIONS.map((c) => (
        <button key={c.key} type="button" role="radio" aria-checked={value === c.key} aria-label={c.label}
          onClick={() => onChange(c.key)}
          className="w-6 h-6 rounded-full flex items-center justify-center transition-transform duration-100 hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
          style={{ backgroundColor: c.hex }}
        >
          {value === c.key && (
            <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
              <path d="M1 4L3.5 6.5L9 1" stroke="#111" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>
      ))}
    </div>
  )
}

export function SettingsPage() {
  const { program, isLoading: programLoading, updateProgram, isSaving } = useProgram()
  const [localProgram, setLocalProgram] = useState<WorkoutDay[]>([])
  const [deletedDayIds, setDeletedDayIds] = useState<string[]>([])
  const [bodyWeight, setBodyWeight] = useState(() => localStorage.getItem(BODY_WEIGHT_KEY) ?? '')

  useEffect(() => {
    if (program.length > 0) {
      setLocalProgram(structuredClone(program))
      setDeletedDayIds([])
    }
  }, [program])

  // ── Body weight — auto-saves on blur or Enter ──────────────
  function commitBodyWeight(val: string) {
    const kg = parseFloat(val)
    if (isNaN(kg) || kg <= 0) return
    const proteinGoal = Math.round(kg * PROTEIN_PER_KG)
    localStorage.setItem(BODY_WEIGHT_KEY, String(kg))
    localStorage.setItem(PROTEIN_GOAL_KEY, String(proteinGoal))
  }

  const savedKg = parseFloat(localStorage.getItem(BODY_WEIGHT_KEY) ?? '')
  const proteinGoalPreview = (() => {
    const kg = parseFloat(bodyWeight)
    return isNaN(kg) || kg <= 0 ? null : Math.round(kg * PROTEIN_PER_KG)
  })()

  // ── Day management ─────────────────────────────────────────
  function handleDayNameChange(dayIndex: number, name: string) {
    setLocalProgram((prev) => { const next = structuredClone(prev); next[dayIndex].name = name; return next })
  }

  function handleDayColorChange(dayIndex: number, color: DayColor) {
    setLocalProgram((prev) => { const next = structuredClone(prev); next[dayIndex].color = color; return next })
  }

  function handleDeleteDay(dayIndex: number) {
    const day = localProgram[dayIndex]
    if (!window.confirm(`Delete "${day.name}"? All exercises in this day will be lost.`)) return
    setDeletedDayIds((prev) => [...prev, day.id])
    setLocalProgram((prev) => prev.filter((_, i) => i !== dayIndex))
  }

  function handleAddDay() {
    setLocalProgram((prev) => [...prev, {
      id: generateId(), name: 'New Day', color: 'pull',
      sort_order: prev.length, exercises: [],
    }])
  }

  // ── Exercise management ────────────────────────────────────
  function handleExerciseChange(dayIndex: number, exIndex: number, field: keyof Exercise, value: string | number) {
    setLocalProgram((prev) => {
      const next = structuredClone(prev)
      const ex = next[dayIndex].exercises[exIndex]
      if (field === 'sets') ex.sets = typeof value === 'number' ? value : parseInt(value as string, 10) || 1
      else if (field === 'name') ex.name = value as string
      else if (field === 'repsTarget') ex.repsTarget = value as string
      return next
    })
  }

  function handleDeleteExercise(dayIndex: number, exIndex: number) {
    const exName = localProgram[dayIndex]?.exercises[exIndex]?.name ?? 'this exercise'
    if (!window.confirm(`Delete "${exName}"?`)) return
    setLocalProgram((prev) => {
      const next = structuredClone(prev)
      next[dayIndex].exercises.splice(exIndex, 1)
      return next
    })
  }

  function handleAddExercise(dayIndex: number) {
    setLocalProgram((prev) => {
      const next = structuredClone(prev)
      next[dayIndex].exercises.push({ id: generateExId(), name: '', sets: 3, repsTarget: '8–12' })
      return next
    })
  }

  function handleSaveProgram() {
    for (const day of localProgram) {
      if (!day.name.trim()) { toast.error('All days must have a name.'); return }
      for (const ex of day.exercises) {
        if (!ex.name.trim()) { toast.error('All exercises must have a name.'); return }
      }
    }
    updateProgram({ days: localProgram, deletedIds: deletedDayIds })
    setDeletedDayIds([])
  }

  if (programLoading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="animate-spin text-muted" size={32} />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-10 max-w-2xl">

      {/* ── BODY & NUTRITION ────────────────────────────── */}
      <Section icon={<Weight size={16} />} title="Body & Nutrition">
        <div className="bg-surface rounded-xl border border-border p-5 flex flex-col gap-4">
          <div>
            <p className="text-sm font-medium text-text">Body weight</p>
            <p className="text-xs text-muted2 mt-0.5">
              Protein goal is set at {PROTEIN_PER_KG}g per 1kg of body weight.
            </p>
          </div>
          <div className="relative max-w-[160px]">
            <input
              id="body-weight"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={bodyWeight}
              onChange={(e) => setBodyWeight(e.target.value)}
              onBlur={(e) => commitBodyWeight(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { commitBodyWeight(bodyWeight); (e.target as HTMLInputElement).blur() } }}
              placeholder="e.g. 80"
              className="w-full rounded-lg px-3 py-2 text-sm pr-10 bg-surface2 border border-border2 text-text placeholder:text-muted2 focus:outline-none focus:border-lime focus:ring-2 focus:ring-lime/20 transition-colors duration-150"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted2 pointer-events-none">kg</span>
          </div>
          {!isNaN(savedKg) && savedKg > 0 && parseFloat(bodyWeight) !== savedKg && (
            <p className="text-xs text-muted2">Tap outside the field to save</p>
          )}
          {proteinGoalPreview !== null && (
            <div className="flex items-center gap-2 px-3 py-2 bg-surface2 rounded-lg border border-border2">
              <span className="text-xs text-muted">Daily protein goal →</span>
              <span className="text-sm font-semibold font-mono text-protein">{proteinGoalPreview}g</span>
            </div>
          )}
        </div>
      </Section>

      {/* ── WORKOUT SPLIT ───────────────────────────────── */}
      <Section icon={<LayoutGrid size={16} />} title="Workout Split">
        <div className="flex flex-col gap-3">
          {localProgram.map((day, dayIndex) => {
            const accentColor = DAY_COLORS[day.color] ?? '#8a8a8a'
            return (
              <div key={day.id} className="bg-surface rounded-xl border border-border overflow-hidden"
                style={{ borderLeftColor: accentColor, borderLeftWidth: 3 }}>

                {/* Day header */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
                  <input
                    type="text"
                    value={day.name}
                    onChange={(e) => handleDayNameChange(dayIndex, e.target.value)}
                    placeholder="Day name"
                    aria-label="Day name"
                    className="flex-1 min-w-0 rounded-lg px-3 py-1.5 text-sm font-medium bg-surface2 border border-border2 text-text placeholder:text-muted2 focus:outline-none focus:border-lime focus:ring-2 focus:ring-lime/20 transition-colors duration-150"
                  />
                  <ColorPicker value={day.color} onChange={(c) => handleDayColorChange(dayIndex, c)} />
                  <Button variant="icon" size="sm" onClick={() => handleDeleteDay(dayIndex)}
                    aria-label={`Delete ${day.name}`} className="text-muted2 hover:text-danger flex-shrink-0">
                    <Trash2 size={15} />
                  </Button>
                </div>

                {/* Column headers */}
                {day.exercises.length > 0 && (
                  <div className="grid grid-cols-[1fr_52px_64px_32px] gap-2 px-4 pt-3 pb-1">
                    <span className="text-xs text-muted2">Exercise</span>
                    <span className="text-xs text-muted2 text-center">Sets</span>
                    <span className="text-xs text-muted2 text-center">Reps</span>
                    <span />
                  </div>
                )}

                {/* Exercises */}
                <div className="px-4 pb-3 flex flex-col gap-2">
                  {day.exercises.map((ex, exIndex) => (
                    <div key={ex.id} className="grid grid-cols-[1fr_52px_64px_32px] gap-2 items-center">
                      <input
                        type="text"
                        value={ex.name}
                        onChange={(e) => handleExerciseChange(dayIndex, exIndex, 'name', e.target.value)}
                        placeholder="Exercise name"
                        aria-label={`Exercise ${exIndex + 1} name`}
                        className="rounded-lg px-2.5 py-1.5 text-sm bg-surface2 border border-border2 text-text placeholder:text-muted2 focus:outline-none focus:border-lime focus:ring-2 focus:ring-lime/20 transition-colors duration-150 min-w-0"
                      />
                      <input
                        type="number"
                        inputMode="numeric"
                        min="1" max="10"
                        value={ex.sets}
                        onChange={(e) => handleExerciseChange(dayIndex, exIndex, 'sets', e.target.value)}
                        aria-label={`Sets for exercise ${exIndex + 1}`}
                        className="w-full rounded-lg px-1 py-1.5 text-sm text-center bg-surface2 border border-border2 text-text focus:outline-none focus:border-lime focus:ring-2 focus:ring-lime/20 transition-colors duration-150"
                      />
                      <input
                        type="text"
                        value={ex.repsTarget}
                        onChange={(e) => handleExerciseChange(dayIndex, exIndex, 'repsTarget', e.target.value)}
                        placeholder="8–12"
                        aria-label={`Reps for exercise ${exIndex + 1}`}
                        className="w-full rounded-lg px-1 py-1.5 text-sm text-center font-mono bg-surface2 border border-border2 text-text placeholder:text-muted2 focus:outline-none focus:border-lime focus:ring-2 focus:ring-lime/20 transition-colors duration-150"
                      />
                      <Button variant="icon" size="sm"
                        onClick={() => handleDeleteExercise(dayIndex, exIndex)}
                        aria-label={`Delete ${ex.name || 'exercise'}`}
                        className="text-muted2 hover:text-danger justify-self-center">
                        <X size={14} />
                      </Button>
                    </div>
                  ))}

                  <button
                    onClick={() => handleAddExercise(dayIndex)}
                    className="mt-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-dashed border-border2 text-muted2 text-xs hover:border-lime/50 hover:text-lime transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-lime/30"
                  >
                    <Plus size={13} /> Add exercise
                  </button>
                </div>
              </div>
            )
          })}

          <button
            onClick={handleAddDay}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-dashed border-border2 text-muted2 text-sm hover:border-lime/50 hover:text-lime transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-lime/30"
          >
            <Plus size={15} /> Add training day
          </button>

          <Button variant="primary" size="lg" onClick={handleSaveProgram} disabled={isSaving} className="w-full">
            {isSaving
              ? <><Loader2 size={16} className="animate-spin" /> Saving…</>
              : <><Save size={16} /> Save Program</>}
          </Button>
        </div>
      </Section>

    </div>
  )
}
