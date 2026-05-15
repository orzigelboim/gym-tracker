import { useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { format, startOfWeek, addDays, parseISO } from 'date-fns'
import { supabase } from '../lib/supabase'
import { MuscleGroup, WeeklySetsRecord } from '../types'
import toast from 'react-hot-toast'

function getWeekKey(date: Date): string {
  return format(startOfWeek(date, { weekStartsOn: 1 }), 'yyyy-MM-dd')
}

function getWeekLabel(weekKey: string): string {
  const monday = parseISO(weekKey)
  const sunday = addDays(monday, 6)
  return `${format(monday, 'MMM d')} – ${format(sunday, 'MMM d')}`
}

// ── Supabase fetchers ─────────────────────────────────────────

async function fetchMuscleGroups(): Promise<MuscleGroup[]> {
  const { data, error } = await supabase
    .from('muscle_groups')
    .select('id, name, weekly_target, sort_order')
    .order('sort_order', { ascending: true })
  if (error) throw new Error(error.message)
  return (data ?? []).map(row => ({
    id: row.id as string,
    name: row.name as string,
    weeklyTarget: row.weekly_target as number,
  }))
}

async function fetchWeekSets(weekStart: string): Promise<WeeklySetsRecord> {
  const { data, error } = await supabase
    .from('weekly_sets')
    .select('muscle_group_id, sets_count')
    .eq('week_start', weekStart)
  if (error) throw new Error(error.message)
  return Object.fromEntries((data ?? []).map(row => [row.muscle_group_id, row.sets_count]))
}

async function fetchWeekHistory(currentWeekKey: string): Promise<Array<{ weekKey: string; weekLabel: string; sets: WeeklySetsRecord }>> {
  const { data, error } = await supabase
    .from('weekly_sets')
    .select('week_start, muscle_group_id, sets_count')
    .neq('week_start', currentWeekKey)
    .order('week_start', { ascending: false })
  if (error) throw new Error(error.message)

  const byWeek: Record<string, WeeklySetsRecord> = {}
  for (const row of data ?? []) {
    if (!byWeek[row.week_start]) byWeek[row.week_start] = {}
    byWeek[row.week_start][row.muscle_group_id] = row.sets_count
  }

  return Object.entries(byWeek)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([weekKey, sets]) => ({ weekKey, weekLabel: getWeekLabel(weekKey), sets }))
}

async function upsertWeekSets(weekStart: string, muscleGroupId: string, setsCount: number): Promise<void> {
  const { error } = await supabase
    .from('weekly_sets')
    .upsert({ week_start: weekStart, muscle_group_id: muscleGroupId, sets_count: setsCount }, { onConflict: 'week_start,muscle_group_id' })
  if (error) throw new Error(error.message)
}

async function insertMuscleGroup(mg: MuscleGroup, sortOrder: number): Promise<void> {
  const { error } = await supabase
    .from('muscle_groups')
    .insert({ id: mg.id, name: mg.name, weekly_target: mg.weeklyTarget, sort_order: sortOrder })
  if (error) throw new Error(error.message)
}

async function updateMuscleGroupRow(id: string, name: string, weeklyTarget: number): Promise<void> {
  const { error } = await supabase
    .from('muscle_groups')
    .update({ name, weekly_target: weeklyTarget })
    .eq('id', id)
  if (error) throw new Error(error.message)
}

async function deleteMuscleGroupRow(id: string): Promise<void> {
  const { error } = await supabase.from('muscle_groups').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

// ── Hook ──────────────────────────────────────────────────────

export function useWeeklySets() {
  const queryClient = useQueryClient()
  const currentWeekKey = useMemo(() => getWeekKey(new Date()), [])
  const currentWeekLabel = useMemo(() => getWeekLabel(currentWeekKey), [currentWeekKey])

  const { data: muscleGroups = [] } = useQuery({
    queryKey: ['muscle-groups'],
    queryFn: fetchMuscleGroups,
    staleTime: 1000 * 60 * 5,
  })

  const { data: setsThisWeek = {} } = useQuery({
    queryKey: ['weekly-sets', currentWeekKey],
    queryFn: () => fetchWeekSets(currentWeekKey),
    staleTime: 1000 * 60,
  })

  const { data: weekHistory = [] } = useQuery({
    queryKey: ['weekly-sets-history', currentWeekKey],
    queryFn: () => fetchWeekHistory(currentWeekKey),
    staleTime: 1000 * 60 * 5,
  })

  // ── Set count mutations ──────────────────────────────────────

  const setsMutation = useMutation({
    mutationFn: ({ muscleId, count }: { muscleId: string; count: number }) =>
      upsertWeekSets(currentWeekKey, muscleId, count),
    onMutate: async ({ muscleId, count }) => {
      const qk = ['weekly-sets', currentWeekKey]
      await queryClient.cancelQueries({ queryKey: qk })
      const previous = queryClient.getQueryData<WeeklySetsRecord>(qk)
      queryClient.setQueryData<WeeklySetsRecord>(qk, old => ({ ...(old ?? {}), [muscleId]: count }))
      return { previous }
    },
    onError: (err: Error, _vars, context) => {
      queryClient.setQueryData(['weekly-sets', currentWeekKey], context?.previous)
      toast.error(`Failed to save: ${err.message}`)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['weekly-sets', currentWeekKey] })
      queryClient.invalidateQueries({ queryKey: ['weekly-sets-history', currentWeekKey] })
    },
  })

  function incrementSets(muscleId: string) {
    const count = (setsThisWeek[muscleId] ?? 0) + 1
    setsMutation.mutate({ muscleId, count })
  }

  function decrementSets(muscleId: string) {
    const current = setsThisWeek[muscleId] ?? 0
    if (current <= 0) return
    setsMutation.mutate({ muscleId, count: current - 1 })
  }

  // ── Muscle group mutations ───────────────────────────────────

  const addMutation = useMutation({
    mutationFn: ({ mg, sortOrder }: { mg: MuscleGroup; sortOrder: number }) =>
      insertMuscleGroup(mg, sortOrder),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['muscle-groups'] }),
    onError: (err: Error) => toast.error(`Failed to add: ${err.message}`),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, name, weeklyTarget }: { id: string; name: string; weeklyTarget: number }) =>
      updateMuscleGroupRow(id, name, weeklyTarget),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['muscle-groups'] }),
    onError: (err: Error) => toast.error(`Failed to update: ${err.message}`),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteMuscleGroupRow(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['muscle-groups'] })
      queryClient.invalidateQueries({ queryKey: ['weekly-sets-history', currentWeekKey] })
    },
    onError: (err: Error) => toast.error(`Failed to delete: ${err.message}`),
  })

  function addMuscleGroup(name: string, weeklyTarget: number) {
    const id = 'mg-' + Math.random().toString(36).slice(2, 10)
    addMutation.mutate({ mg: { id, name, weeklyTarget }, sortOrder: muscleGroups.length })
  }

  function updateMuscleGroup(id: string, name: string, weeklyTarget: number) {
    updateMutation.mutate({ id, name, weeklyTarget })
  }

  function deleteMuscleGroup(id: string) {
    deleteMutation.mutate(id)
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
