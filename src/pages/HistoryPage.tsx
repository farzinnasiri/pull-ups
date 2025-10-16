import { useStore } from '@/store'
import { format } from 'date-fns'
import { Calendar, Dumbbell, TrendingUp, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

const HistoryPage = () => {
  const { sessions, deleteSession } = useStore()

  const completedSessions = sessions
    .filter(s => s.completed)
    .sort((a, b) => b.date.getTime() - a.date.getTime())

  const groupedSessions = completedSessions.reduce((groups, session) => {
    const dateKey = format(session.date, 'yyyy-MM-dd')
    if (!groups[dateKey]) {
      groups[dateKey] = []
    }
    groups[dateKey].push(session)
    return groups
  }, {} as Record<string, typeof completedSessions>)

  const getExerciseName = (type: string, variation: string) => {
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

    return typeNames[type] + variationNames[variation]
  }

  const handleDeleteSession = (sessionId: string) => {
    if (confirm('Are you sure you want to delete this session?')) {
      deleteSession(sessionId)
      toast.success('Session deleted')
    }
  }

  return (
    <div className="p-4">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Workout History</h1>
        <p className="text-gray-600 dark:text-gray-400">
          {completedSessions.length} completed sessions
        </p>
      </header>

      {Object.keys(groupedSessions).length > 0 ? (
        <div className="space-y-6">
          {Object.entries(groupedSessions).map(([dateKey, daySessions]) => (
            <div key={dateKey} className="">
              <div className="flex items-center mb-3">
                <Calendar className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {format(new Date(dateKey), 'EEEE, MMMM d, yyyy')}
                </h3>
              </div>
              
              <div className="space-y-3">
                {daySessions.map(session => (
                  <div key={session.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {getExerciseName(session.exerciseType, session.variation)}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {format(session.date, 'h:mm a')}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteSession(session.id)}
                        className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-3">
                      <div className="text-center">
                        <div className="text-xl font-bold text-gray-900 dark:text-white">
                          {session.totalReps}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Total Reps</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-gray-900 dark:text-white">
                          {session.sets.length}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Sets</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-gray-900 dark:text-white">
                          {session.sets.length > 0 ? Math.round(session.totalReps / session.sets.length) : 0}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Avg/Set</div>
                      </div>
                    </div>

                    {/* Set Details */}
                    <div className="space-y-2">
                      {session.sets.map((set, index) => (
                        <div key={set.id} className="flex justify-between items-center text-sm">
                          <span className="text-gray-600 dark:text-gray-400">
                            Set {index + 1}: {set.reps} reps
                          </span>
                          <div className="flex gap-3 text-gray-500 dark:text-gray-400">
                            {set.weight && <span>{set.weight}kg</span>}
                            {set.bandResistance && <span>{set.bandResistance}kg</span>}
                            <span>RPE {set.proximityToFailure}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Best Set */}
                    {session.sets.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                        <div className="flex items-center text-sm">
                          <TrendingUp className="w-4 h-4 text-green-500 mr-2" />
                          <span className="text-gray-600 dark:text-gray-400">
                            Best set: {Math.max(...session.sets.map(s => s.reps))} reps
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Dumbbell className="w-16 h-16 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No workout history yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Complete your first workout to see your history here
          </p>
        </div>
      )}
    </div>
  )
}

export default HistoryPage