import type { ApiResponse, PaginatedResponse } from '@/types';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const handleApiResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(
      errorData.message || 'Er is een fout opgetreden',
      response.status,
      errorData.code
    );
  }

  const data = await response.json();
  return data;
};

export const createApiClient = (baseUrl: string) => {
  const request = async <T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> => {
    const url = `${baseUrl}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(url, config);
    return handleApiResponse<T>(response);
  };

  return {
    get: <T>(endpoint: string, headers?: HeadersInit) =>
      request<T>(endpoint, { method: 'GET', headers }),
    
    post: <T>(endpoint: string, data?: unknown, headers?: HeadersInit) =>
      request<T>(endpoint, {
        method: 'POST',
        body: data ? JSON.stringify(data) : undefined,
        headers,
      }),
    
    put: <T>(endpoint: string, data?: unknown, headers?: HeadersInit) =>
      request<T>(endpoint, {
        method: 'PUT',
        body: data ? JSON.stringify(data) : undefined,
        headers,
      }),
    
    delete: <T>(endpoint: string, headers?: HeadersInit) =>
      request<T>(endpoint, { method: 'DELETE', headers }),
  };
};