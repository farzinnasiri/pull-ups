import type { ExerciseSet } from '@/types'
import { useState } from 'react'

interface SetModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (set: Omit<ExerciseSet, 'id'>) => void
  initialSet?: ExerciseSet
  exerciseType: string
  variation: string
}

const SetModal = ({ isOpen, onClose, onSave, initialSet, exerciseType, variation }: SetModalProps) => {
  const [reps, setReps] = useState(initialSet?.reps || 0)
  const [weight, setWeight] = useState(initialSet?.weight || 0)
  const [bandResistance, setBandResistance] = useState(initialSet?.bandResistance || 0)
  const [proximityToFailure, setProximityToFailure] = useState(initialSet?.proximityToFailure || 5)

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (reps <= 0) {
      alert('Please enter at least 1 rep')
      return
    }

    onSave({
      reps,
      weight: variation === 'weighted' ? weight : undefined,
      bandResistance: variation === 'band' ? bandResistance : undefined,
      proximityToFailure,
      restTime: 0,
      completedAt: new Date()
    })
    
    onClose()
  }

  const getExerciseName = () => {
    const typeNames = {
      normal: 'Pull-ups',
      neutral: 'Neutral Grip',
      'chin-up': 'Chin-ups'
    } as Record<string, string>
    
    const variationNames = {
      bodyweight: '',
      weighted: ' (Weighted)',
      band: ' (Band)'
    } as Record<string, string>

    return typeNames[exerciseType] + variationNames[variation]
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Add Set - {getExerciseName()}
        </h2>

        <form onSubmit={handleSubmit}>
          {/* Reps */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Reps
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={reps}
              onChange={(e) => setReps(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          </div>

          {/* Weight (if weighted variation) */}
          {variation === 'weighted' && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Weight (kg)
              </label>
              <input
                type="number"
                min="0"
                max="200"
                step="0.5"
                value={weight}
                onChange={(e) => setWeight(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {/* Band Resistance (if band variation) */}
          {variation === 'band' && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Band Resistance (kg)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.5"
                value={bandResistance}
                onChange={(e) => setBandResistance(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {/* Proximity to Failure (RPE) */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Proximity to Failure (RPE) - {proximityToFailure}
            </label>
            <input
              type="range"
              min="1"
              max="10"
              step="0.5"
              value={proximityToFailure}
              onChange={(e) => setProximityToFailure(parseFloat(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>Easy (1)</span>
              <span>Max Effort (10)</span>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
            >
              Save Set
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default SetModal