import axios from 'axios';
import storage from '../utils/storage';

const BASE_URL = 'https://api.tezride.pk';

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Request interceptor — attach JWT to every request ─────────────────────
apiClient.interceptors.request.use(
  async (config) => {
    const token = await storage.getItem('jwToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── 401 token-refresh queue ────────────────────────────────────────────────
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// ── Response interceptor — unwrap data, handle 401 refresh ────────────────
apiClient.interceptors.response.use(
  // Success: return the inner `data` object directly
  (response) => response.data,

  async (error) => {
    const originalRequest = error.config;

    // ── 401 Unauthorized — try to refresh the access token once ───────────
    if (error.response?.status === 401 && !originalRequest._retry) {
      // If a refresh is already in-flight, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((newToken) => {
            originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Lazy-import to avoid circular dependency
        const { default: authService } = require('./authService');
        const newToken = await authService.refreshToken();

        processQueue(null, newToken);
        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed — clear session and force re-login
        processQueue(refreshError, null);

        try {
          const { default: authService } = require('./authService');
          await authService.logout();
        } catch (_) {
          // Ensure we clear tokens even if authService throws
          await storage.removeItem('jwToken');
          await storage.removeItem('refreshToken');
        }

        console.error('[apiClient] Token refresh failed. User logged out.');
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // ── Other HTTP errors — normalise the error message ───────────────────
    let errorMessage = 'Something went wrong';

    if (error.response) {
      errorMessage =
        error.response.data?.message ||
        error.response.data?.Message ||
        error.message;
    } else if (error.request) {
      errorMessage = 'No response from server. Please check your internet connection.';
    } else {
      errorMessage = error.message;
    }

    console.error('[apiClient] Error:', errorMessage);
    return Promise.reject({ message: errorMessage });
  }
);

export default apiClient;
