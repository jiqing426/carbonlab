import { appTokenService } from '@/lib/services/app-token-service';

const API_BASE_URL = process.env.NEXT_PUBLIC_TALE_BACKEND_URL || 'https://api.turingue.com';

// 文件接口类型
export interface FileData {
  id: string;
  folderId: string;
  fileName: string;
  fileType: string;
  fileAttr?: object;
  linkUrl?: string;
  content?: string;
  remark?: string;
  createdAt: string;
  updatedAt: string;
}

// API响应类型
export interface FileResponse {
  data: FileData;
  code: number;
  msg: string;
}

// 文件列表响应类型
export interface FilesResponse {
  data: {
    total: number;
    content: FileData[];
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
export interface FilesQueryParams {
  page?: number;
  size?: number;
  sortBy?: string;
  keyword?: string;
  folderId?: string;
}

// 创建文件请求类型
export interface CreateFileRequest {
  file?: File;
  folderId: string;
  fileName: string;
  fileType: string;
  fileAttr?: object;
  linkUrl?: string;
  content?: string;
  remark?: string;
}

// 更新文件请求类型
export interface UpdateFileRequest {
  file?: File;
  id: string;
  folderId: string;
  fileName: string;
  fileType: string;
  fileAttr?: object;
  linkUrl?: string;
  content?: string;
  remark?: string;
}

// 获取文件列表
export async function getFiles(
  params?: FilesQueryParams,
  appKey?: string
): Promise<FilesResponse> {
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
  if (params?.folderId) queryParams.append('folderId', params.folderId);

  // 尝试不同的API路径
  const apiPaths = [
    `/cms/file/page?${queryParams}`,
    `/cms/file/list?${queryParams}`,
    `/cms/file?${queryParams}`,
    `/file/page?${queryParams}`,
    `/file/list?${queryParams}`,
    `/file?${queryParams}`
  ];

  let response;
  let lastError;

  for (const apiPath of apiPaths) {
    try {
      console.log(`尝试API路径: ${API_BASE_URL}${apiPath}`);
      response = await fetch(`${API_BASE_URL}${apiPath}`, {
        method: 'GET',
        headers: {
          'x-t-token': appToken,
        },
      });

      if (response.ok) {
        console.log(`✅ API路径成功: ${apiPath}`);
        break;
      } else {
        console.log(`❌ API路径失败: ${apiPath}, 状态: ${response.status}`);
        const errorText = await response.text();
        console.log(`错误详情: ${errorText}`);
        lastError = new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.log(`❌ API路径异常: ${apiPath}`, error);
      lastError = error;
    }
  }

  if (!response || !response.ok) {
    throw lastError || new Error('所有API路径都失败了');
  }

  const result = await response.json();
  return result;
}

// 创建文件
export async function createFile(
  data: CreateFileRequest,
  appKey?: string
): Promise<FileData> {
  if (!appKey) {
    throw new Error('No app key provided');
  }

  const appToken = await appTokenService.getValidAppToken(appKey);
  if (!appToken) {
    throw new Error('No valid app token');
  }

  const formData = new FormData();

  if (data.file) {
    formData.append('file', data.file);
  }
  formData.append('folderId', data.folderId);
  formData.append('fileName', data.fileName);
  formData.append('fileType', data.fileType);

  if (data.fileAttr) {
    formData.append('fileAttr', JSON.stringify(data.fileAttr));
  }
  if (data.linkUrl) {
    formData.append('linkUrl', data.linkUrl);
  }
  if (data.content) {
    formData.append('content', data.content);
  }
  if (data.remark) {
    formData.append('remark', data.remark);
  }

  const response = await fetch(`${API_BASE_URL}/cms/file/createFile`, {
    method: 'POST',
    headers: {
      'x-t-token': appToken,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const result = await response.json();
  return result.data;
}

// 更新文件
export async function updateFile(
  id: string,
  data: UpdateFileRequest,
  appKey?: string
): Promise<FileData> {
  if (!appKey) {
    throw new Error('No app key provided');
  }

  const appToken = await appTokenService.getValidAppToken(appKey);
  if (!appToken) {
    throw new Error('No valid app token');
  }

  const formData = new FormData();

  if (data.file) {
    formData.append('file', data.file);
  }
  formData.append('folderId', data.folderId);
  formData.append('fileName', data.fileName);
  formData.append('fileType', data.fileType);

  if (data.fileAttr) {
    formData.append('fileAttr', JSON.stringify(data.fileAttr));
  }
  if (data.linkUrl) {
    formData.append('linkUrl', data.linkUrl);
  }
  if (data.content) {
    formData.append('content', data.content);
  }
  if (data.remark) {
    formData.append('remark', data.remark);
  }

  // 尝试不同的API路径
  const apiPaths = [
    `/cms/file/updateFile/${id}`,
    `/cms/file/${id}`,
    `/file/updateFile/${id}`,
    `/file/${id}`
  ];

  let response;
  let lastError;

  for (const apiPath of apiPaths) {
    try {
      console.log(`尝试更新API路径: ${API_BASE_URL}${apiPath}`);
      response = await fetch(`${API_BASE_URL}${apiPath}`, {
        method: 'PUT',
        headers: {
          'x-t-token': appToken,
        },
        body: formData,
      });

      if (response.ok) {
        console.log(`✅ 更新API路径成功: ${apiPath}`);
        break;
      } else {
        console.log(`❌ 更新API路径失败: ${apiPath}, 状态: ${response.status}`);
        const errorText = await response.text();
        console.log(`错误详情: ${errorText}`);
        lastError = new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.log(`❌ 更新API路径异常: ${apiPath}`, error);
      lastError = error;
    }
  }

  if (!response || !response.ok) {
    throw lastError || new Error('所有更新API路径都失败了');
  }

  const result = await response.json();
  return result.data;
}

// 删除文件
export async function deleteFile(
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

  const response = await fetch(`${API_BASE_URL}/cms/file/deleteFile/${id}`, {
    method: 'DELETE',
    headers: {
      'x-t-token': appToken,
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
}

// 获取文件详情
export async function getFile(
  id: string,
  appKey?: string
): Promise<FileData> {
  if (!appKey) {
    throw new Error('No app key provided');
  }

  const appToken = await appTokenService.getValidAppToken(appKey);
  if (!appToken) {
    throw new Error('No valid app token');
  }

  const response = await fetch(`${API_BASE_URL}/cms/file/${id}`, {
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
