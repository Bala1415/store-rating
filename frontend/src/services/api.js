import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true, // Crucial: Sends and receives HttpOnly cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for clear error message extraction
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const customMessage = error.response?.data?.message || error.message || 'An unexpected error occurred.';
    return Promise.reject(new Error(customMessage));
  }
);

// Auth endpoints
export const authApi = {
  login: (credentials) => api.post('/auth/login', credentials),
  signup: (userData) => api.post('/auth/signup', userData),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  changePassword: (data) => api.patch('/auth/password', data),
};

// Admin endpoints
export const adminApi = {
  getDashboardStats: () => api.get('/admin/dashboard'),
  getUsers: (params) => api.get('/admin/users', { params }),
  createUser: (userData) => api.post('/admin/users', userData),
  getUserById: (id) => api.get(`/admin/users/${id}`),
  getStores: (params) => api.get('/admin/stores', { params }),
  createStore: (storeData) => api.post('/admin/stores', storeData),
};

// Store and rating endpoints
export const storeApi = {
  getStores: (params) => api.get('/stores', { params }),
  getStoreById: (id) => api.get(`/stores/${id}`),
  submitRating: (storeId, rating) => api.post(`/stores/${storeId}/ratings`, { rating }),
  updateRating: (storeId, rating) => api.patch(`/stores/${storeId}/ratings`, { rating }),
};

// Store Owner endpoints
export const ownerApi = {
  getDashboard: () => api.get('/owner/dashboard'),
  getRatings: () => api.get('/owner/ratings'),
};

export default api;
