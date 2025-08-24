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

    // 调用后端API修改密码
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CHANGE_PASSWORD}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'App-Key': API_CONFIG.APP.APP_KEY
      },
      body: JSON.stringify({
        current_password,
        new_password
      })
    })

    const data = await response.json()

    if (response.ok && data.code === 200) {
      return NextResponse.json({
        code: 200,
        message: '密码修改成功',
        data: data.data
      })
    } else {
      return NextResponse.json(
        { 
          code: data.code || response.status, 
          message: data.message || '密码修改失败' 
        },
        { status: response.status }
      )
    }

  } catch (error) {
    console.error('修改密码API错误:', error)
    return NextResponse.json(
      { code: 500, message: '服务器内部错误' },
      { status: 500 }
    )
  }
}
