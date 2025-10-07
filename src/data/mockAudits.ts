import { Audit } from '../types';

export const mockAudits: Audit[] = [
  {
    _id: '1',
    numero: 'AUD-2024-001',
    titre: 'Audit Qualité ISO 9001',
    type: 'Certification',
    domaine: 'Qualité',
    statut: 'Planifié',
    auditeurPrincipal: 'Jean Dupont',
    auditeurs: ['Marie Martin', 'Pierre Durand'],
    dateDebut: new Date('2024-03-15'),
    dateFin: new Date('2024-03-20'),
    resultats: {
      score: 85,
      conclusion: 'Audit satisfaisant avec quelques points d\'amélioration',
      constatations: [
        'Documentation bien organisée',
        'Procédures claires et respectées',
        'Formation du personnel à améliorer'
      ]
    },
    actionsCorrectives: [
      {
        description: 'Mettre à jour le plan de formation',
        responsable: 'DRH',
        dateEcheance: new Date('2024-04-30'),
        statut: 'En cours',
        commentaires: 'En attente de validation budgétaire'
      }
    ],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    _id: '2',
    numero: 'AUD-2024-002',
    titre: 'Audit Sécurité HSE',
    type: 'Interne',
    domaine: 'Sécurité',
    statut: 'En cours',
    auditeurPrincipal: 'Sophie Bernard',
    auditeurs: ['Lucas Moreau'],
    dateDebut: new Date('2024-03-10'),
    dateFin: new Date('2024-03-12'),
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20')
  },
  {
    _id: '3',
    numero: 'AUD-2024-003',
    titre: 'Audit Environnement ISO 14001',
    type: 'Surveillance',
    domaine: 'Environnement',
    statut: 'Terminé',
    auditeurPrincipal: 'Claude Dubois',
    auditeurs: ['Anne Leroy'],
    dateDebut: new Date('2024-02-20'),
    dateFin: new Date('2024-02-22'),
    resultats: {
      score: 92,
      conclusion: 'Excellente conformité environnementale',
      constatations: [
        'Gestion des déchets exemplaire',
        'Consommation énergétique optimisée',
        'Formation environnementale complète'
      ]
    },
    actionsCorrectives: [],
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-02-22')
  },
  {
    _id: '4',
    numero: 'AUD-2024-004',
    titre: 'Audit Hygiène et Santé',
    type: 'Interne',
    domaine: 'Hygiène',
    statut: 'Planifié',
    auditeurPrincipal: 'Nathalie Petit',
    auditeurs: ['Thomas Roux'],
    dateDebut: new Date('2024-04-05'),
    dateFin: new Date('2024-04-06'),
    createdAt: new Date('2024-01-25'),
    updatedAt: new Date('2024-01-25')
  },
  {
    _id: '5',
    numero: 'AUD-2024-005',
    titre: 'Audit Mixte QHSE',
    type: 'Externe',
    domaine: 'Mixte',
    statut: 'Annulé',
    auditeurPrincipal: 'Consultant Externe',
    auditeurs: [],
    dateDebut: new Date('2024-03-25'),
    dateFin: new Date('2024-03-27'),
    createdAt: new Date('2024-01-30'),
    updatedAt: new Date('2024-02-15')
  }
];
