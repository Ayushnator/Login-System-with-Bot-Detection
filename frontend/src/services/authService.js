import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Signup API
 */
export const signupUser = async (formData) => {
  try {
    console.log('🔵 Signup request sending to:', API_BASE_URL + '/auth/signup');
    console.log('📤 Request data:', { ...formData, password: '***', confirmPassword: '***' });
    const response = await api.post('/auth/signup', formData);
    console.log('✅ Signup response received:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Signup error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      message: error.response?.data?.message,
      data: error.response?.data,
      networkError: error.message,
      code: error.code,
    });
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Signup failed',
    };
  }
};

/**
 * Login API
 */
export const loginUser = async (formData) => {
  try {
    const response = await api.post('/auth/login', formData);
    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Login failed',
      requiresCaptcha: error.response?.data?.requiresCaptcha,
    };
  }
};

/**
 * Get Current User (Protected Route)
 */
export const getCurrentUser = async () => {
  try {
    const response = await api.get('/auth/me');
    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch user',
    };
  }
};

/**
 * Logout
 */
export const logoutUser = () => {
  localStorage.removeItem('authToken');
};

export default {
  signupUser,
  loginUser,
  getCurrentUser,
  logoutUser,
};
