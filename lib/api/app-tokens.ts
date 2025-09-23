import {
  AppTokensResponse,
  AppTokensQueryParams,
  AppSecretApiResponse,
} from '../types/tale';
import { appTokenService } from '@/lib/services/app-token-service';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_TALE_BACKEND_URL || 'https://api.turingue.com';

// 获取 App Token 列表
export async function getAppTokens(
  appKey: string,
  params?: AppTokensQueryParams
): Promise<AppTokensResponse> {
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
  if (params?.is_valid !== undefined)
    queryParams.append('is_valid', params.is_valid.toString());
  if (params?.sort_by) queryParams.append('sort_by', params.sort_by);
  if (params?.sort_direction)
    queryParams.append('sort_direction', params.sort_direction);
  if (params?.search) queryParams.append('search', params.search);

  const response = await fetch(
    `${API_BASE_URL}/app/v1/app/tokens?${queryParams}`,
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

// 获取 App Secret
export async function getAppSecret(appKey: string): Promise<string> {
  if (!appKey) {
    throw new Error('No app key provided');
  }

  const taleToken = await appTokenService.getValidTaleToken();
  if (!taleToken) {
    throw new Error('No valid app token');
  }

  const response = await fetch(`${API_BASE_URL}/app/v1/app/${appKey}/secret`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'x-t-token': taleToken,
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const result: AppSecretApiResponse = await response.json();

  if (result.code !== 200) {
    throw new Error(result.msg || 'Failed to get app secret');
  }

  return result.data.app_secret;
}
