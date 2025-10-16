import type { WorkoutSession, PersonalRecord, AppSettings } from '@/types'

const STORAGE_KEYS = {
  SESSIONS: 'pullup_sessions',
  RECORDS: 'pullup_records',
  SETTINGS: 'pullup_settings',
  ACTIVE_SESSION: 'pullup_active_session'
} as const

export class LocalStorageService {
  private static instance: LocalStorageService

  private constructor() {}

  static getInstance(): LocalStorageService {
    if (!LocalStorageService.instance) {
      LocalStorageService.instance = new LocalStorageService()
    }
    return LocalStorageService.instance
  }

  // Sessions
  getSessions(): WorkoutSession[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SESSIONS)
      if (!data) return []
      
      const sessions = JSON.parse(data)
      return sessions.map((session: any) => ({
        ...session,
        date: new Date(session.date),
        sets: session.sets.map((set: any) => ({
          ...set,
          completedAt: new Date(set.completedAt)
        })),
        createdAt: new Date(session.createdAt),
        updatedAt: new Date(session.updatedAt)
      }))
    } catch (error) {
      console.error('Error loading sessions:', error)
      return []
    }
  }

  saveSession(session: WorkoutSession): void {
    try {
      const sessions = this.getSessions()
      const existingIndex = sessions.findIndex(s => s.id === session.id)
      
      if (existingIndex >= 0) {
        sessions[existingIndex] = session
      } else {
        sessions.push(session)
      }
      
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions))
    } catch (error) {
      console.error('Error saving session:', error)
    }
  }

  deleteSession(sessionId: string): void {
    try {
      const sessions = this.getSessions()
      const filtered = sessions.filter(s => s.id !== sessionId)
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(filtered))
    } catch (error) {
      console.error('Error deleting session:', error)
    }
  }

  // Active Session
  getActiveSession(): WorkoutSession | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ACTIVE_SESSION)
      if (!data) return null
      
      const session = JSON.parse(data)
      return {
        ...session,
        date: new Date(session.date),
        sets: session.sets.map((set: any) => ({
          ...set,
          completedAt: new Date(set.completedAt)
        })),
        createdAt: new Date(session.createdAt),
        updatedAt: new Date(session.updatedAt)
      }
    } catch (error) {
      console.error('Error loading active session:', error)
      return null
    }
  }

  saveActiveSession(session: WorkoutSession | null): void {
    try {
      if (session) {
        localStorage.setItem(STORAGE_KEYS.ACTIVE_SESSION, JSON.stringify(session))
      } else {
        localStorage.removeItem(STORAGE_KEYS.ACTIVE_SESSION)
      }
    } catch (error) {
      console.error('Error saving active session:', error)
    }
  }

  // Personal Records
  getPersonalRecords(): PersonalRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.RECORDS)
      if (!data) return []
      
      const records = JSON.parse(data)
      return records.map((record: any) => ({
        ...record,
        date: new Date(record.date)
      }))
    } catch (error) {
      console.error('Error loading records:', error)
      return []
    }
  }

  updatePersonalRecord(record: PersonalRecord): void {
    try {
      const records = this.getPersonalRecords()
      const existingIndex = records.findIndex(
        r => r.exerciseType === record.exerciseType && r.variation === record.variation
      )
      
      if (existingIndex >= 0) {
        const existing = records[existingIndex]
        const shouldUpdate = 
          record.maxReps > existing.maxReps ||
          record.maxWeight > existing.maxWeight ||
          record.maxBandResistance > existing.maxBandResistance
        
        if (shouldUpdate) {
          records[existingIndex] = record
        }
      } else {
        records.push(record)
      }
      
      localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(records))
    } catch (error) {
      console.error('Error updating record:', error)
    }
  }

  // Settings
  getSettings(): AppSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS)
      if (!data) {
        return {
          defaultRestTime: 90,
          soundEnabled: false,
          vibrationEnabled: true,
          theme: 'auto'
        }
      }
      
      return JSON.parse(data)
    } catch (error) {
      console.error('Error loading settings:', error)
      return {
        defaultRestTime: 90,
        soundEnabled: false,
        vibrationEnabled: true,
        theme: 'auto'
      }
    }
  }

  saveSettings(settings: AppSettings): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings))
    } catch (error) {
      console.error('Error saving settings:', error)
    }
  }

  // Utility methods
  clearAllData(): void {
    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key)
      })
    } catch (error) {
      console.error('Error clearing data:', error)
    }
  }

  exportData(): string {
    const data = {
      sessions: this.getSessions(),
      records: this.getPersonalRecords(),
      settings: this.getSettings(),
      exportDate: new Date().toISOString()
    }
    return JSON.stringify(data, null, 2)
  }

  importData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData)
      
      if (data.sessions) {
        localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(data.sessions))
      }
      if (data.records) {
        localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(data.records))
      }
      if (data.settings) {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(data.settings))
      }
      
      return true
    } catch (error) {
      console.error('Error importing data:', error)
      return false
    }
  }
}

export const storage = LocalStorageService.getInstance()