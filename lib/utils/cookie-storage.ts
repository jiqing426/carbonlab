import { StateStorage } from 'zustand/middleware'

/**
 * Cookie存储适配器
 * 提供与localStorage兼容的接口，但使用cookie作为底层存储
 */
export interface CookieStorageOptions {
  /** Cookie过期时间（天数），默认30天 */
  expires?: number
  /** Cookie路径，默认'/' */
  path?: string
  /** Cookie域名 */
  domain?: string
  /** 是否仅HTTPS，默认false */
  secure?: boolean
  /** SameSite策略，默认'Lax' */
  sameSite?: 'Strict' | 'Lax' | 'None'
}

class CookieStorage implements StateStorage {
  private options: Required<CookieStorageOptions>
  clear: any

  constructor(options: CookieStorageOptions = {}) {
    this.options = {
      expires: options.expires ?? 30,
      path: options.path ?? '/',
      domain: options.domain ?? '',
      secure: options.secure ?? false,
      sameSite: options.sameSite ?? 'Lax'
    }
  }

  /**
   * 获取cookie值
   */
  getItem(key: string): string | null {
    if (typeof document === 'undefined') return null
    
    const name = key + '='
    const decodedCookie = decodeURIComponent(document.cookie)
    const cookieArray = decodedCookie.split(';')
    
    for (let cookie of cookieArray) {
      cookie = cookie.trim()
      if (cookie.indexOf(name) === 0) {
        return cookie.substring(name.length, cookie.length)
      }
    }
    return null
  }

  /**
   * 设置cookie值
   */
  setItem(key: string, value: string): void {
    if (typeof document === 'undefined') return
    
    const expires = new Date()
    expires.setTime(expires.getTime() + (this.options.expires * 24 * 60 * 60 * 1000))
    
    let cookieString = `${key}=${encodeURIComponent(value)}`
    cookieString += `; expires=${expires.toUTCString()}`
    cookieString += `; path=${this.options.path}`
    
    if (this.options.domain) {
      cookieString += `; domain=${this.options.domain}`
    }
    
    if (this.options.secure) {
      cookieString += '; secure'
    }
    
    cookieString += `; SameSite=${this.options.sameSite}`
    
    document.cookie = cookieString
  }

  /**
   * 删除cookie
   */
  removeItem(key: string): void {
    if (typeof document === 'undefined') return
    
    let cookieString = `${key}=`
    cookieString += '; expires=Thu, 01 Jan 1970 00:00:00 UTC'
    cookieString += `; path=${this.options.path}`
    
    if (this.options.domain) {
      cookieString += `; domain=${this.options.domain}`
    }
    
    document.cookie = cookieString
  }
}

/**
 * 创建cookie存储实例
 */
export const createCookieStorage = (options?: CookieStorageOptions): StateStorage => {
  return new CookieStorage(options)
}

/**
 * 默认的cookie存储实例
 * 用于用户认证信息存储，设置较长的过期时间
 */
export const cookieStorage = createCookieStorage({
  expires: 30, // 30天过期
  path: '/',
  domain: '', // 留空以使用当前域名
  secure: false, // 开发环境可以设为false，生产环境建议设为true
  sameSite: 'Lax'
})