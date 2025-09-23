'use server';

import { cookies } from 'next/headers';
import { getAvatarPresignedUrl, uploadAvatar } from '@/lib/api/users';

const API_BASE_URL =
  process.env.TALE_BASE_URL || 'https://api.turingue.com';

// Server action result 类型
export interface ServerActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// 用户管理数据类型
export interface UserManagementData {
  app: {
    app_name: string;
    app_key: string;
    org_id: string;
    app_id: string;
  };
  user: {
    registered_at: string;
    user_id: string;
    phone?: string;
    username: string;
    nick_name?: string;
    email?: string;
    remark?: string;
    avatar_url?: string;
    latest_login_time?: string;
    is_frozen?: boolean;
  };
  third_party: Record<string, unknown>;
  user_roles: Array<{
    role_id: string;
    role_name: string;
    role_type: string;
    role_property: Record<string, unknown>;
    expired_at?: string;
  }>;
  user_privileges: string[];
  user_groups: Array<{
    groupId: string;
    name: string;
    description: string;
    createdAt: string;
    updatedAt: string;
    remark: string;
    memberCount: number;
  }>;
}

// 更新用户基础信息请求接口
export interface UpdateUserRequest {
  username?: string;
  nick_name?: string;
  phone?: string;
  email?: string;
  remark?: string;
}

// 更新用户密码请求接口
export interface UpdateUserPasswordRequest {
  user_id: string;
  password_encrypted: string;
}

/**
 * 获取当前登录用户详情 (Server Action)
 * 注意：此函数专用于当前登录用户的个人设置页面，使用 Tale Token 进行身份验证
 * 区别于通用用户管理功能，仅允许用户查看和编辑自己的信息
 */
export async function getUserDetailAction(
  userId: string
): Promise<ServerActionResult<UserManagementData>> {
  try {
    // 服务器端获取 tale token
    const getTaleTokenServer = async (): Promise<string> => {
      const TALE_API_BASE = process.env.TALE_BASE_URL;
      const APP_KEY = process.env.TALE_APP_KEY;
      const APP_SECRET = process.env.TALE_APP_SECRET;

      if (!TALE_API_BASE || !APP_KEY || !APP_SECRET) {
        throw new Error('服务器配置错误');
      }

      const response = await fetch(`${TALE_API_BASE}/app/v1/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          app_key: APP_KEY,
          app_secret: APP_SECRET,
        }),
      });

      if (!response.ok) {
        throw new Error(`获取 Tale Token 失败: ${response.status}`);
      }

      const result = await response.json();

      // 检查不同的响应格式
      let token;

      if (result.data) {
        token = result.data.access_token || result.data.token;
      } else if (result.access_token) {
        token = result.access_token;
      } else if (result.token) {
        token = result.token;
      }

      if (!token) {
        throw new Error('无法获取有效的 Tale Token');
      }

      return token;
    };

    // 获取用户详情 - 直接使用 Tale Token（用于编辑用户自己的信息）
    const getUserDetailServer = async (userId: string, taleToken: string) => {
      const response = await fetch(
        `${API_BASE_URL}/account/v1/user?user_id=${userId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'x-t-token': taleToken,
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
    };

    // 执行流程：获取 tale token -> 获取用户详情（直接使用 Tale Token）
    const taleToken = await getTaleTokenServer();
    const result = await getUserDetailServer(userId, taleToken);

    if (result.code === 200) {
      return {
        success: true,
        data: result.data,
      };
    } else {
      throw new Error(result.msg || '获取用户详情失败');
    }
  } catch (error) {
    console.error('获取用户详情失败:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '获取用户详情失败',
    };
  }
}

/**
 * 获取用户详情 (Server Action) - 用于用户管理页面，使用 App Token
 */
// 在服务端获取app token的辅助函数
async function getAppTokenFromCookies(appKey: string): Promise<string | null> {
  const cookieStore = await cookies();
  const tokenKey = `tale-app-token-${appKey}`;
  const expiredKey = `tale-app-token-expired-${appKey}`;

  const token = cookieStore.get(tokenKey)?.value;
  const expiredAt = cookieStore.get(expiredKey)?.value;

  if (!token || !expiredAt) {
    return null;
  }

  // 检查是否过期（提前5分钟刷新）
  const expiredTime = new Date(expiredAt).getTime();
  if (Date.now() >= expiredTime - 5 * 60 * 1000) {
    console.log(`App token for ${appKey} is expired or will expire soon`);
    return null;
  }

  return token;
}

export async function getUserDetailForManagementAction(
  userId: string,
  appKey: string
): Promise<ServerActionResult<UserManagementData>> {
  try {
    const appToken = await getAppTokenFromCookies(appKey);
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

    return {
      success: true,
      data: data.data,
    };
  } catch (error) {
    console.error('获取用户详情失败:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '获取用户详情失败',
    };
  }
}

/**
 * 更新当前登录用户基础信息 (Server Action)
 * 注意：此函数专用于当前登录用户编辑自己的基础信息，使用 Tale Token 进行身份验证
 * 区别于通用用户管理功能，仅允许用户修改自己的个人资料
 */
export async function updateUserAction(
  userId: string,
  userData: UpdateUserRequest
): Promise<ServerActionResult<void>> {
  try {
    // 服务器端获取 tale token - 用于编辑用户自己的信息
    const getTaleTokenServer = async (): Promise<string> => {
      const TALE_API_BASE = process.env.TALE_BASE_URL;
      const APP_KEY = process.env.TALE_APP_KEY;
      const APP_SECRET = process.env.TALE_APP_SECRET;

      if (!TALE_API_BASE || !APP_KEY || !APP_SECRET) {
        throw new Error('服务器配置错误');
      }

      const response = await fetch(`${TALE_API_BASE}/app/v1/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          app_key: APP_KEY,
          app_secret: APP_SECRET,
        }),
      });

      if (!response.ok) {
        throw new Error(`获取 Tale Token 失败: ${response.status}`);
      }

      const result = await response.json();
      return result.data.token;
    };

    const taleToken = await getTaleTokenServer();

    const response = await fetch(`${API_BASE_URL}/account/v1/user/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-t-token': taleToken,
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (result.code === 200) {
      return {
        success: true,
        data: undefined,
      };
    } else {
      throw new Error(result.msg || '更新用户信息失败');
    }
  } catch (error) {
    console.error('更新用户信息失败:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '更新用户信息失败',
    };
  }
}

/**
 * 更新当前登录用户密码 (Server Action)
 * 注意：此函数专用于当前登录用户修改自己的密码，使用 Tale Token 进行身份验证
 * 区别于通用用户管理功能，仅允许用户修改自己的登录密码
 */
export async function updateUserPasswordAction(
  passwordData: UpdateUserPasswordRequest
): Promise<ServerActionResult<void>> {
  try {
    // 服务器端获取 tale token - 用于编辑用户自己的信息
    const getTaleTokenServer = async (): Promise<string> => {
      const TALE_API_BASE = process.env.TALE_BASE_URL;
      const APP_KEY = process.env.TALE_APP_KEY;
      const APP_SECRET = process.env.TALE_APP_SECRET;

      if (!TALE_API_BASE || !APP_KEY || !APP_SECRET) {
        throw new Error('服务器配置错误');
      }

      const response = await fetch(`${TALE_API_BASE}/app/v1/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          app_key: APP_KEY,
          app_secret: APP_SECRET,
        }),
      });

      if (!response.ok) {
        throw new Error(`获取 Tale Token 失败: ${response.status}`);
      }

      const result = await response.json();

      // 检查不同的响应格式
      let token;

      if (result.data) {
        token = result.data.access_token || result.data.token;
      } else if (result.access_token) {
        token = result.access_token;
      } else if (result.token) {
        token = result.token;
      }

      if (!token) {
        throw new Error('无法获取有效的 Tale Token');
      }

      return token;
    };

    const taleToken = await getTaleTokenServer();

    const response = await fetch(`${API_BASE_URL}/account/v1/user/password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-t-token': taleToken,
      },
      body: JSON.stringify(passwordData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (result.code === 200) {
      return {
        success: true,
        data: undefined,
      };
    } else {
      throw new Error(result.msg || '更新用户密码失败');
    }
  } catch (error) {
    console.error('更新用户密码失败:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '更新用户密码失败',
    };
  }
}

/**
 * 获取当前登录用户头像预签名URL (Server Action)
 * 注意：此函数专用于当前登录用户上传头像，使用 App Token 进行身份验证
 * 用于获取 OSS 预签名 URL，允许用户直接上传头像文件
 */
export async function getAvatarPresignedUrlAction(ossKey: string): Promise<
  ServerActionResult<{
    ossKey: string;
    presignedUrl: string;
    expireTimeInSeconds: number;
  }>
> {
  try {
    const appKey = process.env.NEXT_PUBLIC_DEFAULT_APP_KEY || 'oa_ab9afb9d';
    if (!appKey) {
      throw new Error('No app key configured');
    }

    const result = await getAvatarPresignedUrl(ossKey, appKey);

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error('获取头像预签名URL失败:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '获取头像预签名URL失败',
    };
  }
}

/**
 * 上传当前登录用户头像 (Server Action)
 * 注意：此函数专用于当前登录用户上传头像，使用 App Token 进行身份验证
 * 区别于通用用户管理功能，仅允许用户上传自己的头像
 */
export async function uploadAvatarAction(
  file: File,
  userId: string
): Promise<ServerActionResult<{ avatar_oss_key: string }>> {
  try {
    const appKey = process.env.NEXT_PUBLIC_DEFAULT_APP_KEY || 'oa_ab9afb9d';
    if (!appKey) {
      throw new Error('No app key configured');
    }

    const result = await uploadAvatar(file, userId, appKey);

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error('头像上传失败:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '头像上传失败',
    };
  }
}
