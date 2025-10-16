export type ExerciseType = 'normal' | 'neutral' | 'chin-up'
export type ExerciseVariation = 'bodyweight' | 'weighted' | 'band'

export interface ExerciseSet {
  id: string
  reps: number
  weight?: number // kg, only for weighted exercises
  bandResistance?: number // kg equivalent, only for band exercises
  proximityToFailure: number // 1-10 scale, can be 7.5, 8.5, etc.
  restTime: number // seconds
  completedAt: Date
}

export interface WorkoutSession {
  id: string
  date: Date
  exerciseType: ExerciseType
  variation: ExerciseVariation
  sets: ExerciseSet[]
  totalReps: number
  completed: boolean
  createdAt: Date
  updatedAt: Date
}

export interface PersonalRecord {
  exerciseType: ExerciseType
  variation: ExerciseVariation
  maxReps: number
  maxWeight: number
  maxBandResistance: number
  date: Date
}

export interface AppSettings {
  defaultRestTime: number // seconds
  soundEnabled: boolean
  vibrationEnabled: boolean
  theme: 'light' | 'dark' | 'auto'
}

// Ensure module under isolatedModules and type-only import contexts
export const __types_module = true
export {}