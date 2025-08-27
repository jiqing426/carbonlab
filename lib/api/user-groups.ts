import { useAppTokenStore } from '@/lib/stores/app-token-store';

// 用户组接口类型
export interface UserGroup {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
  // 根据实际API响应添加更多字段
}

// 分页查询用户组
export const getUserGroups = async (params: {
  page: number;
  size: number;
  keyword?: string;
}) => {
  const { page, size, keyword } = params;
  
  try {
    // 获取应用token
    const appTokenStore = useAppTokenStore.getState();
    const appToken = await appTokenStore.getAppToken();
    
    if (!appToken) {
      throw new Error('No app token available');
    }
    
    // 构建API URL
    let url = `https://api.turingue.com/user-group/v1?page=${page}&size=${size}`;
    if (keyword) {
      url += `&keyword=${encodeURIComponent(keyword)}`;
    }
    
    console.log('🔍 调用用户组API:', url);
    
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
    
    const data = await response.json();
    console.log('🔍 用户组API响应:', data);
    
    return data;
  } catch (error) {
    console.error('获取用户组列表失败:', error);
    throw error;
  }
};

// 根据ID获取用户组
export const getUserGroupById = async (id: string) => {
  try {
    // 获取应用token
    const appTokenStore = useAppTokenStore.getState();
    const appToken = await appTokenStore.getAppToken();
    
    if (!appToken) {
      throw new Error('No app token available');
    }
    
    const url = `https://api.turingue.com/user-group/v1/${id}`;
    console.log('🔍 调用用户组详情API:', url);
    
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
    
    const data = await response.json();
    console.log('🔍 用户组详情API响应:', data);
    
    return data;
  } catch (error) {
    console.error('获取用户组详情失败:', error);
    throw error;
  }
};
