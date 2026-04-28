import axios from 'axios';
import storage from '../utils/storage';

const BASE_URL = 'https://api.tezride.pk';

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add the JWT token to headers
apiClient.interceptors.request.use(
  async (config) => {
    const token = await storage.getItem('jwToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

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

// Response interceptor for consistent error handling
apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers['Authorization'] = 'Bearer ' + token;
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { authService } = require('./authService');
        const newToken = await authService.refreshToken();
        processQueue(null, newToken);
        originalRequest.headers['Authorization'] = 'Bearer ' + newToken;
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    let errorMessage = 'Something went wrong';

    if (error.response) {
      // Server responded with a status code outside the 2xx range
      errorMessage = error.response.data?.message || error.response.data?.Message || error.message;
    } else if (error.request) {
      // Request was made but no response was received
      errorMessage = 'No response from server. Please check your internet.';
    } else {
      // Something happened in setting up the request
      errorMessage = error.message;
    }

    console.error('API Error:', errorMessage);
    return Promise.reject({ message: errorMessage });
  }
);

export default apiClient;
