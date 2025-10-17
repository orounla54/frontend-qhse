import axios from 'axios';

// Configuration de l'API
const API_BASE_URL = 'https://backend-qhse.vercel.app';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api/laboratoire`,
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

// Types pour les échantillons
export interface Echantillon {
  _id: string;
  numero: string;
  numeroLot: string;
  produit: string;
  typeEchantillon: string;
  statut: string;
  prelevement: {
    date: string;
    responsable: string;
    localisation: string;
  };
  analyses: any[];
  resultats: {
    conformite: string;
    observations: string;
  };
  decisionQualite: {
    decision: string;
    decideur: string;
    dateDecision: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Analyse {
  _id: string;
  numero: string;
  type: string;
  statut: string;
  echantillon: string;
  resultats: any;
  validation: any;
  createdAt: string;
  updatedAt: string;
}

export interface PlanControle {
  _id: string;
  numero: string;
  produit: string;
  statut: string;
  responsable: string;
  analyses: any[];
  createdAt: string;
  updatedAt: string;
}

// Services pour les échantillons
export const echantillonService = {
  getAll: (params?: any) => api.get('/echantillons', { params }),
  getById: (id: string) => api.get(`/echantillons/${id}`),
  create: (data: Partial<Echantillon>) => api.post('/echantillons', data),
  update: (id: string, data: Partial<Echantillon>) => api.put(`/echantillons/${id}`, data),
  delete: (id: string) => api.delete(`/echantillons/${id}`),
  addAnalyse: (id: string, data: any) => api.post(`/echantillons/${id}/analyses`, data),
  decisionQualite: (id: string, data: any) => api.post(`/echantillons/${id}/decision-qualite`, data),
};

// Services pour les analyses
export const analyseService = {
  getAll: (params?: any) => api.get('/analyses', { params }),
  getById: (id: string) => api.get(`/analyses/${id}`),
  create: (data: Partial<Analyse>) => api.post('/analyses', data),
  update: (id: string, data: Partial<Analyse>) => api.put(`/analyses/${id}`, data),
  delete: (id: string) => api.delete(`/analyses/${id}`),
  addResultats: (id: string, data: any) => api.post(`/analyses/${id}/resultats`, data),
  valider: (id: string, data: any) => api.post(`/analyses/${id}/valider`, data),
};

// Services pour les plans de contrôle
export const planControleService = {
  getAll: (params?: any) => api.get('/plans-controle', { params }),
  getById: (id: string) => api.get(`/plans-controle/${id}`),
  create: (data: Partial<PlanControle>) => api.post('/plans-controle', data),
  update: (id: string, data: Partial<PlanControle>) => api.put(`/plans-controle/${id}`, data),
  delete: (id: string) => api.delete(`/plans-controle/${id}`),
  activer: (id: string) => api.post(`/plans-controle/${id}/activer`),
};

// Services pour les statistiques
export const laboratoireStatsService = {
  getStats: (periode?: string) => api.get('/stats', { params: { periode } }),
};

export default api;


