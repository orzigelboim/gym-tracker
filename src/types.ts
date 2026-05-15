export interface Exercise {
  id: string
  name: string
  sets: number
  repsTarget: string
}

export interface WorkoutDay {
  id: string
  name: string
  color: 'pull' | 'push' | 'shoulders' | 'legs'
  exercises: Exercise[]
  sort_order?: number
}

export interface SetData {
  weight: string
  reps: string
}

export interface LoggedExercise {
  id: string
  name: string
  sets: SetData[]
}

export interface Session {
  id: string
  day_id: string
  day_name: string
  day_color: string
  exercises: LoggedExercise[]
  note: string
  created_at: string
}

export interface ProteinEntry {
  id: number
  date: string
  food_name: string
  grams: number
  created_at: string
}

export interface MuscleGroup {
  id: string
  name: string
  weeklyTarget: number
}

export type WeeklySetsRecord = Record<string, number>
