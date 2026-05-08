import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ProteinEntry } from '../types'
import toast from 'react-hot-toast'

function queryKey(date: string) {
  return ['protein', date]
}

function lsKey(date: string) {
  return `gym-protein-${date}`
}

function readEntries(date: string): ProteinEntry[] {
  try {
    const raw = localStorage.getItem(lsKey(date))
    if (raw) return JSON.parse(raw) as ProteinEntry[]
  } catch {}
  return []
}

function writeEntries(date: string, entries: ProteinEntry[]): void {
  localStorage.setItem(lsKey(date), JSON.stringify(entries))
}

interface AddEntryData {
  date: string
  food_name: string
  grams: number
}

async function fetchEntries(date: string): Promise<ProteinEntry[]> {
  return readEntries(date).sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  )
}

async function insertEntry(data: AddEntryData): Promise<ProteinEntry> {
  const entries = readEntries(data.date)
  const entry: ProteinEntry = {
    id: Date.now(),
    date: data.date,
    food_name: data.food_name,
    grams: data.grams,
    created_at: new Date().toISOString(),
  }
  entries.push(entry)
  writeEntries(data.date, entries)
  return entry
}

async function removeEntry(id: number, date: string): Promise<void> {
  writeEntries(date, readEntries(date).filter((e) => e.id !== id))
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
    mutationFn: (id: number) => removeEntry(id, date),
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
