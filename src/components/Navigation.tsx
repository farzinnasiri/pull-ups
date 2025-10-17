import { Home, Dumbbell, History, TrendingUp, Settings } from 'lucide-react'
import { NavLink } from 'react-router-dom'

const Navigation = () => {
  const navItems = [
    { icon: Home, label: 'Home', page: 'home', path: '/' },
    { icon: Dumbbell, label: 'Workout', page: 'workout', path: '/workout' },
    { icon: History, label: 'History', page: 'history', path: '/history' },
    { icon: TrendingUp, label: 'Progress', page: 'progress', path: '/progress' },
    { icon: Settings, label: 'Settings', page: 'settings', path: '/settings' }
  ]

  return (
    <nav
      className="fixed left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800 pb-safe z-50"
      style={{ bottom: 'var(--safe-bottom)' }}
    >
      <div className="flex justify-around py-2">
        {navItems.map(({ icon: Icon, label, page, path }) => (
          <NavLink
            key={page}
            to={path}
            end={path === '/'}
            className={({ isActive }) => `flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
              isActive
                ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <Icon className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

export default Navigation