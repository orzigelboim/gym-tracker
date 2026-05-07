import { useState, useRef } from 'react'
import { format, subDays, isToday, isYesterday, parseISO } from 'date-fns'
import { ChevronLeft, ChevronRight, X, Loader2, Beef } from 'lucide-react'
import { useProtein } from '../../hooks/useProtein'
import { ProgressRing } from './ProgressRing'
import { Button } from '../ui/Button'

const GOAL_KEY = 'gym-protein-goal'

function formatDateLabel(dateStr: string): string {
  const date = parseISO(dateStr)
  if (isToday(date)) return 'Today'
  if (isYesterday(date)) return 'Yesterday'
  return format(date, 'MMMM d, yyyy')
}

export function ProteinPage() {
  const [selectedDate, setSelectedDate] = useState(() => format(new Date(), 'yyyy-MM-dd'))
  const [goal, setGoal] = useState(() => {
    const stored = localStorage.getItem(GOAL_KEY)
    return stored ? parseInt(stored, 10) : 160
  })
  const [goalInput, setGoalInput] = useState(String(goal))
  const [foodInput, setFoodInput] = useState('')
  const [gramsInput, setGramsInput] = useState('')

  const foodRef = useRef<HTMLInputElement>(null)
  const gramsRef = useRef<HTMLInputElement>(null)

  const { entries, isLoading, addEntry, deleteEntry } = useProtein(selectedDate)

  const totalGrams = entries.reduce((sum, e) => sum + e.grams, 0)
  const remaining = goal - totalGrams
  const goalReached = totalGrams >= goal

  const today = format(new Date(), 'yyyy-MM-dd')
  const isOnToday = selectedDate === today

  function prevDay() {
    const date = parseISO(selectedDate)
    setSelectedDate(format(subDays(date, 1), 'yyyy-MM-dd'))
  }

  function nextDay() {
    if (!isOnToday) {
      const date = parseISO(selectedDate)
      const next = format(subDays(date, -1), 'yyyy-MM-dd')
      if (next <= today) setSelectedDate(next)
    }
  }

  function handleGoalBlur() {
    const parsed = parseInt(goalInput, 10)
    if (!isNaN(parsed) && parsed > 0) {
      setGoal(parsed)
      localStorage.setItem(GOAL_KEY, String(parsed))
    } else {
      setGoalInput(String(goal))
    }
  }

  function handleAddEntry() {
    const grams = parseFloat(gramsInput)
    if (!foodInput.trim() || isNaN(grams) || grams <= 0) return

    addEntry({
      date: selectedDate,
      food_name: foodInput.trim(),
      grams,
    })

    setFoodInput('')
    setGramsInput('')
    setTimeout(() => foodRef.current?.focus(), 50)
  }

  function handleFoodKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      gramsRef.current?.focus()
    }
  }

  function handleGramsKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddEntry()
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-lg">
      {/* Date navigator */}
      <div className="flex items-center justify-between gap-4">
        <Button variant="ghost" size="sm" onClick={prevDay} aria-label="Previous day">
          <ChevronLeft size={16} />
        </Button>
        <span className="font-medium text-text text-sm">{formatDateLabel(selectedDate)}</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={nextDay}
          disabled={isOnToday}
          aria-label="Next day"
        >
          <ChevronRight size={16} />
        </Button>
      </div>

      {/* Summary card */}
      <div className="bg-surface rounded-xl border border-border p-6 flex items-center gap-6">
        <ProgressRing value={totalGrams} max={goal} size={100} strokeWidth={9} />
        <div className="flex-1 min-w-0">
          <p className="text-3xl font-bold text-protein font-mono">{totalGrams}g</p>
          {goalReached ? (
            <p className="text-sm text-lime mt-1 font-medium">Goal reached! 🎉</p>
          ) : (
            <p className="text-sm text-muted mt-1">{remaining}g remaining</p>
          )}
          <div className="flex items-center gap-2 mt-3">
            <label htmlFor="goal-input" className="text-xs text-muted2 whitespace-nowrap">
              Daily goal:
            </label>
            <input
              id="goal-input"
              type="number"
              inputMode="numeric"
              value={goalInput}
              onChange={(e) => setGoalInput(e.target.value)}
              onBlur={handleGoalBlur}
              className={[
                'w-20 rounded-md px-2 py-1 text-xs text-center font-mono',
                'bg-surface2 border border-border2 text-text',
                'focus:outline-none focus:border-protein focus:ring-2 focus:ring-protein/20',
                'transition-colors duration-150',
              ].join(' ')}
            />
            <span className="text-xs text-muted2">g</span>
          </div>
        </div>
      </div>

      {/* Add food form */}
      <div className="bg-surface rounded-xl border border-border p-4 flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-text">Add food</h2>
        <input
          ref={foodRef}
          type="text"
          value={foodInput}
          onChange={(e) => setFoodInput(e.target.value)}
          onKeyDown={handleFoodKeyDown}
          placeholder="Food name (e.g. Chicken breast)"
          aria-label="Food name"
          className={[
            'w-full rounded-lg px-3 py-2 text-sm',
            'bg-surface2 border border-border2 text-text',
            'placeholder:text-muted2',
            'focus:outline-none focus:border-protein focus:ring-2 focus:ring-protein/20',
            'transition-colors duration-150',
          ].join(' ')}
        />
        <div className="flex gap-2">
          <input
            ref={gramsRef}
            type="number"
            inputMode="decimal"
            min="0"
            step="1"
            value={gramsInput}
            onChange={(e) => setGramsInput(e.target.value)}
            onKeyDown={handleGramsKeyDown}
            placeholder="Protein (g)"
            aria-label="Grams of protein"
            className={[
              'flex-1 rounded-lg px-3 py-2 text-sm',
              'bg-surface2 border border-border2 text-text',
              'placeholder:text-muted2',
              'focus:outline-none focus:border-protein focus:ring-2 focus:ring-protein/20',
              'transition-colors duration-150',
            ].join(' ')}
          />
          <Button
            variant="primary"
            size="md"
            onClick={handleAddEntry}
            disabled={!foodInput.trim() || !gramsInput}
          >
            Add
          </Button>
        </div>
      </div>

      {/* Entries list */}
      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-muted">
          {formatDateLabel(selectedDate)}'s entries
        </h2>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="animate-spin text-muted" size={24} />
          </div>
        ) : entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
            <Beef size={32} className="text-muted2" />
            <p className="text-sm text-muted">No entries yet.</p>
            <p className="text-xs text-muted2">Add your first food above to start tracking.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between gap-3 px-4 py-3 bg-surface rounded-lg border border-border hover:border-border2 transition-colors duration-150"
              >
                <span className="text-sm text-text flex-1 min-w-0 truncate">{entry.food_name}</span>
                <span className="text-sm font-mono font-semibold text-protein flex-shrink-0">
                  {entry.grams}g
                </span>
                <Button
                  variant="icon"
                  size="sm"
                  onClick={() => deleteEntry(entry.id)}
                  aria-label={`Delete ${entry.food_name}`}
                  className="text-muted2 hover:text-danger flex-shrink-0"
                >
                  <X size={14} />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
