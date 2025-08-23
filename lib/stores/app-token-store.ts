import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { appAPI, AppTokenResponse } from '@/lib/api/app'

interface AppTokenStore {
  // 状态
  appToken: string | null
  appTokenExpiredAt: string | null
  isLoading: boolean
  error: string | null
  
  // 方法
  getAppToken: () => Promise<string | null>
  refreshAppToken: () => Promise<string | null>
  clearAppToken: () => void
  isTokenValid: () => boolean
  getRemainingTime: () => number
}

export const useAppTokenStore = create<AppTokenStore>()(
  persist(
    (set, get) => ({
      // 初始状态
      appToken: null,
      appTokenExpiredAt: null,
      isLoading: false,
      error: null,

      // 获取应用token
      getAppToken: async () => {
        const state = get()
        
        // 如果已有有效token，直接返回
        if (state.appToken && state.isTokenValid()) {
          return state.appToken
        }

        // 否则获取新token
        return await state.refreshAppToken()
      },

      // 刷新应用token
      refreshAppToken: async () => {
        set({ isLoading: true, error: null })

        try {
          const response: AppTokenResponse = await appAPI.getAppToken()
          
          const { token, expired_at } = response.data
          
          set({
            appToken: token,
            appTokenExpiredAt: expired_at,
            isLoading: false,
            error: null
          })

          console.log('应用token获取成功:', {
            token: token.substring(0, 10) + '...',
            expiredAt: expired_at,
            remainingTime: appAPI.getAppTokenRemainingTime(expired_at)
          })

          return token
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : '获取应用token失败'
          set({ 
            isLoading: false, 
            error: errorMessage 
          })
          
          console.error('获取应用token失败:', error)
          return null
        }
      },

      // 清除应用token
      clearAppToken: () => {
        set({
          appToken: null,
          appTokenExpiredAt: null,
          error: null
        })
      },

      // 检查token是否有效
      isTokenValid: () => {
        const state = get()
        if (!state.appToken || !state.appTokenExpiredAt) {
          return false
        }
        return appAPI.isAppTokenValid(state.appTokenExpiredAt)
      },

      // 获取剩余有效期（分钟）
      getRemainingTime: () => {
        const state = get()
        if (!state.appTokenExpiredAt) {
          return 0
        }
        return appAPI.getAppTokenRemainingTime(state.appTokenExpiredAt)
      }
    }),
    {
      name: 'app-token-storage',
      partialize: (state) => ({
        appToken: state.appToken,
        appTokenExpiredAt: state.appTokenExpiredAt,
      }),
    }
  )
)
