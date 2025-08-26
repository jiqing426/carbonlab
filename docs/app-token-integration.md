# 应用Token集成说明

## 功能概述

应用Token（App Token）是平台与后端API通信的凭证，用于验证应用的身份和权限。系统会自动管理token的获取、刷新和过期处理。

## API接口信息

### 获取应用Token
- **端点**: `POST /app/v1/token`
- **基础URL**: `https://api.turingue.com`
- **请求体**:
  ```json
  {
    "app_key": "oa_HBamFxnA",
    "app_secret": "7f785775-cfa9-44c1-bc84-80a9497a5bd5"
  }
  ```

### 响应格式
```json
{
  "data": {
    "type": "app",
    "app_key": "oa_HBamFxnA",
    "app_name": "whut-carbonlab-dev",
    "token": "ta_758e9859c3a745729455cbbb62d8b7b4",
    "status": "valid",
    "expired_at": "2025-08-23T11:39:57+08:00"
  },
  "code": 200,
  "msg": "OK"
}
```

## 技术实现

### 1. API配置 (`lib/config/api.ts`)
```typescript
export const API_CONFIG = {
  BASE_URL: 'https://api.turingue.com',
  APP: {
    APP_KEY: 'oa_HBamFxnA',
    APP_NAME: 'whut-carbonlab-dev',
    APP_SECRET: '7f785775-cfa9-44c1-bc84-80a9497a5bd5',
  },
  ENDPOINTS: {
    GET_APP_TOKEN: '/app/v1/token',
    // ... 其他端点
  }
}
```

### 2. API服务 (`lib/api/app.ts`)
```typescript
export const appAPI = {
  // 获取应用token
  getAppToken: async (): Promise<AppTokenResponse> => { ... },
  
  // 验证token是否有效
  isAppTokenValid: (expiredAt: string): boolean => { ... },
  
  // 获取剩余有效期
  getAppTokenRemainingTime: (expiredAt: string): number => { ... }
}
```

### 3. 状态管理 (`lib/stores/app-token-store.ts`)
```typescript
export const useAppTokenStore = create<AppTokenStore>()(
  persist(
    (set, get) => ({
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
    }),
    { name: 'app-token-storage' }
  )
)
```

## 使用方法

### 1. 自动获取Token
用户登录成功后，系统会自动获取应用token：
```typescript
// 在用户登录成功后自动执行
const appTokenStore = useAppTokenStore.getState()
await appTokenStore.refreshAppToken()
```

### 2. 手动获取Token
```typescript
import { useAppTokenStore } from '@/lib/stores/app-token-store'

const { getAppToken, refreshAppToken } = useAppTokenStore()

// 获取token（如果有效则返回现有token，否则获取新token）
const token = await getAppToken()

// 强制刷新token
const newToken = await refreshAppToken()
```

### 3. 检查Token状态
```typescript
const { isTokenValid, getRemainingTime } = useAppTokenStore()

// 检查token是否有效
const isValid = isTokenValid()

// 获取剩余有效期（分钟）
const remainingMinutes = getRemainingTime()
```

### 4. 清除Token
```typescript
const { clearAppToken } = useAppTokenStore()

// 清除存储的token
clearAppToken()
```

## 功能特性

### 自动管理
- **自动获取**: 用户登录后自动获取应用token
- **自动验证**: 自动检查token的有效性
- **自动刷新**: 在需要时自动刷新过期token

### 数据持久化
- 使用 `localStorage` 存储token信息
- 页面刷新后token状态保持
- 支持token的完整生命周期管理

### 错误处理
- 网络请求超时处理
- API错误响应处理
- 用户友好的错误提示

### 状态监控
- 实时显示token状态
- 显示剩余有效期
- 显示过期时间

## 测试页面

访问 `/test-app-token` 页面可以测试所有app token功能：

1. **获取Token**: 测试token获取功能
2. **刷新Token**: 测试token刷新功能
3. **清除Token**: 测试token清除功能
4. **状态监控**: 查看token的实时状态
5. **详细信息**: 查看完整的token信息

## 集成流程

### 1. 用户登录
```
用户登录 → 验证用户凭证 → 获取用户token → 自动获取应用token
```

### 2. Token使用
```
检查应用token → 如果有效则使用 → 如果过期则自动刷新
```

### 3. 错误处理
```
API调用失败 → 记录错误信息 → 显示用户提示 → 支持重试
```

## 注意事项

1. **安全性**: app_secret 不应暴露在前端代码中，建议使用环境变量
2. **有效期**: token有过期时间，系统会自动处理过期情况
3. **错误处理**: 获取token失败不会影响用户登录功能
4. **性能**: token获取有超时设置，避免长时间等待
5. **存储**: token信息存储在localStorage中，清除浏览器数据会丢失

## 环境变量配置

建议在 `.env.local` 文件中配置：
```bash
NEXT_PUBLIC_API_BASE_URL=https://api.turingue.com
NEXT_PUBLIC_APP_KEY=oa_HBamFxnA
NEXT_PUBLIC_APP_SECRET=7f785775-cfa9-44c1-bc84-80a9497a5bd5
```

这样可以更安全地管理敏感信息，并支持不同环境的配置。


