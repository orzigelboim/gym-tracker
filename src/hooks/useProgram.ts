import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { DEFAULT_PROGRAM } from '../lib/constants'
import { WorkoutDay } from '../types'
import toast from 'react-hot-toast'

const QUERY_KEY = ['program']

async function fetchProgram(): Promise<WorkoutDay[]> {
  const { data, error } = await supabase
    .from('program')
    .select('*')
    .order('sort_order', { ascending: true })

  if (error) throw new Error(error.message)

  if (!data || data.length === 0) {
    const rows = DEFAULT_PROGRAM.map((day) => ({
      id: day.id,
      name: day.name,
      color: day.color,
      exercises: day.exercises,
      sort_order: day.sort_order ?? 0,
    }))
    const { error: insertError } = await supabase.from('program').insert(rows)
    if (insertError) throw new Error(insertError.message)
    return DEFAULT_PROGRAM
  }

  return data.map((row) => ({
    id: row.id as string,
    name: row.name as string,
    color: row.color as WorkoutDay['color'],
    exercises: row.exercises as WorkoutDay['exercises'],
    sort_order: row.sort_order as number,
  }))
}

async function saveProgram({
  days,
  deletedIds,
}: {
  days: WorkoutDay[]
  deletedIds: string[]
}): Promise<void> {
  if (deletedIds.length > 0) {
    const { error } = await supabase.from('program').delete().in('id', deletedIds)
    if (error) throw new Error(error.message)
  }
  if (days.length > 0) {
    const rows = days.map((day, i) => ({
      id: day.id,
      name: day.name,
      color: day.color,
      exercises: day.exercises,
      sort_order: i,
    }))
    const { error } = await supabase.from('program').upsert(rows)
    if (error) throw new Error(error.message)
  }
}

export function useProgram() {
  const queryClient = useQueryClient()

  const { data: program = [], isLoading } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: fetchProgram,
    staleTime: 1000 * 60 * 5,
  })

  const mutation = useMutation({
    mutationFn: saveProgram,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      toast.success('Program saved!')
    },
    onError: (err: Error) => {
      toast.error(`Failed to save: ${err.message}`)
    },
  })

  return {
    program,
    isLoading,
    updateProgram: mutation.mutate,
    isSaving: mutation.isPending,
  }
}
