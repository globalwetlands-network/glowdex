import { API_BASE_URL, DEFAULT_API_TIMEOUT } from './config';

/**
 * Enhanced error class for API failures
 */
export class ApiError extends Error {
  public status?: number;
  public data?: unknown;

  constructor(message: string, status?: number, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

/**
 * Small API client wrapper around fetch with timeout support
 */
export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_BASE_URL.replace(/\/$/, '')}${endpoint}`;

  const headers = {
    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    ...options.headers,
  };

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), DEFAULT_API_TIMEOUT);

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });

    clearTimeout(id);

    if (!response.ok) {
      let errorMessage = `API Error: ${response.status} ${response.statusText}`;
      let data;

      try {
        data = await response.json();
        errorMessage = data.message || errorMessage;
      } catch {
        // Fallback if response is not JSON
      }

      throw new ApiError(errorMessage, response.status, data);
    }

    return response.json();
  } catch (error: unknown) {
    clearTimeout(id);

    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiError(
        `Request timed out after ${DEFAULT_API_TIMEOUT}ms`,
        408,
      );
    }

    throw error;
  }
}
