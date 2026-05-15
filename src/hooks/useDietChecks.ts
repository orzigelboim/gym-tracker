import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export interface DietChecks {
  vegetables: boolean
  waterOnly: boolean
}

async function fetchChecks(date: string): Promise<DietChecks> {
  const { data, error } = await supabase
    .from('diet_checks')
    .select('vegetables, water_only')
    .eq('date', date)
    .maybeSingle()

  if (error) throw new Error(error.message)
  if (!data) return { vegetables: false, waterOnly: false }
  return { vegetables: data.vegetables, waterOnly: data.water_only }
}

async function upsertChecks(date: string, checks: DietChecks): Promise<void> {
  const { error } = await supabase
    .from('diet_checks')
    .upsert({ date, vegetables: checks.vegetables, water_only: checks.waterOnly }, { onConflict: 'date' })
  if (error) throw new Error(error.message)
}

export function useDietChecks(date: string) {
  const queryClient = useQueryClient()
  const queryKey = ['diet-checks', date]

  const { data: checks = { vegetables: false, waterOnly: false } } = useQuery({
    queryKey,
    queryFn: () => fetchChecks(date),
    staleTime: 1000 * 60 * 5,
  })

  const mutation = useMutation({
    mutationFn: (next: DietChecks) => upsertChecks(date, next),
    onMutate: async (next) => {
      await queryClient.cancelQueries({ queryKey })
      const previous = queryClient.getQueryData<DietChecks>(queryKey)
      queryClient.setQueryData(queryKey, next)
      return { previous }
    },
    onError: (_err, _next, context) => {
      if (context?.previous) queryClient.setQueryData(queryKey, context.previous)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey })
    },
  })

  return {
    checks,
    updateChecks: mutation.mutate,
  }
}
