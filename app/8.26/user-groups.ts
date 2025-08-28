import {
  UserGroup,
  UserGroupsResponse,
  UserGroupsQueryParams,
} from '@/types/tale';
import { appTokenService } from '@/lib/services/app-token-service';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_TALE_BACKEND_URL || 'https://api.turingue.com';

// 获取组织列表
export async function getUserGroups(
  params?: UserGroupsQueryParams,
  appKey?: string
): Promise<UserGroupsResponse> {
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
  if (params?.keyword) queryParams.append('keyword', params.keyword);

  const response = await fetch(`${API_BASE_URL}/user-group/v1?${queryParams}`, {
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

// 获取单个用户组详情
export async function getUserGroup(
  groupId: string,
  appKey?: string
): Promise<UserGroup> {
  if (!appKey) {
    throw new Error('No app key provided');
  }

  const appToken = await appTokenService.getValidAppToken(appKey);
  if (!appToken) {
    throw new Error('No valid app token');
  }

  const response = await fetch(`${API_BASE_URL}/user-group/v1/${groupId}`, {
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

// 创建组织请求接口
export interface CreateUserGroupRequest {
  name: string;
  description?: string;
  remark?: string;
}

// 创建组织
export async function createUserGroup(
  groupData: CreateUserGroupRequest,
  appKey?: string
): Promise<UserGroup> {
  if (!appKey) {
    throw new Error('No app key provided');
  }

  const appToken = await appTokenService.getValidAppToken(appKey);
  if (!appToken) {
    throw new Error('No valid app token');
  }

  const response = await fetch(`${API_BASE_URL}/user-group/v1`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-t-token': appToken,
    },
    body: JSON.stringify(groupData),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const result = await response.json();
  return result.data;
}

// 删除组织
export async function deleteUserGroup(
  groupId: string,
  appKey?: string
): Promise<void> {
  if (!appKey) {
    throw new Error('No app key provided');
  }

  const appToken = await appTokenService.getValidAppToken(appKey);
  if (!appToken) {
    throw new Error('No valid app token');
  }

  const response = await fetch(`${API_BASE_URL}/user-group/v1/${groupId}`, {
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

// 更新组织请求接口
export interface UpdateUserGroupRequest {
  name: string;
  description?: string;
  remark?: string;
}

// 更新组织
export async function updateUserGroup(
  groupId: string,
  groupData: UpdateUserGroupRequest,
  appKey?: string
): Promise<UserGroup> {
  if (!appKey) {
    throw new Error('No app key provided');
  }

  const appToken = await appTokenService.getValidAppToken(appKey);
  if (!appToken) {
    throw new Error('No valid app token');
  }

  const response = await fetch(`${API_BASE_URL}/user-group/v1/${groupId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'x-t-token': appToken,
    },
    body: JSON.stringify(groupData),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const result = await response.json();
  return result.data;
}

// 添加成员到组织
export async function addMembersToUserGroup(
  groupId: string,
  userIds: string[],
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
    `${API_BASE_URL}/user-group/v1/${groupId}/members`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-t-token': appToken,
      },
      body: JSON.stringify({
        user_ids: userIds,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
}

// 移除组织成员
export async function removeMembersFromUserGroup(
  groupId: string,
  userIds: string[],
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
    `${API_BASE_URL}/user-group/v1/${groupId}/members`,
    {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'x-t-token': appToken,
      },
      body: JSON.stringify({
        user_ids: userIds,
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Remove members API Error:', errorText);
    throw new Error(
      `HTTP error! status: ${response.status}, message: ${errorText}`
    );
  }
}

// 获取组织成员列表
export interface UserGroupMember {
  userId: string;
  username: string;
  phone: string;
  isFrozen: boolean;
  createdAt: string;
}

export interface UserGroupMembersResponse {
  data: {
    total: number;
    content: UserGroupMember[];
    pageable: {
      sort: {
        orders: unknown[];
      };
      pageNumber: number;
      pageSize: number;
    };
  };
  code: number;
  msg: string;
}

// 获取组织成员列表（支持分页）
export async function getUserGroupMembers(
  groupId: string,
  page: number = 0,
  size: number = 10,
  appKey?: string
): Promise<UserGroupMembersResponse> {
  if (!appKey) {
    throw new Error('No app key provided');
  }

  const appToken = await appTokenService.getValidAppToken(appKey);
  if (!appToken) {
    throw new Error('No valid app token');
  }

  console.log('Requesting members for groupId:', groupId);
  console.log('Using appToken:', appToken);

  const url = new URL(`${API_BASE_URL}/user-group/v1/${groupId}/members`);
  url.searchParams.append('page', page.toString());
  url.searchParams.append('size', size.toString());

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'x-t-token': appToken,
    },
  });

  console.log('Response status:', response.status);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('API Error:', errorText);
    throw new Error(
      `HTTP error! status: ${response.status}, message: ${errorText}`
    );
  }

  const result = await response.json();
  console.log('API Response:', result);
  return result;
}
