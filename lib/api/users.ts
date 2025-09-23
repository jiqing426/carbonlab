import { AppUser, UsersResponse, UsersQueryParams } from '../types/tale';
import { appTokenService } from '@/lib/services/app-token-service';

const API_BASE_URL = process.env.NEXT_PUBLIC_TALE_BACKEND_URL || 'https://api.turingue.com';

// 获取用户列表
export async function getUsers(
  params?: UsersQueryParams,
  appKey?: string
): Promise<UsersResponse> {
  if (!appKey) {
    throw new Error('No app key provided');
  }
  
  const appToken = await appTokenService.getValidAppToken(appKey);
  if (!appToken) {
    throw new Error('No valid app token');
  }

  const queryParams = new URLSearchParams();
  if (params?.page !== undefined)
    queryParams.append('page', params.page.toString());
  if (params?.size !== undefined)
    queryParams.append('size', params.size.toString());
  if (params?.sort_by) queryParams.append('sort_by', params.sort_by);
  if (params?.sort_direction)
    queryParams.append('sort_direction', params.sort_direction);
  if (params?.search) queryParams.append('search', params.search);
  if (params?.keyword) queryParams.append('keyword', params.keyword);
  if (params?.user_roles) queryParams.append('user_roles', params.user_roles);

  const response = await fetch(
    `${API_BASE_URL}/account/v1/users?${queryParams}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-t-token': appToken,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const result = await response.json();
  return result.data;
}

// 更新用户密码请求接口
export interface UpdateUserPasswordRequest {
  user_id: string;
  password_encrypted: string;
}

/**
 * 更新用户密码（通用 API 函数）
 */
export async function updateUserPassword(
  passwordData: UpdateUserPasswordRequest,
  appKey?: string
): Promise<void> {
  if (!appKey) {
    throw new Error('No app key provided');
  }

  const appToken = await appTokenService.getValidAppToken(appKey);
  if (!appToken) {
    throw new Error('No valid app token');
  }

  const response = await fetch(`${API_BASE_URL}/account/v1/user/password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-t-token': appToken,
    },
    body: JSON.stringify(passwordData),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const result = await response.json();

  if (result.code !== 200) {
    throw new Error(result.msg || '更新用户密码失败');
  }
}

// 更新用户基础信息请求接口
export interface UpdateUserRequest {
  username?: string;
  nick_name?: string;
  email?: string;
  phone?: string;
  remark?: string;
}

/**
 * 更新用户基础信息（通用 API 函数）
 */
export async function updateUser(
  userId: string,
  userData: UpdateUserRequest,
  appKey?: string
): Promise<void> {
  if (!appKey) {
    throw new Error('No app key provided');
  }

  const appToken = await appTokenService.getValidAppToken(appKey);
  if (!appToken) {
    throw new Error('No valid app token');
  }

  const response = await fetch(`${API_BASE_URL}/account/v1/user/${userId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'x-t-token': appToken,
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const result = await response.json();

  if (result.code !== 200) {
    throw new Error(result.msg || '更新用户信息失败');
  }
}

// 删除用户
export async function deleteUser(
  userId: string,
  appKey?: string
): Promise<void> {
  if (!appKey) {
    throw new Error('No app key provided');
  }

  const appToken = await appTokenService.getValidAppToken(appKey);
  if (!appToken) {
    throw new Error('No valid app token');
  }

  const response = await fetch(`${API_BASE_URL}/account/v1/users/${userId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'x-t-token': appToken,
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
}

// 创建用户请求接口
export interface CreateUserRequest {
  username: string;
  phone?: string;
  password_encrypted?: string;
}

// 创建用户
export async function createUser(
  userData: CreateUserRequest,
  appKey?: string
): Promise<AppUser> {
  if (!appKey) {
    throw new Error('No app key provided');
  }

  const appToken = await appTokenService.getValidAppToken(appKey);
  if (!appToken) {
    throw new Error('No valid app token');
  }

  const response = await fetch(`${API_BASE_URL}/account/v1/user`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-t-token': appToken,
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const result = await response.json();
  return result.data;
}

// 用户详情接口数据类型
export interface UserDetailResponse {
  data: {
    app: {
      app_name: string;
      app_key: string;
      org_id: string;
      app_id: string;
    };
    user: {
      registered_at: string;
      user_id: string;
      phone: string;
      username: string;
      nick_name?: string;
      remark?: string;
      avatar_url?: string;
    };
    third_party: Record<
      string,
      {
        id: string;
        name: string;
        type: string;
        bindTime: string;
        metadata: Record<string, string | number | boolean>;
      }
    >;
    user_roles: [];
    user_privileges: unknown[];
    user_groups: {
      groupId: string;
      name: string;
      description: string;
      createdAt: string;
      updatedAt: string;
      remark: string;
      memberCount: number;
    }[];
    user_login_methods: {
      methodType: string;
      identifier: string;
      oauthService?: string;
      isActivate: boolean;
    }[];
  };
  code: number;
  msg: string;
}

// 获取用户详情
export async function getUserDetail(
  userId: string,
  appKey?: string
): Promise<UserDetailResponse> {
  if (!appKey) {
    throw new Error('No app key provided');
  }

  const appToken = await appTokenService.getValidAppToken(appKey);
  if (!appToken) {
    throw new Error('No valid app token');
  }

  const response = await fetch(
    `${API_BASE_URL}/account/v1/user?user_id=${userId}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-t-token': appToken,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();

  if (data.code !== 200) {
    throw new Error(data.msg || 'Failed to fetch user detail');
  }

  return data;
}

// 保存用户角色请求接口
export interface SaveUserRolesRequest {
  role_ids: string[];
}

// 保存用户角色
export async function saveUserRoles(
  userId: string,
  roleData: SaveUserRolesRequest,
  appKey?: string
): Promise<void> {
  if (!appKey) {
    throw new Error('No app key provided');
  }

  const appToken = await appTokenService.getValidAppToken(appKey);
  if (!appToken) {
    throw new Error('No valid app token');
  }

  const response = await fetch(`${API_BASE_URL}/rbac/v1/user/${userId}/roles`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-t-token': appToken,
    },
    body: JSON.stringify(roleData),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
}

// 移除用户角色请求接口
export interface RemoveUserRoleRequest {
  role_ids: string[];
}

// 移除用户角色
export async function removeUserRole(
  userId: string,
  roleData: RemoveUserRoleRequest,
  appKey?: string
): Promise<void> {
  if (!appKey) {
    throw new Error('No app key provided');
  }

  const appToken = await appTokenService.getValidAppToken(appKey);
  if (!appToken) {
    throw new Error('No valid app token');
  }

  const response = await fetch(`${API_BASE_URL}/rbac/v1/user/${userId}/roles`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'x-t-token': appToken,
    },
    body: JSON.stringify(roleData),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
}

// 用户权限分配请求接口
export interface SaveUserPrivilegesRequest {
  privilege_ids: string[];
  started_at?: string;
  expired_at?: string;
  assignment_type?: string;
  assignment_ref?: string;
  remark?: string;
}

// 保存用户权限
export async function saveUserPrivileges(
  userId: string,
  privilegeData: SaveUserPrivilegesRequest,
  appKey?: string
): Promise<void> {
  if (!appKey) {
    throw new Error('No app key provided');
  }

  const appToken = await appTokenService.getValidAppToken(appKey);
  if (!appToken) {
    throw new Error('No valid app token');
  }

  const response = await fetch(
    `${API_BASE_URL}/rbac/v1/user/${userId}/privileges`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-t-token': appToken,
      },
      body: JSON.stringify(privilegeData),
    }
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
}

// 移除用户权限请求接口
export interface RemoveUserPrivilegeRequest {
  privilege_ids: string[];
}

// 移除用户权限
export async function removeUserPrivilege(
  userId: string,
  privilegeData: RemoveUserPrivilegeRequest,
  appKey?: string
): Promise<void> {
  if (!appKey) {
    throw new Error('No app key provided');
  }

  const appToken = await appTokenService.getValidAppToken(appKey);
  if (!appToken) {
    throw new Error('No valid app token');
  }

  const response = await fetch(
    `${API_BASE_URL}/rbac/v1/user/${userId}/privileges`,
    {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'x-t-token': appToken,
      },
      body: JSON.stringify(privilegeData),
    }
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
}

// 获取头像预签名URL的响应类型
export interface PresignedUrlResponse {
  data: {
    ossKey: string;
    presignedUrl: string;
    expireTimeInSeconds: number;
  };
  code: number;
  msg: string;
}

/**
 * 获取头像预签名URL
 */
export async function getAvatarPresignedUrl(
  ossKey: string,
  appKey?: string
): Promise<PresignedUrlResponse['data']> {
  if (!appKey) {
    throw new Error('No app key provided');
  }

  const appToken = await appTokenService.getValidAppToken(appKey);
  if (!appToken) {
    throw new Error('No valid app token');
  }

  const response = await fetch(
    `${API_BASE_URL}/cms/file/getPresignedUrl?ossKey=${encodeURIComponent(ossKey)}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-t-token': appToken,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const result: PresignedUrlResponse = await response.json();

  if (result.code !== 200) {
    throw new Error(result.msg || '获取头像预签名URL失败');
  }

  return result.data;
}

// 头像上传响应类型
export interface AvatarUploadResponse {
  data: {
    avatar_oss_key: string;
  };
  code: number;
  msg: string;
}

/**
 * 上传用户头像
 */
export async function uploadAvatar(
  file: File,
  userId: string,
  appKey?: string
): Promise<AvatarUploadResponse['data']> {
  if (!appKey) {
    throw new Error('No app key provided');
  }

  const appToken = await appTokenService.getValidAppToken(appKey);
  if (!appToken) {
    throw new Error('No valid app token');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('user_open_id', userId);

  const response = await fetch(
    `${API_BASE_URL}/account/v1/user/avatar/upload`,
    {
      method: 'POST',
      headers: {
        'x-t-token': appToken,
      },
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const result: AvatarUploadResponse = await response.json();

  if (result.code !== 200) {
    throw new Error(result.msg || '头像上传失败');
  }

  return result.data;
}
