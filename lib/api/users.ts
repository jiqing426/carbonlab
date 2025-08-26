import { 
  AppUser, 
  UsersResponse, 
  UsersQueryParams, 
  CreateUserRequest,
  UserDetailResponse,
  SaveUserRolesRequest,
  RemoveUserRoleRequest,
  PresignedUrlResponse,
  AvatarUploadResponse
} from '@/types/tale'
import { appTokenService } from '@/lib/services/app-token-service'

const API_BASE_URL = process.env.NEXT_PUBLIC_TALE_BACKEND_URL || 'https://api.turingue.com'

  // 获取用户列表 - 重新实现以避免缓存问题
export async function getUsers(params?: UsersQueryParams, appKey?: string): Promise<UsersResponse> {
  if (!appKey) {
    throw new Error('No app key provided')
  }
  
  const appToken = await appTokenService.getValidAppToken(appKey)
  if (!appToken) {
    throw new Error('No valid app token')
  }
  
  console.log('用户管理API使用的token:', appToken.substring(0, 20) + '...')
  console.log('=== 用户管理API调用开始 ===')

  const queryParams = new URLSearchParams()
  if (params?.page !== undefined) queryParams.append('page', params.page.toString())
  if (params?.size !== undefined) queryParams.append('size', params.size.toString())
  if (params?.sort_by) queryParams.append('sort_by', params.sort_by)
  if (params?.sort_direction) queryParams.append('sort_direction', params.sort_direction)
  if (params?.search) queryParams.append('search', params.search)

  // 强制使用正确的端点
  const endpoint = '/account/v1/users'
  const timestamp = Date.now()
  // 添加额外的随机参数确保不缓存
  const randomParam = Math.random().toString(36).substring(7)
  const url = `${API_BASE_URL}${endpoint}?${queryParams}&_t=${timestamp}&_r=${randomParam}`
  
  console.log('用户管理API请求URL:', url)
  console.log('确认使用正确的端点:', endpoint)
  console.log('API版本: v1.0.2 - 强制使用 /account/v1/users 端点')
  console.log('请求参数:', Object.fromEntries(queryParams.entries()))
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-t-token': appToken,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      },
    })

    console.log('用户管理API响应状态:', response.status, response.statusText)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('获取用户列表失败:', response.status, errorText)
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    console.log('用户列表API响应:', result)
    console.log('=== 用户管理API调用成功 ===')
    
    // 详细分析API响应结构
    console.log('API响应类型:', typeof result)
    console.log('API响应键名:', Object.keys(result))
    
    let usersData: any = null
    
    // 尝试多种可能的响应格式
    if (result.data && result.data.content) {
      console.log('✅ 找到 result.data.content 格式')
      usersData = result.data
    } else if (result.content) {
      console.log('✅ 找到 result.content 格式')
      usersData = result
    } else if (Array.isArray(result)) {
      console.log('✅ 响应本身就是数组格式')
      usersData = {
        content: result,
        total: result.length,
        pageable: {
          pageNumber: 0,
          pageSize: result.length
        }
      }
    } else if (result.data && Array.isArray(result.data)) {
      console.log('✅ 找到 result.data 数组格式')
      usersData = {
        content: result.data,
        total: result.data.length,
        pageable: {
          pageNumber: 0,
          pageSize: result.data.length
        }
      }
    } else {
      console.log('❌ 未知的响应格式:', result)
      throw new Error('Unknown API response format')
    }
    
    console.log('处理后的用户数据:', usersData)
    console.log('用户数量:', usersData.content?.length || 0)
    
    // 验证用户数据格式
    if (usersData.content && usersData.content.length > 0) {
      const firstUser = usersData.content[0]
      console.log('第一个用户对象:', firstUser)
      console.log('第一个用户的字段:', Object.keys(firstUser))
      
      // 检查必要的字段
      if (!firstUser.username && !firstUser.user_id) {
        console.warn('⚠️ 用户对象缺少必要字段')
      }
      
      // 处理嵌套的用户数据结构
      if (firstUser.user && typeof firstUser.user === 'object') {
        console.log('✅ 检测到嵌套的用户数据结构，开始标准化...')
        
        // 标准化嵌套的用户数据
        usersData.content = usersData.content.map((item: any) => {
          if (item.user && typeof item.user === 'object') {
            return {
              // 从嵌套的user字段提取用户信息
              user_id: item.user.user_id || item.user.id,
              username: item.user.username || item.user.name,
              phone: item.user.phone || item.user.mobile,
              email: item.user.email,
              registered_at: item.user.registered_at || item.user.created_at,
              latest_login_time: item.user.latest_login_time || item.user.last_login,
              is_frozen: item.user.is_frozen || item.user.frozen || false,
              // 保留原有的角色和权限信息
              roles: item.user_roles || item.roles || [],
              privileges: item.user_privileges || item.privileges || [],
              groups: item.user_groups || item.groups || [],
              // 保留应用信息
              app: item.app,
              third_party: item.third_party
            }
          } else {
            // 如果不是嵌套结构，保持原样
            return item
          }
        })
        
        console.log('✅ 用户数据标准化完成')
        console.log('标准化后的第一个用户:', usersData.content[0])
      }
      
      // 过滤掉已删除的用户
      const originalCount = usersData.content.length
      usersData.content = usersData.content.filter((user: any) => {
        // 检查各种可能的删除状态字段
        const isDeleted = user.is_deleted === true || 
                         user.deleted === true || 
                         user.status === 'deleted' || 
                         user.user_status === 'deleted' ||
                         user.active === false ||
                         user.is_active === false
        
        // 检查冻结状态（冻结的用户可能也应该被过滤）
        const isFrozen = user.is_frozen === true || 
                        user.frozen === true || 
                        user.status === 'frozen' || 
                        user.user_status === 'frozen'
        
        // 如果用户被标记为删除或冻结，则过滤掉
        if (isDeleted || isFrozen) {
          console.log(`过滤掉用户: ${user.username || user.user_id} (删除: ${isDeleted}, 冻结: ${isFrozen})`)
          return false
        }
        
        return true
      })
      
      // 更新总数
      usersData.total = usersData.content.length
      console.log(`过滤后用户数量: ${usersData.content.length} (原始: ${originalCount})`)
    }
    
    return usersData
  } catch (error) {
    console.error('用户管理API调用异常:', error)
    throw error
  }
}

// 删除用户
export async function deleteUser(userId: string, appKey?: string): Promise<void> {
  if (!appKey) {
    throw new Error('No app key provided')
  }

  const appToken = await appTokenService.getValidAppToken(appKey)
  if (!appToken) {
    throw new Error('No valid app token')
  }

  console.log('删除用户API调用开始，用户ID:', userId)
  
  // 尝试多个可能的删除用户端点，使用PUT方法进行软删除
  const possibleEndpoints = [
    `/account/v1/user/${userId}`,        // 单数形式，支持PUT方法
    `/account/v1/users/${userId}`,       // 复数形式
    `/rbac/v1/users/${userId}`,          // 基于角色的用户管理
    `/app/v1/users/${userId}`,           // 应用级别的用户管理
    `/auth/v1/users/${userId}`           // 认证相关的用户管理
  ]
  
  let lastError = null
  
  for (const endpoint of possibleEndpoints) {
    try {
      console.log(`\n--- 尝试删除端点: ${endpoint} ---`)
      console.log('API端点:', `${API_BASE_URL}${endpoint}`)
      console.log('请求方法: PUT (软删除)')
      console.log('请求头:', {
        'Content-Type': 'application/json',
        'x-t-token': appToken.substring(0, 20) + '...'
      })

      // 使用PUT方法进行软删除，设置用户状态为已删除或冻结
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-t-token': appToken,
        },
        body: JSON.stringify({
          // 尝试不同的状态字段来标记用户为已删除
          is_deleted: true,
          is_frozen: true,
          status: 'deleted',
          deleted_at: new Date().toISOString(),
          // 或者使用其他可能的字段
          user_status: 'deleted',
          active: false
        })
      })

      console.log('删除用户API响应状态:', response.status, response.statusText)
      
      if (response.ok) {
        console.log('✅ 删除用户成功，使用端点:', endpoint)
        return
      } else {
        const errorText = await response.text()
        console.log(`❌ 端点 ${endpoint} 失败:`, response.status, errorText)
        
        // 尝试解析错误信息
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
  
  // 所有端点都失败了，尝试使用DELETE方法作为备选方案
  console.log('\n--- 尝试使用DELETE方法作为备选方案 ---')
  const deleteEndpoints = [
    `/account/v1/user/${userId}`,
    `/rbac/v1/users/${userId}`,
    `/app/v1/users/${userId}`,
    `/auth/v1/users/${userId}`,
    `/account/v1/users/${userId}`
  ]
  
  for (const endpoint of deleteEndpoints) {
    try {
      console.log(`\n--- 尝试DELETE端点: ${endpoint} ---`)
      console.log('API端点:', `${API_BASE_URL}${endpoint}`)
      console.log('请求方法: DELETE')
      
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-t-token': appToken,
        },
      })

      console.log('DELETE方法响应状态:', response.status, response.statusText)
      
      if (response.ok) {
        console.log('✅ 使用DELETE方法删除用户成功，端点:', endpoint)
        return
      } else {
        const errorText = await response.text()
        console.log(`❌ DELETE端点 ${endpoint} 失败:`, response.status, errorText)
        
        try {
          const parsedError = JSON.parse(errorText)
          if (parsedError.msg) {
            console.log(`错误信息: ${parsedError.msg}`)
          }
        } catch (parseError) {
          console.log('无法解析错误信息:', parseError)
        }
      }
    } catch (error) {
      console.error(`DELETE端点 ${endpoint} 异常:`, error)
    }
  }
  
  // 所有方法都失败了
  console.error('❌ 所有可能的删除用户方法都失败了')
  throw lastError || new Error('All delete user methods failed')
}

// 创建用户
export async function createUser(userData: CreateUserRequest, appKey?: string): Promise<AppUser> {
  console.log('=== 创建用户API调用开始 ===')
  console.log('用户数据:', userData)
  console.log('使用的app_key:', appKey)
  
  if (!appKey) {
    console.error('❌ 没有提供app_key')
    throw new Error('No app key provided')
  }
  
  console.log('开始获取App Token...')
  const appToken = await appTokenService.getValidAppToken(appKey)
  if (!appToken) {
    console.error('❌ 无法获取有效的App Token')
    throw new Error('No valid app token')
  }
  
  console.log('✅ App Token获取成功:', appToken.substring(0, 20) + '...')
  
  // 数据预处理和验证
  const processedData = { ...userData }
  
  // 如果手机号为空或无效，设置为undefined（让后端处理）
  if (!processedData.phone || processedData.phone.trim() === '') {
    console.log('⚠️ 手机号为空，设置为undefined')
    processedData.phone = undefined
  }
  
  // 如果密码为空，设置为undefined
  if (!processedData.password_encrypted || processedData.password_encrypted.trim() === '') {
    console.log('⚠️ 密码为空，设置为undefined')
    processedData.password_encrypted = undefined
  }
  
  console.log('处理后的数据:', processedData)
  
  // 使用已知有效的端点
  const endpoint = '/account/v1/user'
  const url = `${API_BASE_URL}${endpoint}`
  
  console.log(`使用端点: ${endpoint}`)
  console.log('完整URL:', url)
  console.log('请求方法: POST')
  console.log('请求头:', {
    'Content-Type': 'application/json',
    'x-t-token': appToken.substring(0, 20) + '...'
  })

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-t-token': appToken,
      },
      body: JSON.stringify(processedData),
    })

    console.log('API响应状态:', response.status, response.statusText)
    
    if (response.ok) {
      const result = await response.json()
      console.log('✅ API调用成功，响应数据:', result)
      
      if (result.data) {
        return result.data
      } else if (result.code === 200) {
        // 如果响应成功但没有data字段，返回整个结果
        return result as any
      } else {
        console.error('❌ 响应格式异常:', result)
        throw new Error('Invalid response format')
      }
    } else {
      const errorText = await response.text()
      console.error('❌ API调用失败:', response.status, errorText)
      
      // 尝试解析错误信息
      try {
        const errorData = JSON.parse(errorText)
        if (errorData.msg) {
          throw new Error(`创建用户失败: ${errorData.msg}`)
        }
      } catch (parseError) {
        // 如果无法解析JSON，使用原始错误文本
      }
      
      throw new Error(`创建用户失败: HTTP ${response.status} - ${errorText}`)
    }
  } catch (error) {
    console.error('❌ 创建用户异常:', error)
    throw error
  }
}

// 获取用户详情
export async function getUserDetail(userId: string, appKey?: string): Promise<UserDetailResponse> {
  if (!appKey) {
    throw new Error('No app key provided')
  }
  
  const appToken = await appTokenService.getValidAppToken(appKey)
  if (!appToken) {
    throw new Error('No valid app token')
  }

  console.log('获取用户详情API调用开始，用户ID:', userId)
  
  // 尝试多个可能的获取用户详情端点
  const possibleEndpoints = [
    `/account/v1/user/${userId}`,        // 单数形式，可能支持GET
    `/rbac/v1/users/${userId}`,          // 基于角色的用户详情
    `/app/v1/users/${userId}`,           // 应用级别的用户详情
    `/auth/v1/users/${userId}`,          // 认证相关的用户详情
    `/account/v1/users/${userId}`        // 原始端点（最后尝试）
  ]
  
  let lastError = null
  
  for (const endpoint of possibleEndpoints) {
    try {
      console.log(`\n--- 尝试获取用户详情端点: ${endpoint} ---`)
      console.log('API端点:', `${API_BASE_URL}${endpoint}`)
      console.log('请求方法: GET')
      console.log('请求头:', {
        'Content-Type': 'application/json',
        'x-t-token': appToken.substring(0, 20) + '...'
      })

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-t-token': appToken,
        },
      })

      console.log('获取用户详情API响应状态:', response.status, response.statusText)
      
      if (response.ok) {
        const data = await response.json()
        console.log('✅ 获取用户详情成功，使用端点:', endpoint)
        console.log('获取用户详情API成功响应:', data)
        
        if (data.code !== 200) {
          throw new Error(data.msg || 'Failed to fetch user detail')
        }

        return data
      } else {
        const errorText = await response.text()
        console.log(`❌ 端点 ${endpoint} 失败:`, response.status, errorText)
        
        // 尝试解析错误信息
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
  console.error('❌ 所有可能的获取用户详情端点都失败了')
  throw lastError || new Error('All get user detail endpoints failed')
}

// 保存用户角色
export async function saveUserRoles(userId: string, roleData: SaveUserRolesRequest, appKey?: string): Promise<void> {
  if (!appKey) {
    throw new Error('No app key provided')
  }
  
  const appToken = await appTokenService.getValidAppToken(appKey)
  if (!appToken) {
    throw new Error('No valid app token')
  }

  console.log('保存用户角色API调用开始，用户ID:', userId)
  console.log('角色数据:', roleData)
  console.log('API端点:', `${API_BASE_URL}/rbac/v1/user/${userId}/roles`)

  const response = await fetch(`${API_BASE_URL}/rbac/v1/user/${userId}/roles`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-t-token': appToken,
    },
    body: JSON.stringify(roleData),
  })

  console.log('保存用户角色API响应状态:', response.status, response.statusText)

  if (!response.ok) {
    const errorText = await response.text()
    console.error('保存用户角色API失败:', response.status, errorText)
    
    // 尝试解析错误信息
    try {
      const parsedError = JSON.parse(errorText)
      if (parsedError.msg) {
        throw new Error(`保存用户角色失败: ${parsedError.msg}`)
      }
    } catch (parseError) {
      // 如果无法解析JSON，使用原始错误文本
    }
    
    throw new Error(`保存用户角色失败: HTTP ${response.status} - ${errorText}`)
  }

  // 尝试解析成功响应
  try {
    const result = await response.json()
    console.log('保存用户角色成功，响应:', result)
    
    if (result.code && result.code !== 200) {
      throw new Error(result.msg || '保存用户角色失败')
    }
  } catch (parseError) {
    // 如果响应不是JSON格式，可能是空响应，这是正常的
    console.log('保存用户角色成功（无响应内容）')
  }
}

// 移除用户角色
export async function removeUserRole(userId: string, roleData: RemoveUserRoleRequest, appKey?: string): Promise<void> {
  if (!appKey) {
    throw new Error('No app key provided')
  }
  
  const appToken = await appTokenService.getValidAppToken(appKey)
  if (!appToken) {
    throw new Error('No valid app token')
  }

  const response = await fetch(`${API_BASE_URL}/rbac/v1/user/${userId}/roles`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'x-t-token': appToken,
    },
    body: JSON.stringify(roleData),
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
}

// 获取头像预签名URL
export async function getAvatarPresignedUrl(ossKey: string, appKey?: string): Promise<PresignedUrlResponse['data']> {
  if (!appKey) {
    throw new Error('No app key provided')
  }
  
  const appToken = await appTokenService.getValidAppToken(appKey)
  if (!appToken) {
    throw new Error('No valid app token')
  }

  const response = await fetch(`${API_BASE_URL}/cms/file/getPresignedUrl?ossKey=${encodeURIComponent(ossKey)}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'x-t-token': appToken,
    },
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  const result: PresignedUrlResponse = await response.json()
  
  if (result.code !== 200) {
    throw new Error(result.msg || '获取头像预签名URL失败')
  }

  return result.data
}

// 上传用户头像
export async function uploadAvatar(file: File, userId: string, appKey?: string): Promise<AvatarUploadResponse['data']> {
  if (!appKey) {
    throw new Error('No app key provided')
  }
  
  const appToken = await appTokenService.getValidAppToken(appKey)
  if (!appToken) {
    throw new Error('No valid app token')
  }

  const formData = new FormData()
  formData.append('file', file)
  formData.append('user_open_id', userId)

  const response = await fetch(`${API_BASE_URL}/account/v1/user/avatar/upload`, {
    method: 'POST',
    headers: {
      'x-t-token': appToken,
    },
    body: formData,
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  const result: AvatarUploadResponse = await response.json()
  
  if (result.code !== 200) {
    throw new Error(result.msg || '头像上传失败')
  }

  return result.data
}

