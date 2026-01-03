const API_BASE_URL = 'http://localhost:5000/api';

/**
 * API utility functions for making HTTP requests
 */

/**
 * Make an API request
 */
const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  try {
    console.log(`[API] ${options.method || 'GET'} ${API_BASE_URL}${endpoint}`);
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();
    
    if (!response.ok) {
      console.error('[API] Error response:', data);
      throw new Error(data.message || 'API request failed');
    }
    
    console.log('[API] Success response:', data);
    return data;
  } catch (error) {
    console.error('[API] Request failed:', error);
    throw error;
  }
};

/**
 * Auth API calls
 */
export const authAPI = {
  signup: async (userData) => {
    console.log('[Auth API] Signup request:', userData);
    const response = await apiRequest('/auth/signup', {
      method: 'POST',
      body: userData,
    });
    return response;
  },

  login: async (credentials) => {
    console.log('[Auth API] Login request:', credentials);
    const response = await apiRequest('/auth/login', {
      method: 'POST',
      body: credentials,
    });
    return response;
  },

  getCurrentUser: async () => {
    console.log('[Auth API] Get current user request');
    const response = await apiRequest('/auth/me', {
      method: 'GET',
    });
    return response;
  },
};


