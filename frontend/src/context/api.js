import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('agritech-token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject({
      message: 'Request configuration failed',
      error: error.message,
      state: 'error',
    });
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      
      if (status === 401) {
        localStorage.removeItem('agritech-token');
        localStorage.removeItem('agritech-user');
        window.location.href = '/login';
        
        return Promise.reject({
          message: 'Session expired. Please login again.',
          state: 'unauthorized',
          status,
        });
      }
      
      if (status === 403) {
        return Promise.reject({
          message: 'Access denied. Insufficient permissions.',
          state: 'forbidden',
          status,
        });
      }
      
      if (status === 404) {
        return Promise.reject({
          message: 'Resource not found.',
          state: 'not_found',
          status,
        });
      }
      
      if (status >= 500) {
        return Promise.reject({
          message: 'Server error. Please try again later.',
          state: 'server_error',
          status,
        });
      }
      
      return Promise.reject({
        message: data.message || 'Request failed',
        state: 'error',
        status,
        details: data,
      });
    }
    
    if (error.request) {
      return Promise.reject({
        message: 'Network error. Check your connection.',
        state: 'network_error',
      });
    }
    
    return Promise.reject({
      message: error.message || 'An unexpected error occurred',
      state: 'unknown_error',
    });
  }
);

export default api;
