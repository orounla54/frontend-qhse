'use client'

import { useState, useEffect, useMemo } from 'react'
import { 
  GraduationCap, 
  Users, 
  Clock, 
  Plus, 
  Search, 
  AlertTriangle,
  Award,
  TrendingUp,
  User,
  Calendar,
  X
} from 'lucide-react'

import FormInput from '../components/common/FormInput'
import FormButton from '../components/common/FormButton'
import { ViewModal, DeleteConfirmModal, InfoSection, InfoField, ActionButtons } from '../components/common'
import ModalFormation from '../components/features/ModalFormation'
import { formationService } from '../services/api'

// Interfaces TypeScript
interface Formation {
  _id: string;
  numero: string;
  titre: string;
  description: string;
  type: string;
  categorie: string;
  duree: number;
  datePlanification: string;
  dateDebut: string;
  dateFin: string;
  lieu: string;
  salle: string;
  capacite: number;
  statut: string;
  priorite: string;
  formateur: {
    nom: string;
    prenom: string;
    organisme: string;
  };
  participants: Array<{
    employe: {
      nom: string;
      prenom: string;
      matricule: string;
    };
    statut: string;
    evaluation: {
      note: number;
      commentaires: string;
    };
    certificat: {
      numero: string;
      dateEmission: string;
      dateExpiration: string;
      statut: string;
    };
  }>;
  couts: {
    formation: number;
    materiel: number;
    deplacement: number;
    hebergement: number;
    total: number;
  };
  createdBy: {
    nom: string;
    prenom: string;
  };
}

interface Stats {
  total: number;
  parStatut: {
    Planifiée: number;
    'En cours': number;
    Terminée: number;
    Annulée: number;
  };
  parType: {
    Sécurité: number;
    Qualité: number;
    Environnement: number;
    Hygiène: number;
  };
  totalParticipants: number;
  coutsTotal: number;
}

export default function FormationsPage() {
  const [formations, setFormations] = useState<Formation[]>([
    {
      _id: '1',
      numero: 'FOR-2024-001',
      titre: 'Formation Sécurité Incendie',
      description: 'Formation obligatoire sur les consignes de sécurité incendie et utilisation des extincteurs',
      type: 'Sécurité',
      categorie: 'Formation initiale',
      duree: 4,
      datePlanification: '2024-10-15',
      dateDebut: '2024-10-15',
      dateFin: '2024-10-15',
      lieu: 'Salle de formation A',
      salle: 'Salle A',
      capacite: 20,
      statut: 'Terminée',
      priorite: 'Haute',
      formateur: {
        nom: 'Moreau',
        prenom: 'Claire',
        organisme: 'Interne'
      },
      participants: [
        {
          employe: { nom: 'Dupont', prenom: 'Jean', matricule: 'EMP001' },
          statut: 'Terminé',
          evaluation: { note: 18, commentaires: 'Très bon niveau' },
          certificat: {
            numero: 'CERT-SEC-001',
            dateEmission: '2024-10-15',
            dateExpiration: '2025-10-15',
            statut: 'Valide'
          }
        },
        {
          employe: { nom: 'Martin', prenom: 'Sophie', matricule: 'EMP002' },
          statut: 'Terminé',
          evaluation: { note: 16, commentaires: 'Bon niveau' },
          certificat: {
            numero: 'CERT-SEC-002',
            dateEmission: '2024-10-15',
            dateExpiration: '2025-10-15',
            statut: 'Valide'
          }
        }
      ],
      couts: {
        formation: 800,
        materiel: 200,
        deplacement: 0,
        hebergement: 0,
        total: 1000
      },
      createdBy: { nom: 'Bernard', prenom: 'Pierre' }
    },
    {
      _id: '2',
      numero: 'FOR-2024-002',
      titre: 'Formation Qualité ISO 9001',
      description: 'Formation sur les exigences de la norme ISO 9001 et mise en place du système qualité',
      type: 'Qualité',
      categorie: 'Formation continue',
      duree: 16,
      datePlanification: '2024-11-20',
      dateDebut: '2024-11-20',
      dateFin: '2024-11-22',
      lieu: 'Centre de formation externe',
      salle: 'Salle B',
      capacite: 15,
      statut: 'Planifiée',
      priorite: 'Normale',
      formateur: {
        nom: 'Leroy',
        prenom: 'Michel',
        organisme: 'Externe'
      },
      participants: [],
      couts: {
        formation: 2400,
        materiel: 150,
        deplacement: 300,
        hebergement: 600,
        total: 3450
      },
      createdBy: { nom: 'Martin', prenom: 'Sophie' }
    }
  ])
  const [stats, setStats] = useState<Stats | null>({
    total: 2,
    parStatut: {
      Planifiée: 1,
      'En cours': 0,
      Terminée: 1,
      Annulée: 0
    },
    parType: {
      Sécurité: 1,
      Qualité: 1,
      Environnement: 0,
      Hygiène: 0
    },
    totalParticipants: 2,
    coutsTotal: 4450
  })
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState('mois')
  const [filters, setFilters] = useState({
    statut: '',
    type: '',
    categorie: ''
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedFormation, setSelectedFormation] = useState<Formation | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [formationToDelete, setFormationToDelete] = useState<Formation | null>(null)
  
  // Form state
  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    type: '',
    domaine: '',
    niveau: '',
    duree: '',
    datePlanification: '',
    dateDebut: '',
    dateFin: '',
    formateurNom: '',
    formateurPrenom: '',
    lieu: '',
    salle: '',
    capacite: ''
  })

  useEffect(() => {
    fetchData()
  }, [selectedPeriod, filters])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Récupérer les formations depuis l'API
      const formationsResponse = await formationService.getAll()
      if (formationsResponse.data) {
        setFormations(formationsResponse.data.formations || formationsResponse.data)
      }
      
      // Calculer les stats localement en attendant l'API stats
      const formationsData = formationsResponse.data.formations || formationsResponse.data || []
      const statsCalculated = {
        total: formationsData.length,
        planifiees: formationsData.filter((f: Formation) => f.statut === 'Planifiée').length,
        enCours: formationsData.filter((f: Formation) => f.statut === 'En cours').length,
        terminees: formationsData.filter((f: Formation) => f.statut === 'Terminée').length,
        expirantes: formationsData.filter((f: Formation) => {
          if (!f.dateFin) return false
          const finDate = new Date(f.dateFin)
          const maintenant = new Date()
          const dans30Jours = new Date()
          dans30Jours.setDate(maintenant.getDate() + 30)
          return finDate <= dans30Jours && f.statut !== 'Terminée'
        }).length,
        parType: {
          Sécurité: formationsData.filter((f: Formation) => f.type === 'Sécurité').length,
          Qualité: formationsData.filter((f: Formation) => f.type === 'Qualité').length,
          Environnement: formationsData.filter((f: Formation) => f.type === 'Environnement').length,
          Hygiène: formationsData.filter((f: Formation) => f.type === 'Hygiène').length
        },
        totalParticipants: formationsData.reduce((acc: number, f: Formation) => 
          acc + (f.participants?.length || 0), 0),
        coutsTotal: formationsData.reduce((acc: number, f: Formation) => 
          acc + (f.couts?.cout || 0), 0)
      }
      setStats(statsCalculated)
      
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error)
      // En cas d'erreur, garder les données par défaut
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

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'Planifiée': return 'text-blue-600 bg-blue-50'
      case 'En cours': return 'text-orange-600 bg-orange-50'
      case 'Terminée': return 'text-green-600 bg-green-50'
      case 'Annulée': return 'text-red-600 bg-red-50'
      case 'Reportée': return 'text-yellow-600 bg-yellow-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Sécurité': return 'text-red-600 bg-red-50'
      case 'Qualité': return 'text-blue-600 bg-blue-50'
      case 'Environnement': return 'text-green-600 bg-green-50'
      case 'Hygiène': return 'text-purple-600 bg-purple-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getPrioriteColor = (priorite: string) => {
    switch (priorite) {
      case 'Critique': return 'text-red-600 bg-red-50'
      case 'Haute': return 'text-orange-600 bg-orange-50'
      case 'Normale': return 'text-blue-600 bg-blue-50'
      case 'Basse': return 'text-green-600 bg-green-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const filteredFormations = useMemo(() => formations.filter(formation =>
    formation.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    formation.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
    formation.formateur.nom.toLowerCase().includes(searchTerm.toLowerCase())
  ), [formations, searchTerm])

  // Calculer les statistiques de statut en temps réel avec useMemo pour optimiser les performances
  const formationsExpirantes = useMemo(() => formations.filter(formation =>
    formation.participants.some(p => 
      p.certificat && new Date(p.certificat.dateExpiration) <= new Date()
    )
  ), [formations])

  const formationsEnCours = useMemo(() => formations.filter(formation => 
    formation.statut === 'En cours'
  ), [formations])

  const formationsPlanifiees = useMemo(() => formations.filter(formation => 
    formation.statut === 'Planifiée'
  ), [formations])
  
  const formationsTerminees = useMemo(() => formations.filter(formation => 
    formation.statut === 'Terminée'
  ), [formations])

  const formationsCritiques = useMemo(() => formations.filter(formation => 
    formation.priorite === 'Critique'
  ), [formations])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      // Préparer les données pour l'API
      const formationData = {
        titre: formData.titre,
        description: formData.description,
        type: formData.type,
        categorie: formData.domaine,
        duree: parseInt(formData.duree) || 0,
        datePlanification: formData.datePlanification,
        dateDebut: formData.dateDebut,
        dateFin: formData.dateFin,
        lieu: formData.lieu,
        salle: formData.salle || '',
        capacite: parseInt(formData.capacite) || 0,
        statut: 'Planifiée',
        priorite: 'Normale',
        formateur: {
          nom: formData.formateurNom,
          prenom: formData.formateurPrenom,
          specialite: formData.domaine || 'Généraliste',
          organisme: 'Interne'
        },
        participants: [],
        couts: {
          cout: 0,
          devise: 'EUR'
        }
      }
      
      // Appel de l'API réelle pour créer la formation
      const response = await formationService.create(formationData as any)
      
      // Ajouter la nouvelle formation à la liste
      if (response.data) {
        setFormations(prev => [response.data as any, ...prev])
        
        // Mettre à jour les stats
        if (stats) {
          setStats(prev => prev ? {
            ...prev,
            total: prev.total + 1,
            parStatut: {
              ...prev.parStatut,
              [(response.data as any).statut || 'Planifiée']: (prev.parStatut[(response.data as any).statut as keyof typeof prev.parStatut] || 0) + 1
            }
          } : null)
        }
      }
      
      // Afficher le message de succès
      setShowSuccessMessage(true)
      
      // Fermer le modal après un délai
      setTimeout(() => {
        closeAddModal()
      }, 2000)
    } catch (error: any) {
      console.error('Erreur lors de l\'ajout de la formation:', error)
      
      // Afficher les détails de l'erreur du backend
      if (error.response?.data) {
        console.error('Détails de l\'erreur backend:', error.response.data)
        
        const backendError = error.response.data
        const errorMessages = []
        
        if (backendError.message) {
          errorMessages.push(backendError.message)
        }
        
        if (backendError.details && Array.isArray(backendError.details)) {
          backendError.details.forEach((detail: any) => {
            errorMessages.push(`${detail.field}: ${detail.message}`)
          })
        }
        
        if (backendError.error) {
          errorMessages.push(`Erreur: ${backendError.error}`)
        }
        
        setValidationErrors(errorMessages.length > 0 ? errorMessages : ['Erreur lors de la création de la formation. Veuillez réessayer.'])
      } else {
        setValidationErrors(['Erreur lors de la création de la formation. Veuillez réessayer.'])
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      titre: '',
      description: '',
      type: '',
      domaine: '',
      niveau: '',
      duree: '',
      datePlanification: '',
      dateDebut: '',
      dateFin: '',
      formateurNom: '',
      formateurPrenom: '',
      lieu: '',
      salle: '',
      capacite: ''
    })
  }

  const clearValidationErrors = () => {
    setValidationErrors([])
  }

  const openAddModal = () => {
    setIsAddModalOpen(true)
    clearValidationErrors()
    setShowSuccessMessage(false)
  }

  const closeAddModal = () => {
    setIsAddModalOpen(false)
    clearValidationErrors()
    setShowSuccessMessage(false)
    resetForm()
  }

  // Fonctions pour gérer les actions sur les formations
  const handleViewFormation = (formation: Formation) => {
    setSelectedFormation(formation)
    setIsViewModalOpen(true)
  }

  const handleEditFormation = (formation: Formation) => {
    setSelectedFormation(formation)
    setIsEditModalOpen(true)
  }

  const handleDeleteFormation = (formation: Formation) => {
    setFormationToDelete(formation)
    setShowDeleteConfirm(true)
  }

  const confirmDeleteFormation = async () => {
    if (!formationToDelete) return

    try {
      // Appel API réel pour supprimer la formation
      await formationService.delete(formationToDelete._id)
      
      // Supprimer la formation de la liste
      setFormations(prev => prev.filter(formation => formation._id !== formationToDelete._id))
      
      // Mettre à jour les stats
      if (stats) {
        setStats(prev => prev ? {
          ...prev,
          total: prev.total - 1,
          parStatut: {
            ...prev.parStatut,
            [formationToDelete.statut]: prev.parStatut[formationToDelete.statut as keyof typeof prev.parStatut] - 1
          }
        } : null)
      }
      
      setShowDeleteConfirm(false)
      setFormationToDelete(null)
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
    }
  }

  const closeViewModal = () => {
    setIsViewModalOpen(false)
    setSelectedFormation(null)
  }

  const closeEditModal = () => {
    setIsEditModalOpen(false)
    setSelectedFormation(null)
  }

  const handleUpdateFormation = async (updatedData: any) => {
    if (!selectedFormation) return

    try {
      // Appel API réel pour mettre à jour la formation
      const response = await formationService.update(selectedFormation._id, updatedData)
      
      // Mettre à jour la formation dans la liste
      if (response.data) {
        setFormations(prev => prev.map(formation => 
          formation._id === selectedFormation._id 
            ? response.data as any
            : formation
        ))
      }
      
      closeEditModal()
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
          <div className="flex justify-between items-center py-8">
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <GraduationCap className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Gestion des Formations
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Planification, organisation et suivi des formations QHSE
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="semaine">Cette semaine</option>
                <option value="mois">Ce mois</option>
                <option value="trimestre">Ce trimestre</option>
                <option value="annee">Cette année</option>
              </select>
              
              <button 
                onClick={() => setIsAddModalOpen(true)}
                className="inline-flex items-center px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-md transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nouvelle Formation
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-10">
        {/* Statistiques optimisées */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Formations</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats?.total || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-green-600 dark:text-green-400">
              <TrendingUp className="w-4 h-4 mr-1" />
              <span>+15% ce mois</span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Participants</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats?.totalParticipants || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-green-600 dark:text-green-400">
              <Users className="w-4 h-4 mr-1" />
              <span>Personnes formées</span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Certificats Expirants</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formationsExpirantes.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-orange-600 dark:text-orange-400">
              <Clock className="w-4 h-4 mr-1" />
              <span>Renouvellement requis</span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Coût Total</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats?.coutsTotal ? `${stats.coutsTotal.toLocaleString()} FCFA` : '0 FCFA'}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                <Award className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-purple-600 dark:text-purple-400">
              <Award className="w-4 h-4 mr-1" />
              <span>Investissement formation</span>
            </div>
          </div>
        </div>

        {/* Filtres et recherche */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6">
          <div className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Rechercher une formation..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <select
                  value={filters.statut}
                  onChange={(e) => setFilters({...filters, statut: e.target.value})}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Tous les statuts</option>
                  <option value="Planifiée">Planifiée</option>
                  <option value="En cours">En cours</option>
                  <option value="Terminée">Terminée</option>
                  <option value="Annulée">Annulée</option>
                  <option value="Reportée">Reportée</option>
                </select>
                
                <select
                  value={filters.type}
                  onChange={(e) => setFilters({...filters, type: e.target.value})}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Tous les types</option>
                  <option value="Sécurité">Sécurité</option>
                  <option value="Qualité">Qualité</option>
                  <option value="Environnement">Environnement</option>
                  <option value="Hygiène">Hygiène</option>
                </select>
                
                <select
                  value={filters.categorie}
                  onChange={(e) => setFilters({...filters, categorie: e.target.value})}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Toutes les catégories</option>
                  <option value="Formation initiale">Formation initiale</option>
                  <option value="Formation continue">Formation continue</option>
                  <option value="Recyclage">Recyclage</option>
                  <option value="Formation spécifique">Formation spécifique</option>
                  <option value="Sensibilisation">Sensibilisation</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Liste des formations */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Liste des Formations ({filteredFormations.length})
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Formation
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Formateur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Planning
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Participants
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredFormations.map((formation) => (
                  <tr key={formation._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {formation.numero}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {formation.titre}
                        </div>
                        <div className="text-xs text-gray-400 dark:text-gray-500">
                          {formation.categorie} • {formation.duree}h
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(formation.type)}`}>
                        {formation.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {formation.formateur.prenom} {formation.formateur.nom}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {formation.formateur.organisme}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {formatDate(formation.datePlanification)}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {formation.lieu} {formation.salle && `• ${formation.salle}`}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-1 text-gray-400" />
                        <span className="text-sm text-gray-900 dark:text-white">
                          {formation.participants.length}/{formation.capacite}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {formation.participants.filter(p => p.statut === 'Terminé').length} terminés
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col space-y-1">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatutColor(formation.statut)}`}>
                          {formation.statut}
                        </span>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPrioriteColor(formation.priorite)}`}>
                          {formation.priorite}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <ActionButtons
                        onView={() => handleViewFormation(formation)}
                        onEdit={() => handleEditFormation(formation)}
                        onDelete={() => handleDeleteFormation(formation)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal d'ajout de formation */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsAddModalOpen(false)}></div>
            <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Nouvelle Formation</h3>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormInput
              label="Titre de la formation"
              name="titre"
              type="text"
              value={formData.titre}
              onChange={handleInputChange}
              placeholder="Titre de la formation"
              required
            />
            
            <FormInput
              label="Type de formation"
              name="type"
              type="select"
              value={formData.type}
              onChange={handleInputChange}
              options={[
                { value: 'Interne', label: 'Interne' },
                { value: 'Externe', label: 'Externe' },
                { value: 'Certification', label: 'Certification' },
                { value: 'Recyclage', label: 'Recyclage' },
                { value: 'Initiale', label: 'Initiale' }
              ]}
              required
            />
            
            <FormInput
              label="Domaine"
              name="domaine"
              type="select"
              value={formData.domaine}
              onChange={handleInputChange}
              options={[
                { value: 'Qualité', label: 'Qualité' },
                { value: 'Sécurité', label: 'Sécurité' },
                { value: 'Environnement', label: 'Environnement' },
                { value: 'Hygiène', label: 'Hygiène' },
                { value: 'Intégré', label: 'Intégré' }
              ]}
              required
            />
            
            <FormInput
              label="Niveau"
              name="niveau"
              type="select"
              value={formData.niveau}
              onChange={handleInputChange}
              options={[
                { value: 'Débutant', label: 'Débutant' },
                { value: 'Intermédiaire', label: 'Intermédiaire' },
                { value: 'Avancé', label: 'Avancé' },
                { value: 'Expert', label: 'Expert' }
              ]}
              required
            />
            
            <FormInput
              label="Durée (heures)"
              name="duree"
              type="number"
              value={formData.duree}
              onChange={handleInputChange}
              placeholder="Durée en heures"
              required
            />
            
            <FormInput
              label="Date de planification"
              name="datePlanification"
              type="date"
              value={formData.datePlanification}
              onChange={handleInputChange}
              required
            />
            
            <FormInput
              label="Date de début"
              name="dateDebut"
              type="date"
              value={formData.dateDebut}
              onChange={handleInputChange}
              required
            />
            
            <FormInput
              label="Date de fin"
              name="dateFin"
              type="date"
              value={formData.dateFin}
              onChange={handleInputChange}
              required
            />
            
            <FormInput
              label="Nom du formateur"
              name="formateurNom"
              type="text"
              value={formData.formateurNom}
              onChange={handleInputChange}
              placeholder="Nom de famille"
              required
            />
            
            <FormInput
              label="Prénom du formateur"
              name="formateurPrenom"
              type="text"
              value={formData.formateurPrenom}
              onChange={handleInputChange}
              placeholder="Prénom"
              required
            />
            
            <FormInput
              label="Lieu"
              name="lieu"
              type="text"
              value={formData.lieu}
              onChange={handleInputChange}
              placeholder="Salle, bâtiment..."
              required
            />
            
            <FormInput
              label="Capacité (participants)"
              name="capacite"
              type="number"
              value={formData.capacite}
              onChange={handleInputChange}
              placeholder="Nombre max de participants"
              required
            />
          </div>
          
          <FormInput
            label="Description de la formation"
            name="description"
            type="textarea"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Objectifs, contenu et méthodologie de la formation..."
            rows={4}
            required
          />
          
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <FormButton
              type="button"
              variant="secondary"
              onClick={() => {
                resetForm()
                setIsAddModalOpen(false)
              }}
            >
              Annuler
            </FormButton>
            <FormButton
              type="submit"
              variant="primary"
              loading={isSubmitting}
            >
              {isSubmitting ? 'Enregistrement...' : 'Enregistrer la formation'}
            </FormButton>
          </div>
        </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de vue de formation */}
      <ViewModal
        isOpen={isViewModalOpen}
        onClose={closeViewModal}
        title="Détails de la Formation"
      >
        {selectedFormation && (
          <div className="space-y-6">
            {/* Informations générales */}
            <InfoSection
              title="Informations Générales"
              gradientFrom="from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20"
              gradientTo=""
              borderColor="border-blue-100 dark:border-blue-800"
              icon={<GraduationCap className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoField label="Numéro" value={selectedFormation.numero} />
                <InfoField label="Titre" value={selectedFormation.titre} />
                <InfoField label="Type" value={selectedFormation.type} />
                <InfoField label="Catégorie" value={selectedFormation.categorie} />
                <InfoField label="Durée" value={`${selectedFormation.duree} heures`} />
                <InfoField label="Capacité" value={`${selectedFormation.capacite} participants`} />
                <InfoField 
                  label="Statut" 
                  value={
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      selectedFormation.statut === 'Planifiée' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                      selectedFormation.statut === 'En cours' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                      selectedFormation.statut === 'Terminée' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                      selectedFormation.statut === 'Annulée' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    }`}>
                      {selectedFormation.statut}
                    </span>
                  } 
                />
                <InfoField 
                  label="Priorité" 
                  value={
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      selectedFormation.priorite === 'Critique' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                      selectedFormation.priorite === 'Haute' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                      selectedFormation.priorite === 'Normale' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                      'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    }`}>
                      {selectedFormation.priorite}
                    </span>
                  } 
                />
              </div>
              <div className="mt-4">
                <InfoField label="Description" value={selectedFormation.description} />
              </div>
            </InfoSection>

            {/* Formateur */}
            <InfoSection
              title="Formateur"
              gradientFrom="from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20"
              gradientTo=""
              borderColor="border-purple-100 dark:border-purple-800"
              icon={<User className="w-5 h-5 text-purple-600 dark:text-purple-400" />}
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <InfoField label="Nom" value={selectedFormation.formateur.nom} />
                <InfoField label="Prénom" value={selectedFormation.formateur.prenom} />
                <InfoField label="Organisme" value={selectedFormation.formateur.organisme} />
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
                <InfoField label="Date de planification" value={formatDate(selectedFormation.datePlanification)} />
                <InfoField label="Date de début" value={formatDate(selectedFormation.dateDebut)} />
                <InfoField label="Date de fin" value={formatDate(selectedFormation.dateFin)} />
              </div>
              <div className="mt-4">
                <InfoField label="Lieu" value={selectedFormation.lieu} />
              </div>
            </InfoSection>

            {/* Participants */}
            <InfoSection
              title="Participants"
              gradientFrom="from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20"
              gradientTo=""
              borderColor="border-orange-100 dark:border-orange-800"
              icon={<Users className="w-5 h-5 text-orange-600 dark:text-orange-400" />}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoField label="Nombre de participants" value={`${selectedFormation.participants.length}/${selectedFormation.capacite}`} />
                <InfoField label="Participants terminés" value={selectedFormation.participants.filter(p => p.statut === 'Terminé').length} />
              </div>
            </InfoSection>
          </div>
        )}
      </ViewModal>

      {/* Modal d'édition de formation */}
      <ModalFormation
        isOpen={isEditModalOpen}
        onClose={closeEditModal}
        onSubmit={handleUpdateFormation}
        formation={selectedFormation as any}
        mode="edit"
      />

      {/* Modal de confirmation de suppression */}
      <DeleteConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDeleteFormation}
        title="Confirmer la suppression"
        itemName={formationToDelete?.titre || ''}
        itemType="la formation"
      />
    </div>
  )
} 