import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { DEFAULT_PROGRAM } from '../lib/constants'
import { WorkoutDay } from '../types'
import toast from 'react-hot-toast'

const QUERY_KEY = ['program']
const LS_KEY = 'gym-program'

function readProgram(): WorkoutDay[] {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (raw) return JSON.parse(raw) as WorkoutDay[]
  } catch {}
  return []
}

function writeProgram(days: WorkoutDay[]): void {
  localStorage.setItem(LS_KEY, JSON.stringify(days))
}

async function fetchProgram(): Promise<WorkoutDay[]> {
  const stored = readProgram()
  if (stored.length === 0) {
    writeProgram(DEFAULT_PROGRAM)
    return DEFAULT_PROGRAM
  }
  return stored
}

async function saveProgram({
  days,
  deletedIds,
}: {
  days: WorkoutDay[]
  deletedIds: string[]
}): Promise<void> {
  const current = readProgram()
  const afterDelete = current.filter((d) => !deletedIds.includes(d.id))
  const upserted = days.map((day, i) => ({ ...day, sort_order: i }))
  const merged = [
    ...afterDelete.filter((d) => !upserted.find((u) => u.id === d.id)),
    ...upserted,
  ].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
  writeProgram(merged)
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
