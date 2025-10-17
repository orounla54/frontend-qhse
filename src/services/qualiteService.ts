import axios from 'axios';

// Configuration de l'API
const API_BASE_URL = 'https://backend-qhse.vercel.app';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api/qualite`,
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

// Services pour les matières premières
export const matierePremiereService = {
  getAll: (params?: any) => api.get('/matieres-premieres', { params }),
  getById: (id: string) => api.get(`/matieres-premieres/${id}`),
  create: (data: any) => api.post('/matieres-premieres', data),
  update: (id: string, data: any) => api.put(`/matieres-premieres/${id}`, data),
  delete: (id: string) => api.delete(`/matieres-premieres/${id}`),
  addLot: (id: string, data: any) => api.post(`/matieres-premieres/${id}/lots`, data),
  decisionLot: (id: string, numeroLot: string, data: any) => 
    api.post(`/matieres-premieres/${id}/lots/${numeroLot}/decision`, data),
};

// Services pour les contrôles qualité
export const controleQualiteService = {
  getAll: (params?: any) => api.get('/controles-qualite', { params }),
  getById: (id: string) => api.get(`/controles-qualite/${id}`),
  create: (data: any) => api.post('/controles-qualite', data),
  update: (id: string, data: any) => api.put(`/controles-qualite/${id}`, data),
  delete: (id: string) => api.delete(`/controles-qualite/${id}`),
  addResultat: (id: string, data: any) => api.post(`/controles-qualite/${id}/resultats`, data),
  valider: (id: string, data: any) => api.post(`/controles-qualite/${id}/valider`, data),
};

// Services pour les non-conformités
export const nonConformiteService = {
  getAll: (params?: any) => api.get('/non-conformites', { params }),
  getById: (id: string) => api.get(`/non-conformites/${id}`),
  create: (data: any) => api.post('/non-conformites', data),
  update: (id: string, data: any) => api.put(`/non-conformites/${id}`, data),
  delete: (id: string) => api.delete(`/non-conformites/${id}`),
  fermer: (id: string, data: any) => api.post(`/non-conformites/${id}/fermer`, data),
  cloturer: (id: string, data: any) => api.post(`/non-conformites/${id}/cloturer`, data),
};

// Services pour les audits qualité
export const auditQualiteService = {
  getAll: (params?: any) => api.get('/audits', { params }),
  getById: (id: string) => api.get(`/audits/${id}`),
  create: (data: any) => api.post('/audits', data),
  update: (id: string, data: any) => api.put(`/audits/${id}`, data),
  delete: (id: string) => api.delete(`/audits/${id}`),
};

// Services pour les décisions qualité
export const decisionQualiteService = {
  getAll: (params?: any) => api.get('/decisions-qualite', { params }),
  getById: (id: string) => api.get(`/decisions-qualite/${id}`),
  create: (data: any) => api.post('/decisions-qualite', data),
  update: (id: string, data: any) => api.put(`/decisions-qualite/${id}`, data),
  delete: (id: string) => api.delete(`/decisions-qualite/${id}`),
  valider: (id: string, data: any) => api.post(`/decisions-qualite/${id}/valider`, data),
};

// Services pour les plans de contrôle
export const planControleService = {
  getAll: (params?: any) => api.get('/plans-controle', { params }),
  getById: (id: string) => api.get(`/plans-controle/${id}`),
  create: (data: any) => api.post('/plans-controle', data),
  update: (id: string, data: any) => api.put(`/plans-controle/${id}`, data),
  delete: (id: string) => api.delete(`/plans-controle/${id}`),
  activer: (id: string) => api.post(`/plans-controle/${id}/activer`),
};

// Services pour la traçabilité
export const tracabiliteService = {
  getAll: (params?: any) => api.get('/tracabilite', { params }),
  getById: (id: string) => api.get(`/tracabilite/${id}`),
  create: (data: any) => api.post('/tracabilite', data),
  update: (id: string, data: any) => api.put(`/tracabilite/${id}`, data),
  delete: (id: string) => api.delete(`/tracabilite/${id}`),
};

// Services pour la conformité
export const conformiteService = {
  getAll: (params?: any) => api.get('/conformite', { params }),
  getById: (id: string) => api.get(`/conformite/${id}`),
  create: (data: any) => api.post('/conformite', data),
  update: (id: string, data: any) => api.put(`/conformite/${id}`, data),
  delete: (id: string) => api.delete(`/conformite/${id}`),
};

// Services pour les analyses
export const analyseService = {
  getAll: (params?: any) => api.get('/analyses', { params }),
  getById: (id: string) => api.get(`/analyses/${id}`),
  create: (data: any) => api.post('/analyses', data),
  update: (id: string, data: any) => api.put(`/analyses/${id}`, data),
  delete: (id: string) => api.delete(`/analyses/${id}`),
};

// Services pour les échantillons
export const echantillonService = {
  getAll: (params?: any) => api.get('/echantillons', { params }),
  getById: (id: string) => api.get(`/echantillons/${id}`),
  create: (data: any) => api.post('/echantillons', data),
  update: (id: string, data: any) => api.put(`/echantillons/${id}`, data),
  delete: (id: string) => api.delete(`/echantillons/${id}`),
};

// Services pour les statistiques qualité
export const qualiteStatsService = {
  getStats: (periode?: string) => api.get('/stats', { params: { periode } }),
};

export default api;


