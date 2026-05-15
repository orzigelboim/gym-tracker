import { useState, useRef } from 'react'
import { format, subDays, isToday, isYesterday, parseISO } from 'date-fns'
import { ChevronLeft, ChevronRight, X, Loader2, Beef } from 'lucide-react'
import { useProtein } from '../../hooks/useProtein'
import { useDietChecks } from '../../hooks/useDietChecks'
import { useSettings } from '../../hooks/useSettings'
import { ProgressRing } from '../protein/ProgressRing'
import { Button } from '../ui/Button'

function formatDateLabel(dateStr: string): string {
  const date = parseISO(dateStr)
  if (isToday(date)) return 'Today'
  if (isYesterday(date)) return 'Yesterday'
  return format(date, 'MMMM d, yyyy')
}

function HabitCheckbox({ id, label, emoji, checked, onChange }: {
  id: string; label: string; emoji: string; checked: boolean; onChange: (val: boolean) => void
}) {
  return (
    <label
      htmlFor={id}
      className={[
        'flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer',
        'transition-all duration-150 select-none',
        checked
          ? 'bg-lime/10 border-lime/40 text-lime'
          : 'bg-surface border-border text-muted hover:border-border2 hover:text-text',
      ].join(' ')}
    >
      <input id={id} type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="sr-only" />
      <span
        className={[
          'w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all duration-150',
          checked ? 'bg-lime border-lime' : 'border-border2 bg-surface2',
        ].join(' ')}
        aria-hidden="true"
      >
        {checked && (
          <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
            <path d="M1 4.5L4 7.5L10 1" stroke="#111111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      <span className="text-sm font-medium">{emoji} {label}</span>
    </label>
  )
}

export function DietPage() {
  const [selectedDate, setSelectedDate] = useState(() => format(new Date(), 'yyyy-MM-dd'))
  const [foodInput, setFoodInput] = useState('')
  const [gramsInput, setGramsInput] = useState('')

  const foodRef = useRef<HTMLInputElement>(null)
  const gramsRef = useRef<HTMLInputElement>(null)

  const { entries, isLoading, addEntry, deleteEntry } = useProtein(selectedDate)
  const { checks, updateChecks } = useDietChecks(selectedDate)
  const { proteinGoal: goal } = useSettings()

  const totalGrams = entries.reduce((sum, e) => sum + e.grams, 0)
  const remaining = goal - totalGrams
  const goalReached = totalGrams >= goal
  const today = format(new Date(), 'yyyy-MM-dd')
  const isOnToday = selectedDate === today

  function prevDay() {
    setSelectedDate(format(subDays(parseISO(selectedDate), 1), 'yyyy-MM-dd'))
  }

  function nextDay() {
    if (!isOnToday) {
      const next = format(subDays(parseISO(selectedDate), -1), 'yyyy-MM-dd')
      if (next <= today) setSelectedDate(next)
    }
  }

  function handleCheckChange(key: 'vegetables' | 'waterOnly', val: boolean) {
    updateChecks({ ...checks, [key]: val })
  }

  function handleAddEntry() {
    const grams = parseFloat(gramsInput)
    if (!foodInput.trim() || isNaN(grams) || grams <= 0) return
    addEntry({ date: selectedDate, food_name: foodInput.trim(), grams })
    setFoodInput('')
    setGramsInput('')
    setTimeout(() => foodRef.current?.focus(), 50)
  }

  return (
    <div className="flex flex-col gap-6 max-w-lg">

      {/* Date navigator */}
      <div className="flex items-center justify-between gap-4">
        <Button variant="ghost" size="sm" onClick={prevDay} aria-label="Previous day">
          <ChevronLeft size={16} />
        </Button>
        <span className="font-medium text-text text-sm">{formatDateLabel(selectedDate)}</span>
        <Button variant="ghost" size="sm" onClick={nextDay} disabled={isOnToday} aria-label="Next day">
          <ChevronRight size={16} />
        </Button>
      </div>

      {/* Daily habits */}
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold text-muted uppercase tracking-widest">Daily habits</p>
        <HabitCheckbox id="check-vegetables" label="Ate vegetables" emoji="🥦"
          checked={checks.vegetables} onChange={(v) => handleCheckChange('vegetables', v)} />
        <HabitCheckbox id="check-water" label="Drank only water" emoji="💧"
          checked={checks.waterOnly} onChange={(v) => handleCheckChange('waterOnly', v)} />
      </div>

      {/* Protein summary */}
      <div className="bg-surface rounded-xl border border-border p-6 flex items-center gap-6">
        <ProgressRing value={totalGrams} max={goal} size={100} strokeWidth={9} />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-muted uppercase tracking-widest mb-1">Protein</p>
          <p className="text-3xl font-bold text-protein font-mono">{totalGrams}g</p>
          {goalReached ? (
            <p className="text-sm text-lime mt-1 font-medium">Goal reached! 🎉</p>
          ) : (
            <p className="text-sm text-muted mt-1">
              {remaining}g remaining <span className="text-muted2">/ {goal}g goal</span>
            </p>
          )}
        </div>
      </div>

      {/* Add protein form */}
      <div className="bg-surface rounded-xl border border-border p-4 flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-text">Add protein</h2>
        <input
          ref={foodRef}
          type="text"
          value={foodInput}
          onChange={(e) => setFoodInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); gramsRef.current?.focus() } }}
          placeholder="Food name (e.g. Chicken breast)"
          aria-label="Food name"
          className="w-full rounded-lg px-3 py-2 text-sm bg-surface2 border border-border2 text-text placeholder:text-muted2 focus:outline-none focus:border-protein focus:ring-2 focus:ring-protein/20 transition-colors duration-150"
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
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddEntry() } }}
            placeholder="Protein (g)"
            aria-label="Grams of protein"
            className="flex-1 rounded-lg px-3 py-2 text-sm bg-surface2 border border-border2 text-text placeholder:text-muted2 focus:outline-none focus:border-protein focus:ring-2 focus:ring-protein/20 transition-colors duration-150"
          />
          <Button variant="primary" size="md" onClick={handleAddEntry} disabled={!foodInput.trim() || !gramsInput}>
            Add
          </Button>
        </div>
      </div>

      {/* Entries */}
      <div className="flex flex-col gap-3">
        <h2 className="text-xs font-semibold text-muted uppercase tracking-widest">
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
              <div key={entry.id} className="flex items-center justify-between gap-3 px-4 py-3 bg-surface rounded-lg border border-border hover:border-border2 transition-colors duration-150">
                <span className="text-sm text-text flex-1 min-w-0 truncate">{entry.food_name}</span>
                <span className="text-sm font-mono font-semibold text-protein flex-shrink-0">{entry.grams}g</span>
                <Button variant="icon" size="sm" onClick={() => deleteEntry(entry.id)}
                  aria-label={`Delete ${entry.food_name}`} className="text-muted2 hover:text-danger flex-shrink-0">
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
