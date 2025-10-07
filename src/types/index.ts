// Types pour les audits
export interface Audit {
  _id: string;
  numero: string;
  titre: string;
  type: 'Interne' | 'Externe' | 'Certification' | 'Surveillance' | 'Suivi';
  domaine: 'Qualité' | 'Sécurité' | 'Environnement' | 'Hygiène' | 'Mixte';
  statut: 'Planifié' | 'En cours' | 'Terminé' | 'Annulé' | 'Reporté';
  auditeurPrincipal: string;
  auditeurs: string[];
  dateDebut: Date;
  dateFin: Date;
  resultats?: {
    score: number;
    conclusion: string;
    constatations: string[];
  };
  actionsCorrectives: ActionCorrective[];
  createdAt: Date;
  updatedAt: Date;
}

// Types pour les incidents
export interface Incident {
  _id: string;
  numero: string;
  titre: string;
  type: 'Accident' | 'Incident' | 'Presqu\'accident' | 'Maladie';
  gravite: 'Légère' | 'Modérée' | 'Grave' | 'Critique';
  statut: 'Déclaré' | 'En cours d\'investigation' | 'En cours de traitement' | 'Résolu' | 'Clôturé';
  dateIncident: Date;
  localisation: {
    batiment: string;
    etage?: string;
    zone: string;
  };
  declarant: string;
  personnesImpliquees: string[];
  impacts: {
    humains: { blesses: number; deces: number };
    materiels: { degats: string; coutEstime: number };
    environnementaux: { pollution: string; impact: string };
  };
  actionsCorrectives: ActionCorrective[];
  createdAt: Date;
  updatedAt: Date;
}

// Types pour les risques
export interface Risque {
  _id: string;
  numero: string;
  titre: string;
  type: 'Sécurité' | 'Qualité' | 'Environnement' | 'Hygiène' | 'Santé' | 'Mixte';
  categorie: 'Chimique' | 'Biologique' | 'Physique' | 'Ergonomique' | 'Psychosocial' | 'Environnemental';
  probabilite: 'Très faible' | 'Faible' | 'Modérée' | 'Élevée' | 'Très élevée';
  gravite: 'Négligeable' | 'Faible' | 'Modérée' | 'Élevée' | 'Critique';
  niveauRisque: 'Très faible' | 'Faible' | 'Modéré' | 'Élevé' | 'Très élevé';
  scoreRisque: number;
  localisation: {
    batiment: string;
    zone: string;
  };
  personnesExposees: string[];
  mesuresExistentes: string[];
  mesuresCorrectives: ActionCorrective[];
  createdAt: Date;
  updatedAt: Date;
}

// Types pour les formations
export interface Formation {
  _id: string;
  numero: string;
  titre: string;
  type: 'Sécurité' | 'Qualité' | 'Environnement' | 'Hygiène' | 'Santé' | 'Mixte';
  categorie: 'Formation initiale' | 'Continue' | 'Recyclage' | 'Spécifique' | 'Sensibilisation';
  datePlanification: Date;
  duree: number;
  lieu: 'Interne' | 'Externe' | 'Virtuel';
  formateur: {
    nom: string;
    specialite: string;
    organisme: string;
  };
  participants: string[];
  couts: {
    formation: number;
    materiel: number;
    deplacement: number;
    hebergement: number;
    total: number;
  };
  evaluationFormation?: {
    note: number;
    commentaires: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Types pour la conformité
export interface Conformite {
  _id: string;
  numero: string;
  titre: string;
  type: 'Législation' | 'Réglementation' | 'Norme' | 'Certification' | 'Accréditation' | 'Autorisation';
  domaine: 'Sécurité' | 'Qualité' | 'Environnement' | 'Hygiène' | 'Santé' | 'Mixte';
  reference: {
    norme: string;
    version: string;
    organisme: string;
  };
  obligations: string[];
  statutConformite: 'Conforme' | 'Non conforme' | 'En cours de mise en conformité' | 'Non applicable' | 'À évaluer';
  niveauConformite: 'Exemplaire' | 'Bon' | 'Acceptable' | 'Insuffisant' | 'Critique';
  scoreConformite: number;
  actionsConformite: ActionCorrective[];
  certifications: Certification[];
  createdAt: Date;
  updatedAt: Date;
}

// Types communs
export interface ActionCorrective {
  _id?: string;
  description: string;
  responsable: string;
  dateEcheance: Date;
  statut: 'En cours' | 'Terminé' | 'En retard' | 'Annulé';
  dateRealisation?: Date;
  commentaires?: string;
}

export interface Certification {
  _id?: string;
  nom: string;
  organisme: string;
  dateObtention: Date;
  dateExpiration: Date;
  statut: 'Valide' | 'Expirée' | 'En cours de renouvellement';
}

// Types pour les statistiques
export interface StatistiquesQHSE {
  audits: {
    total: number;
    parStatut: Record<string, number>;
    parType: Record<string, number>;
  };
  incidents: {
    total: number;
    parGravite: Record<string, number>;
    parType: Record<string, number>;
  };
  risques: {
    total: number;
    parNiveau: Record<string, number>;
    parCategorie: Record<string, number>;
  };
  formations: {
    total: number;
    planifiees: number;
    terminees: number;
  };
  conformites: {
    total: number;
    conformes: number;
    nonConformes: number;
  };
}

// Types pour les formulaires
export interface AuditFormData {
  titre: string;
  type: string;
  domaine: string;
  auditeurPrincipal: string;
  auditeurs: string[];
  dateDebut: string;
  dateFin: string;
}

export interface IncidentFormData {
  titre: string;
  type: string;
  gravite: string;
  dateIncident: string;
  localisation: {
    batiment: string;
    etage: string;
    zone: string;
  };
  declarant: string;
  personnesImpliquees: string[];
  impacts: {
    humains: { blesses: number; deces: number };
    materiels: { degats: string; coutEstime: number };
    environnementaux: { pollution: string; impact: string };
  };
}

export interface RisqueFormData {
  titre: string;
  type: string;
  categorie: string;
  probabilite: string;
  gravite: string;
  localisation: {
    batiment: string;
    zone: string;
  };
  personnesExposees: string[];
  mesuresExistentes: string[];
}

export interface FormationFormData {
  titre: string;
  type: string;
  categorie: string;
  datePlanification: string;
  duree: number;
  lieu: string;
  formateur: {
    nom: string;
    specialite: string;
    organisme: string;
  };
  participants: string[];
  couts: {
    formation: number;
    materiel: number;
    deplacement: number;
    hebergement: number;
  };
}

export interface ConformiteFormData {
  titre: string;
  type: string;
  domaine: string;
  reference: {
    norme: string;
    version: string;
    organisme: string;
  };
  obligations: string[];
  statutConformite: string;
  niveauConformite: string;
} 