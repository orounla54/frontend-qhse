// Types d'audits
export const AUDIT_TYPES = [
  'Interne',
  'Externe',
  'Certification',
  'Surveillance',
  'Suivi'
] as const;

// Domaines d'audits
export const AUDIT_DOMAINS = [
  'Qualité',
  'Sécurité',
  'Environnement',
  'Hygiène',
  'Mixte'
] as const;

// Statuts d'audits
export const AUDIT_STATUS = [
  'Planifié',
  'En cours',
  'Terminé',
  'Annulé',
  'Reporté'
] as const;

// Types d'incidents
export const INCIDENT_TYPES = [
  'Accident',
  'Incident',
  'Presqu\'accident',
  'Maladie'
] as const;

// Niveaux de gravité
export const GRAVITY_LEVELS = [
  'Légère',
  'Modérée',
  'Grave',
  'Critique'
] as const;

// Statuts d'incidents
export const INCIDENT_STATUS = [
  'Déclaré',
  'En cours d\'investigation',
  'En cours de traitement',
  'Résolu',
  'Clôturé'
] as const;

// Types de risques
export const RISK_TYPES = [
  'Sécurité',
  'Qualité',
  'Environnement',
  'Hygiène',
  'Santé',
  'Mixte'
] as const;

// Catégories de risques
export const RISK_CATEGORIES = [
  'Chimique',
  'Biologique',
  'Physique',
  'Ergonomique',
  'Psychosocial',
  'Environnemental'
] as const;

// Niveaux de probabilité
export const PROBABILITY_LEVELS = [
  'Très faible',
  'Faible',
  'Modérée',
  'Élevée',
  'Très élevée'
] as const;

// Niveaux de risque
export const RISK_LEVELS = [
  'Très faible',
  'Faible',
  'Modéré',
  'Élevé',
  'Très élevé'
] as const;

// Types de formations
export const FORMATION_TYPES = [
  'Sécurité',
  'Qualité',
  'Environnement',
  'Hygiène',
  'Santé',
  'Mixte'
] as const;

// Catégories de formations
export const FORMATION_CATEGORIES = [
  'Formation initiale',
  'Continue',
  'Recyclage',
  'Spécifique',
  'Sensibilisation'
] as const;

// Lieux de formation
export const FORMATION_LOCATIONS = [
  'Interne',
  'Externe',
  'Virtuel'
] as const;

// Types de conformité
export const CONFORMITY_TYPES = [
  'Législation',
  'Réglementation',
  'Norme',
  'Certification',
  'Accréditation',
  'Autorisation'
] as const;

// Statuts de conformité
export const CONFORMITY_STATUS = [
  'Conforme',
  'Non conforme',
  'En cours de mise en conformité',
  'Non applicable',
  'À évaluer'
] as const;

// Niveaux de conformité
export const CONFORMITY_LEVELS = [
  'Exemplaire',
  'Bon',
  'Acceptable',
  'Insuffisant',
  'Critique'
] as const;

// Statuts d'actions correctives
export const ACTION_STATUS = [
  'En cours',
  'Terminé',
  'En retard',
  'Annulé'
] as const;

// Formats d'export
export const EXPORT_FORMATS = [
  'pdf',
  'excel',
  'csv'
] as const;

// Configuration des tableaux
export const TABLE_CONFIG = {
  pageSize: 10,
  pageSizeOptions: [5, 10, 20, 50],
  maxPageSize: 100,
} as const;

// Configuration des graphiques
export const CHART_CONFIG = {
  colors: [
    '#14b8a6', // teal-500
    '#f59e0b', // amber-500
    '#ef4444', // red-500
    '#8b5cf6', // violet-500
    '#06b6d4', // cyan-500
    '#84cc16', // lime-500
    '#f97316', // orange-500
    '#ec4899', // pink-500
  ],
  height: 300,
} as const;

// Configuration des notifications
export const NOTIFICATION_CONFIG = {
  duration: 5000,
  position: 'top-right',
} as const;

// Configuration des exports
export const EXPORT_CONFIG = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  supportedFormats: ['pdf', 'excel', 'csv'],
  defaultFormat: 'pdf',
} as const;

// Configuration de l'API
export const API_CONFIG = {
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000,
} as const;

// Messages d'erreur
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Erreur de connexion réseau',
  UNAUTHORIZED: 'Accès non autorisé',
  FORBIDDEN: 'Accès interdit',
  NOT_FOUND: 'Ressource non trouvée',
  VALIDATION_ERROR: 'Erreur de validation des données',
  SERVER_ERROR: 'Erreur interne du serveur',
  UNKNOWN_ERROR: 'Erreur inconnue',
} as const;

// Messages de succès
export const SUCCESS_MESSAGES = {
  CREATED: 'Élément créé avec succès',
  UPDATED: 'Élément mis à jour avec succès',
  DELETED: 'Élément supprimé avec succès',
  SAVED: 'Données sauvegardées avec succès',
  EXPORTED: 'Export réalisé avec succès',
} as const;

// Validation des formulaires
export const VALIDATION_RULES = {
  required: 'Ce champ est obligatoire',
  email: 'Format d\'email invalide',
  minLength: (min: number) => `Minimum ${min} caractères requis`,
  maxLength: (max: number) => `Maximum ${max} caractères autorisés`,
  minValue: (min: number) => `Valeur minimum : ${min}`,
  maxValue: (max: number) => `Valeur maximum : ${max}`,
  positiveNumber: 'Veuillez saisir un nombre positif',
  futureDate: 'La date doit être dans le futur',
  pastDate: 'La date doit être dans le passé',
} as const; 