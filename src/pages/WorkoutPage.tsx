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
    proximityToFailure: 6.0,
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
      proximityToFailure: 6.0,
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

  // Lock background scroll when modal is open (Android keyboard friendly)
  useEffect(() => {
    if (showSetModal) {
      const prevHtmlOverflow = document.documentElement.style.overflow
      const prevBodyOverflow = document.body.style.overflow
      document.documentElement.style.overflow = 'hidden'
      document.body.style.overflow = 'hidden'
      return () => {
        document.documentElement.style.overflow = prevHtmlOverflow
        document.body.style.overflow = prevBodyOverflow
      }
    }
  }, [showSetModal])

  const scrollIntoViewIfNeeded = (el: HTMLElement) => {
    setTimeout(() => {
      try {
        el.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
      } catch {}
    }, 100)
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
          <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800">
            <div className={"grid " + ((activeSession.variation === 'weighted' || activeSession.variation === 'band') ? 'grid-cols-4' : 'grid-cols-3') + " bg-gray-100 dark:bg-black/40 text-xs font-medium text-gray-600 dark:text-gray-400 px-4 py-2"}>
              <div>Set</div>
              {(activeSession.variation === 'weighted' || activeSession.variation === 'band') && (
                <div>{activeSession.variation === 'weighted' ? 'Weight' : 'Assist'}</div>
              )}
              <div>Reps</div>
              <div>RPE</div>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-800">
              {activeSession.sets.map((set: ExerciseSet, index: number) => (
                <div key={set.id} className={"grid " + ((activeSession.variation === 'weighted' || activeSession.variation === 'band') ? 'grid-cols-4' : 'grid-cols-3') + " items-center px-4 py-3 bg-white dark:bg-black"}>
                  <div className="text-gray-900 dark:text-white font-medium">{index + 1}</div>
                  {(activeSession.variation === 'weighted' || activeSession.variation === 'band') && (
                    <div className="text-gray-900 dark:text-white">
                      {activeSession.variation === 'weighted' ? (set.weight ?? 0) : (set.bandResistance ?? 0)}
                      <span className="ml-1 text-xs text-gray-600 dark:text-gray-400">kg</span>
                    </div>
                  )}
                  <div className="text-gray-900 dark:text-white">{set.reps}</div>
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-xs font-medium">
                      {set.proximityToFailure}
                    </span>
                    {!activeSession.completed && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingSet(set)
                            setCurrentSet({
                              reps: set.reps,
                              weight: set.weight || 0,
                              bandResistance: set.bandResistance || 0,
                              proximityToFailure: Math.max(6, Math.min(10, set.proximityToFailure)),
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
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Plus className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No sets yet. Add your first set to get started!</p>
          </div>
        )}

        {!activeSession.completed && (
          <button
            onClick={() => { setEditingSet(null); setShowSetModal(true) }}
            className="mt-4 w-full bg-gray-900 dark:bg-white text-white dark:text-black rounded-full py-3 font-semibold shadow-sm hover:opacity-90 transition-opacity"
          >
            + Add Set
          </button>
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


      {showSetModal && !activeSession.completed && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div
            className="bg-white dark:bg-black rounded-lg p-6 w-full max-w-md max-h-[80dvh] overflow-y-auto overscroll-contain pb-safe shadow-2xl shadow-black/60 ring-1 ring-gray-200 dark:ring-white/10"
            style={{ transform: 'translateZ(0)' }}
          >

            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {editingSet ? 'Edit Set' : 'Add Set'}
            </h3>
            
            {/* Reps */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Reps
              </label>
              <div className="relative">
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={String(currentSet.reps)}
                  onFocus={(e) => scrollIntoViewIfNeeded(e.target as HTMLElement)}
                  onChange={(e) => {
                    const raw = e.target.value
                    const digitsOnly = raw.replace(/\D/g, '')
                    const normalized = digitsOnly.replace(/^0+(?=\d)/, '')
                    const num = parseInt(normalized, 10)
                    setCurrentSet(prev => ({
                      ...prev,
                      reps: Number.isFinite(num) ? Math.min(50, Math.max(0, num)) : 0
                    }))
                  }}
                  className="w-full pr-10 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col items-center gap-0.5">
                  <button
                    type="button"
                    aria-label="Increase reps"
                    onClick={() => setCurrentSet(prev => ({ ...prev, reps: Math.min(50, prev.reps + 1) }))}
                    className="w-4 h-4 rounded bg-gray-500/40 dark:bg-gray-500/40 text-gray-900 dark:text-gray-100 hover:bg-gray-500/60 transition grid place-items-center border border-gray-400/40 dark:border-gray-500/40"
                  >
                    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <polyline points="6 15 12 9 18 15" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    aria-label="Decrease reps"
                    onClick={() => setCurrentSet(prev => ({ ...prev, reps: Math.max(0, prev.reps - 1) }))}
                    className="w-4 h-4 rounded bg-gray-500/40 dark:bg-gray-500/40 text-gray-900 dark:text-gray-100 hover:bg-gray-500/60 transition grid place-items-center border border-gray-400/40 dark:border-gray-500/40"
                  >
                    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="mt-2 flex flex-wrap justify-center gap-1.5">
                {[2,4,6,8,10].map((val) => {
                  const selected = currentSet.reps === val
                  return (
                    <button
                      type="button"
                      key={val}
                      onClick={() => setCurrentSet(prev => ({ ...prev, reps: val }))}
                      className={(selected ? "bg-blue-600 text-white" : "bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100") + " rounded-full px-3.5 py-1.5 text-sm"}
                    >
                      {val}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Weight (for weighted exercises) */}
            {activeSession?.variation === 'weighted' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Weight (kg)
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  pattern="[0-9]*[.]?[0-9]*"
                  value={String(currentSet.weight)}
                  onFocus={(e) => scrollIntoViewIfNeeded(e.target as HTMLElement)}
                  onChange={(e) => {
                    const raw = e.target.value
                    const sanitized = raw.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1')
                    const normalized = sanitized.startsWith('0') && !sanitized.startsWith('0.')
                      ? sanitized.replace(/^0+(?=\d)/, '')
                      : sanitized
                    const num = parseFloat(normalized)
                    setCurrentSet(prev => ({
                      ...prev,
                      weight: Number.isFinite(num) ? Math.min(200, Math.max(0, parseFloat(num.toFixed(1)))) : 0
                    }))
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="mt-2 flex flex-wrap justify-center gap-1.5">
                  {[2.5,5,7.5,10].map((val) => {
                    const selected = currentSet.weight === val
                    return (
                      <button
                        type="button"
                        key={val}
                        onClick={() => setCurrentSet(prev => ({ ...prev, weight: val }))}
                        className={(selected ? "bg-blue-600 text-white" : "bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100") + " rounded-full px-3.5 py-1.5 text-sm"}
                      >
                        {val}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Band Resistance (for band exercises) */}
            {activeSession?.variation === 'band' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Band Resistance (kg)
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  pattern="[0-9]*[.]?[0-9]*"
                  value={String(currentSet.bandResistance)}
                  onFocus={(e) => scrollIntoViewIfNeeded(e.target as HTMLElement)}
                  onChange={(e) => {
                    const raw = e.target.value
                    const digitsOnly = raw.replace(/[^\d.]/g, '')
                    const normalized = digitsOnly.replace(/^0+(?=\d)/, '')
                    const num = parseFloat(normalized)
                    setCurrentSet(prev => ({
                      ...prev,
                      bandResistance: Number.isFinite(num) ? Math.min(100, Math.max(0, num)) : 0
                    }))
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="mt-2 flex flex-wrap justify-center gap-1.5">
                  {[10,15,20,25,30,35].map((val) => {
                    const selected = currentSet.bandResistance === val
                    return (
                      <button
                        type="button"
                        key={val}
                        onClick={() => setCurrentSet(prev => ({ ...prev, bandResistance: val }))}
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
            <div className="mb-4">
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center mb-2">RPE</div>
              <div className="rounded-full bg-gray-200 dark:bg-gray-800 px-4 py-3 w-full flex items-center justify-between" role="radiogroup" aria-label="RPE">
                {[6,7,7.5,8,8.5,9,9.5,10].map((val) => {
                  const selected = currentSet.proximityToFailure === val
                  return (
                    <button
                      type="button"
                      key={val}
                      role="radio"
                      aria-checked={selected}
                      onClick={() => setCurrentSet(prev => ({ ...prev, proximityToFailure: val }))}
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

            {/* Rest Time */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Rest Time (seconds)
              </label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={String(currentSet.restTime)}
                onFocus={(e) => scrollIntoViewIfNeeded(e.target as HTMLElement)}
                onChange={(e) => {
                  const raw = e.target.value
                  const digitsOnly = raw.replace(/\D/g, '')
                  const normalized = digitsOnly.replace(/^0+(?=\d)/, '')
                  const num = parseInt(normalized, 10)
                  setCurrentSet(prev => ({
                    ...prev,
                    restTime: Number.isFinite(num) ? Math.min(600, Math.max(0, num)) : 0
                  }))
                }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="mt-2 flex flex-wrap gap-1.5">
                {[30,60,90,120].map((sec) => {
                  const selected = currentSet.restTime === sec
                  const label = sec === 60 ? "1m" : sec === 120 ? "2m" : `${sec}s`
                  return (
                    <button
                      type="button"
                      key={sec}
                      onClick={() => setCurrentSet(prev => ({ ...prev, restTime: sec }))}
                      className={(selected ? "bg-blue-600 text-white" : "bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100") + " rounded-full px-3.5 py-1.5 text-sm"}
                    >
                      {label}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowSetModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={addSet}
                disabled={currentSet.reps === 0}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default WorkoutPage