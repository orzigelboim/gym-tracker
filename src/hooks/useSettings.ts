import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

const PROTEIN_PER_KG = 2.2

async function fetchSettings(): Promise<Record<string, string>> {
  const { data, error } = await supabase.from('settings').select('key, value')
  if (error) throw new Error(error.message)
  return Object.fromEntries((data ?? []).map(row => [row.key, row.value]))
}

async function upsertSetting(key: string, value: string): Promise<void> {
  const { error } = await supabase
    .from('settings')
    .upsert({ key, value }, { onConflict: 'key' })
  if (error) throw new Error(error.message)
}

export function useSettings() {
  const queryClient = useQueryClient()

  const { data: settings = {}, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: fetchSettings,
    staleTime: 1000 * 60 * 5,
  })

  const bodyWeight = settings.body_weight ? parseFloat(settings.body_weight) : null
  const proteinGoal = settings.protein_goal
    ? parseInt(settings.protein_goal, 10)
    : bodyWeight
      ? Math.round(bodyWeight * PROTEIN_PER_KG)
      : 160
  const calorieGoal = settings.calorie_goal ? parseInt(settings.calorie_goal, 10) : 2200

  const saveBodyWeight = useMutation({
    mutationFn: async (kg: number) => {
      const goal = Math.round(kg * PROTEIN_PER_KG)
      await upsertSetting('body_weight', String(kg))
      await upsertSetting('protein_goal', String(goal))
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] })
      toast.success('Body weight saved')
    },
    onError: (err: Error) => {
      toast.error(`Failed to save: ${err.message}`)
    },
  })

  const saveCalorieGoal = useMutation({
    mutationFn: (kcal: number) => upsertSetting('calorie_goal', String(kcal)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] })
      toast.success('Calorie goal saved')
    },
    onError: (err: Error) => {
      toast.error(`Failed to save: ${err.message}`)
    },
  })

  return {
    isLoading,
    bodyWeight,
    proteinGoal,
    calorieGoal,
    saveBodyWeight: saveBodyWeight.mutate,
    isSavingWeight: saveBodyWeight.isPending,
    saveCalorieGoal: saveCalorieGoal.mutate,
    isSavingCalories: saveCalorieGoal.isPending,
  }
}
