import { Exercise, SetData } from '../../types'
import { Badge } from '../ui/Badge'
import { SetRow } from './SetRow'
import { DAY_COLORS } from '../../lib/constants'

interface ExerciseCardProps {
  exercise: Exercise
  exerciseNumber: number
  dayColor: string
  sets: SetData[]
  previousSets: { weight: string; reps: string }[] | null
  prWeight: number
  onChange: (exerciseId: string, setIndex: number, field: keyof SetData, value: string) => void
}

export function ExerciseCard({
  exercise,
  exerciseNumber,
  dayColor,
  sets,
  previousSets,
  prWeight,
  onChange,
}: ExerciseCardProps) {
  const accentColor = DAY_COLORS[dayColor] ?? '#8a8a8a'

  return (
    <div
      className="bg-surface rounded-xl border border-border overflow-hidden"
      style={{ borderLeftColor: accentColor, borderLeftWidth: 3 }}
    >
      {/* Card header */}
      <div className="px-4 pt-4 pb-3 flex items-start justify-between gap-3">
        <div className="flex items-baseline gap-2 min-w-0">
          <span className="font-mono text-xs text-muted2 flex-shrink-0">
            {String(exerciseNumber).padStart(2, '0')}
          </span>
          <h3 className="font-medium text-text text-sm leading-snug">{exercise.name}</h3>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Badge variant="default">{exercise.repsTarget}</Badge>
          {prWeight > 0 && (
            <Badge variant="pr">★ {prWeight}kg</Badge>
          )}
        </div>
      </div>

      {/* Column headers */}
      <div className="grid grid-cols-[40px_1fr_1fr_72px] gap-2 px-4 pb-1">
        <span className="text-center text-xs text-muted2">Set</span>
        <span className="text-center text-xs text-muted2">Weight kg</span>
        <span className="text-center text-xs text-muted2">Reps</span>
        <span className="text-center text-xs text-muted2">Last time</span>
      </div>

      {/* Set rows */}
      <div className="px-4 pb-4">
        {sets.map((set, idx) => (
          <SetRow
            key={idx}
            setIndex={idx}
            exerciseId={exercise.id}
            weight={set.weight}
            reps={set.reps}
            prevWeight={previousSets?.[idx]?.weight}
            prevReps={previousSets?.[idx]?.reps}
            prWeight={prWeight}
            onChange={onChange}
          />
        ))}
      </div>
    </div>
  )
}
