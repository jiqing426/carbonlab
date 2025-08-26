"use server"

import { revalidatePath } from "next/cache"

export interface ServerActionResult<T = any> {
  success: boolean
  data?: T
  error?: string
}

// 获取用户详情（管理用）
export async function getUserDetailForManagementAction(
  userId: string, 
  appKey: string
): Promise<ServerActionResult<any>> {
  try {
    // TODO: 实现真实的API调用
    // const response = await fetch(`${process.env.NEXT_PUBLIC_TALE_BACKEND_URL}/account/v1/users/${userId}`, {
    //   headers: {
    //     'x-t-token': await getAppToken(appKey)
    //   }
    // })
    
    // 模拟API响应
    const mockResponse = {
      user: {
        user_id: userId,
        username: "testuser",
        nick_name: "测试用户",
        phone: "13800138000",
        avatar_url: null,
        registered_at: "2024-01-01T00:00:00Z",
        latest_login_time: "2024-01-15T10:30:00Z",
        remark: "这是一个测试用户"
      },
      user_roles: [
        {
          role_id: "role1",
          role_name: "student",
          role_type: "user"
        }
      ],
      user_groups: [
        {
          groupId: "group1",
          name: "默认用户组",
          description: "系统默认用户组",
          createdAt: "2024-01-01T00:00:00Z",
          updatedAt: "2024-01-01T00:00:00Z",
          remark: "自动创建",
          memberCount: 100
        }
      ]
    }
    
    return {
      success: true,
      data: mockResponse
    }
  } catch (error) {
    console.error('Failed to get user detail:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '获取用户详情失败'
    }
  }
}

// 获取头像预签名URL
export async function getAvatarPresignedUrlAction(
  avatarOssKey: string
): Promise<ServerActionResult<{ ossKey: string; presignedUrl: string; expireTimeInSeconds: number }>> {
  try {
    // TODO: 实现真实的API调用
    // const response = await fetch(`${process.env.NEXT_PUBLIC_TALE_BACKEND_URL}/storage/v1/avatar/presigned-url`, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify({ oss_key: avatarOssKey })
    // })
    
    // 模拟API响应
    const mockResponse = {
      ossKey: avatarOssKey,
      presignedUrl: `https://example.com/avatar/${avatarOssKey}`,
      expireTimeInSeconds: 3600
    }
    
    return {
      success: true,
      data: mockResponse
    }
  } catch (error) {
    console.error('Failed to get avatar presigned URL:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '获取头像URL失败'
    }
  }
}

// 上传头像
export async function uploadAvatarAction(
  file: File, 
  userId: string
): Promise<ServerActionResult<{ avatar_oss_key: string }>> {
  try {
    // TODO: 实现真实的文件上传API调用
    // const formData = new FormData()
    // formData.append('file', file)
    // formData.append('user_id', userId)
    
    // const response = await fetch(`${process.env.NEXT_PUBLIC_TALE_BACKEND_URL}/storage/v1/avatar/upload`, {
    //   method: 'POST',
    //   body: formData
    // })
    
    // 模拟API响应
    const mockResponse = {
      avatar_oss_key: `avatar/${userId}/${Date.now()}.jpg`
    }
    
    // 重新验证相关路径
    revalidatePath(`/dashboard/users/${userId}`)
    
    return {
      success: true,
      data: mockResponse
    }
  } catch (error) {
    console.error('Failed to upload avatar:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '头像上传失败'
    }
  }
}
