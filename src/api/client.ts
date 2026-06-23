import axios from 'axios';
import { API_BASE_URL } from '@/utils/constants';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { Accept: 'application/json' },
  timeout: 20000,
});

let currentToken: string | null = null;
let unauthorizedHandler: (() => void) | null = null;

/** Set/clear the bearer token used on every request. */
export function setAuthToken(token: string | null): void {
  currentToken = token;
}

/** Register a callback fired when the API returns 401 (e.g. force sign-out). */
export function setUnauthorizedHandler(fn: (() => void) | null): void {
  unauthorizedHandler = fn;
}

api.interceptors.request.use((config) => {
  if (currentToken) {
    config.headers.Authorization = `Bearer ${currentToken}`;
  }
  console.log('API REQUEST:', {
    url: config.baseURL + config.url,
    method: config.method,
    headers: config.headers,
  });
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      unauthorizedHandler?.();
    }
    return Promise.reject(error);
  },
);

/** Pull a human-friendly message out of an axios error. */
export function apiErrorMessage(
  error: unknown,
  fallback = 'Something went wrong.'
): string {
  if (axios.isAxiosError(error)) {
    // Request timed out
    if (error.code === 'ECONNABORTED') {
      return 'The server is taking too long to respond. Please try again.';
    }

    // Backend unavailable / network issue
    if (!error.response) {
      return 'Unable to connect to the server. Please check your connection and try again.';
    }

    // API-provided message
    return (
      (error.response.data as { message?: string })?.message ??
      fallback
    );
  }

  return fallback;
}
