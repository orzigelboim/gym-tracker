import { WorkoutDay } from '../types'

export const DEFAULT_PROGRAM: WorkoutDay[] = [
  {
    id: 'pull',
    name: 'Pull — Back & Traps',
    color: 'pull',
    sort_order: 0,
    exercises: [
      { id: 'pull-1', name: 'Wide-grip lat pulldown', sets: 4, repsTarget: '8–10' },
      { id: 'pull-2', name: 'Seated cable row wide grip', sets: 3, repsTarget: '10–12' },
      { id: 'pull-3', name: 'Single-arm dumbbell row', sets: 3, repsTarget: '10–12' },
      { id: 'pull-4', name: 'Barbell shrug', sets: 4, repsTarget: '10–15' },
      { id: 'pull-5', name: 'Face pull cable', sets: 3, repsTarget: '12–15' },
      { id: 'pull-6', name: 'EZ-bar curl', sets: 3, repsTarget: '10–12' },
    ],
  },
  {
    id: 'push',
    name: 'Push — Chest & Triceps',
    color: 'push',
    sort_order: 1,
    exercises: [
      { id: 'push-1', name: 'Flat barbell bench press', sets: 4, repsTarget: '6–8' },
      { id: 'push-2', name: 'Incline dumbbell press', sets: 3, repsTarget: '8–10' },
      { id: 'push-3', name: 'Cable chest fly low to high', sets: 3, repsTarget: '12–15' },
      { id: 'push-4', name: 'Overhead cable tricep extension', sets: 3, repsTarget: '10–12' },
      { id: 'push-5', name: 'Cable pushdown rope', sets: 3, repsTarget: '12–15' },
    ],
  },
  {
    id: 'shoulders',
    name: 'Shoulders & Arms',
    color: 'shoulders',
    sort_order: 2,
    exercises: [
      { id: 'shoulders-1', name: 'Seated dumbbell overhead press', sets: 4, repsTarget: '8–10' },
      { id: 'shoulders-2', name: 'Lateral raise dumbbell', sets: 4, repsTarget: '12–15' },
      { id: 'shoulders-3', name: 'Cable lateral raise low pulley', sets: 3, repsTarget: '12–15' },
      { id: 'shoulders-4', name: 'Reverse pec deck', sets: 3, repsTarget: '12–15' },
      { id: 'shoulders-5', name: 'Cable upright row', sets: 3, repsTarget: '10–12' },
      { id: 'shoulders-6', name: 'Hammer curl', sets: 3, repsTarget: '10–12' },
      { id: 'shoulders-7', name: 'Skull crusher EZ-bar', sets: 3, repsTarget: '10–12' },
    ],
  },
  {
    id: 'legs',
    name: 'Legs & Core',
    color: 'legs',
    sort_order: 3,
    exercises: [
      { id: 'legs-1', name: 'Barbell back squat', sets: 4, repsTarget: '6–8' },
      { id: 'legs-2', name: 'Leg press', sets: 3, repsTarget: '10–12' },
      { id: 'legs-3', name: 'Romanian deadlift', sets: 3, repsTarget: '8–10' },
      { id: 'legs-4', name: 'Leg curl machine', sets: 3, repsTarget: '10–12' },
      { id: 'legs-5', name: 'Standing calf raise', sets: 4, repsTarget: '12–15' },
      { id: 'legs-6', name: 'Cable crunch', sets: 3, repsTarget: '12–15' },
      { id: 'legs-7', name: 'Plank', sets: 3, repsTarget: '30–45s' },
    ],
  },
]

export const DAY_COLORS: Record<string, string> = {
  pull:      '#34d399',
  push:      '#a78bfa',
  shoulders: '#fb923c',
  legs:      '#60a5fa',
}
