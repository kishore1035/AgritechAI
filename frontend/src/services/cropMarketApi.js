/**
 * Crop Market API Service
 * Wrapper for new market intelligence endpoints
 */

import axios from 'axios';
import { API_BASE_URL } from '../config';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api/crops`,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add token to headers
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const cropMarketAPI = {
  /**
   * Analyze crop image with market intelligence
   * @param {FormData} formData - Contains image, area, optional farmId
   * @returns {Promise} - Image analysis + market recommendations
   */
  async analyzeImageWithMarket(formData) {
    const response = await api.post('/analyze-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  },

  /**
   * Get market data for a specific crop
   * @param {string} cropName - Crop name (rice, wheat, etc.)
   * @param {number} area - Farm area in hectares (default: 1)
   * @returns {Promise} - News, prices, profit analysis, seasonal info
   */
  async getCropMarketData(cropName, area = 1) {
    const response = await api.get(`/market-data/${cropName}`, {
      params: { area }
    });
    return response;
  },

  /**
   * Get best investment opportunities
   * @param {number} area - Farm area in hectares (default: 1)
   * @returns {Promise} - Top ranked crops by investment score
   */
  async getBestInvestment(area = 1) {
    const response = await api.get('/best-investment', {
      params: { area }
    });
    return response;
  },

  /**
   * Compare multiple crops
   * @param {Object} payload - { crops: [], area: number }
   * @returns {Promise} - Comparison data with scores and recommendations
   */
  async compareCrops(payload) {
    const response = await api.post('/compare', payload);
    return response;
  },

  /**
   * Get all available crops
   * @returns {Promise} - List of all crops
   */
  async getAllCrops() {
    const response = await api.get('/');
    return response;
  },

  /**
   * Get crops by region
   * @param {string} region - Region name
   * @returns {Promise} - Crops suitable for region
   */
  async getCropsByRegion(region) {
    const response = await api.get(`/region/${region}`);
    return response;
  },
};

export default cropMarketAPI;
