import { getApiBaseUrl } from '@/lib/config';

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

type ApiFetchOptions = RequestInit & {
  json?: unknown;
};

let accessTokenHeader: string | null = null;

/** Seam for native clients that store access tokens outside cookies. */
export function setAccessTokenHeader(token: string | null): void {
  accessTokenHeader = token;
}

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { json, headers, ...rest } = options;
  const requestHeaders = new Headers(headers);

  if (json !== undefined) {
    requestHeaders.set('Content-Type', 'application/json');
  }

  if (accessTokenHeader) {
    requestHeaders.set('Authorization', `Bearer ${accessTokenHeader}`);
  }

  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...rest,
    headers: requestHeaders,
    credentials: 'include',
    body: json !== undefined ? JSON.stringify(json) : rest.body,
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      typeof payload === 'object' &&
      payload !== null &&
      'error' in payload &&
      typeof payload.error === 'string'
        ? payload.error
        : 'Request failed';

    throw new ApiError(message, response.status, payload);
  }

  return payload as T;
}
