import { API_CONFIG } from '@/lib/config/api'

export interface AppTokenResponse {
  data: {
    type: string
    app_key: string
    app_name: string
    token: string
    status: string
    expired_at: string
  }
  code: number
  msg: string
}

export interface AppTokenRequest {
  app_key: string
  app_secret: string
}

export const appAPI = {
  // 获取应用token
  getAppToken: async (): Promise<AppTokenResponse> => {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.REQUEST.TIMEOUT)

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.GET_APP_TOKEN}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          app_key: API_CONFIG.APP.APP_KEY,
          app_secret: API_CONFIG.APP.APP_SECRET,
        } as AppTokenRequest),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: AppTokenResponse = await response.json()

      if (data.code !== 200) {
        throw new Error(data.msg || '获取应用token失败')
      }

      return data
    } catch (error) {
      clearTimeout(timeoutId)
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('请求超时')
        }
        throw error
      }
      throw new Error('获取应用token失败')
    }
  },

  // 验证应用token是否有效
  isAppTokenValid: (expiredAt: string): boolean => {
    const now = new Date()
    const expiredTime = new Date(expiredAt)
    return now < expiredTime
  },

  // 获取应用token的剩余有效期（分钟）
  getAppTokenRemainingTime: (expiredAt: string): number => {
    const now = new Date()
    const expiredTime = new Date(expiredAt)
    const remainingMs = expiredTime.getTime() - now.getTime()
    return Math.max(0, Math.floor(remainingMs / (1000 * 60)))
  }
}
