import axios from 'axios';

// Configuration de l'API
const API_BASE_URL = 'https://backend-qhse.vercel.app';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api/hse`,
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

// Services pour les formations
export const formationService = {
  getAll: (params?: any) => api.get('/formations', { params }),
  getById: (id: string) => api.get(`/formations/${id}`),
  create: (data: any) => api.post('/formations', data),
  update: (id: string, data: any) => api.put(`/formations/${id}`, data),
  delete: (id: string) => api.delete(`/formations/${id}`),
  getExpirantes: () => api.get('/formations/expirantes'),
  getByType: (type: string) => api.get(`/formations/type/${type}`),
};

// Services pour les EPI (Équipements de Protection Individuelle)
export const epiService = {
  getAll: (params?: any) => api.get('/epis', { params }),
  getById: (id: string) => api.get(`/epis/${id}`),
  create: (data: any) => api.post('/epis', data),
  update: (id: string, data: any) => api.put(`/epis/${id}`, data),
  delete: (id: string) => api.delete(`/epis/${id}`),
};

// Services pour les produits chimiques
export const produitChimiqueService = {
  getAll: (params?: any) => api.get('/produits-chimiques', { params }),
  getById: (id: string) => api.get(`/produits-chimiques/${id}`),
  create: (data: any) => api.post('/produits-chimiques', data),
  update: (id: string, data: any) => api.put(`/produits-chimiques/${id}`, data),
  delete: (id: string) => api.delete(`/produits-chimiques/${id}`),
};

// Services pour l'hygiène
export const hygieneService = {
  getAll: (params?: any) => api.get('/hygiene', { params }),
  getById: (id: string) => api.get(`/hygiene/${id}`),
  create: (data: any) => api.post('/hygiene', data),
  update: (id: string, data: any) => api.put(`/hygiene/${id}`, data),
  delete: (id: string) => api.delete(`/hygiene/${id}`),
};

// Services pour les incidents
export const incidentService = {
  getAll: (params?: any) => api.get('/incidents', { params }),
  getById: (id: string) => api.get(`/incidents/${id}`),
  create: (data: any) => api.post('/incidents', data),
  update: (id: string, data: any) => api.put(`/incidents/${id}`, data),
  delete: (id: string) => api.delete(`/incidents/${id}`),
};

// Services pour les risques
export const risqueService = {
  getAll: (params?: any) => api.get('/risques', { params }),
  getById: (id: string) => api.get(`/risques/${id}`),
  create: (data: any) => api.post('/risques', data),
  update: (id: string, data: any) => api.put(`/risques/${id}`, data),
  delete: (id: string) => api.delete(`/risques/${id}`),
};

// Services pour les statistiques HSE
export const hseStatsService = {
  getStats: (periode?: string) => api.get('/stats', { params: { periode } }),
};

export default api;


