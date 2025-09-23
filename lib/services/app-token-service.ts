interface AppTokenData {
  type: string;
  app_key: string;
  token: string;
  status: string;
  expired_at: number;
}

interface AppTokenResponse {
  data: AppTokenData;
}

interface TaleTokenData {
  token: string;
  expired_at: number;
}

class AppTokenService {
  private static instance: AppTokenService;
  private tokenCache = new Map<string, AppTokenData>();
  private refreshPromises = new Map<string, Promise<string>>();
  private taleTokenPromise: Promise<string> | null = null;

  static getInstance(): AppTokenService {
    if (!AppTokenService.instance) {
      AppTokenService.instance = new AppTokenService();
    }
    return AppTokenService.instance;
  }

  // 获取tale token的cookie键名
  private getTaleTokenCookieKey(): string {
    return 'tale-backend-token';
  }

  // 获取tale token过期时间的cookie键名
  private getTaleTokenExpiredCookieKey(): string {
    return 'tale-backend-token-expired';
  }

  // 获取app token的cookie键名
  private getTokenCookieKey(appKey: string): string {
    return `tale-app-token-${appKey}`;
  }

  // 获取app token过期时间的cookie键名
  private getTokenExpiredCookieKey(appKey: string): string {
    return `tale-app-token-expired-${appKey}`;
  }

  // 从cookie获取tale token
  private getTaleTokenFromCookie(): string | null {
    if (typeof document === 'undefined') return null;
    
    const tokenKey = this.getTaleTokenCookieKey();
    const expiredKey = this.getTaleTokenExpiredCookieKey();
    
    const cookies = document.cookie.split(';');
    const tokenCookie = cookies.find(cookie => cookie.trim().startsWith(`${tokenKey}=`));
    const expiredCookie = cookies.find(cookie => cookie.trim().startsWith(`${expiredKey}=`));
    
    if (!tokenCookie || !expiredCookie) return null;
    
    const token = tokenCookie.split('=')[1];
    const expiredAtValue = expiredCookie.split('=')[1];
    const expiredAt = parseInt(expiredAtValue, 10);
    
    // 检查是否过期（提前5分钟刷新）
    if (Date.now() >= expiredAt - 5 * 60 * 1000) {
      console.log('Tale token is expired or will expire soon');
      return null;
    }
    
    return token;
  }

  // 保存tale token到cookie
  private saveTaleToken(tokenData: TaleTokenData): void {
    if (typeof document === 'undefined') return;
    
    const tokenKey = this.getTaleTokenCookieKey();
    const expiredKey = this.getTaleTokenExpiredCookieKey();
    
    // 计算过期时间（cookie过期时间设置为token过期时间）
    const expireDate = new Date(tokenData.expired_at * 1000);
    const cookieOptions = `expires=${expireDate.toUTCString()}; path=/; SameSite=Lax`;
    
    document.cookie = `${tokenKey}=${tokenData.token}; ${cookieOptions}`;
    document.cookie = `${expiredKey}=${expireDate.toISOString()}; ${cookieOptions}`;
    
    console.log('Tale token saved, expires at:', new Date(tokenData.expired_at));
  }

  // 从服务端API获取tale token
  private async fetchTaleToken(): Promise<string> {
    try {
      // 检测运行环境，在服务端需要使用完整URL
      const isServer = typeof window === 'undefined';
      let apiUrl = '/api/tale-token';
      
      if (isServer) {
        // 在服务端环境中，需要构建完整的URL
        const baseUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL || 'http://localhost:3000';
        apiUrl = `${baseUrl}/api/tale-token`;
      }
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch tale token: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.token && result.expired_time) {
        const tokenData: TaleTokenData = {
          token: result.token,
          expired_at: new Date(result.expired_time).getTime(),
        };
        this.saveTaleToken(tokenData);
        return result.token;
      } else {
        throw new Error('Invalid tale token response');
      }
    } catch (error) {
      console.error('Error fetching tale token:', error);
      throw error;
    }
  }

  // 获取tale token（自动刷新）
  private async getTaleToken(): Promise<string | null> {
    try {
      // 先尝试从cookie获取
      let token = this.getTaleTokenFromCookie();
      console.log(token,'---------从token中获取----------')
      if (!token) {
        // 防止重复请求
        if (this.taleTokenPromise) {
          return await this.taleTokenPromise;
        }
        
        // 如果没有或已过期，重新获取
        console.log('Fetching new tale token');
        this.taleTokenPromise = this.fetchTaleToken();
        
        try {
          token = await this.taleTokenPromise;
        } finally {
          this.taleTokenPromise = null;
        }
      }
      
      return token;
    } catch (error) {
      console.error('Failed to get tale token:', error);
      return null;
    }
  }

  // 从cookie获取app token
  getAppToken(appKey: string): string | null {
    if (typeof document === 'undefined') return null;
    
    const tokenKey = this.getTokenCookieKey(appKey);
    const expiredKey = this.getTokenExpiredCookieKey(appKey);
    
    const cookies = document.cookie.split(';');
    const tokenCookie = cookies.find(cookie => cookie.trim().startsWith(`${tokenKey}=`));
    const expiredCookie = cookies.find(cookie => cookie.trim().startsWith(`${expiredKey}=`));
    
    if (!tokenCookie || !expiredCookie) return null;
    
    const token = tokenCookie.split('=')[1];
    // 将 ISO 8601 格式转换为时间戳
    const expiredAt = new Date(expiredCookie.split('=')[1]).getTime();
    // 检查是否过期（提前5分钟刷新）
    if (Date.now() >= expiredAt - 5 * 60 * 1000) {
      console.log(`App token for ${appKey} is expired or will expire soon`);
      return null;
    }
    console.log(token,'--------app token---------')
    return token;
  }

  // 保存app token到cookie
  private saveAppToken(appKey: string, tokenData: AppTokenData): void {
    if (typeof document === 'undefined') return;
    
    const tokenKey = this.getTokenCookieKey(appKey);
    const expiredKey = this.getTokenExpiredCookieKey(appKey);
    
    // 计算过期时间（cookie过期时间设置为token过期时间）
    const expireDate = new Date(tokenData.expired_at);
    const cookieOptions = `expires=${expireDate.toUTCString()}; path=/; SameSite=Lax`;
    
    document.cookie = `${tokenKey}=${tokenData.token}; ${cookieOptions}`;
    document.cookie = `${expiredKey}=${expireDate.toISOString()}; ${cookieOptions}`;
    
    // 更新缓存
    this.tokenCache.set(appKey, tokenData);
    
    console.log(`App token saved for ${appKey}, expires at:`, new Date(tokenData.expired_at));
  }

  // 从API获取app token
  async fetchAppToken(appKey: string): Promise<string> {
    // 防止重复请求
    if (this.refreshPromises.has(appKey)) {
      return this.refreshPromises.get(appKey)!;
    }

    const promise = this.doFetchAppToken(appKey);
    this.refreshPromises.set(appKey, promise);
    
    try {
      const token = await promise;
      return token;
    } finally {
      this.refreshPromises.delete(appKey);
    }
  }

  // 添加直接登录方法
  public async directLogin(username: string, password: string): Promise<any> {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_TALE_BACKEND_URL || 'https://api.turingue.com'
      const appKey = process.env.NEXT_PUBLIC_TALE_APP_KEY || 'oa_HBamFxnA'
      
      console.log('=== 尝试直接登录 ===')
      console.log('登录URL:', `${backendUrl}/auth/v1/login/username-password`)
      console.log('使用的app_key:', appKey)
      
      const response = await fetch(`${backendUrl}/auth/v1/login/username-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          app_key: appKey,
          username: username,
          password: password
        })
      })
      
      console.log('登录响应状态:', response.status, response.statusText)
      
      if (response.ok) {
        const data = await response.json()
        console.log('登录成功！响应数据:', data)
        
        // 保存登录后的用户token
        if (data.data && data.data.token && data.data.token.token) {
          this.saveUserToken(data.data.token)
        }
        
        return data
      } else {
        const errorText = await response.text()
        console.error('登录失败:', response.status, errorText)
        throw new Error(`Login failed: ${response.status} - ${errorText}`)
      }
    } catch (error) {
      console.error('直接登录异常:', error)
      throw error
    }
  }

  // 保存用户token
  private saveUserToken(tokenData: any): void {
    if (typeof document === 'undefined') return;
    
    const tokenKey = 'user-auth-token';
    const expiredKey = 'user-auth-token-expired';
    
    // 将ISO时间转换为时间戳
    const expiredAt = new Date(tokenData.expired_at).getTime();
    
    const cookieOptions = `expires=${new Date(expiredAt).toUTCString()}; path=/; SameSite=Lax`;
    
    document.cookie = `${tokenKey}=${tokenData.token}; ${cookieOptions}`;
    document.cookie = `${expiredKey}=${expiredAt}; ${cookieOptions}`;
    
    console.log('用户token已保存，过期时间:', new Date(expiredAt));
  }

  // 获取用户token
  private getUserToken(): string | null {
    if (typeof document === 'undefined') return null;
    
    const tokenKey = 'user-auth-token';
    const expiredKey = 'user-auth-token-expired';
    
    const cookies = document.cookie.split(';');
    const tokenCookie = cookies.find(cookie => cookie.trim().startsWith(`${tokenKey}=`));
    const expiredCookie = cookies.find(cookie => cookie.trim().startsWith(`${expiredKey}=`));
    
    if (!tokenCookie || !expiredCookie) return null;
    
    const token = tokenCookie.split('=')[1];
    const expiredAt = parseInt(expiredCookie.split('=')[1], 10);
    
    // 检查是否过期（提前5分钟刷新）
    if (Date.now() >= expiredAt - 5 * 60 * 1000) {
      console.log('用户token已过期或即将过期');
      return null;
    }
    
    return token;
  }

  // 修改App Token获取方法，优先使用用户token
  private async doFetchAppToken(appKey: string): Promise<string> {
    try {
      // 优先尝试获取用户token
      let authToken = this.getUserToken();
      let tokenSource = '用户token';

      if (!authToken) {
        // 如果没有用户token，尝试获取tale token作为fallback
        authToken = await this.getTaleToken();
        tokenSource = 'tale token';
      }

      if (!authToken) {
        throw new Error('No valid authentication token found');
      }

      console.log(`使用${tokenSource}获取App Token:`, authToken.substring(0, 20) + '...')

      const backendUrl = process.env.NEXT_PUBLIC_TALE_BACKEND_URL || 'https://api.turingue.com'
      console.log('App Token API 使用的后端URL:', backendUrl)

      // 使用正确的API端点和请求方法
      const apiUrl = `${backendUrl}/app/v1/token`
      console.log('App Token API 完整URL:', apiUrl)
      console.log('使用POST方法，包含app_key和app_secret')

      // 首先尝试使用app_key + app_secret获取App Token
      let response;
      let authMethod = 'app_key + app_secret (POST)';

      try {
        console.log('尝试使用app_key + app_secret获取App Token...')
        
        const appSecret = process.env.NEXT_PUBLIC_TALE_APP_SECRET || '7f785775-cfa9-44c1-bc84-80a9497a5bd5'
        
        response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            app_key: appKey,
            app_secret: appSecret
          }),
        });

        if (response.ok) {
          console.log('app_key + app_secret认证成功！');
        } else {
          console.log('app_key + app_secret认证失败，尝试其他方式...');
          
          // 如果失败，尝试使用用户token进行认证
          authMethod = '用户token + x-t-token header';
          response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'x-t-token': authToken
            },
          });

          if (response.ok) {
            console.log('用户token认证成功！');
          } else if (response.status === 401) {
            console.log('用户token认证失败(401)，尝试其他方式...');

            // 尝试Authorization Bearer
            authMethod = '用户token + Authorization Bearer';
            response = await fetch(apiUrl, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
              },
            });

            if (response.ok) {
              console.log('Authorization Bearer认证成功！');
            } else {
              console.log('所有认证方式都失败');
            }
          }
        }
      } catch (fetchError) {
        console.error('API调用异常:', fetchError);
        throw fetchError;
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`App Token API调用失败 (${authMethod}):`, response.status, errorText);
        throw new Error(`Failed to fetch app token: ${response.status} - ${errorText}`);
      }

      const result: AppTokenResponse = await response.json();
      console.log('App Token API响应:', result);

      if (result.data && result.data.token) {
        this.saveAppToken(appKey, result.data);
        return result.data.token;
      } else {
        throw new Error('Invalid token response');
      }
    } catch (error) {
      console.error(`Error fetching app token for ${appKey}:`, error);
      throw error;
    }
  }

  // 获取有效的app token（自动刷新）
  async getValidAppToken(appKey: string): Promise<string | null> {
    try {
      // 先尝试从cookie获取
      let token = this.getAppToken(appKey);
      if (!token) {
        // 如果没有或已过期，重新获取
        console.log(`Fetching new app token for ${appKey}`);
        token = await this.fetchAppToken(appKey);
      }
      
      return token;
    } catch (error) {
      console.error(`Failed to get valid app token for ${appKey}:`, error);
      return null;
    }
  }

  // 清除指定app的token
  clearAppToken(appKey: string): void {
    if (typeof document === 'undefined') return;
    
    const tokenKey = this.getTokenCookieKey(appKey);
    const expiredKey = this.getTokenExpiredCookieKey(appKey);
    
    document.cookie = `${tokenKey}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    document.cookie = `${expiredKey}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    
    this.tokenCache.delete(appKey);
  }

  // 清除tale token
  clearTaleToken(): void {
    if (typeof document === 'undefined') return;
    
    const tokenKey = this.getTaleTokenCookieKey();
    const expiredKey = this.getTaleTokenExpiredCookieKey();
    
    document.cookie = `${tokenKey}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    document.cookie = `${expiredKey}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  }

  // 清除所有app token
  clearAllAppTokens(): void {
    if (typeof document === 'undefined') return;
    
    const cookies = document.cookie.split(';');
    cookies.forEach(cookie => {
      const [name] = cookie.trim().split('=');
      if (name.startsWith('tale-app-token-') || name.startsWith('tale-backend-token')) {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      }
    });
    
    this.tokenCache.clear();
  }
  
  // 在 AppTokenService 类中添加公共方法
  public async getValidTaleToken(): Promise<string | null> {
    return await this.getTaleToken();
  }
}

export const appTokenService = AppTokenService.getInstance();
