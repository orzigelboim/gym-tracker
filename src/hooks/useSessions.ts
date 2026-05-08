import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Session, LoggedExercise } from '../types'
import toast from 'react-hot-toast'

const QUERY_KEY = ['sessions']
const LS_KEY = 'gym-sessions'

function readSessions(): Session[] {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (raw) return JSON.parse(raw) as Session[]
  } catch {}
  return []
}

function writeSessions(sessions: Session[]): void {
  localStorage.setItem(LS_KEY, JSON.stringify(sessions))
}

interface AddSessionData {
  day_id: string
  day_name: string
  day_color: string
  exercises: LoggedExercise[]
  note: string
}

async function fetchSessions(): Promise<Session[]> {
  return readSessions().sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )
}

async function insertSession(data: AddSessionData): Promise<void> {
  const sessions = readSessions()
  sessions.push({
    ...data,
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
  })
  writeSessions(sessions)
}

async function removeSession(id: string): Promise<void> {
  writeSessions(readSessions().filter((s) => s.id !== id))
}

async function patchSession(id: string, fields: Partial<Pick<Session, 'day_name' | 'note'>>): Promise<void> {
  writeSessions(
    readSessions().map((s) => (s.id === id ? { ...s, ...fields } : s))
  )
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
