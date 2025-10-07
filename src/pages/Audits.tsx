'use client'

import { useState, useEffect, useMemo } from 'react'
import { 
  FileText, 
  Users, 
  Calendar, 
  Clock, 
  Plus, 
  Search, 
  CheckCircle,
  TrendingUp,
  Activity,
  Target,
  Filter,
  X
} from 'lucide-react'
import { ViewModal, DeleteConfirmModal, InfoSection, InfoField, ActionButtons } from '../components/common'
import ModalAudit from '../components/features/ModalAudit'
import { auditService } from '../services/api'

// Interfaces TypeScript
interface Audit {
  _id: string;
  numero: string;
  titre: string;
  description: string;
  type: string;
  domaine: string;
  statut: string;
  priorite: string;
  datePlanification: string;
  dateDebut: string;
  dateFin: string;
  dureeEstimee: number;
  auditeurPrincipal: {
    nom: string;
    prenom: string;
  } | string;
  auditeurs: Array<{
    auditeur: {
      nom: string;
      prenom: string;
    };
    role: string;
  }>;
  resultats: {
    score: number;
    conclusion: string;
    constatations: Array<{
      description: string;
      type: string;
      priorite: string;
      responsable: {
        nom: string;
        prenom: string;
      };
      dateEcheance: string;
      statut: string;
    }>;
  };
  actionsCorrectives: Array<{
    description: string;
    type: string;
    priorite: string;
    responsable: {
      nom: string;
      prenom: string;
    };
    dateEcheance: string;
    statut: string;
  }>;
  createdBy: {
    nom: string;
    prenom: string;
  };
}

interface Stats {
  total: number;
  parStatut: {
    Planifié: number;
    'En cours': number;
    Terminé: number;
    Annulé: number;
  };
  parType: {
    Interne: number;
    Externe: number;
    Certification: number;
    Surveillance: number;
    Suivi: number;
  };
  scoreMoyen: number;
  enRetard: number;
}

export default function AuditsPage() {
  const [audits, setAudits] = useState<Audit[]>([
    // Données d'exemple pour tester
    {
      _id: '1',
      numero: 'AUD-2024-001',
      titre: 'Audit Qualité Processus Production',
      description: 'Audit de conformité des processus de production selon ISO 9001',
      type: 'Interne',
      domaine: 'Qualité',
      statut: 'Planifié',
      priorite: 'Élevée',
      datePlanification: '2024-02-15',
      dateDebut: '2024-02-15',
      dateFin: '2024-02-16',
      dureeEstimee: 16,
      auditeurPrincipal: {
        nom: 'Dupont',
        prenom: 'Marie'
      },
      auditeurs: [
        {
          auditeur: {
            nom: 'Martin',
            prenom: 'Pierre'
          },
          role: 'Auditeur adjoint'
        }
      ],
      resultats: {
        score: 0,
        conclusion: '',
        constatations: []
      },
      actionsCorrectives: [],
      createdBy: {
        nom: 'Admin',
        prenom: 'QHSE'
      }
    },
    {
      _id: '2',
      numero: 'AUD-2024-002',
      titre: 'Audit Sécurité Environnement',
      description: 'Audit de sécurité et environnement selon ISO 14001 et OHSAS 18001',
      type: 'Externe',
      domaine: 'Mixte',
      statut: 'En cours',
      priorite: 'Critique',
      datePlanification: '2024-02-10',
      dateDebut: '2024-02-10',
      dateFin: '2024-02-12',
      dureeEstimee: 24,
      auditeurPrincipal: {
        nom: 'Bernard',
        prenom: 'Sophie'
      },
      auditeurs: [
        {
          auditeur: {
            nom: 'Leroy',
            prenom: 'Jean'
          },
          role: 'Expert sécurité'
        }
      ],
      resultats: {
        score: 75,
        conclusion: 'Conformité générale avec quelques points d\'amélioration',
        constatations: [
          {
            description: 'Formation sécurité à renforcer',
            type: 'Observation',
            priorite: 'Moyenne',
            responsable: {
              nom: 'Durand',
              prenom: 'Paul'
            },
            dateEcheance: '2024-03-15',
            statut: 'À traiter'
          }
        ]
      },
      actionsCorrectives: [
        {
          description: 'Mise en place d\'un plan de formation sécurité',
          type: 'Corrective',
          priorite: 'Moyenne',
          responsable: {
            nom: 'Durand',
            prenom: 'Paul'
          },
          dateEcheance: '2024-03-15',
          statut: 'En cours'
        }
      ],
      createdBy: {
        nom: 'Admin',
        prenom: 'QHSE'
      }
    }
  ])
  const [stats, setStats] = useState<Stats>({
    total: 2,
    parStatut: {
      Planifié: 1,
      'En cours': 1,
      Terminé: 0,
      Annulé: 0
    },
    parType: {
      Interne: 1,
      Externe: 1,
      Certification: 0,
      Surveillance: 0,
      Suivi: 0
    },
    scoreMoyen: 75,
    enRetard: 0
  })
  const [loading, setLoading] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState('mois')
  const [filters, setFilters] = useState({
    statut: '',
    type: '',
    domaine: ''
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedAudit, setSelectedAudit] = useState<Audit | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [auditToDelete, setAuditToDelete] = useState<Audit | null>(null)

  // Charger les données au montage du composant
  useEffect(() => {
    fetchData()
  }, [selectedPeriod, filters])

  // Fonction pour récupérer les données depuis l'API
  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Récupérer les audits depuis l'API
      const auditsResponse = await auditService.getAll()
      if (auditsResponse.data) {
        const auditsArray = Array.isArray(auditsResponse.data) ? auditsResponse.data : (auditsResponse.data as any).audits || []
        setAudits(auditsArray)
      }
      
      // Calculer les stats localement en attendant l'API stats
      const auditsData = auditsResponse.data ? (Array.isArray(auditsResponse.data) ? auditsResponse.data : (auditsResponse.data as any).audits || []) : []
      const statsCalculated = {
        total: auditsData.length,
        parStatut: {
          Planifié: auditsData.filter((a: Audit) => a.statut === 'Planifié').length,
          'En cours': auditsData.filter((a: Audit) => a.statut === 'En cours').length,
          Terminé: auditsData.filter((a: Audit) => a.statut === 'Terminé').length,
          Annulé: auditsData.filter((a: Audit) => a.statut === 'Annulé').length
        },
        parType: {
          Interne: auditsData.filter((a: Audit) => a.type === 'Interne').length,
          Externe: auditsData.filter((a: Audit) => a.type === 'Externe').length,
          Certification: auditsData.filter((a: Audit) => a.type === 'Certification').length,
          Surveillance: auditsData.filter((a: Audit) => a.type === 'Surveillance').length,
          Suivi: auditsData.filter((a: Audit) => a.type === 'Suivi').length
        },
        scoreMoyen: auditsData.reduce((acc: number, a: Audit) => acc + (a.resultats?.score || 0), 0) / (auditsData.length || 1),
        enRetard: 0 // À calculer selon la logique métier
      }
      setStats(statsCalculated)
      
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error)
      // En cas d'erreur, utiliser les données par défaut
    } finally {
      setLoading(false)
    }
  }





  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }



  const filteredAudits = useMemo(() => audits.filter(audit =>
    audit.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    audit.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (typeof audit.auditeurPrincipal === 'string' 
      ? false 
      : audit.auditeurPrincipal?.nom?.toLowerCase()?.includes(searchTerm.toLowerCase()) || false)
  ), [audits, searchTerm])

  // Calculer les statistiques de statut en temps réel avec useMemo pour optimiser les performances
  const auditsEnCours = useMemo(() => audits.filter(audit => 
    audit.statut === 'En cours'
  ), [audits])

  // Fonction pour ouvrir le modal
  const openAddModal = () => {
    setIsAddModalOpen(true)
  }

  // Fonction pour fermer le modal
  const closeAddModal = () => {
    setIsAddModalOpen(false)
  }

  // Fonctions pour gérer les actions sur les audits
  const handleViewAudit = (audit: Audit) => {
    setSelectedAudit(audit)
    setIsViewModalOpen(true)
  }

  const handleEditAudit = (audit: Audit) => {
    setSelectedAudit(audit)
    setIsEditModalOpen(true)
  }

  const handleDeleteAudit = (audit: Audit) => {
    setAuditToDelete(audit)
    setShowDeleteConfirm(true)
  }

  const confirmDeleteAudit = async () => {
    if (!auditToDelete) return

    try {
      // Appel API réel pour supprimer l'audit
      await auditService.delete(auditToDelete._id)
      
      // Supprimer l'audit de la liste
      setAudits(prev => prev.filter(audit => audit._id !== auditToDelete._id))
      
      // Mettre à jour les stats
      setStats(prev => ({
        ...prev,
        total: prev.total - 1,
        parStatut: {
          ...prev.parStatut,
          [auditToDelete.statut]: prev.parStatut[auditToDelete.statut as keyof typeof prev.parStatut] - 1
        }
      }))
      
      setShowDeleteConfirm(false)
      setAuditToDelete(null)
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
    }
  }

  const closeViewModal = () => {
    setIsViewModalOpen(false)
    setSelectedAudit(null)
  }

  const closeEditModal = () => {
    setIsEditModalOpen(false)
    setSelectedAudit(null)
  }

  const handleUpdateAudit = async (updatedData: any) => {
    if (!selectedAudit) return

    try {
      // Préparer les données pour l'API
      const auditData = {
        titre: updatedData.titre,
        description: updatedData.description,
        type: updatedData.type,
        domaine: updatedData.domaine,
        priorite: updatedData.priorite,
        datePlanification: updatedData.datePlanification,
        dateDebut: updatedData.dateDebut,
        dateFin: updatedData.dateFin,
        dureeEstimee: updatedData.dureeEstimee,
        auditeurPrincipal: updatedData.auditeurPrincipal,
        auditeurs: updatedData.auditeurs?.map((auditeur: any) => ({
          auditeur: {
            nom: auditeur.nom,
            prenom: auditeur.prenom
          },
          role: auditeur.role
        })) || [],
        resultats: updatedData.resultats,
        actionsCorrectives: updatedData.actionsCorrectives
      }
      
      // Appel API réel pour mettre à jour l'audit
      const response = await auditService.update(selectedAudit._id, auditData)
      
      // Mettre à jour l'audit dans la liste
      if (response.data) {
        setAudits(prev => prev.map(audit => 
          audit._id === selectedAudit._id 
            ? response.data as unknown as Audit
            : audit
        ))
      }
      
      closeEditModal()
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-4 border-blue-500 mx-auto mb-6"></div>
          <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300">Chargement des audits...</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Veuillez patienter pendant que nous récupérons vos données</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header optimisé */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-xl">
                <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Gestion des Audits
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Planification, exécution et suivi des audits QHSE
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="semaine" className="text-gray-900 dark:text-gray-100">Cette semaine</option>
                <option value="mois" className="text-gray-900 dark:text-gray-100">Ce mois</option>
                <option value="trimestre" className="text-gray-900 dark:text-gray-100">Ce trimestre</option>
                <option value="annee" className="text-gray-900 dark:text-gray-100">Cette année</option>
              </select>
              
              <button 
                onClick={openAddModal}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg flex items-center space-x-2 transition-all duration-200 shadow-sm hover:shadow-md"
                data-action="add-audit"
              >
                <Plus className="w-4 h-4" />
                <span className="font-medium">Nouvel Audit</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-8">
        {/* Statistiques optimisées */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Audits</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats?.total || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-green-600 dark:text-green-400">
              <TrendingUp className="w-4 h-4 mr-1" />
              <span>+12% ce mois</span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">En Cours</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {auditsEnCours.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-orange-600 dark:text-orange-400">
              <Clock className="w-4 h-4 mr-1" />
              <span>En cours d'exécution</span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Planifiés</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats?.parStatut?.Planifié || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-yellow-600 dark:text-yellow-400">
              <Clock className="w-4 h-4 mr-1" />
              <span>À venir</span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Terminés</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats?.parStatut?.Terminé || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-green-600 dark:text-green-400">
              <CheckCircle className="w-4 h-4 mr-1" />
              <span>Complétés</span>
            </div>
          </div>
        </div>

        {/* Filtres et recherche optimisés */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Rechercher par titre, numéro, auditeur..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white w-64"
                />
              </div>
              
              <select
                value={filters.statut}
                onChange={(e) => setFilters(prev => ({ ...prev, statut: e.target.value }))}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="">Tous les statuts</option>
                <option value="Planifié">Planifié</option>
                <option value="En cours">En cours</option>
                <option value="Terminé">Terminé</option>
                <option value="Annulé">Annulé</option>
              </select>
              
              <select
                value={filters.type}
                onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="">Tous les types</option>
                <option value="Interne">Interne</option>
                <option value="Externe">Externe</option>
                <option value="Certification">Certification</option>
                <option value="Surveillance">Surveillance</option>
                <option value="Suivi">Suivi</option>
              </select>
              
              <select
                value={filters.domaine}
                onChange={(e) => setFilters(prev => ({ ...prev, domaine: e.target.value }))}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="">Tous les domaines</option>
                <option value="Qualité">Qualité</option>
                <option value="Sécurité">Sécurité</option>
                <option value="Environnement">Environnement</option>
                <option value="Santé">Santé</option>
                <option value="Intégré">Intégré QHSE</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setFilters({ statut: '', type: '', domaine: '' })}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
              >
                <Filter className="w-4 h-4 mr-2" />
                Effacer
              </button>
            </div>
          </div>
        </div>

        {/* Tableau des audits optimisé */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Liste des Audits ({filteredAudits.length})
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Audit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Type & Domaine
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Statut & Priorité
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Dates
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Auditeur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredAudits.map((audit) => (
                  <tr key={audit._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">
                          {audit.numero}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate">
                          {audit.titre}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          {audit.type}
                        </div>
                        <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                          {audit.domaine}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            audit.statut === 'Planifié' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                            audit.statut === 'En cours' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                            audit.statut === 'Terminé' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                            'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}>
                            {audit.statut}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            audit.priorite === 'Critique' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                            audit.priorite === 'Élevée' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                            audit.priorite === 'Moyenne' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                            'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          }`}>
                            {audit.priorite}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3 text-gray-400" />
                          <span>Planifié: {new Date(audit.datePlanification).toLocaleDateString()}</span>
                        </div>
                        {audit.dateDebut && (
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3 text-gray-400" />
                            <span>Début: {new Date(audit.dateDebut).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                            {typeof audit.auditeurPrincipal === 'string' 
                              ? 'U' 
                              : audit.auditeurPrincipal 
                                ? `${audit.auditeurPrincipal.prenom.charAt(0)}${audit.auditeurPrincipal.nom.charAt(0)}`
                                : 'N/A'
                            }
                          </span>
                        </div>
                        <div className="text-sm text-gray-900 dark:text-white">
                          {typeof audit.auditeurPrincipal === 'string' 
                            ? 'Utilisateur assigné' 
                            : audit.auditeurPrincipal 
                              ? `${audit.auditeurPrincipal.prenom} ${audit.auditeurPrincipal.nom}`
                              : 'Non assigné'
                          }
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">
                          {audit.resultats?.score || 0}%
                        </div>
                        <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-300 ${
                              (audit.resultats?.score || 0) >= 80 ? 'bg-green-500' :
                              (audit.resultats?.score || 0) >= 60 ? 'bg-yellow-500' :
                              'bg-red-500'
                            }`}
                            style={{ width: `${audit.resultats?.score || 0}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <ActionButtons
                        onView={() => handleViewAudit(audit)}
                        onEdit={() => handleEditAudit(audit)}
                        onDelete={() => handleDeleteAudit(audit)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredAudits.length === 0 && (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FileText className="w-12 h-12 text-gray-400 dark:text-gray-500" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Aucun audit trouvé</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  {searchTerm || Object.values(filters).some(f => f) 
                    ? 'Aucun audit ne correspond à vos critères de recherche. Essayez de modifier vos filtres.'
                    : 'Commencez par créer votre premier audit en cliquant sur le bouton "Nouvel Audit".'
                  }
                </p>
                {searchTerm || Object.values(filters).some(f => f) ? (
                  <button
                    onClick={() => {
                      setSearchTerm('')
                      setFilters({ statut: '', type: '', domaine: '' })
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors duration-200"
                  >
                    Effacer les filtres
                  </button>
                ) : (
                  <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors duration-200"
                  >
                    Créer un audit
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal d'ajout d'audit utilisant le composant ModalAudit */}
      <ModalAudit
        isOpen={isAddModalOpen}
        onClose={closeAddModal}
        onSubmit={async (auditData) => {
          try {
            // Appel API pour créer l'audit  
            const response = await auditService.create(auditData as any)
            
            if (response.data) {
              // Ajouter le nouvel audit à la liste
              setAudits(prev => [response.data as unknown as Audit, ...prev])
              
              // Mettre à jour les stats
              setStats(prev => ({
                ...prev,
                total: prev.total + 1,
                parStatut: {
                  ...prev.parStatut,
                  [response.data.statut || 'Planifié']: (prev.parStatut[response.data.statut as keyof typeof prev.parStatut] || 0) + 1
                }
              }))
              
              // Fermer le modal
              closeAddModal()
              
              // Recharger les données pour être sûr de la cohérence
              fetchData()
            }
          } catch (error) {
            console.error('Erreur lors de l\'ajout de l\'audit:', error)
          }
        }}
        mode="create"
      />

      {/* Ancien formulaire inline supprimé - remplacé par le composant ModalAudit */}
      {false && isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={closeAddModal}></div>
            <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Nouvel Audit</h3>
                <button
                  onClick={closeAddModal}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <div className="p-6">
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de vue d'audit */}
      <ViewModal
        isOpen={isViewModalOpen}
        onClose={closeViewModal}
        title="Détails de l'Audit"
      >
        {selectedAudit && (
          <div className="space-y-6">
            {/* Informations générales */}
            <InfoSection
              title="Informations Générales"
              gradientFrom="from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20"
              gradientTo=""
              borderColor="border-blue-100 dark:border-blue-800"
              icon={<FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoField label="Numéro" value={selectedAudit.numero} />
                <InfoField label="Titre" value={selectedAudit.titre} />
                <InfoField label="Type" value={selectedAudit.type} />
                <InfoField label="Domaine" value={selectedAudit.domaine} />
                <InfoField 
                  label="Statut" 
                  value={
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      selectedAudit.statut === 'Planifié' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                      selectedAudit.statut === 'En cours' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                      selectedAudit.statut === 'Terminé' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                      'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {selectedAudit.statut}
                    </span>
                  } 
                />
                <InfoField 
                  label="Priorité" 
                  value={
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      selectedAudit.priorite === 'Critique' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                      selectedAudit.priorite === 'Élevée' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                      selectedAudit.priorite === 'Moyenne' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                      'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    }`}>
                      {selectedAudit.priorite}
                    </span>
                  } 
                />
              </div>
              <div className="mt-4">
                <InfoField label="Description" value={selectedAudit.description} />
              </div>
            </InfoSection>

            {/* Planning */}
            <InfoSection
              title="Planning"
              gradientFrom="from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20"
              gradientTo=""
              borderColor="border-green-100 dark:border-green-800"
              icon={<Calendar className="w-5 h-5 text-green-600 dark:text-green-400" />}
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <InfoField label="Date de planification" value={formatDate(selectedAudit.datePlanification)} />
                <InfoField label="Date de début" value={selectedAudit.dateDebut ? formatDate(selectedAudit.dateDebut) : 'Non définie'} />
                <InfoField label="Date de fin" value={selectedAudit.dateFin ? formatDate(selectedAudit.dateFin) : 'Non définie'} />
                <InfoField label="Durée estimée" value={`${selectedAudit.dureeEstimee} heures`} />
              </div>
            </InfoSection>

            {/* Auditeurs */}
            <InfoSection
              title="Auditeurs"
              gradientFrom="from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20"
              gradientTo=""
              borderColor="border-purple-100 dark:border-purple-800"
              icon={<Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoField 
                  label="Auditeur Principal" 
                  value={typeof selectedAudit.auditeurPrincipal === 'string' 
                    ? 'Utilisateur assigné' 
                    : selectedAudit.auditeurPrincipal 
                      ? `${selectedAudit.auditeurPrincipal.prenom} ${selectedAudit.auditeurPrincipal.nom}`
                      : 'Non assigné'
                  } 
                />
                {selectedAudit.auditeurs && selectedAudit.auditeurs.length > 0 && (
                  <InfoField 
                    label="Auditeurs Supplémentaires" 
                    value={selectedAudit.auditeurs.map(a => `${a.auditeur.prenom} ${a.auditeur.nom} (${a.role})`).join(', ')} 
                  />
                )}
              </div>
            </InfoSection>

            {/* Résultats */}
            {selectedAudit.resultats && (
              <InfoSection
                title="Résultats"
                gradientFrom="from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20"
                gradientTo=""
                borderColor="border-orange-100 dark:border-orange-800"
                icon={<Target className="w-5 h-5 text-orange-600 dark:text-orange-400" />}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoField label="Score" value={`${selectedAudit.resultats.score}%`} />
                  <InfoField label="Conclusion" value={selectedAudit.resultats.conclusion || 'Non définie'} />
                </div>
              </InfoSection>
            )}
          </div>
        )}
      </ViewModal>

      {/* Modal d'édition d'audit */}
      <ModalAudit
        isOpen={isEditModalOpen}
        onClose={closeEditModal}
        onSubmit={handleUpdateAudit}
        audit={selectedAudit as any}
        mode="edit"
      />

      {/* Modal de confirmation de suppression */}
      <DeleteConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDeleteAudit}
        title="Confirmer la suppression"
        itemName={auditToDelete?.titre || ''}
        itemType="l'audit"
      />


    </div>
  )
} 