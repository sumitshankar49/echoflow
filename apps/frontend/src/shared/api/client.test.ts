import { beforeEach, describe, expect, it, vi } from 'vitest';

let createMock: ReturnType<typeof vi.fn>;
let postMock: ReturnType<typeof vi.fn>;
let apiClientMock: any;
let requestHandler: ((config: any) => any) | undefined;
let responseSuccessHandler: ((response: any) => any) | undefined;
let responseErrorHandler: ((error: any) => Promise<any>) | undefined;

function createLocalStorageMock() {
  const store = new Map<string, string>();
  return {
    getItem: vi.fn((key: string) => store.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store.set(key, value);
    }),
    removeItem: vi.fn((key: string) => {
      store.delete(key);
    }),
    clear: vi.fn(() => {
      store.clear();
    }),
  };
}

async function loadApiClientModule() {
  vi.resetModules();

  createMock = vi.fn();
  postMock = vi.fn();
  requestHandler = undefined;
  responseSuccessHandler = undefined;
  responseErrorHandler = undefined;

  apiClientMock = vi.fn();
  apiClientMock.defaults = { baseURL: 'http://localhost:4000/api' };
  apiClientMock.interceptors = {
    request: {
      use: vi.fn((handler: (config: any) => any) => {
        requestHandler = handler;
        return 0;
      }),
    },
    response: {
      use: vi.fn((onFulfilled: (response: any) => any, onRejected: (error: any) => Promise<any>) => {
        responseSuccessHandler = onFulfilled;
        responseErrorHandler = onRejected;
        return 0;
      }),
    },
  };

  createMock.mockReturnValue(apiClientMock);

  vi.doMock('axios', () => ({
    default: {
      create: createMock,
      post: postMock,
    },
    create: createMock,
    post: postMock,
  }));

  return import('./client');
}

describe('apiClient', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    const localStorageMock = createLocalStorageMock();
    vi.stubGlobal('localStorage', localStorageMock);
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      configurable: true,
      writable: true,
    });
  });

  it('creates axios instance with expected defaults', async () => {
    await loadApiClientModule();

    expect(createMock).toHaveBeenCalledWith({
      baseURL: 'http://localhost:4000/api',
      headers: { 'Content-Type': 'application/json' },
    });
  });

  it('adds authorization header when access token exists', async () => {
    await loadApiClientModule();
    localStorage.setItem('access_token', 'token-123');

    const config = { headers: {} as Record<string, string> };
    const result = requestHandler?.(config);

    expect(result).toBe(config);
    expect(config.headers.Authorization).toBe('Bearer token-123');
  });

  it('returns response untouched in response success interceptor', async () => {
    await loadApiClientModule();

    const response = { data: { ok: true } };
    expect(responseSuccessHandler?.(response)).toBe(response);
  });

  it('clears session and redirects when 401 occurs without refresh token', async () => {
    await loadApiClientModule();

    const error = {
      config: {},
      response: { status: 401 },
    };

    await expect(responseErrorHandler?.(error)).rejects.toBe(error);

    expect(localStorage.removeItem).toHaveBeenCalledWith('access_token');
    expect(localStorage.removeItem).toHaveBeenCalledWith('refresh_token');
  });

  it('refreshes tokens and retries original request on 401', async () => {
    await loadApiClientModule();

    localStorage.setItem('refresh_token', 'refresh-123');
    postMock.mockResolvedValue({
      data: {
        accessToken: 'new-access',
        refreshToken: 'new-refresh',
      },
    });
    apiClientMock.mockResolvedValue({ data: { ok: true } });

    const originalRequest = { _retry: false, headers: {} as Record<string, string> };
    const error = {
      config: originalRequest,
      response: { status: 401 },
    };

    const result = await responseErrorHandler?.(error);

    expect(postMock).toHaveBeenCalledWith('http://localhost:4000/api/auth/refresh', {
      refreshToken: 'refresh-123',
    });
    expect(localStorage.getItem('access_token')).toBe('new-access');
    expect(localStorage.getItem('refresh_token')).toBe('new-refresh');
    expect(originalRequest.headers.Authorization).toBe('Bearer new-access');
    expect(apiClientMock).toHaveBeenCalledWith(originalRequest);
    expect(result).toEqual({ data: { ok: true } });
  });
});
