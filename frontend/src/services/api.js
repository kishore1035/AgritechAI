import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const ML_BASE_URL = import.meta.env.VITE_ML_URL || 'http://localhost:5001';

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || (error.response.status === 400 && error.response.data?.error === 'Invalid token'))) {
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: async (data) => {
    try {
      console.log('🚀 Registration attempt:', { 
        url: `${API_BASE_URL}/auth/register`,
        data: { ...data, password: '[HIDDEN]' } 
      });
      
      const response = await api.post('/auth/register', data);
      console.log('✅ Registration successful:', response.status);
      return response;
    } catch (error) {
      console.error('❌ Registration failed:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    }
  },
  login: (data) => api.post('/auth/login', data),
};

export const farmsAPI = {
  getAll: () => api.get('/farms'),
  getOne: (id) => api.get(`/farms/${id}`),
  create: (data) => api.post('/farms', data),
  update: (id, data) => api.put(`/farms/${id}`, data),
  delete: (id) => api.delete(`/farms/${id}`),
};

export const predictionsAPI = {
  analyze: (farmData) => axios.post(`${ML_BASE_URL}/predict/nutrient-depletion`, farmData),
  getRotation: (farmData) => axios.post(`${ML_BASE_URL}/recommend/rotation`, farmData),
};

export const cropsAPI = {
  getAll: () => api.get('/crops'),
  getByRegion: (region) => api.get(`/crops/region/${region}`),
  // Crop image analysis endpoints
  analyzeCrop: (formData) => api.post('/crops/analyze', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  getAnalyses: () => api.get('/crops/analyses'),
  getAnalysis: (id) => api.get(`/crops/analyses/${id}`),
  linkAnalysisToFarm: (analysisId, farmId) => api.post(`/crops/analyses/${analysisId}/link-farm`, { farmId }),
  
  // NEW: Market intelligence endpoints
  analyzeImageWithMarket: (formData) => api.post('/crops/analyze-image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  getCropMarketData: (cropName, area = 1) => api.get(`/crops/market-data/${cropName}`, { params: { area } }),
  getBestInvestment: (area = 1) => api.get('/crops/best-investment', { params: { area } }),
  compareCrops: (payload) => api.post('/crops/compare', payload),
};

export const dashboardAPI = {
  getDashboard: () => api.get('/dashboard'),
};

export const chatAPI = {
  sendMessage: (message, sessionId = null) => api.post('/chat/message', {
    message,
    sessionId,
    language: 'en',
    streaming: false
  }),
  getSessions: () => api.get('/chat/sessions'),
  createSession: (title) => api.post('/chat/sessions', { title }),
};

export default api;
