import { useState } from 'react'
import { X, Search } from 'lucide-react'
import { WorkoutDay } from '../../types'
import { DAY_COLORS } from '../../lib/constants'

interface PickableExercise {
  id: string
  name: string
  dayName: string
  dayColor: string
}

interface ExercisePickerProps {
  program: WorkoutDay[]
  alreadyAdded: string[]   // exercise ids already in session
  onSelect: (ex: PickableExercise) => void
  onClose: () => void
}

export function ExercisePicker({ program, alreadyAdded, onSelect, onClose }: ExercisePickerProps) {
  const [search, setSearch] = useState('')

  const allExercises: PickableExercise[] = program.flatMap((day) =>
    day.exercises.map((ex) => ({
      id: ex.id,
      name: ex.name,
      dayName: day.name,
      dayColor: day.color,
    }))
  )

  const filtered = allExercises.filter((ex) =>
    ex.name.toLowerCase().includes(search.toLowerCase())
  )

  // Group by dayName
  const groups: Record<string, PickableExercise[]> = {}
  for (const ex of filtered) {
    if (!groups[ex.dayName]) groups[ex.dayName] = []
    groups[ex.dayName].push(ex)
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-bg" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-5 pb-3 border-b border-border shrink-0">
        <h2 className="text-base font-semibold text-text">Add Exercise</h2>
        <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-muted hover:text-text hover:bg-surface3 transition-colors">
          <X size={18} />
        </button>
      </div>

      {/* Search */}
      <div className="px-4 py-3 shrink-0">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search exercises…"
            autoFocus
            className="w-full rounded-lg pl-9 pr-3 py-2 text-sm bg-surface2 border border-border2 text-text placeholder:text-muted2 focus:outline-none focus:border-lime focus:ring-2 focus:ring-lime/20 transition-colors"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4 pb-6">
        {filtered.length === 0 ? (
          <p className="text-sm text-muted text-center py-12">No exercises found.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {Object.entries(groups).map(([dayName, exercises]) => {
              const dayColor = DAY_COLORS[exercises[0].dayColor] ?? '#8a8a8a'
              return (
                <div key={dayName}>
                  <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: dayColor }}>
                    {dayName}
                  </p>
                  <div className="flex flex-col gap-1">
                    {exercises.map((ex) => {
                      const added = alreadyAdded.includes(ex.id)
                      return (
                        <button
                          key={ex.id}
                          disabled={added}
                          onClick={() => { onSelect(ex); onClose() }}
                          className={[
                            'w-full text-left px-4 py-3 rounded-xl border text-sm font-medium transition-colors duration-150',
                            added
                              ? 'bg-surface border-border text-muted2 cursor-default'
                              : 'bg-surface border-border text-text hover:border-lime/50 hover:bg-lime/5 active:bg-lime/10',
                          ].join(' ')}
                        >
                          {ex.name}
                          {added && <span className="ml-2 text-xs text-muted2 font-normal">added</span>}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
