// Tale系统类型定义

// 用户相关类型
export interface AppUser {
  user_id: string
  username: string
  phone?: string
  nick_name?: string
  remark?: string
  avatar_url?: string
  registered_at: string
}

export interface UsersResponse {
  total: number
  content: AppUser[]
  pageable: {
    sort: {
      orders: Array<{
        direction: string
        property: string
        ignoreCase: boolean
        nullHandling: string
      }>
    }
    pageNumber: number
    pageSize: number
  }
}

export interface UsersQueryParams {
  page?: number
  size?: number
  sort_by?: string
  sort_direction?: string
  search?: string
}

export interface CreateUserRequest {
  username: string
  phone?: string
  password_encrypted?: string
}

export interface UserDetailResponse {
  data: {
    app: {
      app_name: string
      app_key: string
      org_id: string
      app_id: string
    }
    user: {
      registered_at: string
      user_id: string
      phone: string
      username: string
      nick_name?: string
      remark?: string
      avatar_url?: string
    }
    third_party: Record<string, {
      id: string
      name: string
      type: string
      bindTime: string
      metadata: Record<string, string | number | boolean>
    }>
    user_roles: Array<{
      role_id: string
      role_name: string
      role_type: string
      role_property: Record<string, unknown>
      expired_at: string
      remark?: string
    }>
    user_privileges: Array<{
      privilege_id: string
      privilege_name: string
      privilege_type: string
      expired_at?: string
    }>
    user_groups: {
      groupId: string
      name: string
      description: string
      createdAt: string
      updatedAt: string
      remark: string
      memberCount: number
    }[]
  }
  code: number
  msg: string
}

export interface SaveUserRolesRequest {
  role_ids: string[]
}

export interface RemoveUserRoleRequest {
  role_ids: string[]
}

export interface PresignedUrlResponse {
  data: {
    ossKey: string
    presignedUrl: string
    expireTimeInSeconds: number
  }
  code: number
  msg: string
}

export interface AvatarUploadResponse {
  data: {
    avatar_oss_key: string
  }
  code: number
  msg: string
}

// 角色相关类型
export interface Role {
  role_id: string
  role_name: string
  role_type: string
  role_property: Record<string, unknown>
  role_privileges: unknown[]
  remark?: string
}

export interface RolesResponse {
  data: {
    total: number
    content: Role[]
    pageable: {
      sort: {
        orders: Array<{
          direction: string
          property: string
          ignoreCase: boolean
          nullHandling: string
        }>
      }
      pageNumber: number
      pageSize: number
    }
  }
  code: number
  msg: string
}

export interface CreateRoleRequest {
  role_name: string
  role_type: string
  remark?: string
}

export interface UpdateRoleRequest {
  role_name: string
  role_type: string
  remark?: string
}

export interface RolesQueryParams {
  page: number
  size: number
  role_type?: string
}

// 应用令牌相关类型
export interface AppTokensResponse {
  total: number
  content: Array<{
    id: string
    name: string
    token: string
    is_valid: boolean
    created_at: string
    expired_at?: string
  }>
  pageable: {
    sort: {
      orders: Array<{
        direction: string
        property: string
        ignoreCase: boolean
        nullHandling: string
      }>
    }
    pageNumber: number
    pageSize: number
  }
}

export interface AppTokensQueryParams {
  page?: number
  size?: number
  is_valid?: boolean
  sort_by?: string
  sort_direction?: string
  search?: string
}

export interface AppSecretApiResponse {
  data: {
    app_secret: string
  }
  code: number
  msg: string
}

// 短信相关类型
export interface SmsRecord {
  id: string
  phone: string
  content: string
  sms_type: string
  verified_status: boolean
  created_at: string
  sent_at?: string
}

export interface SmsRecordsResponse {
  data: {
    total: number
    content: SmsRecord[]
    pageable: {
      sort: {
        orders: Array<{
          direction: string
          property: string
          ignoreCase: boolean
          nullHandling: string
        }>
      }
      pageNumber: number
      pageSize: number
    }
  }
  code: number
  msg: string
}

export interface SmsQueryParams {
  page?: number
  size?: number
  verifiedStatus?: boolean
  sms_type?: string
}
