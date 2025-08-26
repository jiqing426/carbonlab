// API配置文件
export const API_CONFIG = {
  // API基础URL
  BASE_URL: 'https://api.turingue.com',
  
  // 应用配置
  APP: {
    APP_KEY: 'oa_HBamFxnA',
    APP_NAME: 'whut-carbonlab-dev',
    APP_SECRET: '7f785775-cfa9-44c1-bc84-80a9497a5bd5',
  },
  
  // API端点
  ENDPOINTS: {
    LOGIN: '/auth/v1/login/username-password',
    VALIDATE_TOKEN: '/auth/v1/validate',
    CHANGE_PASSWORD: '/account/v1/user',  // 使用用户更新端点
    GET_APP_TOKEN: '/app/v1/token',
  },
  
  // 请求配置
  REQUEST: {
    TIMEOUT: 10000, // 10秒超时
    RETRY_ATTEMPTS: 3, // 重试次数
  }
}

// 环境变量覆盖（如果存在）
if (process.env.NEXT_PUBLIC_API_BASE_URL) {
  API_CONFIG.BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL
}

if (process.env.NEXT_PUBLIC_APP_KEY) {
  API_CONFIG.APP.APP_KEY = process.env.NEXT_PUBLIC_APP_KEY
}
