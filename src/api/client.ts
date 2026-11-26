import { ApiError } from '../types';

let inMemoryToken: string | null = null;
let onUnauthorizedCallback: (() => void) | null = null;
let connectivityListener: ((online: boolean) => void) | null = null;

export const setAuthToken = (token: string | null) => {
  inMemoryToken = token;
};

export const getAuthToken = () => inMemoryToken;

export const setOnUnauthorized = (cb: () => void) => {
  onUnauthorizedCallback = cb;
};

export const setConnectivityListener = (cb: (online: boolean) => void) => {
  connectivityListener = cb;
};

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = endpoint.startsWith('http')
    ? endpoint
    : `${BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (inMemoryToken) {
    headers.set('Authorization', `Bearer ${inMemoryToken}`);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (connectivityListener) {
      connectivityListener(true);
    }

    if (response.status === 401) {
      if (onUnauthorizedCallback && !endpoint.endsWith('/auth/login')) {
        onUnauthorizedCallback();
      }
      throw {
        status: 401,
        message: 'انتهت صلاحية الجلسة، يرجى تسجيل الدخول مجدداً.',
      } as ApiError;
    }

    if (!response.ok) {
      let errorMessage = 'حدث خطأ غير متوقع في الخادم';
      try {
        const errorJson = await response.json();
        errorMessage = errorJson.message || errorMessage;
      } catch {
        // fallback to status text
        errorMessage = response.statusText || errorMessage;
      }

      throw {
        status: response.status,
        message: errorMessage,
      } as ApiError;
    }

    if (response.status === 204) {
      return {} as T;
    }

    return await response.json();
  } catch (error: unknown) {
    clearTimeout(timeoutId);

    const err = error as { name?: string; message?: string; status?: number; isNetworkError?: boolean };

    if (err.status) {
      throw err;
    }

    if (connectivityListener) {
      connectivityListener(false);
    }

    const isNetwork = err.name === 'AbortError' || err.message?.includes('Failed to fetch') || !navigator.onLine;

    throw {
      message: isNetwork
        ? 'تعذر الاتصال بخادم العيادة. يرجى التحقق من الشبكة المحلية أو تشغيل الخادم.'
        : err.message || 'حدث خطأ في معالجة الطلب',
      isNetworkError: true,
    } as ApiError;
  }
}
