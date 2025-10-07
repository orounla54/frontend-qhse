// Configuration de l'API
export const API_CONFIG = {
  // Mode développement - utilise des données mockées
  MOCK_MODE: true,
  
  // URL de l'API backend
  BASE_URL: (import.meta as any).env?.VITE_API_URL || 'https://backend-qhse.vercel.app',
  
  // Timeout pour les requêtes
  TIMEOUT: 5000,
  
  // Retry configuration
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000
};

// Fonction pour vérifier si l'API est disponible
export const isApiAvailable = async (): Promise<boolean> => {
  if (API_CONFIG.MOCK_MODE) {
    return false;
  }
  
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/test`, {
      method: 'GET',
      timeout: API_CONFIG.TIMEOUT
    });
    
    return response.ok && response.headers.get('content-type')?.includes('application/json');
  } catch (error) {
    console.warn('🔧 API non disponible, utilisation du mode mock:', error);
    return false;
  }
};

// Fonction pour obtenir l'URL de l'API
export const getApiUrl = (): string => {
  return API_CONFIG.BASE_URL;
};

// Fonction pour vérifier si on doit utiliser les données mockées
export const shouldUseMockData = (): boolean => {
  return API_CONFIG.MOCK_MODE;
};
