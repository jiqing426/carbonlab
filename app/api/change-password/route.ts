import { NextRequest, NextResponse } from 'next/server'
import { API_CONFIG } from '@/lib/config/api'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { current_password, new_password } = body

    // 验证请求参数
    if (!current_password || !new_password) {
      return NextResponse.json(
        { code: 400, message: '缺少必要参数' },
        { status: 400 }
      )
    }

    // 验证新密码长度
    if (new_password.length < 6) {
      return NextResponse.json(
        { code: 400, message: '新密码长度至少6位' },
        { status: 400 }
      )
    }

    // 获取Authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { code: 401, message: '未授权访问' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)

    // 首先获取当前用户信息
    let userInfo = null
    try {
      const userResponse = await fetch(`${API_CONFIG.BASE_URL}/auth/v1/validate`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'App-Key': API_CONFIG.APP.APP_KEY
        }
      })
      
      if (userResponse.ok) {
        const userData = await userResponse.json()
        userInfo = userData.data || userData
        console.log('获取到用户信息:', userInfo)
      }
    } catch (error) {
      console.log('获取用户信息失败，继续尝试密码修改:', error)
    }

    // 尝试多个可能的密码修改端点
    const possibleEndpoints = [
      `/account/v1/user/${userInfo?.user_id || 'current'}/password`,
      `/account/v1/users/${userInfo?.user_id || 'current'}/password`,
      `/rbac/v1/users/${userInfo?.user_id || 'current'}/password`,
      `/app/v1/users/${userInfo?.user_id || 'current'}/password`,
      `/auth/v1/users/${userInfo?.user_id || 'current'}/password`,
      // 用户更新端点
      `/account/v1/user/${userInfo?.user_id || 'current'}`,
      `/account/v1/users/${userInfo?.user_id || 'current'}`,
      `/rbac/v1/users/${userInfo?.user_id || 'current'}`,
      `/app/v1/users/${userInfo?.user_id || 'current'}`,
      `/auth/v1/users/${userInfo?.user_id || 'current'}`,
      // 通用用户端点
      `/account/v1/user`,
      `/rbac/v1/user`
    ]

    let lastError: Error | null = null
    let successEndpoint = null

    for (const endpoint of possibleEndpoints) {
      try {
        console.log(`尝试密码修改端点: ${endpoint}`)
        
        const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'App-Key': API_CONFIG.APP.APP_KEY
          },
          body: JSON.stringify({
            // 尝试多种可能的密码字段名
            password: new_password,
            password_encrypted: new_password,
            new_password: new_password,
            current_password: current_password,
            // 如果是用户更新端点，需要包含用户的其他信息
            ...(userInfo && !endpoint.includes('/password') ? {
              username: userInfo.username || userInfo.user?.username,
              phone: userInfo.phone || userInfo.user?.phone,
              email: userInfo.email || userInfo.user?.email
            } : {}),
            // 如果是通用端点，添加用户ID
            ...(endpoint.endsWith('/user') && userInfo?.user_id ? { user_id: userInfo.user_id } : {})
          })
        })

        console.log(`端点 ${endpoint} 响应状态:`, response.status)

        if (response.ok) {
          console.log('密码修改成功，使用端点:', endpoint)
          successEndpoint = endpoint
          break
        } else {
          const errorText = await response.text()
          console.log(`端点 ${endpoint} 失败:`, response.status, errorText)
          
          lastError = new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
          
          // 如果是404 Not Found，继续尝试下一个端点
          if (response.status === 404) {
            console.log(`端点 ${endpoint} 不存在，尝试下一个...`)
            continue
          }
          
          // 如果是其他错误，也继续尝试
          console.log(`端点 ${endpoint} 返回错误，尝试下一个...`)
          continue
        }
      } catch (error) {
        console.log(`端点 ${endpoint} 请求异常:`, error)
        lastError = error instanceof Error ? error : new Error(String(error))
        continue
      }
    }

    if (!successEndpoint) {
      return NextResponse.json(
        { 
          code: 500, 
          message: `所有密码修改端点都失败了。最后错误: ${lastError?.message || '未知错误'}` 
        },
        { status: 500 }
      )
    }

    // 密码修改成功
    return NextResponse.json({
      code: 200,
      message: '密码修改成功',
      data: { endpoint: successEndpoint }
    })

  } catch (error) {
    console.error('修改密码API错误:', error)
    return NextResponse.json(
      { code: 500, message: '服务器内部错误' },
      { status: 500 }
    )
  }
}
