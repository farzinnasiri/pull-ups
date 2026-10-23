import { useState } from 'react'
import { useStore } from '@/store'
import { Settings, Download, Upload, Trash2, Moon, Sun, Volume2, VolumeX } from 'lucide-react'
import { toast } from 'sonner'

const SettingsPage = () => {
  const { settings, updateSettings } = useStore()
  const [isClearing, setIsClearing] = useState(false)

  const handleRestTimeChange = (value: number) => {
    updateSettings({ ...settings, defaultRestTime: value })
  }

  const handleThemeToggle = () => {
    const newTheme = settings.theme === 'dark' ? 'light' : 'dark'
    updateSettings({ ...settings, theme: newTheme })
    // Persist theme for useTheme hook
    localStorage.setItem('theme', newTheme)
    // Apply classes to <html>
    document.documentElement.classList.remove('light', 'dark')
    document.documentElement.classList.add(newTheme)
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
        sessions: JSON.parse(localStorage.getItem('pullup_sessions') || '[]'),
        records: JSON.parse(localStorage.getItem('pullup_records') || '[]'),
        settings: JSON.parse(localStorage.getItem('pullup_settings') || '{}'),
        activeSession: JSON.parse(localStorage.getItem('pullup_active_session') || 'null')
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
      localStorage.setItem('pullup_sessions', JSON.stringify(data.sessions || []))
      localStorage.setItem('pullup_records', JSON.stringify(data.records || []))
      localStorage.setItem('pullup_settings', JSON.stringify(data.settings || {}))
      localStorage.setItem('pullup_active_session', JSON.stringify(data.activeSession || null))
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
                className={`px-3 py-1 rounded-full text-sm font-medium ${settings.soundEnabled ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : 'bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-300'}`}
              >
                {settings.soundEnabled ? (
                  <span className="flex items-center"><Volume2 className="w-4 h-4 mr-1" /> On</span>
                ) : (
                  <span className="flex items-center"><VolumeX className="w-4 h-4 mr-1" /> Off</span>
                )}
              </button>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <div>
                <div className="font-medium text-gray-900 dark:text-white">Vibration</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Vibrate when rest timer finishes
                </div>
              </div>
              <button
                onClick={handleVibrationToggle}
                className={`px-3 py-1 rounded-full text-sm font-medium ${settings.vibrationEnabled ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : 'bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-300'}`}
              >
                {settings.vibrationEnabled ? 'On' : 'Off'}
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
              <div className="font-medium text-gray-900 dark:text-white">Theme</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Toggle between light and dark mode
              </div>
            </div>
            <button
              onClick={handleThemeToggle}
              className="px-3 py-1 rounded-full text-sm font-medium bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-300 flex items-center"
            >
              {settings.theme === 'dark' ? (
                <span className="flex items-center"><Moon className="w-4 h-4 mr-1" /> Dark</span>
              ) : (
                <span className="flex items-center"><Sun className="w-4 h-4 mr-1" /> Light</span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Data Management</h2>
        <div className="space-y-3">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <div>
                <div className="font-medium text-gray-900 dark:text-white">Export Data</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Download your workout data as a JSON file
                </div>
              </div>
              <button
                onClick={exportData}
                className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 flex items-center"
              >
                <Download className="w-4 h-4 mr-1" /> Export
              </button>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <div>
                <div className="font-medium text-gray-900 dark:text-white">Import Data</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Restore data from a previously exported JSON file
                </div>
              </div>
              <label className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 flex items-center cursor-pointer">
                <Upload className="w-4 h-4 mr-1" /> Import
                <input type="file" accept="application/json" className="hidden" onChange={importData} />
              </label>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <div>
                <div className="font-medium text-gray-900 dark:text-white">Clear All Data</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Permanently delete all stored data
                </div>
              </div>
              <button
                onClick={handleClearAllData}
                disabled={isClearing}
                className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 flex items-center disabled:opacity-60"
              >
                <Trash2 className="w-4 h-4 mr-1" /> {isClearing ? 'Clearing...' : 'Clear'}
              </button>
            </div>
          </div>
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