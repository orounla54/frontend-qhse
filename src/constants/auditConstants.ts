/**
 * Constantes pour les audits QHSE
 */

export const AUDIT_TYPES = {
  INTERNE: 'Interne',
  EXTERNE: 'Externe',
  CERTIFICATION: 'Certification',
  SURVEILLANCE: 'Surveillance',
  SUIVI: 'Suivi'
} as const;

export const AUDIT_DOMAINS = {
  QUALITE: 'Qualité',
  SECURITE: 'Sécurité',
  ENVIRONNEMENT: 'Environnement',
  HYGIENE: 'Hygiène',
  MIXTE: 'Mixte'
} as const;

export const AUDIT_STATUS = {
  PLANIFIE: 'Planifié',
  EN_COURS: 'En cours',
  TERMINE: 'Terminé',
  ANNULE: 'Annulé',
  REPORTE: 'Reporté'
} as const;

export const AUDIT_STATUS_COLORS = {
  [AUDIT_STATUS.PLANIFIE]: 'default',
  [AUDIT_STATUS.EN_COURS]: 'warning',
  [AUDIT_STATUS.TERMINE]: 'success',
  [AUDIT_STATUS.ANNULE]: 'danger',
  [AUDIT_STATUS.REPORTE]: 'secondary'
} as const;

export const AUDIT_TYPE_COLORS = {
  [AUDIT_TYPES.INTERNE]: 'default',
  [AUDIT_TYPES.EXTERNE]: 'secondary',
  [AUDIT_TYPES.CERTIFICATION]: 'success',
  [AUDIT_TYPES.SURVEILLANCE]: 'warning',
  [AUDIT_TYPES.SUIVI]: 'info'
} as const;

export const AUDIT_SCORE_LEVELS = {
  EXCELLENT: { min: 90, max: 100, label: 'Excellent', color: 'success' },
  BON: { min: 75, max: 89, label: 'Bon', color: 'success' },
  ACCEPTABLE: { min: 60, max: 74, label: 'Acceptable', color: 'warning' },
  INSUFFISANT: { min: 40, max: 59, label: 'Insuffisant', color: 'warning' },
  CRITIQUE: { min: 0, max: 39, label: 'Critique', color: 'danger' }
} as const;

export const ACTION_CORRECTIVE_STATUS = {
  EN_COURS: 'En cours',
  TERMINE: 'Terminé',
  EN_RETARD: 'En retard',
  ANNULE: 'Annulé'
} as const;

export const ACTION_CORRECTIVE_STATUS_COLORS = {
  [ACTION_CORRECTIVE_STATUS.EN_COURS]: 'warning',
  [ACTION_CORRECTIVE_STATUS.TERMINE]: 'success',
  [ACTION_CORRECTIVE_STATUS.EN_RETARD]: 'danger',
  [ACTION_CORRECTIVE_STATUS.ANNULE]: 'secondary'
} as const;

export const AUDIT_FREQUENCIES = {
  ANNUEL: 'Annuel',
  SEMESTRIEL: 'Semestriel',
  TRIMESTRIEL: 'Trimestriel',
  MENSUEL: 'Mensuel',
  PONCTUEL: 'Ponctuel'
} as const;

export const AUDIT_DURATIONS = {
  COURT: { min: 1, max: 3, label: 'Court (1-3 jours)' },
  MOYEN: { min: 4, max: 7, label: 'Moyen (4-7 jours)' },
  LONG: { min: 8, max: 14, label: 'Long (8-14 jours)' },
  TRES_LONG: { min: 15, max: 30, label: 'Très long (15+ jours)' }
} as const;
