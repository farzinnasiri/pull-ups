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
  const [proximityToFailure, setProximityToFailure] = useState(initialSet?.proximityToFailure || 6)

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
      <div className="bg-white dark:bg-black rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Add Set - {getExerciseName()}
        </h2>

        <form onSubmit={handleSubmit}>
          {/* Reps */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Reps
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                max="100"
                value={reps}
                onChange={(e) => setReps(parseInt(e.target.value) || 0)}
                className="w-full pr-10 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col items-center gap-0.5">
                <button
                  type="button"
                  aria-label="Increase reps"
                  onClick={() => setReps((prev: number) => Math.min(100, prev + 1))}
                  className="w-4 h-4 rounded bg-gray-500/40 dark:bg-gray-500/40 text-gray-900 dark:text-gray-100 hover:bg-gray-500/60 transition grid place-items-center border border-gray-400/40 dark:border-gray-500/40"
                >
                  <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="6 15 12 9 18 15" />
                  </svg>
                </button>
                <button
                  type="button"
                  aria-label="Decrease reps"
                  onClick={() => setReps((prev: number) => Math.max(0, prev - 1))}
                  className="w-4 h-4 rounded bg-gray-500/40 dark:bg-gray-500/40 text-gray-900 dark:text-gray-100 hover:bg-gray-500/60 transition grid place-items-center border border-gray-400/40 dark:border-gray-500/40"
                >
                  <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="mt-2 flex flex-wrap justify-center gap-1">
               {[2,4,6,8,10].map((val) => {
                 const selected = reps === val
                 return (
                   <button
                     type="button"
                     key={val}
                     onClick={() => setReps(val)}
                     className={(selected ? "bg-blue-600 text-white" : "bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100") + " rounded-full px-3.5 py-1.5 text-sm"}
                   >
                     {val}
                   </button>
                 )
               })}
             </div>
          </div>

          {/* Weight (if weighted variation) */}
          {variation === 'weighted' && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Weight (kg)
              </label>
              <input
                type="text"
                inputMode="decimal"
                pattern="[0-9]*[.]?[0-9]*"
                value={String(weight)}
                onChange={(e) => {
                  const raw = e.target.value
                  const sanitized = raw.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1')
                  const normalized = sanitized.startsWith('0') && !sanitized.startsWith('0.')
                    ? sanitized.replace(/^0+(?=\d)/, '')
                    : sanitized
                  const num = parseFloat(normalized)
                  setWeight(Number.isFinite(num) ? Math.min(200, Math.max(0, parseFloat(num.toFixed(1)))) : 0)
                }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="mt-2 flex flex-wrap justify-center gap-1.5">
                {[2.5,5,7.5,10].map((val) => {
                  const selected = weight === val
                  return (
                    <button
                      type="button"
                      key={val}
                      onClick={() => setWeight(val)}
                      className={(selected ? "bg-blue-600 text-white" : "bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100") + " rounded-full px-3.5 py-1.5 text-sm"}
                    >
                      {val}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Band Resistance (if band variation) */}
          {variation === 'band' && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Band Resistance (kg)
              </label>
              <input
                type="text"
                inputMode="decimal"
                pattern="[0-9]*[.]?[0-9]*"
                value={String(bandResistance)}
                onChange={(e) => {
                  const raw = e.target.value
                  const sanitized = raw.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1')
                  const normalized = sanitized.startsWith('0') && !sanitized.startsWith('0.')
                    ? sanitized.replace(/^0+(?=\d)/, '')
                    : sanitized
                  const num = parseFloat(normalized)
                  setBandResistance(Number.isFinite(num) ? Math.min(200, Math.max(0, parseFloat(num.toFixed(1)))) : 0)
                }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="mt-2 flex flex-wrap justify-center gap-1.5">
                {[10,15,20,25,30,35].map((val) => {
                  const selected = bandResistance === val
                  return (
                    <button
                      type="button"
                      key={val}
                      onClick={() => setBandResistance(val)}
                      className={(selected ? "bg-blue-600 text-white" : "bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100") + " rounded-full px-3.5 py-1.5 text-sm"}
                    >
                      {val}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* RPE (Proximity to Failure) */}
          <div className="mb-6">
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center mb-2">RPE</div>
            <div className="rounded-full bg-gray-200 dark:bg-gray-800 px-4 py-3 w-full flex items-center justify-between" role="radiogroup" aria-label="RPE">
              {[6,7,7.5,8,8.5,9,9.5,10].map((val) => {
                const selected = proximityToFailure === val
                return (
                  <button
                    type="button"
                    key={val}
                    role="radio"
                    aria-checked={selected}
                    onClick={() => setProximityToFailure(val)}
                    className={
                      (selected
                        ? "bg-blue-600 text-white"
                        : "text-gray-800 dark:text-gray-200") +
                      " rounded-full px-3 py-1.5 text-sm"
                    }
                  >
                    {val}
                  </button>
                )
              })}
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