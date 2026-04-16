import axios from 'axios';
import toast from 'react-hot-toast';
import { buildAppUrl, getCurrentAppPath } from '../utils/router.js';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'https://game-reco-backend.onrender.com';
const AUTH_SESSION_ENDED_EVENT = 'auth:session-ended';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
});

const clearStoredSession = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.dispatchEvent(new CustomEvent(AUTH_SESSION_ENDED_EVENT));
};

const isAuthRequest = (url = '') =>
  url.includes('/auth/login') || url.includes('/auth/register');

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
    if (error.response?.status === 401 && !isAuthRequest(error.config?.url)) {
      clearStoredSession();
      toast.error('Session expired. Please login again.');

      if (getCurrentAppPath() !== '/login') {
        window.location.replace(buildAppUrl('/login'));
      }
    }

    return Promise.reject(error);
  }
);

export const authAPI = {
  register: async (data) => api.post('/auth/register', data),
  login: async (data) => api.post('/auth/login', data),
  getProfile: async () => api.get('/auth/profile'),
  updateProfile: async (data) => api.put('/auth/updateProfile', data),
};

export const gamesAPI = {
  getAll: async (params) => api.get('/games/getAllGames', { params }),
  getById: async (id) => api.get(`/games/getGame/${id}`),
  add: async (data) => api.post('/games/addGame', data),
  update: async (id, data) => api.put(`/games/updateGame/${id}`, data),
  delete: async (id) => api.delete(`/games/deleteGame/${id}`),
};

export const sliderAPI = {
  getAll: async () => api.get('/slider/getAllSliders'),
  update: async (id, data) => api.put(`/slider/updateSlider/${id}`, data),
  add: async (data) => api.post('/slider/createSlider', data),
  delete: async (id) => api.delete(`/slider/deleteSlider/${id}`),
};

export const libraryAPI = {
  getMyLibrary: async () => api.get('/library/me'),
  addBookmark: async (gameId) => api.post(`/library/bookmarks/${gameId}`),
  removeBookmark: async (gameId) => api.delete(`/library/bookmarks/${gameId}`),
  addFavorite: async (gameId) => api.post(`/library/favorites/${gameId}`),
  removeFavorite: async (gameId) => api.delete(`/library/favorites/${gameId}`),
};

export const recommendAPI = {
  getRecommendations: async (specs) => api.post('/recommendations', specs),
};
