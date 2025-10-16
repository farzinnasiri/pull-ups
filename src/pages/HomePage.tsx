import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Dumbbell, Clock, TrendingUp, CalendarDays } from 'lucide-react'
import { useStore } from '@/store'
import type { WorkoutSession, ExerciseType, ExerciseVariation, ExerciseSet } from '@/types/index'
import { toast } from 'sonner'

const HomePage = () => {
  const navigate = useNavigate()
  const { sessions, setActiveSession } = useStore()
  const [showNewSessionModal, setShowNewSessionModal] = useState(false)
  const [selectedExercise, setSelectedExercise] = useState<ExerciseType>('normal')
  const [selectedVariation, setSelectedVariation] = useState<ExerciseVariation>('bodyweight')

  const recentSessions = sessions
    .filter(s => s.completed)
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 3)

  const todayTotalReps = sessions
    .filter(s => s.completed && s.date.toDateString() === new Date().toDateString())
    .reduce((sum, s) => sum + s.totalReps, 0)

  const todaySessionsCount = sessions
    .filter(s => s.completed && s.date.toDateString() === new Date().toDateString())
    .length

  const createNewSession = () => {
    const newSession: WorkoutSession = {
      id: Date.now().toString(),
      date: new Date(),
      exerciseType: selectedExercise,
      variation: selectedVariation,
      sets: [],
      totalReps: 0,
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    setActiveSession(newSession)
    setShowNewSessionModal(false)
    toast.success('New workout session started!')
    navigate('/workout')
  }

  const getExerciseName = (type: ExerciseType, variation: ExerciseVariation) => {
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

    return typeNames[type] + variationNames[variation]
  }

  return (
    <div className="p-4">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Pull-Up Counter</h1>
        <p className="text-gray-600 dark:text-gray-400">Track your progress, one rep at a time</p>
      </header>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <Dumbbell className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">This Week</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {sessions
              .filter(s => {
                const weekAgo = new Date()
                weekAgo.setDate(weekAgo.getDate() - 7)
                return s.completed && s.date >= weekAgo
              })
              .reduce((sum, s) => sum + s.totalReps, 0)}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Reps</div>
        </div>

        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <CalendarDays className="w-5 h-5 text-purple-600 dark:text-purple-400 mr-2" />
            <span className="text-sm font-medium text-purple-600 dark:text-purple-400">Today</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{todayTotalReps}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Reps</div>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
            <span className="text-sm font-medium text-green-600 dark:text-green-400">Best Set</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {Math.max(...sessions.flatMap(s => s.sets.map((set: ExerciseSet) => set.reps)), 0) || 0}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Max Reps</div>
        </div>

        <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <CalendarDays className="w-5 h-5 text-orange-600 dark:text-orange-400 mr-2" />
            <span className="text-sm font-medium text-orange-600 dark:text-orange-400">Today’s Sessions</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{todaySessionsCount}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Completed Sessions</div>
        </div>
      </div>

      {/* New Session Button */}
      <button
        onClick={() => setShowNewSessionModal(true)}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center mb-4"
      >
        <Plus className="w-5 h-5 mr-2" />
        Start New Session
      </button>

      {/* Recent Sessions */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Sessions</h2>
          <button
            onClick={() => navigate('/history')}
            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
          >
            View All
          </button>
        </div>

        {recentSessions.length > 0 ? (
          <div className="space-y-3">
            {recentSessions.map(session => (
              <div
                key={session.id}
                className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                onClick={() => {
                  setActiveSession(session)
                  navigate('/workout')
                }}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {getExerciseName(session.exerciseType, session.variation)}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {session.date.toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      {session.totalReps}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">reps</div>
                  </div>
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <Clock className="w-4 h-4 mr-1" />
                  {session.sets.length} sets
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Dumbbell className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No sessions yet. Start your first workout!</p>
          </div>
        )}
      </div>


      {/* New Session Modal */}
      {showNewSessionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">New Workout Session</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Exercise Type
              </label>
              <select
                value={selectedExercise}
                onChange={(e) => setSelectedExercise(e.target.value as ExerciseType)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="normal">Pull-ups</option>
                <option value="neutral">Neutral Grip</option>
                <option value="chin-up">Chin-ups</option>
              </select>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Variation
              </label>
              <select
                value={selectedVariation}
                onChange={(e) => setSelectedVariation(e.target.value as ExerciseVariation)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="bodyweight">Bodyweight</option>
                <option value="weighted">Weighted</option>
                <option value="band">Resistance Band</option>
              </select>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowNewSessionModal(false)}
                className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createNewSession}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
              >
                Start
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default HomePage