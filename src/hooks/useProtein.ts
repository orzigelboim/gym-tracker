import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { ProteinEntry } from '../types'
import toast from 'react-hot-toast'

function queryKey(date: string) {
  return ['protein', date]
}

interface AddEntryData {
  date: string
  food_name: string
  grams: number
  calories: number
}

async function fetchEntries(date: string): Promise<ProteinEntry[]> {
  const { data, error } = await supabase
    .from('protein_logs')
    .select('*')
    .eq('date', date)
    .order('created_at', { ascending: true })

  if (error) throw new Error(error.message)

  return (data ?? []).map((row) => ({
    id: row.id as number,
    date: row.date as string,
    food_name: row.food_name as string,
    grams: row.grams as number,
    calories: (row.calories ?? 0) as number,
    created_at: row.created_at as string,
  }))
}

async function insertEntry(data: AddEntryData): Promise<ProteinEntry> {
  const { data: result, error } = await supabase
    .from('protein_logs')
    .insert([data])
    .select()
    .single()

  if (error) throw new Error(error.message)
  return { ...result, calories: result.calories ?? 0 } as ProteinEntry
}

async function removeEntry(id: number): Promise<void> {
  const { error } = await supabase.from('protein_logs').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

export function useProtein(date: string) {
  const queryClient = useQueryClient()

  const { data: entries = [], isLoading } = useQuery({
    queryKey: queryKey(date),
    queryFn: () => fetchEntries(date),
    staleTime: 1000 * 60 * 5,
  })

  const addMutation = useMutation({
    mutationFn: insertEntry,
    onMutate: async (newEntry) => {
      await queryClient.cancelQueries({ queryKey: queryKey(date) })
      const previousEntries = queryClient.getQueryData<ProteinEntry[]>(queryKey(date))

      const optimisticEntry: ProteinEntry = {
        id: Date.now(),
        date: newEntry.date,
        food_name: newEntry.food_name,
        grams: newEntry.grams,
        calories: newEntry.calories,
        created_at: new Date().toISOString(),
      }

      queryClient.setQueryData<ProteinEntry[]>(queryKey(date), (old = []) => [
        ...old,
        optimisticEntry,
      ])

      return { previousEntries }
    },
    onError: (err: Error, _vars, context) => {
      if (context?.previousEntries) {
        queryClient.setQueryData(queryKey(date), context.previousEntries)
      }
      toast.error(`Failed to add entry: ${err.message}`)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKey(date) })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: removeEntry,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKey(date) })
      const previousEntries = queryClient.getQueryData<ProteinEntry[]>(queryKey(date))

      queryClient.setQueryData<ProteinEntry[]>(queryKey(date), (old = []) =>
        old.filter((e) => e.id !== id)
      )

      return { previousEntries }
    },
    onError: (err: Error, _id, context) => {
      if (context?.previousEntries) {
        queryClient.setQueryData(queryKey(date), context.previousEntries)
      }
      toast.error(`Failed to delete: ${err.message}`)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKey(date) })
    },
  })

  return {
    entries,
    isLoading,
    addEntry: addMutation.mutate,
    deleteEntry: deleteMutation.mutate,
  }
}
