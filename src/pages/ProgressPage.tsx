import { useStore } from '@/store'
import { format } from 'date-fns'
import { TrendingUp, Trophy, Target, Clock, CalendarRange } from 'lucide-react'
import type { ExerciseSet } from '@/types'

const ProgressPage = () => {
  const { sessions, personalRecords } = useStore()
  
  const completedSessions = sessions.filter(s => s.completed)
  
  // Calculate weekly stats
  const last7Days = completedSessions.filter(s => {
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    return s.date >= sevenDaysAgo
  })
  
  const weeklyReps = last7Days.reduce((sum, s) => sum + s.totalReps, 0)
  const weeklySessions = last7Days.length
  
  // Calculate monthly stats
  const last30Days = completedSessions.filter(s => {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    return s.date >= thirtyDaysAgo
  })
  
  const monthlyReps = last30Days.reduce((sum, s) => sum + s.totalReps, 0)
  const monthlySessions = last30Days.length
  
  // Get all-time stats
  const allTimeReps = completedSessions.reduce((sum, s) => sum + s.totalReps, 0)
  const allTimeSessions = completedSessions.length
  
  // Average daily reps: total reps divided by number of distinct days with sessions
  const dayKeys = Array.from(new Set(completedSessions.map(s => s.date.toDateString())))
  const repsByDay = dayKeys.map(dayKey => {
    return completedSessions
      .filter(s => s.date.toDateString() === dayKey)
      .reduce((sum, s) => sum + s.totalReps, 0)
  })
  const averageDailyReps = repsByDay.length > 0 ? Math.round(repsByDay.reduce((a, b) => a + b, 0) / repsByDay.length) : 0
  
  // Find best single set
  let bestSingleSet = { reps: 0, date: null as Date | null }
  completedSessions.forEach(session => {
    session.sets.forEach((set: ExerciseSet) => {
      if (set.reps > bestSingleSet.reps) {
        bestSingleSet = { reps: set.reps, date: session.date }
      }
    })
  })
  
  // Get recent workouts for chart
  const recentSessions = completedSessions
    .slice(-10)
    .map(session => ({
      date: format(session.date, 'MMM d'),
      reps: session.totalReps,
      sets: session.sets.length
    }))

  return (
    <div className="p-4">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Progress & Records</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Track your achievements and personal records
        </p>
      </header>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">This Week</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{weeklyReps}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">{weeklySessions} sessions</div>
        </div>
        
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <Target className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
            <span className="text-sm font-medium text-green-600 dark:text-green-400">This Month</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{monthlyReps}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">{monthlySessions} sessions</div>
        </div>

        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <CalendarRange className="w-5 h-5 text-purple-600 dark:text-purple-400 mr-2" />
            <span className="text-sm font-medium text-purple-600 dark:text-purple-400">Average Daily</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{averageDailyReps}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Reps per day</div>
        </div>
      </div>

      {/* Personal Records */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Trophy className="w-5 h-5 text-yellow-500 mr-2" />
          Personal Records
        </h2>
        
        <div className="space-y-3">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <div>
                <div className="font-medium text-gray-900 dark:text-white">Max Reps in One Set</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {bestSingleSet.date ? format(bestSingleSet.date, 'MMM d, yyyy') : 'No data'}
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {bestSingleSet.reps}
              </div>
            </div>
          </div>

          {/* Weight Records */}
          {Object.entries(personalRecords).length > 0 && (
            <>
              {Object.entries(personalRecords).map(([key, record]) => {
                const [exerciseType, variation] = key.split('-')
                if (variation !== 'weighted') return null
                
                return (
                  <div key={key} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          Max Weight - {exerciseType === 'normal' ? 'Pull-ups' : exerciseType === 'neutral' ? 'Neutral Grip' : 'Chin-ups'}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {record.date ? format(new Date(record.date), 'MMM d, yyyy') : 'No date'}
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                          {record.maxWeight}kg
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </>
          )}
        </div>
      </div>

      {/* Recent Progress Chart */}
      {recentSessions.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Clock className="w-5 h-5 text-gray-500 mr-2" />
            Recent Progress
          </h2>
          
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="flex items-end justify-between h-32">
              {recentSessions.map((session, index) => (
                <div key={index} className="flex flex-col items-center flex-1">
                  <div 
                    className="bg-blue-500 rounded-t w-6 transition-all duration-300"
                    style={{ 
                      height: `${Math.max(8, (session.reps / Math.max(...recentSessions.map(s => s.reps))) * 100)}%` 
                    }}
                  />
                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-2 text-center">
                    {session.date}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-500">
                    {session.reps}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* All Time Stats */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">All Time Stats</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{allTimeReps}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Reps</div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{allTimeSessions}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Sessions</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProgressPage