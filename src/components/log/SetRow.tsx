import { SetData } from '../../types'

interface SetRowProps {
  setIndex: number
  exerciseId: string
  weight: string
  reps: string
  prevWeight: string | undefined
  prevReps: string | undefined
  prWeight: number
  onChange: (exerciseId: string, setIndex: number, field: keyof SetData, value: string) => void
}

export function SetRow({
  setIndex,
  exerciseId,
  weight,
  reps,
  prevWeight,
  prevReps,
  prWeight,
  onChange,
}: SetRowProps) {
  const parsedWeight = parseFloat(weight)
  const isNewPR = !isNaN(parsedWeight) && parsedWeight > prWeight && parsedWeight > 0

  const prevLabel =
    prevWeight && prevReps ? `${prevWeight}×${prevReps}` : '—'

  return (
    <div className="grid grid-cols-[40px_1fr_1fr_72px] gap-2 items-center py-1.5">
      {/* Set label */}
      <span className="text-center font-mono text-xs text-muted2 font-medium">
        S{setIndex + 1}
      </span>

      {/* Weight input */}
      <input
        type="number"
        inputMode="decimal"
        min="0"
        step="0.5"
        value={weight}
        placeholder="kg"
        aria-label={`Set ${setIndex + 1} weight for exercise`}
        onChange={(e) => onChange(exerciseId, setIndex, 'weight', e.target.value)}
        className={[
          'w-full rounded-md px-2 py-1.5 text-sm text-center',
          'bg-surface2 border text-text',
          'placeholder:text-muted2',
          'transition-colors duration-150',
          'focus:outline-none focus:ring-2',
          isNewPR
            ? 'border-gold/70 focus:ring-gold/30 focus:border-gold'
            : 'border-border2 focus:border-lime focus:ring-lime/20',
        ].join(' ')}
      />

      {/* Reps input */}
      <input
        type="number"
        inputMode="numeric"
        min="0"
        value={reps}
        placeholder="reps"
        aria-label={`Set ${setIndex + 1} reps for exercise`}
        onChange={(e) => onChange(exerciseId, setIndex, 'reps', e.target.value)}
        className={[
          'w-full rounded-md px-2 py-1.5 text-sm text-center',
          'bg-surface2 border border-border2 text-text',
          'placeholder:text-muted2',
          'transition-colors duration-150',
          'focus:outline-none focus:border-lime focus:ring-2 focus:ring-lime/20',
        ].join(' ')}
      />

      {/* Previous */}
      <span className="text-center font-mono text-xs text-muted2 truncate">
        {prevLabel}
      </span>
    </div>
  )
}
