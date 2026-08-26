import { getApiBaseUrl } from '@/lib/config';

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly details?: unknown,
    /** Machine-readable code from the API's error envelope, when present. */
    readonly code?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/** Narrow an unknown error to an ApiError with a specific code. */
export function isApiErrorCode(error: unknown, code: string): boolean {
  return error instanceof ApiError && error.code === code;
}

type ApiFetchOptions = RequestInit & {
  json?: unknown;
};

let accessTokenHeader: string | null = null;

/** Seam for native clients that store access tokens outside cookies. */
export function setAccessTokenHeader(token: string | null): void {
  accessTokenHeader = token;
}

/**
 * Installed by the auth layer: attempt a session refresh and report
 * whether it succeeded. Lets apiFetch retry exactly once on 401 without a
 * circular import between the API client and the auth feature.
 */
let refreshSessionHandler: (() => Promise<boolean>) | null = null;

export function setRefreshSessionHandler(
  handler: (() => Promise<boolean>) | null,
): void {
  refreshSessionHandler = handler;
}

async function performFetch(path: string, options: ApiFetchOptions): Promise<Response> {
  const { json, headers, ...rest } = options;
  const requestHeaders = new Headers(headers);

  if (json !== undefined) {
    requestHeaders.set('Content-Type', 'application/json');
  }

  if (accessTokenHeader) {
    requestHeaders.set('Authorization', `Bearer ${accessTokenHeader}`);
  }

  return fetch(`${getApiBaseUrl()}${path}`, {
    ...rest,
    headers: requestHeaders,
    credentials: 'include',
    body: json !== undefined ? JSON.stringify(json) : rest.body,
  });
}

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  let response = await performFetch(path, options);

  // Expired access token: refresh once and retry. Auth endpoints are
  // excluded so a failing refresh can never recurse.
  if (
    response.status === 401 &&
    refreshSessionHandler &&
    !path.startsWith('/auth/')
  ) {
    const refreshed = await refreshSessionHandler().catch(() => false);

    if (refreshed) {
      response = await performFetch(path, options);
    }
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const envelope =
      typeof payload === 'object' && payload !== null
        ? (payload as { error?: unknown; code?: unknown })
        : {};

    const message =
      typeof envelope.error === 'string' ? envelope.error : 'Request failed';
    const code = typeof envelope.code === 'string' ? envelope.code : undefined;

    throw new ApiError(message, response.status, payload, code);
  }

  return payload as T;
}
