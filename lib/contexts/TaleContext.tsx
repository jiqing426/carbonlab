"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface TaleApp {
  app_key: string
  app_name: string
  org_id: string
  app_id: string
}

interface TaleContextType {
  currentApp: TaleApp | null
  setCurrentApp: (app: TaleApp | null) => void
  availableApps: TaleApp[]
  setAvailableApps: (apps: TaleApp[]) => void
}

const TaleContext = createContext<TaleContextType | undefined>(undefined)

export function TaleProvider({ children }: { children: ReactNode }) {
  const [currentApp, setCurrentApp] = useState<TaleApp | null>(null)
  const [availableApps, setAvailableApps] = useState<TaleApp[]>([])

  // 从localStorage恢复应用选择
  useEffect(() => {
    const savedApp = localStorage.getItem('tale-current-app')
    if (savedApp) {
      try {
        const app = JSON.parse(savedApp)
        setCurrentApp(app)
      } catch (error) {
        console.error('Failed to parse saved app:', error)
      }
    }
  }, [])

  // 保存应用选择到localStorage
  useEffect(() => {
    if (currentApp) {
      localStorage.setItem('tale-current-app', JSON.stringify(currentApp))
    } else {
      localStorage.removeItem('tale-current-app')
    }
  }, [currentApp])

  const value: TaleContextType = {
    currentApp,
    setCurrentApp,
    availableApps,
    setAvailableApps
  }

  return (
    <TaleContext.Provider value={value}>
      {children}
    </TaleContext.Provider>
  )
}

export function useTale() {
  const context = useContext(TaleContext)
  if (context === undefined) {
    throw new Error('useTale must be used within a TaleProvider')
  }
  return context
}
