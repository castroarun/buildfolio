import { Exercise } from '@/types'

const ROUTINES_KEY = 'strength_profile_workout_routines'
const SELECTED_ROUTINE_KEY = 'strength_profile_selected_routine'
const SELECTED_EXERCISES_KEY = 'strength_profile_selected_exercises'

// Basic exercises that are selected by default when choosing a routine
export const DEFAULT_SELECTED_EXERCISES: Exercise[] = [
  'benchPress',
  'squat',
  'deadlift',
  'barbellRow',
  'shoulderPressBarbell',
  'pullUps'
]

export interface WorkoutDay {
  name: string
  exercises: Exercise[]
}

export interface WorkoutRoutine {
  id: string
  name: string
  description: string
  daysPerWeek: number
  days: WorkoutDay[]
  isCustom: boolean
  createdAt?: string
}

/**
 * Predefined workout routines
 * Using Exercise IDs from types: benchPress, inclineBench, dumbbellPress, cableFly,
 * deadlift, barbellRow, latPulldown, pullUps, cableRow,
 * shoulderPressBarbell, shoulderPressDumbbell, sideLateralDumbbell, sideLateralCable, frontRaise,
 * squat, legPress, romanianDeadlift, legCurl, legExtension, calfRaise,
 * bicepCurlBarbell, bicepCurlDumbbell, tricepPushdown, skullCrushers
 */
export const PREDEFINED_ROUTINES: WorkoutRoutine[] = [
  {
    id: 'ppl',
    name: 'Push-Pull-Legs (PPL)',
    description: 'Classic 6-day split focusing on movement patterns. Great for intermediate lifters.',
    daysPerWeek: 6,
    isCustom: false,
    days: [
      {
        name: 'Push A',
        exercises: ['benchPress', 'shoulderPressBarbell', 'inclineBench', 'sideLateralDumbbell', 'tricepPushdown']
      },
      {
        name: 'Pull A',
        exercises: ['barbellRow', 'pullUps', 'latPulldown', 'bicepCurlBarbell', 'bicepCurlDumbbell']
      },
      {
        name: 'Legs A',
        exercises: ['squat', 'romanianDeadlift', 'legPress', 'calfRaise']
      },
      {
        name: 'Push B',
        exercises: ['shoulderPressBarbell', 'benchPress', 'dumbbellPress', 'sideLateralDumbbell', 'skullCrushers']
      },
      {
        name: 'Pull B',
        exercises: ['pullUps', 'barbellRow', 'cableRow', 'bicepCurlDumbbell', 'bicepCurlBarbell']
      },
      {
        name: 'Legs B',
        exercises: ['deadlift', 'squat', 'legCurl', 'calfRaise']
      }
    ]
  },
  {
    id: 'upper-lower',
    name: 'Upper/Lower Split',
    description: '4-day split alternating upper and lower body. Perfect for beginners and busy schedules.',
    daysPerWeek: 4,
    isCustom: false,
    days: [
      {
        name: 'Upper A',
        exercises: ['benchPress', 'barbellRow', 'shoulderPressBarbell', 'pullUps', 'bicepCurlBarbell', 'tricepPushdown']
      },
      {
        name: 'Lower A',
        exercises: ['squat', 'romanianDeadlift', 'legPress', 'legCurl', 'calfRaise']
      },
      {
        name: 'Upper B',
        exercises: ['shoulderPressBarbell', 'pullUps', 'inclineBench', 'barbellRow', 'bicepCurlDumbbell', 'skullCrushers']
      },
      {
        name: 'Lower B',
        exercises: ['deadlift', 'squat', 'legPress', 'calfRaise']
      }
    ]
  },
  {
    id: 'bro-split',
    name: 'Bro Split (5-Day)',
    description: 'Traditional bodybuilding split. One muscle group per day for maximum focus.',
    daysPerWeek: 5,
    isCustom: false,
    days: [
      {
        name: 'Chest',
        exercises: ['benchPress', 'inclineBench', 'dumbbellPress', 'cableFly']
      },
      {
        name: 'Back',
        exercises: ['deadlift', 'barbellRow', 'pullUps', 'latPulldown']
      },
      {
        name: 'Shoulders',
        exercises: ['shoulderPressBarbell', 'sideLateralDumbbell', 'frontRaise', 'shoulderPressDumbbell']
      },
      {
        name: 'Arms',
        exercises: ['bicepCurlBarbell', 'bicepCurlDumbbell', 'tricepPushdown', 'skullCrushers']
      },
      {
        name: 'Legs',
        exercises: ['squat', 'legPress', 'romanianDeadlift', 'legCurl', 'calfRaise']
      }
    ]
  },
  {
    id: 'full-body-3',
    name: 'Full Body (3-Day)',
    description: 'Hit every muscle group 3x per week. Ideal for beginners or those short on time.',
    daysPerWeek: 3,
    isCustom: false,
    days: [
      {
        name: 'Day A',
        exercises: ['squat', 'benchPress', 'barbellRow', 'shoulderPressBarbell', 'bicepCurlBarbell']
      },
      {
        name: 'Day B',
        exercises: ['deadlift', 'inclineBench', 'pullUps', 'sideLateralDumbbell', 'tricepPushdown']
      },
      {
        name: 'Day C',
        exercises: ['legPress', 'benchPress', 'barbellRow', 'cableRow', 'bicepCurlDumbbell']
      }
    ]
  },
  {
    id: '3-day-v1',
    name: '3-Day Split (Chest/Bi, Back/Tri, Legs/Shoulders)',
    description: 'Classic 3-day split pairing opposing muscle groups.',
    daysPerWeek: 3,
    isCustom: false,
    days: [
      {
        name: 'Chest & Biceps',
        exercises: ['benchPress', 'inclineBench', 'cableFly', 'bicepCurlBarbell', 'bicepCurlDumbbell']
      },
      {
        name: 'Back & Triceps',
        exercises: ['deadlift', 'barbellRow', 'pullUps', 'tricepPushdown', 'skullCrushers']
      },
      {
        name: 'Legs & Shoulders',
        exercises: ['squat', 'legPress', 'calfRaise', 'shoulderPressBarbell', 'sideLateralDumbbell']
      }
    ]
  },
  {
    id: '3-day-v2',
    name: '3-Day Split (Chest/Tri, Back/Bi, Legs/Shoulders)',
    description: 'Alternative 3-day split pairing synergistic muscle groups.',
    daysPerWeek: 3,
    isCustom: false,
    days: [
      {
        name: 'Chest & Triceps',
        exercises: ['benchPress', 'inclineBench', 'dumbbellPress', 'tricepPushdown', 'skullCrushers']
      },
      {
        name: 'Back & Biceps',
        exercises: ['deadlift', 'barbellRow', 'pullUps', 'bicepCurlBarbell', 'bicepCurlDumbbell']
      },
      {
        name: 'Legs & Shoulders',
        exercises: ['squat', 'legPress', 'romanianDeadlift', 'shoulderPressBarbell', 'sideLateralDumbbell']
      }
    ]
  },
  {
    id: 'arnold-split',
    name: 'Arnold Split',
    description: 'High-volume 6-day split popularized by Arnold Schwarzenegger.',
    daysPerWeek: 6,
    isCustom: false,
    days: [
      {
        name: 'Chest & Back A',
        exercises: ['benchPress', 'barbellRow', 'inclineBench', 'pullUps', 'cableFly']
      },
      {
        name: 'Shoulders & Arms A',
        exercises: ['shoulderPressBarbell', 'bicepCurlBarbell', 'tricepPushdown', 'sideLateralDumbbell', 'bicepCurlDumbbell']
      },
      {
        name: 'Legs A',
        exercises: ['squat', 'legPress', 'romanianDeadlift', 'legCurl', 'calfRaise']
      },
      {
        name: 'Chest & Back B',
        exercises: ['inclineBench', 'pullUps', 'benchPress', 'barbellRow', 'latPulldown']
      },
      {
        name: 'Shoulders & Arms B',
        exercises: ['sideLateralDumbbell', 'skullCrushers', 'bicepCurlBarbell', 'shoulderPressBarbell', 'bicepCurlDumbbell']
      },
      {
        name: 'Legs B',
        exercises: ['deadlift', 'squat', 'legPress', 'calfRaise']
      }
    ]
  }
]

/**
 * Get all routines (predefined + custom)
 */
export function getAllRoutines(): WorkoutRoutine[] {
  const customRoutines = getCustomRoutines()
  return [...PREDEFINED_ROUTINES, ...customRoutines]
}

/**
 * Get custom routines from localStorage
 */
export function getCustomRoutines(): WorkoutRoutine[] {
  if (typeof window === 'undefined') return []

  const stored = localStorage.getItem(ROUTINES_KEY)
  if (!stored) return []

  try {
    return JSON.parse(stored)
  } catch {
    return []
  }
}

/**
 * Save custom routines to localStorage
 */
function saveCustomRoutines(routines: WorkoutRoutine[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(ROUTINES_KEY, JSON.stringify(routines))
}

/**
 * Add a custom routine
 */
export function addCustomRoutine(routine: Omit<WorkoutRoutine, 'id' | 'isCustom' | 'createdAt'>): WorkoutRoutine {
  const customRoutines = getCustomRoutines()

  const newRoutine: WorkoutRoutine = {
    ...routine,
    id: `custom-${Date.now()}`,
    isCustom: true,
    createdAt: new Date().toISOString()
  }

  customRoutines.push(newRoutine)
  saveCustomRoutines(customRoutines)

  return newRoutine
}

/**
 * Update a custom routine
 */
export function updateCustomRoutine(id: string, updates: Partial<WorkoutRoutine>): WorkoutRoutine | null {
  const customRoutines = getCustomRoutines()
  const index = customRoutines.findIndex(r => r.id === id)

  if (index === -1) return null

  customRoutines[index] = { ...customRoutines[index], ...updates }
  saveCustomRoutines(customRoutines)

  return customRoutines[index]
}

/**
 * Delete a custom routine
 */
export function deleteCustomRoutine(id: string): boolean {
  const customRoutines = getCustomRoutines()
  const filtered = customRoutines.filter(r => r.id !== id)

  if (filtered.length === customRoutines.length) return false

  saveCustomRoutines(filtered)

  // Clear selected routine if it was deleted
  if (getSelectedRoutineId() === id) {
    clearSelectedRoutine()
  }

  return true
}

/**
 * Get routine by ID
 */
export function getRoutineById(id: string): WorkoutRoutine | null {
  return getAllRoutines().find(r => r.id === id) || null
}

/**
 * Get selected routine ID
 */
export function getSelectedRoutineId(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(SELECTED_ROUTINE_KEY)
}

/**
 * Set selected routine
 */
export function setSelectedRoutine(id: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(SELECTED_ROUTINE_KEY, id)
}

/**
 * Clear selected routine
 */
export function clearSelectedRoutine(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(SELECTED_ROUTINE_KEY)
}

/**
 * Get the selected routine
 */
export function getSelectedRoutine(): WorkoutRoutine | null {
  const id = getSelectedRoutineId()
  if (!id) return null
  return getRoutineById(id)
}

/**
 * Get today's workout based on selected routine and week day
 */
export function getTodaysWorkout(): WorkoutDay | null {
  const routine = getSelectedRoutine()
  if (!routine) return null

  // Get the day index based on days since routine was selected
  // This ensures consistent day rotation
  const selectedDate = localStorage.getItem(`${SELECTED_ROUTINE_KEY}_date`)
  const startDate = selectedDate ? new Date(selectedDate) : new Date()

  if (!selectedDate) {
    localStorage.setItem(`${SELECTED_ROUTINE_KEY}_date`, new Date().toISOString())
  }

  const daysSinceStart = Math.floor(
    (Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  )

  const dayIndex = daysSinceStart % routine.days.length
  return routine.days[dayIndex]
}

/**
 * Get selected exercises for the current routine
 */
export function getSelectedExercises(): Exercise[] {
  if (typeof window === 'undefined') return []

  const stored = localStorage.getItem(SELECTED_EXERCISES_KEY)
  if (!stored) return []

  try {
    return JSON.parse(stored)
  } catch {
    return []
  }
}

/**
 * Set selected exercises
 */
export function setSelectedExercises(exercises: Exercise[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(SELECTED_EXERCISES_KEY, JSON.stringify(exercises))
}

/**
 * Toggle exercise selection
 */
export function toggleExerciseSelection(exerciseId: Exercise): Exercise[] {
  const current = getSelectedExercises()
  const index = current.indexOf(exerciseId)

  if (index === -1) {
    current.push(exerciseId)
  } else {
    current.splice(index, 1)
  }

  setSelectedExercises(current)
  return current
}

/**
 * Check if exercise is selected
 */
export function isExerciseSelected(exerciseId: Exercise): boolean {
  return getSelectedExercises().includes(exerciseId)
}

/**
 * Initialize default exercises when a routine is selected
 */
export function initializeDefaultExercises(routine: WorkoutRoutine): Exercise[] {
  // Get all exercises from the routine
  const allRoutineExercises = routine.days.flatMap(day => day.exercises)

  // Select only the default exercises that exist in this routine
  const defaultSelection = DEFAULT_SELECTED_EXERCISES.filter(
    ex => allRoutineExercises.includes(ex)
  )

  setSelectedExercises(defaultSelection)
  return defaultSelection
}
