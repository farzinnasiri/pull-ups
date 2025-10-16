import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Check, Edit3, Trash2 } from 'lucide-react'
import { useStore } from '@/store'
import type { ExerciseSet, WorkoutSession, ExerciseType, ExerciseVariation } from '@/types'
import { toast } from 'sonner'

const WorkoutPage = () => {
  const navigate = useNavigate()
  const { activeSession, saveSession, settings, setActiveSession } = useStore()
  const [isResting, setIsResting] = useState(false)
  const [restTimeLeft, setRestTimeLeft] = useState(0)
  const [showSetModal, setShowSetModal] = useState(false)
  const [editingSet, setEditingSet] = useState<ExerciseSet | null>(null)
  const [currentSet, setCurrentSet] = useState({
    reps: 0,
    weight: 0,
    bandResistance: 0,
    proximityToFailure: 8.0,
    restTime: settings.defaultRestTime
  })

  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // When there is no active session, we render an empty state on this page.

  useEffect(() => {
    if (isResting && restTimeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setRestTimeLeft(prev => {
          if (prev <= 1) {
            setIsResting(false)
            if (settings.soundEnabled) {
              // Play completion sound
              const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmFgU7k9n1unEiBC13yO/eizEIHWq+8+OWT')
              audio.play().catch(() => {})
            }
            if (settings.vibrationEnabled && navigator.vibrate) {
              navigator.vibrate([200, 100, 200])
            }
            toast.success('Rest time complete!')
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isResting, restTimeLeft, settings])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const addSet = () => {
    if (!activeSession || activeSession.completed || currentSet.reps === 0) return

    const newSet: ExerciseSet = {
      id: Date.now().toString(),
      reps: currentSet.reps,
      weight: currentSet.weight || undefined,
      bandResistance: currentSet.bandResistance || undefined,
      proximityToFailure: currentSet.proximityToFailure,
      restTime: currentSet.restTime,
      completedAt: new Date()
    }

    const updatedSession: WorkoutSession = {
      ...activeSession,
      sets: [...activeSession.sets, newSet],
      totalReps: activeSession.totalReps + currentSet.reps,
      updatedAt: new Date()
    }

    saveSession(updatedSession)
    setShowSetModal(false)
    
    // Start rest timer
    setRestTimeLeft(currentSet.restTime)
    setIsResting(true)
    
    // Reset form
    setCurrentSet({
      reps: 0,
      weight: 0,
      bandResistance: 0,
      proximityToFailure: 8.0,
      restTime: settings.defaultRestTime
    })
  }

  const deleteSet = (setId: string) => {
    if (!activeSession || activeSession.completed) return

    const setToDelete = activeSession.sets.find((s: ExerciseSet) => s.id === setId)
    if (!setToDelete) return

    const updatedSession: WorkoutSession = {
      ...activeSession,
      sets: activeSession.sets.filter((s: ExerciseSet) => s.id !== setId),
      totalReps: activeSession.totalReps - setToDelete.reps,
      updatedAt: new Date()
    }

    saveSession(updatedSession)
    toast.success('Set deleted')
  }

  const completeSession = () => {
    if (!activeSession || activeSession.sets.length === 0) {
      toast.error('Add at least one set to complete the session')
      return
    }

    const completedSession: WorkoutSession = {
      ...activeSession,
      completed: true,
      updatedAt: new Date()
    }

    saveSession(completedSession)
    // Clear active session so completed workouts are not editable
    setActiveSession(null)
    toast.success('Workout session completed! 🎉')
    navigate('/')
  }

  const getExerciseName = () => {
    const typeNames: Record<ExerciseType, string> = {
      normal: 'Pull-ups',
      neutral: 'Neutral Grip',
      'chin-up': 'Chin-ups'
    }
    
    const variationNames: Record<ExerciseVariation, string> = {
      bodyweight: '',
      weighted: ' (Weighted)',
      band: ' (Band)'
    }

    const exerciseType: ExerciseType = activeSession?.exerciseType ?? 'normal'
    const variation: ExerciseVariation = activeSession?.variation ?? 'bodyweight'

    return typeNames[exerciseType] + variationNames[variation]
  }

  if (!activeSession) {
    return (
      <div className="p-4 text-center">
        <p className="text-gray-600 dark:text-gray-400">No active session</p>
      </div>
    )
  }

  return (
    <div className="p-4">
      <header className="mb-4">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
          {getExerciseName()}
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {activeSession.sets.length} sets
        </p>
      </header>

      {/* Current Total Reps */}
      <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4 mb-6 text-center">
        <div className="text-3xl font-bold text-indigo-700 dark:text-indigo-300">
          {activeSession.totalReps}
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">Current total reps</div>
      </div>

      {/* Rest Timer */}
      {isResting && (
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6 text-center">
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
            {formatTime(restTimeLeft)}
          </div>
          <p className="text-sm text-blue-600 dark:text-blue-400">Rest Time</p>
          <div className="flex justify-center gap-2 mt-3">
            <button
              onClick={() => setIsResting(false)}
              className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
            >
              Skip
            </button>
            <button
              onClick={() => setRestTimeLeft(prev => prev + 30)}
              className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300 rounded transition-colors"
            >
              +30s
            </button>
          </div>
        </div>
      )}

      {/* Sets List */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Sets</h2>
          {!activeSession.completed && (
            <button
              onClick={() => {
                setEditingSet(null)
                setShowSetModal(true)
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>
          )}
        </div>

        {activeSession.sets.length > 0 ? (
          <div className="space-y-3">
            {activeSession.sets.map((set: ExerciseSet, index: number) => (
              <div key={set.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Set {index + 1}
                    </span>
                    <div className="text-xl font-bold text-gray-900 dark:text-white">
                      {set.reps} reps
                    </div>
                  </div>
                  {!activeSession.completed && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingSet(set)
                          setCurrentSet({
                            reps: set.reps,
                            weight: set.weight || 0,
                            bandResistance: set.bandResistance || 0,
                            proximityToFailure: set.proximityToFailure,
                            restTime: set.restTime
                          })
                          setShowSetModal(true)
                        }}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteSet(set.id)}
                        className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-3 text-sm text-gray-600 dark:text-gray-400">
                  {set.weight && <span>Weight: {set.weight}kg</span>}
                  {set.bandResistance && <span>Band: {set.bandResistance}kg</span>}
                  <span>RPE: {set.proximityToFailure}/10</span>
                  <span>Rest: {set.restTime}s</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Plus className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No sets yet. Add your first set to get started!</p>
          </div>
        )}
      </div>

      {/* Complete Session Button */}
      {!activeSession.completed && (
        <button
          onClick={completeSession}
          disabled={activeSession.sets.length === 0}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
        >
          <Check className="w-5 h-5 mr-2" />
          Complete Session
        </button>
      )}

      {/* Set Modal */}
      {showSetModal && !activeSession.completed && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-sm max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {editingSet ? 'Edit Set' : 'Add Set'}
            </h3>
            
            {/* Reps */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Reps
              </label>
              <input
                type="number"
                min="0"
                max="50"
                value={currentSet.reps}
                onChange={(e) => setCurrentSet(prev => ({ ...prev, reps: parseInt(e.target.value) || 0 }))}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            {/* Weight (for weighted exercises) */}
            {activeSession?.variation === 'weighted' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={currentSet.weight}
                  onChange={(e) => setCurrentSet(prev => ({ ...prev, weight: parseFloat(e.target.value) || 0 }))}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            )}

            {/* Band Resistance (for band exercises) */}
            {activeSession?.variation === 'band' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Band Resistance (kg)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={currentSet.bandResistance}
                  onChange={(e) => setCurrentSet(prev => ({ ...prev, bandResistance: parseFloat(e.target.value) || 0 }))}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            )}

            {/* Proximity to Failure */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Proximity to Failure (1-10)
              </label>
              <input
                type="range"
                min="1"
                max="10"
                step="0.5"
                value={currentSet.proximityToFailure}
                onChange={(e) => setCurrentSet(prev => ({ ...prev, proximityToFailure: parseFloat(e.target.value) }))}
                className="w-full"
              />
              <div className="text-center text-sm text-gray-600 dark:text-gray-400 mt-1">
                {currentSet.proximityToFailure}/10
              </div>
            </div>

            {/* Rest Time */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Rest Time (seconds)
              </label>
              <input
                type="number"
                min="0"
                max="600"
                step="15"
                value={currentSet.restTime}
                onChange={(e) => setCurrentSet(prev => ({ ...prev, restTime: parseInt(e.target.value) || 0 }))}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowSetModal(false)}
                className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={addSet}
                disabled={currentSet.reps === 0}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-md transition-colors"
              >
                {editingSet ? 'Update' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default WorkoutPage