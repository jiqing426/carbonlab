'use client'

import { useEffect } from 'react'
import { useUserStore } from '@/lib/stores/user-store'

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { initialize, syncFromStorage, isLoggedIn, token } = useUserStore()

  useEffect(() => {
    // 组件挂载时初始化认证状态
    initialize()
    syncFromStorage()
  }, [initialize, syncFromStorage])

  // 定期检查token有效性
  useEffect(() => {
    if (!isLoggedIn || !token) return

    const checkTokenValidity = () => {
      if (!token) return
      const expiredAt = new Date(token.expired_at)
      const now = new Date()

      // 如果token即将过期（5分钟内），提示重新登录
      if (expiredAt.getTime() - now.getTime() < 5 * 60 * 1000) {
        console.warn('Token即将过期，请准备重新登录')
      }

      // 如果token已过期，自动登出
      if (expiredAt <= now) {
        useUserStore.getState().logout()
      }
    }

    // 每分钟检查一次token状态
    const interval = setInterval(checkTokenValidity, 60 * 1000)

    // 立即检查一次
    checkTokenValidity()

    return () => clearInterval(interval)
  }, [isLoggedIn, token])

  // 监听storage变化，确保跨标签页同步
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'carbon-user-storage') {
        syncFromStorage()
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [syncFromStorage])

  return <>{children}</>
}