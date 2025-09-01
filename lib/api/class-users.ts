import { appTokenService } from '@/lib/services/app-token-service';

const API_BASE_URL = process.env.NEXT_PUBLIC_TALE_BACKEND_URL || 'https://api.turingue.com';

// 用户接口
export interface ClassUser {
  user: {
    user_id: string;
    username: string;
    phone: string;
    email?: string;
    is_frozen?: boolean;
    created_at?: string;
  };
  user_roles: string[];
  user_groups?: any[];
}

// 用户列表响应接口
export interface ClassUsersResponse {
  total: number;
  content: ClassUser[];
  pageable: {
    sort: { orders: unknown[] };
    pageNumber: number;
    pageSize: number;
  };
}

// 查询参数接口
export interface ClassUsersQueryParams {
  page?: number;
  size?: number;
  search?: string;
}

// 获取用户列表（用于班级管理）
export async function getClassUsers(
  params?: ClassUsersQueryParams,
  appKey?: string
): Promise<ClassUsersResponse> {
  if (!appKey) {
    throw new Error('No app key provided');
  }

  const appToken = await appTokenService.getValidAppToken(appKey);
  if (!appToken) {
    throw new Error('No valid app token');
  }

  console.log('🔍 班级用户API调用开始，使用token:', appToken.substring(0, 20) + '...');

  const queryParams = new URLSearchParams();
  if (params?.page !== undefined) queryParams.append('page', params.page.toString());
  if (params?.size !== undefined) queryParams.append('size', params.size.toString());
  if (params?.search) queryParams.append('search', params.search);

  // 使用用户管理API端点
  const endpoint = '/account/v1/users';
  const url = `${API_BASE_URL}${endpoint}?${queryParams}`;
  
  console.log('🔍 请求URL:', url);
  console.log('🔍 请求参数:', Object.fromEntries(queryParams.entries()));

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
    });

    console.log('🔍 响应状态:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ 获取用户列表失败:', response.status, errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('🔍 API响应:', result);
    
    // 处理不同的响应格式
    let usersData: ClassUsersResponse;
    
    if (result.data && result.data.content) {
      // 标准格式：result.data.content
      usersData = {
        total: result.data.total || result.data.content.length,
        content: result.data.content,
        pageable: {
          sort: { orders: [] },
          pageNumber: result.data.pageable?.pageNumber || 0,
          pageSize: result.data.pageable?.pageSize || result.data.content.length,
        },
      };
    } else if (result.content) {
      // 直接格式：result.content
      usersData = {
        total: result.total || result.content.length,
        content: result.content,
        pageable: {
          sort: { orders: [] },
          pageNumber: result.pageable?.pageNumber || 0,
          pageSize: result.pageable?.pageSize || result.content.length,
        },
      };
    } else if (Array.isArray(result)) {
      // 数组格式
      usersData = {
        total: result.length,
        content: result,
        pageable: {
          sort: { orders: [] },
          pageNumber: 0,
          pageSize: result.length,
        },
      };
    } else if (result.data && Array.isArray(result.data)) {
      // result.data是数组
      usersData = {
        total: result.data.length,
        content: result.data,
        pageable: {
          sort: { orders: [] },
          pageNumber: 0,
          pageSize: result.data.length,
        },
      };
    } else {
      throw new Error('Unexpected API response format');
    }

    console.log('✅ 成功解析用户数据:', usersData.content.length, '个用户');
    return usersData;
    
  } catch (error) {
    console.error('❌ 获取用户列表失败:', error);
    throw error;
  }
}

// 获取单个用户详情
export async function getClassUser(
  userId: string,
  appKey?: string
): Promise<ClassUser> {
  if (!appKey) {
    throw new Error('No app key provided');
  }

  const appToken = await appTokenService.getValidAppToken(appKey);
  if (!appToken) {
    throw new Error('No valid app token');
  }

  const url = `${API_BASE_URL}/account/v1/users/${userId}`;
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-t-token': appToken,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result.data || result;
    
  } catch (error) {
    console.error('获取用户详情失败:', error);
    throw error;
  }
}

// 搜索用户（支持关键词搜索）
export async function searchClassUsers(
  keyword: string,
  appKey?: string,
  page: number = 0,
  size: number = 10
): Promise<ClassUsersResponse> {
  return getClassUsers({
    page,
    size,
    search: keyword,
  }, appKey);
}

