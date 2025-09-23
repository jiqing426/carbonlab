import { appTokenService } from '@/lib/services/app-token-service';

const API_BASE_URL = process.env.NEXT_PUBLIC_TALE_BACKEND_URL || 'https://api.turingue.com';

// 文件夹接口类型
export interface Folder {
  id: string;
  app_id: string;
  folder_name: string;
  folder_type: string[];
  folder_attr?: {
    icon: string;
    color: string;
  };
  remark: string;
  created_at: string;
  updated_at: string;
}

// API响应类型
export interface FoldersResponse {
  data: {
    total: number;
    content: Folder[];
    pageable: {
      sort: {
        orders: Array<{
          direction: string;
          property: string;
          ignoreCase: boolean;
          nullHandling: string;
        }>;
      };
      pageNumber: number;
      pageSize: number;
    };
  };
  code: number;
  msg: string;
}

// 查询参数类型
export interface FoldersQueryParams {
  page?: number;
  size?: number;
  sortBy?: string;
  keyword?: string;
}

// 创建文件夹请求类型
export interface CreateFolderRequest {
  folder_name: string;
  folder_type: string[];
  remark?: string;
  folder_attr?: object;
}

// 更新文件夹请求类型
export interface UpdateFolderRequest {
  folder_name: string;
  folder_type: string[];
  remark?: string;
  folder_attr: object;
}

// 获取文件夹列表
export async function getFolders(
  params?: FoldersQueryParams,
  appKey?: string
): Promise<FoldersResponse> {
  if (!appKey) {
    throw new Error('No app key provided');
  }

  const appToken = await appTokenService.getValidAppToken(appKey);
  if (!appToken) {
    throw new Error('No valid app token');
  }

  const queryParams = new URLSearchParams();
  if (params?.page !== undefined) queryParams.append('page', params.page.toString());
  if (params?.size !== undefined) queryParams.append('size', params.size.toString());
  if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params?.keyword) queryParams.append('keyword', params.keyword);

  const response = await fetch(
    `${API_BASE_URL}/cms/v1/folders?${queryParams}`,
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
  if (result.code !== 200) {
    throw new Error(result.msg || '获取文件夹列表失败');
  }
  return result;
}

// 创建文件夹
export async function createFolder(
  data: CreateFolderRequest,
  appKey?: string
): Promise<Folder> {
  if (!appKey) {
    throw new Error('No app key provided');
  }

  const appToken = await appTokenService.getValidAppToken(appKey);
  if (!appToken) {
    throw new Error('No valid app token');
  }

  const response = await fetch(`${API_BASE_URL}/cms/v1/folders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-t-token': appToken,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const result = await response.json();
  if (result.code !== 200) {
    throw new Error(result.msg || '创建文件夹失败');
  }
  return result.data;
}

// 更新文件夹
export async function updateFolder(
  id: string,
  data: UpdateFolderRequest,
  appKey?: string
): Promise<Folder> {
  if (!appKey) {
    throw new Error('No app key provided');
  }

  const appToken = await appTokenService.getValidAppToken(appKey);
  if (!appToken) {
    throw new Error('No valid app token');
  }

  const response = await fetch(`${API_BASE_URL}/cms/v1/folders/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'x-t-token': appToken,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const result = await response.json();
  if (result.code !== 200) {
    throw new Error(result.msg || '更新文件夹失败');
  }
  return result.data;
}

// 删除文件夹
export async function deleteFolder(
  id: string,
  appKey?: string
): Promise<void> {
  if (!appKey) {
    throw new Error('No app key provided');
  }

  const appToken = await appTokenService.getValidAppToken(appKey);
  if (!appToken) {
    throw new Error('No valid app token');
  }

  const response = await fetch(`${API_BASE_URL}/cms/v1/folders/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'x-t-token': appToken,
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const result = await response.json();
  if (result.code !== 200) {
    throw new Error(result.msg || '删除文件夹失败');
  }
}

// 获取文件夹详情
export async function getFolderById(
  id: string,
  appKey?: string
): Promise<Folder> {
  if (!appKey) {
    throw new Error('No app key provided');
  }

  const appToken = await appTokenService.getValidAppToken(appKey);
  if (!appToken) {
    throw new Error('No valid app token');
  }

  const response = await fetch(`${API_BASE_URL}/cms/v1/folders/${id}`, {
    method: 'GET',
    headers: {
      'x-t-token': appToken,
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const result = await response.json();
  if (result.code !== 200) {
    throw new Error(result.msg || '获取文件夹详情失败');
  }
  return result.data;
}
