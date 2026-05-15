import { useState, useMemo } from 'react'
import { format, startOfWeek, addDays, parseISO } from 'date-fns'
import { MuscleGroup, WeeklySetsRecord } from '../types'

const MUSCLE_GROUPS_KEY = 'gym-muscle-groups'
const SETS_PREFIX = 'gym-weekly-sets-'

function getWeekKey(date: Date): string {
  return format(startOfWeek(date, { weekStartsOn: 1 }), 'yyyy-MM-dd')
}

function getWeekLabel(weekKey: string): string {
  const monday = parseISO(weekKey)
  const sunday = addDays(monday, 6)
  return `${format(monday, 'MMM d')} – ${format(sunday, 'MMM d')}`
}

function loadMuscleGroups(): MuscleGroup[] {
  try {
    return JSON.parse(localStorage.getItem(MUSCLE_GROUPS_KEY) ?? '[]')
  } catch {
    return []
  }
}

function loadSetsForWeek(weekKey: string): WeeklySetsRecord {
  try {
    return JSON.parse(localStorage.getItem(SETS_PREFIX + weekKey) ?? '{}')
  } catch {
    return {}
  }
}

function loadAllWeekHistory(currentWeekKey: string) {
  const keys = Object.keys(localStorage)
    .filter(k => k.startsWith(SETS_PREFIX) && !k.endsWith(currentWeekKey))
    .sort()
    .reverse()

  return keys.map(k => {
    const weekKey = k.slice(SETS_PREFIX.length)
    return {
      weekKey,
      weekLabel: getWeekLabel(weekKey),
      sets: loadSetsForWeek(weekKey),
    }
  })
}

export function useWeeklySets() {
  const currentWeekKey = useMemo(() => getWeekKey(new Date()), [])
  const currentWeekLabel = useMemo(() => getWeekLabel(currentWeekKey), [currentWeekKey])

  const [muscleGroups, setMuscleGroups] = useState<MuscleGroup[]>(loadMuscleGroups)
  const [setsThisWeek, setSetsThisWeek] = useState<WeeklySetsRecord>(() =>
    loadSetsForWeek(currentWeekKey)
  )
  const [weekHistory, setWeekHistory] = useState(() => loadAllWeekHistory(currentWeekKey))

  function saveMuscleGroups(next: MuscleGroup[]) {
    localStorage.setItem(MUSCLE_GROUPS_KEY, JSON.stringify(next))
    setMuscleGroups(next)
  }

  function saveSetsThisWeek(next: WeeklySetsRecord) {
    localStorage.setItem(SETS_PREFIX + currentWeekKey, JSON.stringify(next))
    setSetsThisWeek(next)
  }

  function refreshHistory() {
    setWeekHistory(loadAllWeekHistory(currentWeekKey))
  }

  function addMuscleGroup(name: string, weeklyTarget: number) {
    const id = 'mg-' + Math.random().toString(36).slice(2, 10)
    saveMuscleGroups([...muscleGroups, { id, name, weeklyTarget }])
  }

  function updateMuscleGroup(id: string, name: string, weeklyTarget: number) {
    saveMuscleGroups(muscleGroups.map(mg => mg.id === id ? { ...mg, name, weeklyTarget } : mg))
  }

  function deleteMuscleGroup(id: string) {
    saveMuscleGroups(muscleGroups.filter(mg => mg.id !== id))
  }

  function incrementSets(muscleId: string) {
    const next = { ...setsThisWeek, [muscleId]: (setsThisWeek[muscleId] ?? 0) + 1 }
    saveSetsThisWeek(next)
    refreshHistory()
  }

  function decrementSets(muscleId: string) {
    const current = setsThisWeek[muscleId] ?? 0
    if (current <= 0) return
    const next = { ...setsThisWeek, [muscleId]: current - 1 }
    saveSetsThisWeek(next)
    refreshHistory()
  }

  return {
    muscleGroups,
    addMuscleGroup,
    updateMuscleGroup,
    deleteMuscleGroup,
    currentWeekKey,
    currentWeekLabel,
    setsThisWeek,
    incrementSets,
    decrementSets,
    weekHistory,
  }
}
