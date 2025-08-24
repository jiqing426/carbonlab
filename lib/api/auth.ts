import { API_CONFIG } from '@/lib/config/api'

export interface LoginResponse {
  data: {
    app: {
      app_name: string
      app_key: string
      org_id: string
      app_id: string
    }
    user: {
      latest_login_time: string
      registered_at: string
      is_frozen: boolean
      user_id: string
      username: string
    }
    token: {
      granted_at: string
      scope: string
      expired_at: string
      token: string
    }
    third_party: any
    user_roles: any[]
    user_privileges: any[]
    user_groups: any[]
  }
  code: number
  msg: string
}

export interface LoginRequest {
  app_key: string
  username: string
  password: string
}

export const authAPI = {
  // 用户名密码登录
  async loginWithUsernamePassword(credentials: LoginRequest): Promise<LoginResponse> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.REQUEST.TIMEOUT)

    console.log('API调用开始:', {
      url: `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LOGIN}`,
      credentials: { ...credentials, password: '***' }
    })

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LOGIN}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      console.log('API响应状态:', response.status, response.statusText)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('API响应错误:', errorText)
        throw new Error(`登录失败: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      console.log('API响应数据:', data)
      
      if (data.code !== 200) {
        console.error('API业务错误:', data.msg)
        throw new Error(data.msg || '登录失败')
      }

      console.log('API调用成功')
      return data
    } catch (error) {
      clearTimeout(timeoutId)
      console.error('API调用异常:', error)
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('请求超时，请检查网络连接')
        }
        throw error
      }
      
      throw new Error('网络错误，请检查网络连接')
    }
  },

  // 验证token是否有效
  async validateToken(token: string): Promise<boolean> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.REQUEST.TIMEOUT)

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.VALIDATE_TOKEN}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      })
      
      clearTimeout(timeoutId)
      return response.ok
    } catch (error) {
      clearTimeout(timeoutId)
      return false
    }
  }
}
