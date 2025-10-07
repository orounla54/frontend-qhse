// Utilitaire pour tester les routes du module Qualité
export const QUALITE_ROUTES = {
  // Routes principales
  '/qualite': 'qualite',
  '/qualite/matieres-premieres': 'qualite-matieres-premieres',
  '/qualite/controles-qualite': 'qualite-controles-qualite',
  '/qualite/non-conformites': 'qualite-non-conformites',
  '/qualite/decisions-qualite': 'qualite-decisions-qualite',
  '/qualite/plans-controle': 'qualite-plans-controle',
  '/qualite/tracabilite': 'qualite-tracabilite',
  '/qualite/audits': 'qualite-audits',
  '/qualite/conformite': 'qualite-conformite',
  '/qualite/statistiques': 'qualite-statistiques'
};

// Onglets correspondants dans le composant Qualite
export const QUALITE_TABS = [
  { id: 'matieres-premieres', label: 'Matières Premières' },
  { id: 'controles-qualite', label: 'Contrôles Qualité' },
  { id: 'non-conformites', label: 'Non-Conformités' },
  { id: 'decisions-qualite', label: 'Décisions Qualité' },
  { id: 'plans-controle', label: 'Plans de Contrôle' },
  { id: 'tracabilite', label: 'Traçabilité' },
  { id: 'audits', label: 'Audits' },
  { id: 'conformite', label: 'Conformité' },
  { id: 'statistiques', label: 'Statistiques' }
];

// Fonction pour valider qu'une route correspond à un onglet
export const validateQualiteRoute = (path: string): boolean => {
  return Object.keys(QUALITE_ROUTES).includes(path);
};

// Fonction pour obtenir l'onglet actif basé sur l'URL
export const getActiveTabFromPath = (path: string): string => {
  if (path === '/qualite' || path === '/qualite/') {
    return 'matieres-premieres'; // Onglet par défaut
  }
  
  const route = Object.entries(QUALITE_ROUTES).find(([routePath]) => routePath === path);
  if (route) {
    return route[1].replace('qualite-', '');
  }
  
  return 'matieres-premieres'; // Fallback
};
