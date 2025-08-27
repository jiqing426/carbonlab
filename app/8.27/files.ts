import { appTokenService } from '@/lib/services/app-token-service';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_TALE_BACKEND_URL || 'https://api.turingue.com';

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

  // 将id和folderId添加到formData中
  formData.append('id', id);
  formData.append('folderId', data.folderId);

  if (data.file) {
    formData.append('file', data.file);
  }
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

  const response = await fetch(`${API_BASE_URL}/cms/file/updateFile`, {
    method: 'PUT',
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

// 文件列表查询参数类型
export interface FilesQueryParams {
  page?: number;
  size?: number;
  sortBy?: string;
  folderId?: string;
  keyword?: string;
}

// 文件列表响应类型
export interface FilesResponse {
  code: number;
  msg: string;
  data: {
    content: FileData[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
  };
}

// 获取文件列表
export async function getFiles(
  params: FilesQueryParams = {},
  appKey?: string
): Promise<FilesResponse> {
  if (!appKey) {
    throw new Error('No app key provided');
  }

  const appToken = await appTokenService.getValidAppToken(appKey);
  if (!appToken) {
    throw new Error('No valid app token');
  }

  const searchParams = new URLSearchParams();

  if (params.page !== undefined)
    searchParams.append('page', params.page.toString());
  if (params.size !== undefined)
    searchParams.append('size', params.size.toString());
  if (params.sortBy) searchParams.append('sortBy', params.sortBy);
  if (params.folderId) searchParams.append('folderId', params.folderId);
  if (params.keyword) searchParams.append('keyword', params.keyword);

  const response = await fetch(
    `${API_BASE_URL}/cms/file/page?${searchParams.toString()}`,
    {
      method: 'GET',
      headers: {
        'x-t-token': appToken,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
}

// 根据ID获取文件详情
export async function getFileById(
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

  const response = await fetch(`${API_BASE_URL}/cms/file/getFileById/${id}`, {
    method: 'GET',
    headers: {
      'x-t-token': appToken,
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const result = await response.json();
  return result.data;
}

// 删除文件
export async function deleteFile(id: string, appKey?: string): Promise<void> {
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
      'Content-Type': 'application/json',
      'x-t-token': appToken,
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
}
