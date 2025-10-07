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

// Configuration de l'API
const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'https://backend-qhse.vercel.app';

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
  console.log('🔑 Ajout du token d\'authentification:', {
    tokenPresent: !!token,
    tokenLength: token ? token.length : 0,
    url: config.url
  });
  
  if (token && token !== 'null' && token !== 'undefined') {
    // Enlever les guillemets si présents (cas où le token a été JSON.stringify)
    const cleanToken = token.replace(/^"(.*)"$/, '$1');
    config.headers.Authorization = `Bearer ${cleanToken}`;
  }
  return config;
};

api.interceptors.request.use(addAuthToken);
authApi.interceptors.request.use(addAuthToken);

// Intercepteur pour gérer les erreurs d'authentification
const handleAuthError = (error: any) => {
  console.log('🚨 Erreur d\'authentification détectée:', {
    status: error.response?.status,
    message: error.message,
    url: error.config?.url
  });
  
  if (error.response?.status === 401) {
    console.log('🔒 Erreur 401 - Nettoyage des tokens et déconnexion');
    localStorage.removeItem('qhse-token');
    localStorage.removeItem('qhse-refresh-token');
    // Émettre un événement personnalisé pour déclencher la déconnexion
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

interface UserProfileResponse {
  success: boolean;
  data: {
    user: any;
  };
}

// Services pour l'authentification
export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      const response = await authApi.post('/login', credentials);
      return response.data;
    } catch (error: any) {
      console.error('Erreur de connexion:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Erreur de connexion');
    }
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    try {
      const response = await authApi.post('/register', data);
      return response.data;
    } catch (error: any) {
      console.error('Erreur d\'inscription:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Erreur lors de l\'inscription');
    }
  },

  logout: async (refreshToken?: string): Promise<void> => {
    try {
      await authApi.post('/logout', { refreshToken });
    } catch (error: any) {
      console.error('Erreur de déconnexion:', error.response?.data || error.message);
      // On ne lance pas d'erreur pour la déconnexion car on veut pouvoir se déconnecter même en cas d'erreur
    }
  },

  refreshToken: async (refreshToken: string): Promise<{ token: string }> => {
    try {
      const response = await authApi.post('/refresh', { refreshToken });
      return response.data.data;
    } catch (error: any) {
      console.error('Erreur de rafraîchissement:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Erreur lors du rafraîchissement du token');
    }
  },

  getProfile: async (): Promise<UserProfileResponse> => {
    try {
      const response = await authApi.get('/me');
      return response.data;
    } catch (error: any) {
      console.error('Erreur récupération profil:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Erreur lors de la récupération du profil');
    }
  },

  updateProfile: async (data: any): Promise<UserProfileResponse> => {
    try {
      const response = await authApi.put('/profile', data);
      return response.data;
    } catch (error: any) {
      console.error('Erreur mise à jour profil:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Erreur lors de la mise à jour du profil');
    }
  },

  changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    try {
      await authApi.put('/change-password', { currentPassword, newPassword });
    } catch (error: any) {
      console.error('Erreur changement mot de passe:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Erreur lors du changement de mot de passe');
    }
  },
};

// Services pour les audits
export const auditService = {
  getAll: () => api.get<Audit[]>('/audits'),
  getById: (id: string) => api.get<Audit>(`/audits/${id}`),
  create: (data: AuditFormData) => api.post<Audit>('/audits', data),
  update: (id: string, data: Partial<AuditFormData>) => api.put<Audit>(`/audits/${id}`, data),
  delete: (id: string) => api.delete(`/audits/${id}`),
  getByStatut: (statut: string) => api.get<Audit[]>(`/audits/statut/${statut}`),
  getByType: (type: string) => api.get<Audit[]>(`/audits/type/${type}`),
};

// Services pour les incidents
export const incidentService = {
  getAll: () => api.get<Incident[]>('/incidents'),
  getById: (id: string) => api.get<Incident>(`/incidents/${id}`),
  create: (data: IncidentFormData) => api.post<Incident>('/incidents', data),
  update: (id: string, data: Partial<IncidentFormData>) => api.put<Incident>(`/incidents/${id}`, data),
  delete: (id: string) => api.delete(`/incidents/${id}`),
  getByGravite: (gravite: string) => api.get<Incident[]>(`/incidents/gravite/${gravite}`),
  getByType: (type: string) => api.get<Incident[]>(`/incidents/type/${type}`),
  updateActionCorrective: (incidentId: string, actionId: string, data: any) => 
    api.put(`/actions-correctives/${incidentId}/${actionId}`, data),
};

// Services pour les risques
export const risqueService = {
  getAll: () => api.get<Risque[]>('/risques'),
  getById: (id: string) => api.get<Risque>(`/risques/${id}`),
  create: (data: RisqueFormData) => api.post<Risque>('/risques', data),
  update: (id: string, data: Partial<RisqueFormData>) => api.put<Risque>(`/risques/${id}`, data),
  delete: (id: string) => api.delete(`/risques/${id}`),
  getByNiveau: (niveau: string) => api.get<Risque[]>(`/risques/niveau/${niveau}`),
  getByCategorie: (categorie: string) => api.get<Risque[]>(`/risques/categorie/${categorie}`),
  getMatriceRisques: () => api.get('/risques/matrice'),
};

// Services pour les formations
export const formationService = {
  getAll: () => api.get<Formation[]>('/formations'),
  getById: (id: string) => api.get<Formation>(`/formations/${id}`),
  create: (data: FormationFormData) => api.post<Formation>('/formations', data),
  update: (id: string, data: Partial<FormationFormData>) => api.put<Formation>(`/formations/${id}`, data),
  delete: (id: string) => api.delete(`/formations/${id}`),
  getExpirantes: () => api.get<Formation[]>('/formations/expirantes'),
  getByType: (type: string) => api.get<Formation[]>(`/formations/type/${type}`),
  getByCategorie: (categorie: string) => api.get<Formation[]>(`/formations/categorie/${categorie}`),
};

// Services pour la conformité
export const conformiteService = {
  getAll: () => api.get<Conformite[]>('/conformites'),
  getById: (id: string) => api.get<Conformite>(`/conformites/${id}`),
  create: (data: ConformiteFormData) => api.post<Conformite>('/conformites', data),
  update: (id: string, data: Partial<ConformiteFormData>) => api.put<Conformite>(`/conformites/${id}`, data),
  delete: (id: string) => api.delete(`/conformites/${id}`),
  getExpirantes: () => api.get<Conformite[]>('/conformites/expirantes'),
  getNonConformes: () => api.get<Conformite[]>('/conformites/non-conformes'),
  getByType: (type: string) => api.get<Conformite[]>(`/conformites/type/${type}`),
  getByDomaine: (domaine: string) => api.get<Conformite[]>(`/conformites/domaine/${domaine}`),
};

// Services pour les statistiques
export const statistiquesService = {
  getBase: () => api.get<StatistiquesQHSE>('/stats'),
  getEtendues: () => api.get<StatistiquesQHSE>('/stats/etendues'),
  getParPeriode: (debut: string, fin: string) => 
    api.get<StatistiquesQHSE>(`/stats/periode?debut=${debut}&fin=${fin}`),
};

// Services pour les actions correctives
export const actionCorrectiveService = {
  getAll: () => api.get('/actions-correctives'),
  getByStatut: (statut: string) => api.get(`/actions-correctives/statut/${statut}`),
  getEnRetard: () => api.get('/actions-correctives/retard'),
  update: (id: string, data: any) => api.put(`/actions-correctives/${id}`, data),
};

// Services pour les exports
export const exportService = {
  exportAudits: (format: 'pdf' | 'excel' | 'csv') => 
    api.get(`/exports/audits?format=${format}`, { responseType: 'blob' }),
  exportIncidents: (format: 'pdf' | 'excel' | 'csv') => 
    api.get(`/exports/incidents?format=${format}`, { responseType: 'blob' }),
  exportRisques: (format: 'pdf' | 'excel' | 'csv') => 
    api.get(`/exports/risques?format=${format}`, { responseType: 'blob' }),
  exportFormations: (format: 'pdf' | 'excel' | 'csv') => 
    api.get(`/exports/formations?format=${format}`, { responseType: 'blob' }),
  exportConformites: (format: 'pdf' | 'excel' | 'csv') => 
    api.get(`/exports/conformites?format=${format}`, { responseType: 'blob' }),
  exportRapportComplet: (format: 'pdf' | 'excel') => 
    api.get(`/exports/rapport-complet?format=${format}`, { responseType: 'blob' }),
};

// Services pour les notifications
export const notificationService = {
  getNotifications: () => api.get('/notifications'),
  marquerCommeLue: (id: string) => api.put(`/notifications/${id}/lue`),
  marquerToutesCommeLues: () => api.put('/notifications/toutes-lues'),
  configurerAlertes: (config: any) => api.post('/notifications/config', config),
};

// Services pour la configuration
export const configService = {
  getConfig: () => api.get('/config'),
  updateConfig: (section: string, data: any) => api.put('/config', { section, data }),
  getParametres: () => api.get('/config/parametres'),
  updateParametres: (data: any) => api.put('/config/parametres', data),
  getReglementations: () => api.get('/config/reglementations'),
  exportConfig: (format: string = 'json') => api.get(`/config/export?format=${format}`),
  importConfig: (configData: any) => api.post('/config/import', { configData }),
  createBackup: (configData: any) => api.post('/config/backup', configData),
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

// ==================== Services STATISTIQUES ====================

interface DashboardStats {
  audits: {
    total: number;
    planifies: number;
    enCours: number;
    termines: number;
  };
  incidents: {
    total: number;
    critiques: number;
    enCours: number;
    resolus: number;
  };
  risques: {
    total: number;
    critiques: number;
    eleves: number;
    moderes: number;
  };
  formations: {
    total: number;
    planifiees: number;
    enCours: number;
    terminees: number;
  };
  conformites: {
    total: number;
    conformes: number;
    nonConformes: number;
    aEvaluer: number;
  };
  securite: {
    score: number;
    evolution: number;
  };
  actions: {
    enRetard: number;
    aTraiter: number;
  };
}

interface DashboardData {
  auditsRecents: Audit[];
  incidentsRecents: Incident[];
}

export const statsService = {
  // Obtenir les statistiques globales
  getStats: (): Promise<{ data: DashboardStats }> => {
    console.log('📊 Récupération des statistiques QHSE...');
    return api.get('/stats');
  },

  // Obtenir les données du dashboard
  getDashboard: (params: { limit?: number } = {}): Promise<{ data: DashboardData }> => {
    console.log('📈 Récupération des données du dashboard...');
    return api.get('/dashboard', { params });
  }
};

export default api; 