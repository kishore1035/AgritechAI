import api from './api';

const AUTH_TOKEN_KEY = 'agritech-token';
const AUTH_USER_KEY = 'agritech-user';

export const authService = {
  async login(phoneNumber, password) {
    try {
      const response = await api.post('/auth/login', {
        phone_number: phoneNumber,
        password,
      });
      
      const { token, user } = response.data;
      
      if (token) {
        localStorage.setItem(AUTH_TOKEN_KEY, token);
      }
      
      if (user) {
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
      }
      
      return {
        success: true,
        user,
        token,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Login failed',
        state: error.state || 'error',
      };
    }
  },

  async logout() {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
    
    return {
      success: true,
    };
  },

  isAuthenticated() {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    return !!token;
  },

  getToken() {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  },

  getUser() {
    const userStr = localStorage.getItem(AUTH_USER_KEY);
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  setUser(user) {
    if (user) {
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    }
  },
};

export default authService;
