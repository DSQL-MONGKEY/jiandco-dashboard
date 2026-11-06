export class ApiError extends Error {
  status: number;
  code: number;

  constructor(status: number, code: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

export async function apiClient<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (!(init.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`/api${path}`, {
    ...init,
    headers,
    credentials: 'same-origin'
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok || !payload?.success) {
    throw new ApiError(
      response.status,
      payload?.code ?? response.status,
      payload?.message ?? 'Request failed'
    );
  }

  return payload.data as T;
}
