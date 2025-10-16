import { useState } from 'react'
import { useStore } from '@/store'
import { Settings, Download, Upload, Trash2, Moon, Sun, Volume2, VolumeX, Vibrate } from 'lucide-react'
import { toast } from 'sonner'

const SettingsPage = () => {
  const { settings, updateSettings } = useStore()
  const [isClearing, setIsClearing] = useState(false)

  const handleRestTimeChange = (value: number) => {
    updateSettings({ ...settings, defaultRestTime: value })
  }

  const handleThemeToggle = () => {
    const newTheme = settings.theme === 'light' ? 'dark' : 'light'
    updateSettings({ ...settings, theme: newTheme })
    document.documentElement.classList.toggle('dark', newTheme === 'dark')
  }

  const handleSoundToggle = () => {
    updateSettings({ ...settings, soundEnabled: !settings.soundEnabled })
  }

  const handleVibrationToggle = () => {
    updateSettings({ ...settings, vibrationEnabled: !settings.vibrationEnabled })
  }

  const exportData = () => {
    try {
      const data = {
        sessions: JSON.parse(localStorage.getItem('pullups_sessions') || '[]'),
        records: JSON.parse(localStorage.getItem('pullups_records') || '[]'),
        settings: JSON.parse(localStorage.getItem('pullups_settings') || '{}'),
        activeSession: JSON.parse(localStorage.getItem('pullups_active_session') || 'null')
      }
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'pullups-backup.json'
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Data exported successfully')
    } catch (error) {
      toast.error('Failed to export data')
    }
  }

  const importData = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const text = await file.text()
      const data = JSON.parse(text)
      localStorage.setItem('pullups_sessions', JSON.stringify(data.sessions || []))
      localStorage.setItem('pullups_records', JSON.stringify(data.records || []))
      localStorage.setItem('pullups_settings', JSON.stringify(data.settings || {}))
      localStorage.setItem('pullups_active_session', JSON.stringify(data.activeSession || null))
      toast.success('Data imported successfully')
      window.location.reload()
    } catch (error) {
      toast.error('Failed to import data')
    }
  }

  const handleClearAllData = () => {
    if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      setIsClearing(true)
      localStorage.clear()
      setTimeout(() => {
        setIsClearing(false)
        toast.success('All data cleared')
        window.location.reload()
      }, 1000)
    }
  }

  return (
    <div className="p-4">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 flex items-center">
          <Settings className="w-6 h-6 mr-2" />
          Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Customize your workout experience
        </p>
      </header>

      {/* Workout Settings */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Workout Settings</h2>
        
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Default Rest Time (seconds)
          </label>
          <input
            type="range"
            min="30"
            max="300"
            step="15"
            value={settings.defaultRestTime}
            onChange={(e) => handleRestTimeChange(parseInt(e.target.value))}
            className="w-full mb-2"
          />
          <div className="text-center text-sm text-gray-600 dark:text-gray-400">
            {Math.floor(settings.defaultRestTime / 60)}:{(settings.defaultRestTime % 60).toString().padStart(2, '0')}
          </div>
        </div>

        {/* Alerts */}
        <div className="space-y-3">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <div>
                <div className="font-medium text-gray-900 dark:text-white">Sound Alert</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Play a sound when rest timer finishes
                </div>
              </div>
              <button
                onClick={handleSoundToggle}
                className={`p-2 rounded-lg transition-colors ${
                  settings.soundEnabled
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                }`}
              >
                {settings.soundEnabled ? (
                  <Volume2 className="w-5 h-5" />
                ) : (
                  <VolumeX className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <div>
                <div className="font-medium text-gray-900 dark:text-white">Vibration Alert</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Vibrate device when rest timer finishes
                </div>
              </div>
              <button
                onClick={handleVibrationToggle}
                className={`p-2 rounded-lg transition-colors ${
                  settings.vibrationEnabled
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                }`}
              >
                <Vibrate className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Appearance */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Appearance</h2>
        
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <div>
              <div className="font-medium text-gray-900 dark:text-white">Dark Mode</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Toggle between light and dark themes
              </div>
            </div>
            <button
              onClick={handleThemeToggle}
              className="p-2 rounded-lg bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
            >
              {settings.theme === 'dark' ? (
                <Sun className="w-5 h-5 text-yellow-500" />
              ) : (
                <Moon className="w-5 h-5 text-gray-700" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Data Management</h2>
        
        <div className="space-y-3">
          <button
            onClick={exportData}
            className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Download className="w-5 h-5 mr-2" />
            Export Data
          </button>
          
          <label className="w-full flex items-center justify-center px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors cursor-pointer">
            <Upload className="w-5 h-5 mr-2" />
            Import Data
            <input
              type="file"
              accept=".json"
              onChange={importData}
              className="hidden"
            />
          </label>
          
          <button
            onClick={handleClearAllData}
            disabled={isClearing}
            className="w-full flex items-center justify-center px-4 py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg transition-colors"
          >
            <Trash2 className="w-5 h-5 mr-2" />
            {isClearing ? 'Clearing...' : 'Clear All Data'}
          </button>
        </div>
      </div>

      {/* App Info */}
      <div className="text-center text-sm text-gray-500 dark:text-gray-400">
        <p>Pull-Up Counter PWA v1.0.0</p>
        <p className="mt-1">Data stored locally on your device</p>
      </div>
    </div>
  )
}

export default SettingsPage