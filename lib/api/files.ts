import { appTokenService } from '@/lib/services/app-token-service';

const API_BASE_URL = process.env.NEXT_PUBLIC_TALE_BACKEND_URL || 'https://api.turingue.com';

// 文件接口类型
export interface FileData {
  id: string;
  folder_id: string;
  file_name: string;
  file_type: string;
  file_attr?: object;
  link_url?: string;
  content?: string;
  oss_url?: string;
  remark?: string;
  created_at: string;
  updated_at: string;
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
  folder_id: string;
  file_name: string;
  file_type: string;
  file_attr?: object;
  link_url?: string;
  content?: string;
  oss_url?: string;
  remark?: string;
}

// 更新文件请求类型
export interface UpdateFileRequest {
  file?: File;
  id: string;
  folder_id: string;
  file_name: string;
  file_type: string;
  file_attr?: object;
  link_url?: string;
  content?: string;
  oss_url?: string;
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

  const response = await fetch(`${API_BASE_URL}/cms/v1/files`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-t-token': appToken,
    },
    body: JSON.stringify({
      folder_id: data.folder_id,
      file_name: data.file_name,
      file_type: data.file_type,
      file_attr: data.file_attr || {},
      link_url: data.link_url || '',
      oss_url: data.oss_url || '',
      remark: data.remark || '',
    }),
  });

  if (!response.ok) {
    const errorResult = await response.json().catch(() => null);
    const errorMessage =
      errorResult?.msg || `HTTP error! status: ${response.status}`;
    throw new Error(errorMessage);
  }

  const result = await response.json();
  if (result.code !== 200) {
    throw new Error(result.msg || '创建文件失败');
  }
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

  const response = await fetch(`${API_BASE_URL}/cms/v1/files/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'x-t-token': appToken,
    },
    body: JSON.stringify({
      folder_id: data.folder_id,
      file_name: data.file_name,
      file_type: data.file_type,
      file_attr: data.file_attr || {},
      link_url: data.link_url || '',
      remark: data.remark || '',
    }),
  });

  if (!response.ok) {
    const errorResult = await response.json().catch(() => null);
    const errorMessage =
      errorResult?.msg || `HTTP error! status: ${response.status}`;
    throw new Error(errorMessage);
  }

  const result = await response.json();
  if (result.code !== 200) {
    throw new Error(result.msg || '更新文件失败');
  }
  return result.data;
}

// 更新文件内容
export async function updateFileContent(
  id: string,
  content: string,
  appKey?: string
): Promise<void> {
  if (!appKey) {
    throw new Error('No app key provided');
  }

  const appToken = await appTokenService.getValidAppToken(appKey);
  if (!appToken) {
    throw new Error('No valid app token');
  }

  const response = await fetch(`${API_BASE_URL}/cms/v1/files/${id}/content`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'x-t-token': appToken,
    },
    body: JSON.stringify({
      content: content,
    }),
  });

  if (!response.ok) {
    const errorResult = await response.json().catch(() => null);
    const errorMessage =
      errorResult?.msg || `HTTP error! status: ${response.status}`;
    throw new Error(errorMessage);
  }
}

// 文件列表查询参数类型
export interface FilesQueryParams {
  page?: number;
  size?: number;
  sortBy?: string;
  folder_id?: string;
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

  if (!params.folder_id) {
    throw new Error('folder_id is required for getting files');
  }

  const searchParams = new URLSearchParams();

  if (params.page !== undefined)
    searchParams.append('page', params.page.toString());
  if (params.size !== undefined)
    searchParams.append('size', params.size.toString());
  if (params.sortBy) searchParams.append('sortBy', params.sortBy);
  if (params.keyword) searchParams.append('keyword', params.keyword);

  const response = await fetch(
    `${API_BASE_URL}/cms/v1/folders/${params.folder_id}/files?${searchParams.toString()}`,
    {
      method: 'GET',
      headers: {
        'x-t-token': appToken,
      },
    }
  );

  if (!response.ok) {
    const errorResult = await response.json().catch(() => null);
    const errorMessage =
      errorResult?.msg || `HTTP error! status: ${response.status}`;
    throw new Error(errorMessage);
  }

  const result = await response.json();
  if (result.code !== 200) {
    throw new Error(result.msg || '获取文件列表失败');
  }
  return result;
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

  const response = await fetch(`${API_BASE_URL}/cms/v1/files/${id}`, {
    method: 'GET',
    headers: {
      'x-t-token': appToken,
    },
  });

  if (!response.ok) {
    const errorResult = await response.json().catch(() => null);
    const errorMessage =
      errorResult?.msg || `HTTP error! status: ${response.status}`;
    throw new Error(errorMessage);
  }

  const result = await response.json();
  if (result.code !== 200) {
    throw new Error(result.msg || '获取文件详情失败');
  }
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

  const response = await fetch(`${API_BASE_URL}/cms/v1/files/${id}`, {
    method: 'DELETE',
    headers: {
      'x-t-token': appToken,
    },
  });

  if (!response.ok) {
    const errorResult = await response.json().catch(() => null);
    const errorMessage =
      errorResult?.msg || `HTTP error! status: ${response.status}`;
    throw new Error(errorMessage);
  }

  const result = await response.json();
  if (result.code !== 200) {
    throw new Error(result.msg || '删除文件失败');
  }
}

// STS凭证请求类型
export interface FileSTSCredentialsRequest {
  file_extension: string;
  durationSeconds?: number;
}

// STS凭证响应类型
export interface FileSTSCredentialsResponse {
  credentials: {
    tmpSecretId: string;
    tmpSecretKey: string;
    sessionToken: string;
  };
  allowPrefix: string;
  startTime: number;
  expiredTime: number;
  bucket: string;
  region: string;
}

// 获取文件上传STS凭证
export async function getFileSTSCredentials(
  fileId: string,
  data: FileSTSCredentialsRequest,
  appKey?: string
): Promise<FileSTSCredentialsResponse> {
  if (!appKey) {
    throw new Error('No app key provided');
  }

  const appToken = await appTokenService.getValidAppToken(appKey);
  if (!appToken) {
    throw new Error('No valid app token');
  }

  const response = await fetch(`${API_BASE_URL}/cms/v1/files/${fileId}/sts-credentials`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-t-token': appToken,
    },
    body: JSON.stringify({
      file_extension: data.file_extension,
      duration_seconds: data.durationSeconds || 1800,
    }),
  });

  if (!response.ok) {
    const errorResult = await response.json().catch(() => null);
    const errorMessage =
      errorResult?.msg || `HTTP error! status: ${response.status}`;
    throw new Error(errorMessage);
  }

  const result = await response.json();
  if (result.code !== 200) {
    throw new Error(result.msg || '获取STS凭证失败');
  }
  return result.data;
}

// 文件上传完成请求类型
export interface FileUploadCompleteRequest {
  oss_key: string;
  file_size: number;
  etag: string;
}

// OSS元数据响应类型
export interface OssMetadata {
  content_type: string;
  content_length: number;
  last_modified: string;
  etag: string;
}

// 预签名URL响应类型
export interface PresignedUrlResponse {
  presigned_url: string;
}

// 获取文件预签名URL
export async function getFilePresignedUrl(
  fileId: string,
  appKey?: string
): Promise<PresignedUrlResponse> {
  if (!appKey) {
    throw new Error('No app key provided');
  }

  const appToken = await appTokenService.getValidAppToken(appKey);
  if (!appToken) {
    throw new Error('No valid app token');
  }

  const response = await fetch(`${API_BASE_URL}/cms/v1/files/${fileId}/presigned-url`, {
    method: 'GET',
    headers: {
      'x-t-token': appToken,
    },
  });

  if (!response.ok) {
    const errorResult = await response.json().catch(() => null);
    const errorMessage =
      errorResult?.msg || `HTTP error! status: ${response.status}`;
    throw new Error(errorMessage);
  }

  const result = await response.json();
  if (result.code !== 200) {
    throw new Error(result.msg || '获取预签名URL失败');
  }
  return result.data;
}

// 文件上传完成通知
export async function notifyFileUploadComplete(
  fileId: string,
  data: FileUploadCompleteRequest,
  appKey?: string
): Promise<void> {
  if (!appKey) {
    throw new Error('No app key provided');
  }

  const appToken = await appTokenService.getValidAppToken(appKey);
  if (!appToken) {
    throw new Error('No valid app token');
  }

  const response = await fetch(`${API_BASE_URL}/cms/v1/files/${fileId}/upload-complete`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-t-token': appToken,
    },
    body: JSON.stringify({
      oss_key: data.oss_key,
      file_size: data.file_size,
      etag: data.etag,
    }),
  });

  if (!response.ok) {
    const errorResult = await response.json().catch(() => null);
    const errorMessage =
      errorResult?.msg || `HTTP error! status: ${response.status}`;
    throw new Error(errorMessage);
  }

  const result = await response.json();
  if (result.code !== 200) {
    throw new Error(result.msg || '上传完成通知失败');
  }
}

// 获取OSS文件元数据
export async function getOssMetadata(
  ossKey: string,
  appKey?: string
): Promise<OssMetadata> {
  if (!appKey) {
    throw new Error('No app key provided');
  }

  const appToken = await appTokenService.getValidAppToken(appKey);
  if (!appToken) {
    throw new Error('No valid app token');
  }

  const response = await fetch(`${API_BASE_URL}/cms/v1/files/oss-metadata`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-t-token': appToken,
    },
    body: JSON.stringify({
      oss_key: ossKey,
    }),
  });

  if (!response.ok) {
    const errorResult = await response.json().catch(() => null);
    const errorMessage =
      errorResult?.msg || `HTTP error! status: ${response.status}`;
    throw new Error(errorMessage);
  }

  const result = await response.json();
  if (result.code !== 200) {
    throw new Error(result.msg || '获取OSS元数据失败');
  }
  return result.data;
}