import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    console.log('=== Tale Token API 调用开始 ===')
    
    // 检查环境变量
    const backendUrl = process.env.NEXT_PUBLIC_TALE_BACKEND_URL || 'https://api.turingue.com'
    const appKey = process.env.NEXT_PUBLIC_TALE_APP_KEY || 'oa_HBamFxnA'
    const appSecret = process.env.NEXT_PUBLIC_TALE_APP_SECRET || '7f785775-cfa9-44c1-bc84-80a9497a5bd5'
    
    console.log('使用的配置:', { backendUrl, appKey })
    
    // 尝试调用真实的Tale系统API获取token
    try {
      const response = await fetch(`${backendUrl}/app/v1/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          app_key: appKey,
          app_secret: appSecret
        }),
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('Tale API 响应成功:', data)
        
        // 返回真实的token数据 - 修复数据结构访问
        const tokenData = data.data || data
        return NextResponse.json({
          token: tokenData.token || tokenData.access_token,
          expired_time: tokenData.expired_at || tokenData.expires_at || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        })
      } else {
        console.warn('Tale API 调用失败，状态码:', response.status)
        // 如果真实API失败，返回模拟数据作为fallback
        const mockTokenData = {
          token: 'mock-tale-token-' + Date.now(),
          expired_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        }
        console.log('使用模拟数据作为fallback:', mockTokenData)
        return NextResponse.json(mockTokenData)
      }
    } catch (apiError) {
      console.warn('Tale API 调用异常，使用模拟数据:', apiError)
      // API调用异常时，返回模拟数据
      const mockTokenData = {
        token: 'mock-tale-token-' + Date.now(),
        expired_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      }
      return NextResponse.json(mockTokenData)
    }
    
  } catch (error) {
    console.error('Tale Token API 严重错误:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tale token' },
      { status: 500 }
    )
  }
}
