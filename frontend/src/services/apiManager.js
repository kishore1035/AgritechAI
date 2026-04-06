/**
 * API Service Manager - Enhanced with Claw Code patterns
 * Provides centralized API endpoint management, versioning, and request routing
 */

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const ML_BASE_URL = import.meta.env.VITE_ML_URL || 'http://localhost:5001';

/**
 * API Service Endpoint Definition
 */
class APIEndpoint {
  constructor(path, method = 'GET', description = '', version = 'v1') {
    this.path = path;
    this.method = method;
    this.description = description;
    this.version = version;
    this.createdAt = new Date();
  }

  getFullPath(baseUrl) {
    return `${baseUrl}/${this.version}${this.path}`;
  }
}

/**
 * API Request/Response Logger
 */
class APILogger {
  constructor(maxEntries = 1000) {
    this.entries = [];
    this.maxEntries = maxEntries;
  }

  log(request, response, duration) {
    this.entries.push({
      timestamp: new Date(),
      method: request.method,
      path: request.url,
      status: response?.status,
      duration,
      error: response?.error
    });

    if (this.entries.length > this.maxEntries) {
      this.entries.shift();
    }
  }

  getStats(timeWindowMs = 3600000) {
    const cutoff = Date.now() - timeWindowMs;
    const recent = this.entries.filter(e => new Date(e.timestamp).getTime() > cutoff);

    return {
      total: recent.length,
      successful: recent.filter(e => e.status >= 200 && e.status < 300).length,
      errors: recent.filter(e => !e.status || e.status >= 400).length,
      avgDuration: recent.length > 0 
        ? recent.reduce((s, e) => s + e.duration, 0) / recent.length 
        : 0,
      byEndpoint: this._groupByEndpoint(recent)
    };
  }

  _groupByEndpoint(entries) {
    const grouped = {};
    entries.forEach(e => {
      if (!grouped[e.path]) {
        grouped[e.path] = { count: 0, errors: 0, avgDuration: 0 };
      }
      grouped[e.path].count++;
      grouped[e.path].avgDuration += e.duration;
      if (e.error) grouped[e.path].errors++;
    });

    for (const path in grouped) {
      grouped[path].avgDuration /= grouped[path].count;
    }

    return grouped;
  }

  getRecentErrors(limit = 10) {
    return this.entries
      .filter(e => e.error)
      .slice(-limit)
      .reverse();
  }
}

/**
 * Service Manager
 */
class ServiceManager {
  constructor() {
    this.services = new Map();
    this.endpoints = new Map();
    this.logger = new APILogger();
  }

  registerService(name, baseUrl, description = '') {
    this.services.set(name, { name, baseUrl, description, createdAt: new Date() });
  }

  registerEndpoint(serviceName, endpoint) {
    if (!this.endpoints.has(serviceName)) {
      this.endpoints.set(serviceName, []);
    }
    this.endpoints.get(serviceName).push(endpoint);
  }

  getService(name) {
    return this.services.get(name);
  }

  getEndpoints(serviceName) {
    return this.endpoints.get(serviceName) || [];
  }

  getAllServices() {
    return Array.from(this.services.values());
  }

  getStats() {
    return {
      services: this.services.size,
      endpoints: Array.from(this.endpoints.values()).flat().length,
      apiStats: this.logger.getStats()
    };
  }

  renderMarkdown() {
    let markdown = '# API Service Architecture\n\n';

    for (const [serviceName, endpoints] of this.endpoints) {
      const service = this.services.get(serviceName);
      markdown += `## ${serviceName}\n`;
      markdown += `**Base URL:** ${service.baseUrl}\n`;
      markdown += `**Description:** ${service.description}\n\n`;
      markdown += '### Endpoints\n';

      endpoints.forEach(ep => {
        markdown += `- \`${ep.method} ${ep.path}\` — ${ep.description}\n`;
      });
      markdown += '\n';
    }

    return markdown;
  }
}

// Global service manager
const serviceManager = new ServiceManager();

// Register services
serviceManager.registerService('main', API_BASE_URL, 'Main AgriTech API');
serviceManager.registerService('ml', ML_BASE_URL, 'Machine Learning Service');

// Register main API endpoints
serviceManager.registerEndpoint('main', new APIEndpoint('/auth/login', 'POST', 'User login'));
serviceManager.registerEndpoint('main', new APIEndpoint('/auth/register', 'POST', 'User registration'));
serviceManager.registerEndpoint('main', new APIEndpoint('/farms', 'GET', 'List user farms'));
serviceManager.registerEndpoint('main', new APIEndpoint('/farms', 'POST', 'Create farm'));
serviceManager.registerEndpoint('main', new APIEndpoint('/crops/analyze', 'POST', 'Analyze crop image'));
serviceManager.registerEndpoint('main', new APIEndpoint('/crops/analyses', 'GET', 'Get crop analyses'));
serviceManager.registerEndpoint('main', new APIEndpoint('/command/query', 'POST', 'Execute command query'));
serviceManager.registerEndpoint('main', new APIEndpoint('/command/sessions', 'GET', 'Get user sessions'));

// Register ML endpoints
serviceManager.registerEndpoint('ml', new APIEndpoint('/predict/crop-analysis', 'POST', 'Analyze crop health'));
serviceManager.registerEndpoint('ml', new APIEndpoint('/predict/nutrient-depletion', 'POST', 'Predict nutrient depletion'));
serviceManager.registerEndpoint('ml', new APIEndpoint('/predict/soil-score', 'POST', 'Calculate soil health'));

/**
 * Enhanced Axios Instance
 */
const createAPIInstance = () => {
  const instance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000
  });

  // Request interceptor - add auth token
  instance.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // Response interceptor - log and handle errors
  instance.interceptors.response.use(
    response => {
      const duration = response.config.startTime ? Date.now() - response.config.startTime : 0;
      serviceManager.logger.log(response.config, { status: response.status }, duration);
      return response;
    },
    error => {
      const duration = error.config?.startTime ? Date.now() - error.config.startTime : 0;
      serviceManager.logger.log(error.config || {}, { status: error.response?.status, error: error.message }, duration);

      // Handle auth errors
      if (error.response?.status === 401) {
        localStorage.clear();
        window.location.href = '/login';
      }

      return Promise.reject(error);
    }
  );

  // Add startTime to track duration
  instance.interceptors.request.use(config => {
    config.startTime = Date.now();
    return config;
  });

  return instance;
};

const api = createAPIInstance();

// API Collections (organized like Claw Code)

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
};

export const farmsAPI = {
  getAll: () => api.get('/farms'),
  getOne: (id) => api.get(`/farms/${id}`),
  create: (data) => api.post('/farms', data),
  update: (id, data) => api.put(`/farms/${id}`, data),
  delete: (id) => api.delete(`/farms/${id}`),
};

export const cropsAPI = {
  getAll: () => api.get('/crops'),
  getByRegion: (region) => api.get(`/crops/region/${region}`),
  analyzeCrop: (formData) => api.post('/crops/analyze', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getAnalyses: () => api.get('/crops/analyses'),
  getAnalysis: (id) => api.get(`/crops/analyses/${id}`),
  linkAnalysisToFarm: (analysisId, farmId) => api.post(`/crops/analyses/${analysisId}/link-farm`, { farmId }),
};

export const commandAPI = {
  query: (query, sessionId, farmId) => api.post('/command/query', { query, sessionId, farmId }),
  getRoute: (query) => api.get(`/command/route/${encodeURIComponent(query)}`),
  getSessions: () => api.get('/command/user/sessions'),
  getSession: (sessionId) => api.get(`/command/sessions/${sessionId}`),
  closeSession: (sessionId) => api.post(`/command/sessions/${sessionId}/close`),
  getStats: () => api.get('/command/stats'),
  getRegistry: () => api.get('/command/registry'),
  getTools: () => api.get('/command/tools'),
};

export const predictionsAPI = {
  nutrientDepletion: (farmData) => axios.post(`${ML_BASE_URL}/predict/nutrient-depletion`, farmData),
  soilScore: (farmData) => axios.post(`${ML_BASE_URL}/predict/soil-score`, farmData),
  cropAnalysis: (farmData) => axios.post(`${ML_BASE_URL}/predict/crop-analysis`, farmData),
};

// Service Manager Export
export { serviceManager, ServiceManager, APILogger };

export default api;
