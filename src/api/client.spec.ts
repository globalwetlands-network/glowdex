import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { apiClient, ApiError } from './client';

vi.mock('./config', () => ({
  API_BASE_URL: '/api',
  DEFAULT_API_TIMEOUT: 100,
}));

describe('apiClient', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should make a GET request and return JSON', async () => {
    const mockData = { hello: 'world' };
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockData),
    } as Response);

    const result = await apiClient('/test');
    
    expect(fetch).toHaveBeenCalledWith('/api/test', expect.objectContaining({
      headers: {}
    }));
    expect(result).toEqual(mockData);
  });

  it('should handle POST requests with a body', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    } as Response);

    await apiClient('/post', {
      method: 'POST',
      body: JSON.stringify({ key: 'value' }),
    });

    expect(fetch).toHaveBeenCalledWith('/api/post', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ key: 'value' }),
    }));
  });

  it('should throw ApiError on timeout', async () => {
    vi.mocked(fetch).mockImplementation((_input: string | URL | Request, init?: RequestInit) => {
      return new Promise((_, reject) => {
        if (init?.signal) {
          init.signal.addEventListener('abort', () => {
            const error = new Error('The operation was aborted');
            error.name = 'AbortError';
            reject(error);
          });
        }
      });
    });

    const promise = apiClient('/slow');
    
    // Fast-forward time
    vi.advanceTimersByTime(150);
    
    await expect(promise).rejects.toThrow('Request timed out after 100ms');
    await expect(promise).rejects.toHaveProperty('status', 408);
  });

  it('should throw ApiError on failure', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      json: () => Promise.resolve({ message: 'Resource not found' }),
    } as Response);

    const promise = apiClient('/fail');
    await expect(promise).rejects.toThrow(ApiError);
    await expect(promise).rejects.toThrow('Resource not found');
  });

  it('should fallback to status text if JSON error message is missing', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      json: () => Promise.reject(new Error('No JSON')),
    } as Response);

    await expect(apiClient('/fail')).rejects.toThrow('API Error: 500 Internal Server Error');
  });
});
