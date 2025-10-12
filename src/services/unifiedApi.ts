import axios from 'axios';
import { 
  Audit, 
  Incident, 
  Risque, 
  Formation, 
  Conformite,
  StatistiquesQHSE,
  AuditFormData,
  IncidentFormData,
  RisqueFormData,
  FormationFormData,
  ConformiteFormData
} from '../types';

// Configuration de l'API unifiée - Forcer l'URL qui fonctionne
const API_BASE_URL = 'https://backend-qhse.vercel.app';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api/qhse`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API instance séparée pour l'authentification
const authApi = axios.create({
  baseURL: `${API_BASE_URL}/api/auth`,
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
authApi.interceptors.request.use(addAuthToken);

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
authApi.interceptors.response.use((response) => response, handleAuthError);

// Types pour l'authentification
interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  nom: string;
  prenom: string;
  email: string;
  password: string;
  entreprise: string;
  departement?: string;
  poste?: string;
  role?: string;
}

interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: any;
    token: string;
    refreshToken: string;
  };
}

// Services pour l'authentification
export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      const response = await authApi.post('/login', credentials);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur de connexion');
    }
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    try {
      const response = await authApi.post('/register', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de l\'inscription');
    }
  },

  logout: async (refreshToken?: string): Promise<void> => {
    try {
      await authApi.post('/logout', { refreshToken });
    } catch (error: any) {
      // On ne lance pas d'erreur pour la déconnexion
    }
  },

  refreshToken: async (refreshToken: string): Promise<{ token: string }> => {
    try {
      const response = await authApi.post('/refresh', { refreshToken });
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors du rafraîchissement du token');
    }
  },

  getProfile: async (): Promise<any> => {
    try {
      const response = await authApi.get('/me');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération du profil');
    }
  },

  updateProfile: async (data: any): Promise<any> => {
    try {
      const response = await authApi.put('/profile', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors de la mise à jour du profil');
    }
  },

  changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    try {
      await authApi.put('/change-password', { currentPassword, newPassword });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erreur lors du changement de mot de passe');
    }
  },
};

// Service unifié pour toutes les entités QHSE
export const qhseService = {
  // Audits
  audits: {
    getAll: (params?: any) => api.get('/audits', { params }),
    getById: (id: string) => api.get(`/audits/${id}`),
    create: (data: AuditFormData) => api.post('/audits', data),
    update: (id: string, data: Partial<AuditFormData>) => api.put(`/audits/${id}`, data),
    delete: (id: string) => api.delete(`/audits/${id}`),
    getByStatut: (statut: string) => api.get(`/audits/statut/${statut}`),
    getByType: (type: string) => api.get(`/audits/type/${type}`),
    export: (format: string = 'pdf') => api.get(`/exports/audits?format=${format}`, { responseType: 'blob' }),
  },

  // Incidents
  incidents: {
    getAll: (params?: any) => api.get('/incidents', { params }),
    getById: (id: string) => api.get(`/incidents/${id}`),
    create: (data: IncidentFormData) => api.post('/incidents', data),
    update: (id: string, data: Partial<IncidentFormData>) => api.put(`/incidents/${id}`, data),
    delete: (id: string) => api.delete(`/incidents/${id}`),
    getByGravite: (gravite: string) => api.get(`/incidents/gravite/${gravite}`),
    getByType: (type: string) => api.get(`/incidents/type/${type}`),
    export: (format: string = 'pdf') => api.get(`/exports/incidents?format=${format}`, { responseType: 'blob' }),
  },

  // Risques
  risques: {
    getAll: (params?: any) => api.get('/risques', { params }),
    getById: (id: string) => api.get(`/risques/${id}`),
    create: (data: RisqueFormData) => api.post('/risques', data),
    update: (id: string, data: Partial<RisqueFormData>) => api.put(`/risques/${id}`, data),
    delete: (id: string) => api.delete(`/risques/${id}`),
    getByNiveau: (niveau: string) => api.get(`/risques/niveau/${niveau}`),
    getByCategorie: (categorie: string) => api.get(`/risques/categorie/${categorie}`),
    getMatrice: () => api.get('/risques/matrice'),
    export: (format: string = 'pdf') => api.get(`/exports/risques?format=${format}`, { responseType: 'blob' }),
  },

  // Formations
  formations: {
    getAll: (params?: any) => api.get('/formations', { params }),
    getById: (id: string) => api.get(`/formations/${id}`),
    create: (data: FormationFormData) => api.post('/formations', data),
    update: (id: string, data: Partial<FormationFormData>) => api.put(`/formations/${id}`, data),
    delete: (id: string) => api.delete(`/formations/${id}`),
    getByType: (type: string) => api.get(`/formations/type/${type}`),
    getByCategorie: (categorie: string) => api.get(`/formations/categorie/${categorie}`),
    getExpirantes: () => api.get('/formations/expirantes'),
    export: (format: string = 'pdf') => api.get(`/exports/formations?format=${format}`, { responseType: 'blob' }),
  },

  // Conformités
  conformites: {
    getAll: (params?: any) => api.get('/conformites', { params }),
    getById: (id: string) => api.get(`/conformites/${id}`),
    create: (data: ConformiteFormData) => api.post('/conformites', data),
    update: (id: string, data: Partial<ConformiteFormData>) => api.put(`/conformites/${id}`, data),
    delete: (id: string) => api.delete(`/conformites/${id}`),
    getByType: (type: string) => api.get(`/conformites/type/${type}`),
    getByDomaine: (domaine: string) => api.get(`/conformites/domaine/${domaine}`),
    getExpirantes: () => api.get('/conformites/expirantes'),
    getNonConformes: () => api.get('/conformites/non-conformes'),
    export: (format: string = 'pdf') => api.get(`/exports/conformites?format=${format}`, { responseType: 'blob' }),
  },

  // Actions correctives
  actionsCorrectives: {
    getAll: () => api.get('/actions-correctives'),
    getByStatut: (statut: string) => api.get(`/actions-correctives/statut/${statut}`),
    getEnRetard: () => api.get('/actions-correctives/retard'),
    update: (incidentId: string, actionId: string, data: any) => 
      api.put(`/actions-correctives/${incidentId}/${actionId}`, data),
  },

  // Statistiques
  statistiques: {
    getBase: () => api.get('/stats'),
    getEtendues: () => api.get('/stats/etendues'),
    getParPeriode: (debut: string, fin: string) => 
      api.get(`/stats/periode?debut=${debut}&fin=${fin}`),
    getDashboard: (params?: any) => api.get('/dashboard', { params }),
  },

  // Notifications
  notifications: {
    getAll: () => api.get('/notifications'),
    marquerCommeLue: (id: string) => api.put(`/notifications/${id}/lue`),
    marquerToutesCommeLues: () => api.put('/notifications/toutes-lues'),
    configurerAlertes: (config: any) => api.post('/notifications/config', config),
  },

  // Configuration
  configuration: {
    getConfig: () => api.get('/config'),
    updateConfig: (section: string, data: any) => api.put('/config', { section, data }),
    getParametres: () => api.get('/config/parametres'),
    getReglementations: () => api.get('/config/reglementations'),
    exportConfig: (format: string = 'json') => api.get(`/config/export?format=${format}`),
    importConfig: (configData: any) => api.post('/config/import', { configData }),
    createBackup: (configData: any) => api.post('/config/backup', configData),
  },

  // Exports
  exports: {
    rapportComplet: (format: string = 'pdf') => 
      api.get(`/exports/rapport-complet?format=${format}`, { responseType: 'blob' }),
  },
};

// Utilitaires
export const downloadFile = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

// Export par défaut
export default qhseService;
