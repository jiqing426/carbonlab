import { appTokenService } from '@/lib/services/app-token-service';

const API_BASE_URL = process.env.NEXT_PUBLIC_TALE_BACKEND_URL || 'https://api.turingue.com';

// 文件夹接口类型
export interface Folder {
  id: string;
  appId: string;
  folderName: string;
  folderType: string[];
  folderAttr?: {
    icon: string;
    color: string;
  };
  remark: string;
  createdAt: string;
  updatedAt: string;
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
  folderName: string;
  folderType: string[];
  remark?: string;
  folderAttr?: object;
}

// 更新文件夹请求类型
export interface UpdateFolderRequest {
  folderName: string;
  folderType: string[];
  remark?: string;
  folderAttr: object;
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
    `${API_BASE_URL}/cms/folder/page?${queryParams}`,
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

  // 尝试多个可能的端点
  const possibleEndpoints = [
    '/cms/folder/create',
    '/cms/folder',
    '/api/cms/folder/create',
    '/api/cms/folder',
    '/folder/create',
    '/folder'
  ];

  let response: Response | null = null;
  let lastError: Error | null = null;

  for (const endpoint of possibleEndpoints) {
    try {
      console.log(`🔄 尝试端点: ${API_BASE_URL}${endpoint}`);
      
      response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-t-token': appToken,
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        console.log(`✅ 成功使用端点: ${endpoint}`);
        break;
      } else {
        console.log(`❌ 端点 ${endpoint} 失败: ${response.status}`);
        lastError = new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ 端点 ${endpoint} 异常:`, error);
      lastError = error instanceof Error ? error : new Error('Unknown error');
    }
  }

  if (!response || !response.ok) {
    throw lastError || new Error('All endpoints failed');
  }

  const result = await response.json();
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

  const response = await fetch(`${API_BASE_URL}/cms/folder/update/${id}`, {
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

  const response = await fetch(`${API_BASE_URL}/cms/folder/delete/${id}`, {
    method: 'DELETE',
    headers: {
      'x-t-token': appToken,
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
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

  const response = await fetch(`${API_BASE_URL}/cms/folder/${id}`, {
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
  return result.data;
}
