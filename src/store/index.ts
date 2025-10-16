import { create } from 'zustand'
import type { WorkoutSession, PersonalRecord, AppSettings } from '@/types'
import { storage } from '@/services/storage'

interface AppState {
  // Data
  sessions: WorkoutSession[]
  personalRecords: PersonalRecord[]
  settings: AppSettings
  activeSession: WorkoutSession | null
  
  // UI State
  isLoading: boolean
  currentPage: 'home' | 'workout' | 'history' | 'progress' | 'settings'
  
  // Actions
  loadData: () => void
  setActiveSession: (session: WorkoutSession | null) => void
  saveSession: (session: WorkoutSession) => void
  deleteSession: (sessionId: string) => void
  updatePersonalRecord: (record: PersonalRecord) => void
  updateSettings: (settings: AppSettings) => void
  setCurrentPage: (page: AppState['currentPage']) => void
}

export const useStore = create<AppState>((set, get) => ({
  // Initial state
  sessions: [],
  personalRecords: [],
  settings: {
    defaultRestTime: 90,
    soundEnabled: false,
    vibrationEnabled: true,
    theme: 'auto'
  },
  activeSession: null,
  isLoading: true,
  currentPage: 'home',

  // Actions
  loadData: () => {
    const sessions = storage.getSessions()
    const personalRecords = storage.getPersonalRecords()
    const settings = storage.getSettings()
    const activeSession = storage.getActiveSession()
    
    set({
      sessions,
      personalRecords,
      settings,
      activeSession,
      isLoading: false
    })
  },

  setActiveSession: (session) => {
    storage.saveActiveSession(session)
    set({ activeSession: session })
  },

  saveSession: (session) => {
    storage.saveSession(session)
    const sessions = storage.getSessions()
    set({ sessions })

    // Ensure active session stays in sync with saved session
    const { activeSession } = get()
    if (activeSession && activeSession.id === session.id) {
      storage.saveActiveSession(session)
      set({ activeSession: session })
    }
    
    // Update personal records if this is a new record
    const { personalRecords } = get()
    const existingRecord = personalRecords.find(
      (r: PersonalRecord) => r.exerciseType === session.exerciseType && r.variation === session.variation
    )
    
    const maxReps = Math.max(...session.sets.map((s: { reps: number }) => s.reps))
    const maxWeight = Math.max(...session.sets.map((s: { weight?: number }) => s.weight || 0))
    const maxBandResistance = Math.max(...session.sets.map((s: { bandResistance?: number }) => s.bandResistance || 0))
    
    const shouldUpdateRecord = !existingRecord || 
      maxReps > existingRecord.maxReps ||
      maxWeight > existingRecord.maxWeight ||
      maxBandResistance > existingRecord.maxBandResistance
    
    if (shouldUpdateRecord) {
      const newRecord: PersonalRecord = {
        exerciseType: session.exerciseType,
        variation: session.variation,
        maxReps: Math.max(maxReps, existingRecord?.maxReps || 0),
        maxWeight: Math.max(maxWeight, existingRecord?.maxWeight || 0),
        maxBandResistance: Math.max(maxBandResistance, existingRecord?.maxBandResistance || 0),
        date: new Date()
      }
      
      storage.updatePersonalRecord(newRecord)
      const updatedRecords = storage.getPersonalRecords()
      set({ personalRecords: updatedRecords })
    }
  },

  deleteSession: (sessionId) => {
    storage.deleteSession(sessionId)
    const sessions = storage.getSessions()
    set({ sessions })
  },

  updatePersonalRecord: (record) => {
    storage.updatePersonalRecord(record)
    const personalRecords = storage.getPersonalRecords()
    set({ personalRecords })
  },

  updateSettings: (settings) => {
    storage.saveSettings(settings)
    set({ settings })
  },

  setCurrentPage: (page) => {
    set({ currentPage: page })
  }
}))