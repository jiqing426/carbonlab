'use client'

import { useEffect } from 'react'
import { useUserStore } from '@/lib/stores/user-store'

const STORAGE_KEY = 'carbon-user-storage'

interface AuthInitializerProps {
  children: React.ReactNode
}

export function AuthInitializer({ children }: AuthInitializerProps) {
  const { syncFromStorage } = useUserStore()

  useEffect(() => {
    // 组件挂载时立即同步存储状态
    if (typeof window !== 'undefined') {
      console.log('AuthInitializer: 开始同步认证状态')
      syncFromStorage()

      // 延迟检查以确保状态已更新
      const timer = setTimeout(() => {
        const currentState = useUserStore.getState()
        console.log('AuthInitializer: 同步后的状态:', {
          isLoggedIn: currentState.isLoggedIn,
          hasUser: !!currentState.user,
          hasToken: !!currentState.token,
          username: currentState.user?.username
        })
      }, 50)

      return () => clearTimeout(timer)
    }
  }, [syncFromStorage])

  // 监听storage变化，确保跨标签页同步
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) {
        console.log('检测到storage变化，重新同步认证状态')
        syncFromStorage()
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [syncFromStorage])

  // 监听页面的显示/隐藏
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('页面变为可见，重新同步认证状态')
        syncFromStorage()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [syncFromStorage])

  return <>{children}</>
}