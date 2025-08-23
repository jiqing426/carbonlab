import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authAPI, LoginRequest, LoginResponse } from '@/lib/api/auth'
import { useAppTokenStore } from './app-token-store'

interface User {
  id: string
  username: string
  email?: string
  avatar?: string
  latest_login_time?: string
  registered_at?: string
  is_frozen?: boolean
}

interface Token {
  token: string
  scope: string
  granted_at: string
  expired_at: string
}

interface UserStore {
  user: User | null
  token: Token | null
  isLoggedIn: boolean
  isLoading: boolean
  error: string | null
  
  // 登录方法
  login: (credentials: LoginRequest) => Promise<void>
  
  // 登出方法
  logout: () => void
  
  // 清除错误
  clearError: () => void
  
  // 检查token是否过期
  isTokenExpired: () => boolean
  
  // 验证token
  validateToken: () => Promise<boolean>
  
  // 更新头像
  updateAvatar: (avatarUrl: string) => void
}

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoggedIn: false,
      isLoading: false,
      error: null,

      login: async (credentials: LoginRequest) => {
        try {
          console.log('用户store开始登录:', credentials.username)
          set({ isLoading: true, error: null })
          
          const response: LoginResponse = await authAPI.loginWithUsernamePassword(credentials)
          console.log('API调用成功，开始处理响应')
          
          // 检查用户是否被冻结
          if (response.data.user.is_frozen) {
            console.error('用户账户被冻结')
            throw new Error('账户已被冻结，请联系管理员')
          }
          
          // 检查token是否过期
          const expiredAt = new Date(response.data.token.expired_at)
          if (expiredAt <= new Date()) {
            console.error('Token已过期')
            throw new Error('登录已过期，请重新登录')
          }
          
          console.log('验证通过，更新用户状态')
          
          // 更新用户状态
          const user: User = {
            id: response.data.user.user_id,
            username: response.data.user.username,
            latest_login_time: response.data.user.latest_login_time,
            registered_at: response.data.user.registered_at,
            is_frozen: response.data.user.is_frozen,
          }
          
          const token: Token = {
            token: response.data.token.token,
            scope: response.data.token.scope,
            granted_at: response.data.token.granted_at,
            expired_at: response.data.token.expired_at,
          }
          
          set({
            user,
            token,
            isLoggedIn: true,
            isLoading: false,
            error: null,
          })
          
          console.log('用户状态更新完成，登录成功')
          
          // 登录成功后自动获取app token
          try {
            const appTokenStore = useAppTokenStore.getState()
            await appTokenStore.refreshAppToken()
            console.log('应用token获取成功')
          } catch (appTokenError) {
            console.warn('获取应用token失败，但不影响用户登录:', appTokenError)
          }
        } catch (error) {
          console.error('用户store登录失败:', error)
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : '登录失败',
          })
          throw error
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isLoggedIn: false,
          isLoading: false,
          error: null,
        })
      },

      updateAvatar: (avatarUrl: string) => {
        set((state) => ({
          ...state,
          user: state.user ? { ...state.user, avatar: avatarUrl } : null,
        }))
      },

      clearError: () => {
        set({ error: null })
      },

      isTokenExpired: () => {
        const { token } = get()
        if (!token) return true
        
        const expiredAt = new Date(token.expired_at)
        return expiredAt <= new Date()
      },

      validateToken: async () => {
        const { token } = get()
        if (!token) return false
        
        // 检查本地过期时间
        if (get().isTokenExpired()) {
          get().logout()
          return false
        }
        
        // 调用API验证token
        try {
          const isValid = await authAPI.validateToken(token.token)
          if (!isValid) {
            get().logout()
          }
          return isValid
        } catch (error) {
          get().logout()
          return false
        }
      },
    }),
    {
      name: 'user-storage',
      // 只持久化必要的字段
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isLoggedIn: state.isLoggedIn,
      }),
    }
  )
)
