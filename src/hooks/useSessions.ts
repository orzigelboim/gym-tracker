import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { Session, LoggedExercise } from '../types'
import toast from 'react-hot-toast'

const QUERY_KEY = ['sessions']

interface AddSessionData {
  day_id: string
  day_name: string
  day_color: string
  exercises: LoggedExercise[]
  note: string
}

async function fetchSessions(): Promise<Session[]> {
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)

  return (data ?? []).map((row) => ({
    id: row.id as string,
    day_id: row.day_id as string,
    day_name: row.day_name as string,
    day_color: row.day_color as string,
    exercises: row.exercises as LoggedExercise[],
    note: row.note as string,
    created_at: row.created_at as string,
  }))
}

async function insertSession(data: AddSessionData): Promise<void> {
  const { error } = await supabase.from('sessions').insert([data])
  if (error) throw new Error(error.message)
}

async function removeSession(id: string): Promise<void> {
  const { error } = await supabase.from('sessions').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

async function patchSession(id: string, fields: Partial<Pick<Session, 'day_name' | 'note'>>): Promise<void> {
  const { error } = await supabase.from('sessions').update(fields).eq('id', id)
  if (error) throw new Error(error.message)
}

export function useSessions() {
  const queryClient = useQueryClient()

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: fetchSessions,
    staleTime: 1000 * 60 * 5,
  })

  const addMutation = useMutation({
    mutationFn: insertSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      toast.success('Session saved!')
    },
    onError: (err: Error) => {
      toast.error(`Failed to save session: ${err.message}`)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: removeSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      toast.success('Session deleted')
    },
    onError: (err: Error) => {
      toast.error(`Failed to delete: ${err.message}`)
    },
  })

  const patchMutation = useMutation({
    mutationFn: ({ id, fields }: { id: string; fields: Partial<Pick<Session, 'day_name' | 'note'>> }) =>
      patchSession(id, fields),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      toast.success('Session updated')
    },
    onError: (err: Error) => {
      toast.error(`Failed to update: ${err.message}`)
    },
  })

  return {
    sessions,
    isLoading,
    addSession: addMutation.mutate,
    deleteSession: deleteMutation.mutate,
    updateSession: patchMutation.mutate,
    isSaving: addMutation.isPending,
  }
}
