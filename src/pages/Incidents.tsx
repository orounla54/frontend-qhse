'use client'

import { useState, useEffect, useMemo } from 'react'
import { 
  AlertCircle, 
  Plus, 
  Search, 
  Calendar,
  MapPin,
  Target,
  Activity,
  CheckCircle,
  AlertTriangle,
  FileText,
  User,
  X
} from 'lucide-react'

import FormInput from '../components/common/FormInput'
import FormButton from '../components/common/FormButton'
import { ViewModal, DeleteConfirmModal, InfoSection, InfoField, ActionButtons } from '../components/common'
import ModalIncident from '../components/features/ModalIncident'
import { incidentService } from '../services/api'

// Interfaces TypeScript
interface Incident {
  _id: string;
  numero: string;
  titre: string;
  description: string;
  type: string;
  gravite: string;
  statut: string;
  dateIncident: string;
  heureIncident: string;
  localisation: {
    zone: string;
    batiment: string;
    etage: string;
  };
  declarant: {
    nom: string;
    prenom: string;
  };
  personnesImpliquees: Array<{
    personne: {
      nom: string;
      prenom: string;
    };
    role: string;
    blessures: string;
  }>;
  impacts: {
    humains: {
      blesses: number;
      deces: number;
    };
    materiels: {
      degats: string;
      coutEstime: number;
    };
    environnementaux: {
      pollution: string;
      impact: string;
    };
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
  parGravite: {
    Légère: number;
    Modérée: number;
    Grave: number;
    Critique: number;
  };
  parType: {
    Accident: number;
    Incident: number;
    "Presqu'accident": number;
    Maladie: number;
  };
  evolution: number;
  coutsTotal: number;
}

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [stats, setStats] = useState<Stats>({
    total: 0,
    parGravite: { Légère: 0, Modérée: 0, Grave: 0, Critique: 0 },
    parType: { Accident: 0, Incident: 0, "Presqu'accident": 0, Maladie: 0 },
    evolution: 0,
    coutsTotal: 0
  })
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState('mois')
  const [filters, setFilters] = useState({
    gravite: '',
    type: '',
    statut: ''
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [incidentToDelete, setIncidentToDelete] = useState<Incident | null>(null)
  
  // Form state
  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    type: '',
    gravite: '',
    dateIncident: '',
    heureIncident: '',
    zone: '',
    batiment: '',
    etage: '',
    declarantNom: '',
    declarantPrenom: '',
    descriptionAction: '',
    typeAction: '',
    prioriteAction: '',
    responsableNom: '',
    responsablePrenom: '',
    dateEcheance: ''
  })

  useEffect(() => {
    fetchData()
  }, [selectedPeriod, filters])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Récupérer les incidents depuis l'API
      const incidentsResponse = await incidentService.getAll()
      if (incidentsResponse.data) {
        setIncidents(incidentsResponse.data.incidents || incidentsResponse.data)
      }
      
      // Calculer les stats localement en attendant l'API stats
      const incidentsData = incidentsResponse.data.incidents || incidentsResponse.data || []
      const statsCalculated = {
        total: incidentsData.length,
        parGravite: {
          Légère: incidentsData.filter((i: Incident) => i.gravite === 'Légère').length,
          Modérée: incidentsData.filter((i: Incident) => i.gravite === 'Modérée').length,
          Grave: incidentsData.filter((i: Incident) => i.gravite === 'Grave').length,
          Critique: incidentsData.filter((i: Incident) => i.gravite === 'Critique').length
        },
        parType: {
          Accident: incidentsData.filter((i: Incident) => i.type === 'Accident').length,
          Incident: incidentsData.filter((i: Incident) => i.type === 'Incident').length,
          "Presqu'accident": incidentsData.filter((i: Incident) => i.type === "Presqu'accident").length,
          Maladie: incidentsData.filter((i: Incident) => i.type === 'Maladie').length
        },
        evolution: -25, // À calculer selon la logique métier
        coutsTotal: incidentsData.reduce((acc: number, i: Incident) => 
          acc + (i.impacts?.materiels?.coutEstime || 0), 0)
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

  const getGraviteColor = (gravite: string) => {
    switch (gravite) {
      case 'Légère': return 'text-green-600 bg-green-50'
      case 'Modérée': return 'text-yellow-600 bg-yellow-50'
      case 'Grave': return 'text-orange-600 bg-orange-50'
      case 'Critique': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Accident': return 'text-red-600 bg-red-50'
      case 'Incident': return 'text-orange-600 bg-orange-50'
      case "Presqu'accident": return 'text-yellow-600 bg-yellow-50'
      case 'Maladie': return 'text-blue-600 bg-blue-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'Déclaré': return 'text-blue-600 bg-blue-50'
      case 'En cours d\'investigation': return 'text-orange-600 bg-orange-50'
      case 'En cours de traitement': return 'text-yellow-600 bg-yellow-50'
      case 'Résolu': return 'text-green-600 bg-green-50'
      case 'Clôturé': return 'text-gray-600 bg-gray-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const filteredIncidents = useMemo(() => incidents.filter(incident =>
    incident.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    incident.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (incident.declarant?.nom && incident.declarant.nom.toLowerCase().includes(searchTerm.toLowerCase()))
  ), [incidents, searchTerm])

  // Calculer les statistiques de statut en temps réel avec useMemo pour optimiser les performances
  const incidentsEnCours = useMemo(() => incidents.filter(incident => 
    incident.statut === 'En cours d\'investigation' || incident.statut === 'En cours de traitement'
  ), [incidents])

  const incidentsCritiques = useMemo(() => incidents.filter(incident => 
    incident.gravite === 'Critique'
  ), [incidents])
  
  const incidentsResolus = useMemo(() => incidents.filter(incident => 
    incident.statut === 'Résolu' || incident.statut === 'Clôturé'
  ), [incidents])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation du formulaire
    const errors = validateForm()
    if (errors.length > 0) {
      return
    }
    
    setIsSubmitting(true)
    
    try {
      // Préparer les données pour l'API
      const incidentData = {
        titre: formData.titre,
        description: formData.description,
        type: formData.type,
        gravite: formData.gravite,
        categorie: 'Sécurité', // Valeur par défaut requise
        urgence: 'Modérée', // Valeur par défaut requise
        dateIncident: formData.dateIncident,
        heureIncident: formData.heureIncident,
        localisation: {
          zone: formData.zone,
          batiment: formData.batiment,
          etage: formData.etage
        },
        // Ne pas envoyer l'objet declarant, le backend utilisera l'utilisateur connecté
        declarantInfo: {
          nom: formData.declarantNom,
          prenom: formData.declarantPrenom
        },
        personnesImpliquees: [],
                  impacts: {
            humains: { blesses: 0, deces: 0 },
            materiels: { degats: 'Aucun', coutEstime: 0 }, // Utiliser la valeur d'enum valide
            environnementaux: { pollution: 'Aucune', impact: '' } // Utiliser la valeur d'enum valide
          },
        actionsCorrectives: formData.descriptionAction.trim() ? [{
          description: formData.descriptionAction,
          type: formData.typeAction,
          priorite: formData.prioriteAction,
          responsable: {
            nom: formData.responsableNom,
            prenom: formData.responsablePrenom
          },
          dateEcheance: formData.dateEcheance,
          statut: 'À traiter'
        }] : []
      }
      
      // Appel de l'API réelle pour créer l'incident
      const response = await incidentService.create(incidentData)
      
      // Ajouter le nouvel incident à la liste
      if (response.data) {
        setIncidents(prev => [response.data, ...prev])
      
      // Mettre à jour les stats
      if (stats) {
        setStats(prev => prev ? {
          ...prev,
          total: prev.total + 1,
          parGravite: {
            ...prev.parGravite,
            [formData.gravite]: prev.parGravite[formData.gravite as keyof typeof prev.parGravite] + 1
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
      console.error('Erreur lors de l\'ajout de l\'incident:', error)
      
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
        
        setValidationErrors(errorMessages.length > 0 ? errorMessages : ['Erreur lors de la création de l\'incident. Veuillez réessayer.'])
      } else {
        setValidationErrors(['Erreur lors de la création de l\'incident. Veuillez réessayer.'])
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
      gravite: '',
      dateIncident: '',
      heureIncident: '',
      zone: '',
      batiment: '',
      etage: '',
      declarantNom: '',
      declarantPrenom: '',
      descriptionAction: '',
      typeAction: '',
      prioriteAction: '',
      responsableNom: '',
      responsablePrenom: '',
      dateEcheance: ''
    })
  }

  const validateForm = () => {
    const errors: string[] = []
    
    if (!formData.titre.trim()) errors.push('Le titre est requis')
    if (!formData.description.trim()) errors.push('La description est requise')
    if (!formData.type) errors.push('Le type d\'incident est requis')
    if (!formData.gravite) errors.push('La gravité est requise')
    if (!formData.dateIncident) errors.push('La date de l\'incident est requise')
    if (!formData.declarantNom.trim()) errors.push('Le nom du déclarant est requis')
    if (!formData.declarantPrenom.trim()) errors.push('Le prénom du déclarant est requis')
    
    setValidationErrors(errors)
    return errors
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

  // Fonctions pour gérer les actions sur les incidents
  const handleViewIncident = (incident: Incident) => {
    setSelectedIncident(incident)
    setIsViewModalOpen(true)
  }

  const handleEditIncident = (incident: Incident) => {
    setSelectedIncident(incident)
    setIsEditModalOpen(true)
  }

  const handleDeleteIncident = (incident: Incident) => {
    setIncidentToDelete(incident)
    setShowDeleteConfirm(true)
  }

  const confirmDeleteIncident = async () => {
    if (!incidentToDelete) return

    try {
      // Appel API réel pour supprimer l'incident
      await incidentService.delete(incidentToDelete._id)
      
      // Supprimer l'incident de la liste
      setIncidents(prev => prev.filter(incident => incident._id !== incidentToDelete._id))
      
      // Mettre à jour les stats
      if (stats) {
        setStats(prev => prev ? {
          ...prev,
          total: prev.total - 1,
          parGravite: {
            ...prev.parGravite,
            [incidentToDelete.gravite]: prev.parGravite[incidentToDelete.gravite as keyof typeof prev.parGravite] - 1
          }
        } : null)
      }
      
      setShowDeleteConfirm(false)
      setIncidentToDelete(null)
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      setValidationErrors(['Erreur lors de la suppression. Veuillez réessayer.'])
    }
  }

  const closeViewModal = () => {
    setIsViewModalOpen(false)
    setSelectedIncident(null)
  }

  const closeEditModal = () => {
    setIsEditModalOpen(false)
    setSelectedIncident(null)
  }

  const handleUpdateIncident = async (updatedData: any) => {
    if (!selectedIncident) return

    try {
      // Appel API réel pour mettre à jour l'incident
      const response = await incidentService.update(selectedIncident._id, updatedData)
      
      // Mettre à jour l'incident dans la liste
      if (response.data) {
        setIncidents(prev => prev.map(incident => 
          incident._id === selectedIncident._id 
            ? response.data
            : incident
        ))
      }
      
      closeEditModal()
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error)
      setValidationErrors(['Erreur lors de la mise à jour. Veuillez réessayer.'])
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-12 h-12 bg-red-100 dark:bg-red-900 rounded-lg">
                <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Gestion des Incidents
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Déclaration, suivi et analyse des incidents QHSE
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
                onClick={openAddModal}
                className="inline-flex items-center px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-md transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nouvel Incident
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistiques optimisées */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Incidents</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats?.total || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
            <div className="mt-4 flex items-center text-sm text-red-600 dark:text-red-400">
              <AlertCircle className="w-4 h-4 mr-1" />
              <span>Incidents déclarés</span>
              </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">En Cours</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {incidentsEnCours.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
            <div className="mt-4 flex items-center text-sm text-orange-600 dark:text-orange-400">
              <Activity className="w-4 h-4 mr-1" />
              <span>En investigation</span>
              </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Critiques</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {incidentsCritiques.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
            <div className="mt-4 flex items-center text-sm text-red-600 dark:text-red-400">
              <AlertTriangle className="w-4 h-4 mr-1" />
              <span>Priorité maximale</span>
              </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Résolus</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {incidentsResolus.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-green-600 dark:text-green-400">
              <CheckCircle className="w-4 h-4 mr-1" />
              <span>Incidents traités</span>
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
                    placeholder="Rechercher un incident..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <select
                  value={filters.gravite}
                  onChange={(e) => setFilters({...filters, gravite: e.target.value})}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Toutes les gravités</option>
                  <option value="Légère">Légère</option>
                  <option value="Modérée">Modérée</option>
                  <option value="Grave">Grave</option>
                  <option value="Critique">Critique</option>
                </select>
                
                <select
                  value={filters.type}
                  onChange={(e) => setFilters({...filters, type: e.target.value})}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Tous les types</option>
                  <option value="Accident">Accident</option>
                  <option value="Incident">Incident</option>
                  <option value={"Presqu'accident"}>Presqu'accident</option>
                  <option value="Maladie">Maladie</option>
                </select>
                
                <select
                  value={filters.statut}
                  onChange={(e) => setFilters({...filters, statut: e.target.value})}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Tous les statuts</option>
                  <option value="Déclaré">Déclaré</option>
                  <option value="En cours d'investigation">En investigation</option>
                  <option value="En cours de traitement">En traitement</option>
                  <option value="Résolu">Résolu</option>
                  <option value="Clôturé">Clôturé</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Liste des incidents */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Liste des Incidents ({filteredIncidents.length})
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Incident
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Gravité
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Localisation
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Déclarant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Date
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
                {filteredIncidents.map((incident) => (
                  <tr key={incident._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {incident.numero}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {incident.titre}
                        </div>
                        <div className="text-xs text-gray-400 dark:text-gray-500">
                          {incident.personnesImpliquees?.length || 0} personnes impliquées
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(incident.type)}`}>
                        {incident.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getGraviteColor(incident.gravite)}`}>
                        {incident.gravite}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <MapPin className="w-4 h-4 mr-1" />
                        {incident.localisation?.zone || 'Non spécifiée'}
                        {incident.localisation?.batiment && ` - ${incident.localisation.batiment}`}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900 dark:text-white">
                        <User className="w-4 h-4 mr-1 text-gray-400" />
                        {incident.declarant?.prenom || 'N/A'} {incident.declarant?.nom || ''}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatDate(incident.dateIncident)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatutColor(incident.statut)}`}>
                        {incident.statut}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <ActionButtons
                        onView={() => handleViewIncident(incident)}
                        onEdit={() => handleEditIncident(incident)}
                        onDelete={() => handleDeleteIncident(incident)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal d'ajout d'incident */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={closeAddModal}></div>
            <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Nouvel Incident</h3>
                <button
                  onClick={closeAddModal}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Affichage des erreurs de validation */}
          {validationErrors.length > 0 && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                <h4 className="text-sm font-medium text-red-800 dark:text-red-200">
                  Erreurs de validation
                </h4>
              </div>
              <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                {validationErrors.map((error, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    {error}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Affichage du message de succès */}
          {showSuccessMessage && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                <span className="text-sm font-medium text-green-800 dark:text-green-200">
                  Incident créé avec succès ! Le modal se fermera automatiquement...
                </span>
              </div>
            </div>
          )}

          {/* Section Informations générales */}
          <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 p-6 rounded-xl border border-red-100 dark:border-red-800">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center mr-3">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 dark:text-white">Informations Générales</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormInput
                label="Titre de l'incident"
                name="titre"
                type="text"
                value={formData.titre}
                onChange={handleInputChange}
                placeholder="Titre descriptif de l'incident"
                required
              />
              
              <FormInput
                label="Type d'incident"
                name="type"
                type="select"
                value={formData.type}
                onChange={handleInputChange}
                options={[
                  { value: 'Accident', label: 'Accident' },
                  { value: 'Incident', label: 'Incident' },
                  { value: "Presqu'accident", label: "Presqu'accident" },
                  { value: 'Maladie', label: 'Maladie' }
                ]}
                required
              />
              
              <FormInput
                label="Gravité"
                name="gravite"
                type="select"
                value={formData.gravite}
                onChange={handleInputChange}
                options={[
                  { value: 'Légère', label: 'Légère' },
                  { value: 'Modérée', label: 'Modérée' },
                  { value: 'Grave', label: 'Grave' },
                  { value: 'Critique', label: 'Critique' }
                ]}
                required
              />
              
              <FormInput
                label="Date de l'incident"
                name="dateIncident"
                type="date"
                value={formData.dateIncident}
                onChange={handleInputChange}
                required
              />
              
              <FormInput
                label="Heure de l'incident"
                name="heureIncident"
                type="time"
                value={formData.heureIncident}
                onChange={handleInputChange}
              />
            </div>
          </div>

          {/* Section Description */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-xl border border-blue-100 dark:border-blue-800">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mr-3">
                <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 dark:text-white">Description de l'Incident</h4>
            </div>
            <FormInput
              label="Description détaillée"
              name="description"
              type="textarea"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Description complète de l'incident, circonstances, causes apparentes..."
              rows={4}
              required
            />
          </div>

          {/* Section Localisation */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-6 rounded-xl border border-green-100 dark:border-green-800">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mr-3">
                <MapPin className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 dark:text-white">Localisation</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormInput
                label="Zone"
                name="zone"
                type="text"
                value={formData.zone}
                onChange={handleInputChange}
                placeholder="Zone de l'incident"
              />
              
              <FormInput
                label="Bâtiment"
                name="batiment"
                type="text"
                value={formData.batiment}
                onChange={handleInputChange}
                placeholder="Bâtiment"
              />
              
              <FormInput
                label="Étage"
                name="etage"
                type="text"
                value={formData.etage}
                onChange={handleInputChange}
                placeholder="Étage"
              />
            </div>
          </div>

          {/* Section Déclarant */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-6 rounded-xl border border-purple-100 dark:border-purple-800">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mr-3">
                <User className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 dark:text-white">Déclarant</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormInput
                label="Nom du déclarant"
                name="declarantNom"
                type="text"
                value={formData.declarantNom}
                onChange={handleInputChange}
                placeholder="Nom de famille"
                required
              />
              
              <FormInput
                label="Prénom du déclarant"
                name="declarantPrenom"
                type="text"
                value={formData.declarantPrenom}
                onChange={handleInputChange}
                placeholder="Prénom"
                required
              />
            </div>
          </div>

          {/* Section Action corrective */}
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 p-6 rounded-xl border border-orange-100 dark:border-orange-800">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center mr-3">
                <Target className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 dark:text-white">Action Corrective Immédiate</h4>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormInput
                label="Description de l'action"
                name="descriptionAction"
                type="textarea"
                value={formData.descriptionAction}
                onChange={handleInputChange}
                placeholder="Description de l'action corrective à mettre en place"
                rows={3}
              />
              
              <FormInput
                label="Type d'action"
                name="typeAction"
                type="select"
                value={formData.typeAction}
                onChange={handleInputChange}
                options={[
                  { value: 'Corrective', label: 'Corrective' },
                  { value: 'Préventive', label: 'Préventive' },
                  { value: 'Urgente', label: 'Urgente' },
                  { value: 'Maintenance', label: 'Maintenance' }
                ]}
              />
              
              <FormInput
                label="Priorité"
                name="prioriteAction"
                type="select"
                value={formData.prioriteAction}
                onChange={handleInputChange}
                options={[
                  { value: 'Faible', label: 'Faible' },
                  { value: 'Moyenne', label: 'Moyenne' },
                  { value: 'Élevée', label: 'Élevée' },
                  { value: 'Critique', label: 'Critique' }
                ]}
              />
              
              <FormInput
                label="Date d'échéance"
                name="dateEcheance"
                type="date"
                value={formData.dateEcheance}
                onChange={handleInputChange}
              />
              
              <FormInput
                label="Nom du responsable"
                name="responsableNom"
                type="text"
                value={formData.responsableNom}
                onChange={handleInputChange}
                placeholder="Nom du responsable"
              />
              
              <FormInput
                label="Prénom du responsable"
                name="responsablePrenom"
                type="text"
                value={formData.responsablePrenom}
                onChange={handleInputChange}
                placeholder="Prénom du responsable"
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            <FormButton
              type="button"
              variant="secondary"
              onClick={closeAddModal}
              className="px-6 py-3 text-base"
            >
              Annuler
            </FormButton>
            <FormButton
              type="submit"
              variant="primary"
              loading={isSubmitting}
              className="px-8 py-3 text-base shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              {isSubmitting ? 'Enregistrement...' : 'Enregistrer l\'incident'}
            </FormButton>
          </div>
        </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de vue d'incident */}
      <ViewModal
        isOpen={isViewModalOpen}
        onClose={closeViewModal}
        title="Détails de l'Incident"
      >
        {selectedIncident && (
          <div className="space-y-6">
            {/* Informations générales */}
            <InfoSection
              title="Informations Générales"
              gradientFrom="from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20"
              gradientTo=""
              borderColor="border-red-100 dark:border-red-800"
              icon={<AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoField label="Numéro" value={selectedIncident.numero} />
                <InfoField label="Titre" value={selectedIncident.titre} />
                <InfoField label="Type" value={selectedIncident.type} />
                <InfoField 
                  label="Gravité" 
                  value={
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      selectedIncident.gravite === 'Légère' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                      selectedIncident.gravite === 'Modérée' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                      selectedIncident.gravite === 'Grave' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                      'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {selectedIncident.gravite}
                    </span>
                  } 
                />
                <InfoField 
                  label="Statut" 
                  value={
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      selectedIncident.statut === 'Déclaré' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                      selectedIncident.statut === 'En cours d\'investigation' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                      selectedIncident.statut === 'En cours de traitement' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                      selectedIncident.statut === 'Résolu' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                    }`}>
                      {selectedIncident.statut}
                    </span>
                  } 
                />
              </div>
              <div className="mt-4">
                <InfoField label="Description" value={selectedIncident.description} />
              </div>
            </InfoSection>

            {/* Localisation */}
            <InfoSection
              title="Localisation"
              gradientFrom="from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20"
              gradientTo=""
              borderColor="border-green-100 dark:border-green-800"
              icon={<MapPin className="w-5 h-5 text-green-600 dark:text-green-400" />}
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <InfoField label="Zone" value={selectedIncident.localisation.zone} />
                <InfoField label="Bâtiment" value={selectedIncident.localisation.batiment || 'Non spécifié'} />
                <InfoField label="Étage" value={selectedIncident.localisation.etage || 'Non spécifié'} />
              </div>
            </InfoSection>

            {/* Déclarant */}
            <InfoSection
              title="Déclarant"
              gradientFrom="from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20"
              gradientTo=""
              borderColor="border-purple-100 dark:border-purple-800"
              icon={<User className="w-5 h-5 text-purple-600 dark:text-purple-400" />}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoField label="Nom" value={selectedIncident.declarant.nom} />
                <InfoField label="Prénom" value={selectedIncident.declarant.prenom} />
              </div>
            </InfoSection>

            {/* Date et heure */}
            <InfoSection
              title="Date et Heure"
              gradientFrom="from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20"
              gradientTo=""
              borderColor="border-blue-100 dark:border-blue-800"
              icon={<Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoField label="Date de l'incident" value={formatDate(selectedIncident.dateIncident)} />
                <InfoField label="Heure de l'incident" value={selectedIncident.heureIncident || 'Non spécifiée'} />
              </div>
            </InfoSection>
          </div>
        )}
      </ViewModal>

      {/* Modal d'édition d'incident */}
      <ModalIncident
        isOpen={isEditModalOpen}
        onClose={closeEditModal}
        onSubmit={handleUpdateIncident}
        incident={selectedIncident as any}
        mode="edit"
      />

      {/* Modal de confirmation de suppression */}
      <DeleteConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDeleteIncident}
        title="Confirmer la suppression"
        itemName={incidentToDelete?.titre || ''}
        itemType="l'incident"
      />
    </div>
  )
} 