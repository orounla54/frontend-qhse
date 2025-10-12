import axios from 'axios';

// Configuration de l'API
const API_BASE_URL = 'https://backend-qhse.vercel.app';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token d'authentification
const addAuthToken = (config: any) => {
  const token = localStorage.getItem('qhse-token');
  
  if (token && token !== 'null' && token !== 'undefined') {
    const cleanToken = token.replace(/^"(.*)"$/, '$1');
    config.headers.Authorization = `Bearer ${cleanToken}`;
  }
  return config;
};

api.interceptors.request.use(addAuthToken);

// Intercepteur pour gérer les erreurs d'authentification
const handleAuthError = (error: any) => {
  if (error.response?.status === 401) {
    localStorage.removeItem('qhse-token');
    localStorage.removeItem('qhse-refresh-token');
    window.dispatchEvent(new CustomEvent('auth:logout'));
  }
  return Promise.reject(error);
};

api.interceptors.response.use((response) => response, handleAuthError);

// Services pour le dashboard
export const dashboardApiService = {
  // Statistiques globales
  getStats: () => api.get('/dashboard/stats'),
  
  // Données laboratoire
  getLaboratoire: () => api.get('/dashboard/laboratoire'),
  
  // Données qualité
  getQualite: () => api.get('/dashboard/qualite'),
  
  // Données HSE
  getHSE: () => api.get('/dashboard/hse'),
  
  // Données complètes du dashboard
  getDashboard: (params?: any) => api.get('/dashboard', { params }),
};

export default api;
