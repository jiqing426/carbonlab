import { NextRequest, NextResponse } from 'next/server'
import { appTokenService } from '@/lib/services/app-token-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { user_id, new_password, app_key } = body

    // 验证必要参数
    if (!user_id || !new_password || !app_key) {
      return NextResponse.json({
        code: 400,
        message: '缺少必要参数：user_id, new_password, app_key'
      }, { status: 400 })
    }

    // 验证密码长度
    if (new_password.length < 6) {
      return NextResponse.json({
        code: 400,
        message: '新密码长度至少6位'
      }, { status: 400 })
    }

    // 获取有效的应用令牌
    const appToken = await appTokenService.getValidAppToken(app_key)
    if (!appToken) {
      return NextResponse.json({
        code: 401,
        message: '无法获取有效的应用令牌'
      }, { status: 401 })
    }

    // 调用Tale API重置用户密码
    const API_BASE_URL = process.env.NEXT_PUBLIC_TALE_BACKEND_URL || 'https://api.turingue.com'
    
    // 首先尝试获取用户信息（用于更新端点）
    let userInfo = null
    try {
      const userResponse = await fetch(`${API_BASE_URL}/account/v1/user/${user_id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-t-token': appToken,
        },
      })
      
      if (userResponse.ok) {
        const userData = await userResponse.json()
        userInfo = userData.data || userData
        console.log('获取到用户信息:', userInfo)
      }
    } catch (error) {
      console.log('获取用户信息失败，继续尝试密码重置:', error)
    }
    
    // 尝试多个可能的密码重置端点
    const possibleEndpoints = [
      // 专门的密码重置端点
      `/account/v1/user/${user_id}/password`,
      `/account/v1/users/${user_id}/password`,
      `/rbac/v1/users/${user_id}/password`,
      `/app/v1/users/${user_id}/password`,
      `/auth/v1/users/${user_id}/password`,
      // 用户更新端点（可能支持密码更新）
      `/account/v1/user/${user_id}`,
      `/account/v1/users/${user_id}`,
      `/rbac/v1/users/${user_id}`,
      `/app/v1/users/${user_id}`,
      `/auth/v1/users/${user_id}`,
      // 尝试使用用户创建端点（PUT方法可能支持更新）
      `/account/v1/user`
    ]

    let lastError = null

    for (const endpoint of possibleEndpoints) {
      try {
        console.log(`尝试密码重置端点: ${endpoint}`)
        
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'x-t-token': appToken,
          },
          body: JSON.stringify({
            // 对于密码重置，使用与用户创建相同的字段名
            // 尝试多种可能的密码字段名
            password: new_password,                    // 明文密码
            password_encrypted: new_password,          // 加密密码（Tale API期望的字段）
            new_password: new_password,                // 新密码字段
            // 如果是用户更新端点，需要包含用户的其他信息
            ...(endpoint.includes('/password') ? {} : {
              // 对于用户更新端点，使用真实的用户信息
              ...(userInfo && {
                username: userInfo.username || userInfo.user?.username,
                phone: userInfo.phone || userInfo.user?.phone,
                email: userInfo.email || userInfo.user?.email
              })
            }),
            // 如果是用户创建端点，添加用户ID
            ...(endpoint === '/account/v1/user' ? { user_id: user_id } : {})
          })
        })

        console.log(`端点 ${endpoint} 响应状态:`, response.status)
        console.log(`请求体:`, JSON.stringify({
          password: new_password,
          password_encrypted: new_password,
          new_password: new_password,
          ...(endpoint.includes('/password') ? {} : {
            ...(userInfo && {
              username: userInfo.username || userInfo.user?.username,
              phone: userInfo.phone || userInfo.user?.phone,
              email: userInfo.email || userInfo.user?.email
            })
          }),
          ...(endpoint === '/account/v1/user' ? { user_id: user_id } : {})
        }, null, 2))

        if (response.ok) {
          console.log('密码重置成功，使用端点:', endpoint)
          return NextResponse.json({
            code: 200,
            message: '密码重置成功'
          })
        } else {
          const errorText = await response.text()
          console.log(`端点 ${endpoint} 失败:`, response.status, errorText)
          
          try {
            const parsedError = JSON.parse(errorText)
            if (parsedError.msg) {
              console.log(`错误信息: ${parsedError.msg}`)
            }
          } catch (parseError) {
            console.log('无法解析错误信息:', parseError)
          }
          
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
        console.error(`端点 ${endpoint} 异常:`, error)
        lastError = error
        continue
      }
    }

    // 所有端点都失败了
    console.error('所有密码重置端点都失败了')
    return NextResponse.json({
      code: 500,
      message: '密码重置失败：所有可用的API端点都无法访问'
    }, { status: 500 })

  } catch (error) {
    console.error('密码重置API异常:', error)
    return NextResponse.json({
      code: 500,
      message: '服务器内部错误'
    }, { status: 500 })
  }
}
