'use client'

import { useState, useEffect, useMemo } from 'react'
import { 
  AlertTriangle, 
  Plus, 
  Search, 
  Calendar,
  MapPin,
  Shield,
  Target,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  X
} from 'lucide-react'

import FormInput from '../components/common/FormInput'
import FormButton from '../components/common/FormButton'
import { ViewModal, DeleteConfirmModal, InfoSection, InfoField, ActionButtons } from '../components/common'
import ModalRisque from '../components/features/ModalRisque'
import { risqueService } from '../services/api'

// Interfaces TypeScript
interface Risque {
  _id: string;
  numero: string;
  titre: string;
  description: string;
  type: string;
  categorie: string;
  probabilite: string;
  gravite: string;
  niveauRisque: string;
  scoreRisque: number;
  activite: string;
  localisation: {
    zone: string;
    batiment: string;
    etage: string;
  };
  statut: string;
  dateEvaluation: string;
  prochaineEvaluation: string;
  mesuresCorrectives: Array<{
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
  parNiveau: {
    Faible: number;
    Modéré: number;
    Élevé: number;
    Critique: number;
  };
  parType: {
    Sécurité: number;
    Qualité: number;
    Environnement: number;
    Hygiène: number;
  };
  evolution: number;
}

export default function RisquesPage() {
  const [risques, setRisques] = useState<Risque[]>([
    {
      _id: '1',
      numero: 'RIS-2024-001',
      titre: 'Risque de chute de hauteur',
      description: 'Risque de chute lors des travaux de maintenance sur les équipements en hauteur',
      type: 'Sécurité',
      categorie: 'Technique',
      probabilite: 'Moyenne',
      gravite: 'Grave',
      niveauRisque: 'Élevé',
      scoreRisque: 12,
      activite: 'Maintenance préventive',
      localisation: {
        zone: 'Atelier principal',
        batiment: 'Bâtiment A',
        etage: 'Étage 2'
      },
      statut: 'Actif',
      dateEvaluation: '2024-09-15',
      prochaineEvaluation: '2024-12-15',
      mesuresCorrectives: [
        {
          description: 'Installation de garde-corps et échelles sécurisées',
          type: 'Préventive',
          priorite: 'Élevée',
          responsable: { nom: 'Dupont', prenom: 'Jean' },
          dateEcheance: '2024-11-30',
          statut: 'En cours'
        }
      ],
      createdBy: { nom: 'Martin', prenom: 'Sophie' }
    },
    {
      _id: '2',
      numero: 'RIS-2024-002',
      titre: 'Risque de pollution des eaux',
      description: 'Risque de contamination des eaux souterraines par les produits chimiques stockés',
      type: 'Environnement',
      categorie: 'Environnemental',
      probabilite: 'Faible',
      gravite: 'Critique',
      niveauRisque: 'Modéré',
      scoreRisque: 8,
      activite: 'Stockage de produits chimiques',
      localisation: {
        zone: 'Zone de stockage',
        batiment: 'Bâtiment B',
        etage: 'Rez-de-chaussée'
      },
      statut: 'Maîtrisé',
      dateEvaluation: '2024-08-20',
      prochaineEvaluation: '2025-08-20',
      mesuresCorrectives: [
        {
          description: 'Mise en place de bacs de rétention et système de détection de fuites',
          type: 'Préventive',
          priorite: 'Critique',
          responsable: { nom: 'Bernard', prenom: 'Pierre' },
          dateEcheance: '2024-10-15',
          statut: 'Terminé'
        }
      ],
      createdBy: { nom: 'Moreau', prenom: 'Claire' }
    }
  ])
  const [stats, setStats] = useState<Stats | null>({
    total: 2,
    parNiveau: {
      Faible: 0,
      Modéré: 1,
      Élevé: 1,
      Critique: 0
    },
    parType: {
      Sécurité: 1,
      Qualité: 0,
      Environnement: 1,
      Hygiène: 0
    },
    evolution: -15
  })
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState('mois')
  const [filters, setFilters] = useState({
    niveauRisque: '',
    type: '',
    statut: ''
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedRisque, setSelectedRisque] = useState<Risque | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [risqueToDelete, setRisqueToDelete] = useState<Risque | null>(null)
  
  // Form state
  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    type: '',
    categorie: '',
    probabilite: '',
    gravite: '',
    activite: '',
    zone: '',
    batiment: '',
    etage: '',
    descriptionMesure: '',
    typeMesure: '',
    prioriteMesure: '',
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
      
      // Récupérer les risques depuis l'API
      const risquesResponse = await risqueService.getAll()
      if (risquesResponse.data) {
        setRisques(risquesResponse.data.risques || risquesResponse.data)
      }
      
      // Calculer les stats localement en attendant l'API stats
      const risquesData = risquesResponse.data.risques || risquesResponse.data || []
      const statsCalculated = {
        total: risquesData.length,
        critiques: risquesData.filter((r: Risque) => r.niveauRisque === 'Critique').length,
        eleves: risquesData.filter((r: Risque) => r.niveauRisque === 'Élevé').length,
        moderes: risquesData.filter((r: Risque) => r.niveauRisque === 'Modéré').length,
        faibles: risquesData.filter((r: Risque) => r.niveauRisque === 'Faible').length,
        expiresTot: risquesData.filter((r: Risque) => {
          if (!r.prochaineEvaluation) return false
          const prochaineDate = new Date(r.prochaineEvaluation)
          const maintenant = new Date()
          const dans30Jours = new Date()
          dans30Jours.setDate(maintenant.getDate() + 30)
          return prochaineDate <= dans30Jours
        }).length,
        parNiveau: {
          Critique: risquesData.filter((r: Risque) => r.niveauRisque === 'Critique').length,
          'Élevé': risquesData.filter((r: Risque) => r.niveauRisque === 'Élevé').length,
          'Modéré': risquesData.filter((r: Risque) => r.niveauRisque === 'Modéré').length,
          Faible: risquesData.filter((r: Risque) => r.niveauRisque === 'Faible').length
        },
        scoreGlobal: risquesData.reduce((acc: number, r: Risque) => 
          acc + (r.scoreRisque || 0), 0) / (risquesData.length || 1)
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

  const getNiveauRisqueColor = (niveau: string) => {
    switch (niveau) {
      case 'Faible': return 'text-green-600 bg-green-50'
      case 'Modéré': return 'text-yellow-600 bg-yellow-50'
      case 'Élevé': return 'text-orange-600 bg-orange-50'
      case 'Critique': return 'text-red-600 bg-red-50'
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
      // Calculer le niveau de risque basé sur probabilité et gravité
      const niveauRisque = calculateNiveauRisque(formData.probabilite, formData.gravite)
      const scoreRisque = calculateScoreRisque(formData.probabilite, formData.gravite)
      
      // Préparer les données pour l'API
      const risqueData = {
        titre: formData.titre,
        description: formData.description,
        type: formData.type,
        categorie: formData.categorie,
        probabilite: formData.probabilite,
        gravite: formData.gravite,
        niveauRisque: niveauRisque,
        scoreRisque: scoreRisque,
        activite: formData.activite,
        localisation: {
          zone: formData.zone,
          batiment: formData.batiment,
          etage: formData.etage
        },
        statut: 'Identifié',
        dateEvaluation: new Date().toISOString().split('T')[0],
        prochaineEvaluation: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        mesuresCorrectives: formData.descriptionMesure.trim() ? [{
          description: formData.descriptionMesure,
          type: formData.typeMesure,
          priorite: formData.prioriteMesure,
          responsable: {
            nom: formData.responsableNom,
            prenom: formData.responsablePrenom
          },
          dateEcheance: formData.dateEcheance,
          statut: 'À traiter'
        }] : []
      }
      
      // Appel de l'API réelle pour créer le risque
      const response = await risqueService.create(risqueData)
      
      // Ajouter le nouveau risque à la liste
      if (response.data) {
        setRisques(prev => [response.data, ...prev])
        
        // Mettre à jour les stats
        if (stats) {
          setStats(prev => prev ? {
            ...prev,
            total: prev.total + 1,
            parNiveau: {
              ...prev.parNiveau,
              [response.data.niveauRisque || niveauRisque]: prev.parNiveau[response.data.niveauRisque as keyof typeof prev.parNiveau] + 1
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
      console.error('Erreur lors de l\'ajout du risque:', error)
      
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
        
        setValidationErrors(errorMessages.length > 0 ? errorMessages : ['Erreur lors de la création du risque. Veuillez réessayer.'])
      } else {
        setValidationErrors(['Erreur lors de la création du risque. Veuillez réessayer.'])
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const calculateNiveauRisque = (probabilite: string, gravite: string) => {
    const probScores = { 'Très faible': 1, 'Faible': 2, 'Moyenne': 3, 'Élevée': 4, 'Très élevée': 5 }
    const graviteScores = { 'Légère': 1, 'Modérée': 2, 'Grave': 3, 'Critique': 4, 'Catastrophique': 5 }
    
    const score = (probScores[probabilite as keyof typeof probScores] || 1) * (graviteScores[gravite as keyof typeof graviteScores] || 1)
    
    if (score <= 4) return 'Faible'
    if (score <= 9) return 'Modéré'
    if (score <= 16) return 'Élevé'
    return 'Critique'
  }

  const calculateScoreRisque = (probabilite: string, gravite: string) => {
    const probScores = { 'Très faible': 1, 'Faible': 2, 'Moyenne': 3, 'Élevée': 4, 'Très élevée': 5 }
    const graviteScores = { 'Légère': 1, 'Modérée': 2, 'Grave': 3, 'Critique': 4, 'Catastrophique': 5 }
    
    return (probScores[probabilite as keyof typeof probScores] || 1) * (graviteScores[gravite as keyof typeof graviteScores] || 1)
  }

  const resetForm = () => {
    setFormData({
      titre: '',
      description: '',
      type: '',
      categorie: '',
      probabilite: '',
      gravite: '',
      activite: '',
      zone: '',
      batiment: '',
      etage: '',
      descriptionMesure: '',
      typeMesure: '',
      prioriteMesure: '',
      responsableNom: '',
      responsablePrenom: '',
      dateEcheance: ''
    })
  }

  const validateForm = () => {
    const errors: string[] = []
    
    if (!formData.titre.trim()) errors.push('Le titre est requis')
    if (!formData.description.trim()) errors.push('La description est requise')
    if (!formData.type) errors.push('Le type de risque est requis')
    if (!formData.categorie) errors.push('La catégorie est requise')
    if (!formData.probabilite) errors.push('La probabilité est requise')
    if (!formData.gravite) errors.push('La gravité est requise')
    if (!formData.activite.trim()) errors.push('L\'activité est requise')
    
    setValidationErrors(errors)
    return errors
  }

  const clearValidationErrors = () => {
    setValidationErrors([])
  }

  // Optimisations avec useMemo pour améliorer les performances
  const filteredRisques = useMemo(() => risques.filter(risque =>
    risque.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    risque.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
    risque.activite.toLowerCase().includes(searchTerm.toLowerCase())
  ), [risques, searchTerm])

  // Calculer les statistiques de statut en temps réel avec useMemo pour optimiser les performances
  const risquesCritiques = useMemo(() => risques.filter(risque => 
    risque.niveauRisque === 'Critique'
  ), [risques])

  const risquesEleves = useMemo(() => risques.filter(risque => 
    risque.niveauRisque === 'Élevé'
  ), [risques])
  
  const risquesModeres = useMemo(() => risques.filter(risque => 
    risque.niveauRisque === 'Modéré'
  ), [risques])

  const risquesFaibles = useMemo(() => risques.filter(risque => 
    risque.niveauRisque === 'Faible'
  ), [risques])

  const risquesExpires = useMemo(() => risques.filter(risque => 
    new Date(risque.prochaineEvaluation) <= new Date()
  ), [risques])

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

  // Fonctions pour gérer les actions sur les risques
  const handleViewRisque = (risque: Risque) => {
    setSelectedRisque(risque)
    setIsViewModalOpen(true)
  }

  const handleEditRisque = (risque: Risque) => {
    setSelectedRisque(risque)
    setIsEditModalOpen(true)
  }

  const handleDeleteRisque = (risque: Risque) => {
    setRisqueToDelete(risque)
    setShowDeleteConfirm(true)
  }

  const confirmDeleteRisque = async () => {
    if (!risqueToDelete) return

    try {
      // Appel API réel pour supprimer le risque
      await risqueService.delete(risqueToDelete._id)
      
      // Supprimer le risque de la liste
      setRisques(prev => prev.filter(risque => risque._id !== risqueToDelete._id))
      
      // Mettre à jour les stats
      if (stats) {
        setStats(prev => prev ? {
          ...prev,
          total: prev.total - 1,
          parNiveau: {
            ...prev.parNiveau,
            [risqueToDelete.niveauRisque]: prev.parNiveau[risqueToDelete.niveauRisque as keyof typeof prev.parNiveau] - 1
          }
        } : null)
      }
      
      setShowDeleteConfirm(false)
      setRisqueToDelete(null)
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
    }
  }

  const closeViewModal = () => {
    setIsViewModalOpen(false)
    setSelectedRisque(null)
  }

  const closeEditModal = () => {
    setIsEditModalOpen(false)
    setSelectedRisque(null)
  }

  const handleUpdateRisque = async (updatedData: any) => {
    if (!selectedRisque) return

    try {
      // Appel API réel pour mettre à jour le risque
      const response = await risqueService.update(selectedRisque._id, updatedData)
      
      // Mettre à jour le risque dans la liste
      if (response.data) {
        setRisques(prev => prev.map(risque => 
          risque._id === selectedRisque._id 
            ? response.data
            : risque
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
              <div className="flex items-center justify-center w-12 h-12 bg-red-100 dark:bg-red-900 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Gestion des Risques
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Identification, évaluation et suivi des risques QHSE
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
                Nouveau Risque
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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Risques</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats?.total || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-red-600 dark:text-red-400">
              <AlertTriangle className="w-4 h-4 mr-1" />
              <span>Risques identifiés</span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Risques Élevés</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {(stats?.parNiveau?.Élevé || 0) + (stats?.parNiveau?.Critique || 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-orange-600 dark:text-orange-400">
              <AlertCircle className="w-4 h-4 mr-1" />
              <span>Attention requise</span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Maîtrisés</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {risques.filter(r => r.statut === 'Maîtrisé').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-green-600 dark:text-green-400">
              <CheckCircle className="w-4 h-4 mr-1" />
              <span>Risques contrôlés</span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">À Évaluer</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {risques.filter(r => new Date(r.prochaineEvaluation) <= new Date()).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-yellow-600 dark:text-yellow-400">
              <Clock className="w-4 h-4 mr-1" />
              <span>Évaluation en attente</span>
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
                    placeholder="Rechercher un risque..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <select
                  value={filters.niveauRisque}
                  onChange={(e) => setFilters({...filters, niveauRisque: e.target.value})}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Tous les niveaux</option>
                  <option value="Faible">Faible</option>
                  <option value="Modéré">Modéré</option>
                  <option value="Élevé">Élevé</option>
                  <option value="Critique">Critique</option>
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
                  value={filters.statut}
                  onChange={(e) => setFilters({...filters, statut: e.target.value})}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Tous les statuts</option>
                  <option value="Actif">Actif</option>
                  <option value="Maîtrisé">Maîtrisé</option>
                  <option value="En cours de traitement">En cours</option>
                  <option value="Archivé">Archivé</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Liste des risques */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Liste des Risques ({filteredRisques.length})
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Risque
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Niveau
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Localisation
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Prochaine Évaluation
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredRisques.map((risque) => (
                  <tr key={risque._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {risque.numero}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {risque.titre}
                        </div>
                        <div className="text-xs text-gray-400 dark:text-gray-500">
                          {risque.activite}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getNiveauRisqueColor(risque.niveauRisque)}`}>
                        {risque.niveauRisque} ({risque.scoreRisque})
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(risque.type)}`}>
                        {risque.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <MapPin className="w-4 h-4 mr-1" />
                        {risque.localisation.zone}
                        {risque.localisation.batiment && ` - ${risque.localisation.batiment}`}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        risque.statut === 'Actif' ? 'text-red-600 bg-red-50' :
                        risque.statut === 'Maîtrisé' ? 'text-green-600 bg-green-50' :
                        risque.statut === 'En cours de traitement' ? 'text-orange-600 bg-orange-50' :
                        'text-gray-600 bg-gray-50'
                      }`}>
                        {risque.statut}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatDate(risque.prochaineEvaluation)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <ActionButtons
                        onView={() => handleViewRisque(risque)}
                        onEdit={() => handleEditRisque(risque)}
                        onDelete={() => handleDeleteRisque(risque)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal d'ajout de risque */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={closeAddModal}></div>
            <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Nouveau Risque</h3>
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
                  Risque créé avec succès ! Le modal se fermera automatiquement...
                </span>
              </div>
            </div>
          )}

          {/* Section Informations générales */}
          <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 p-6 rounded-xl border border-orange-100 dark:border-orange-800">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center mr-3">
                <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 dark:text-white">Informations Générales</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormInput
                label="Titre du risque"
                name="titre"
                type="text"
                value={formData.titre}
                onChange={handleInputChange}
                placeholder="Titre descriptif du risque"
                required
              />
              
              <FormInput
                label="Type de risque"
                name="type"
                type="select"
                value={formData.type}
                onChange={handleInputChange}
                options={[
                  { value: 'Sécurité', label: 'Sécurité' },
                  { value: 'Qualité', label: 'Qualité' },
                  { value: 'Environnement', label: 'Environnement' },
                  { value: 'Hygiène', label: 'Hygiène' }
                ]}
                required
              />
              
              <FormInput
                label="Catégorie"
                name="categorie"
                type="select"
                value={formData.categorie}
                onChange={handleInputChange}
                options={[
                  { value: 'Technique', label: 'Technique' },
                  { value: 'Humain', label: 'Humain' },
                  { value: 'Organisationnel', label: 'Organisationnel' },
                  { value: 'Environnemental', label: 'Environnemental' },
                  { value: 'Économique', label: 'Économique' }
                ]}
                required
              />
              
              <FormInput
                label="Activité concernée"
                name="activite"
                type="text"
                value={formData.activite}
                onChange={handleInputChange}
                placeholder="Activité ou processus concerné"
                required
              />
            </div>
          </div>

          {/* Section Description */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-xl border border-blue-100 dark:border-blue-800">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mr-3">
                <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 dark:text-white">Description du Risque</h4>
            </div>
            <FormInput
              label="Description détaillée"
              name="description"
              type="textarea"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Description complète du risque, sources, conséquences potentielles..."
              rows={4}
              required
            />
          </div>

          {/* Section Évaluation */}
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 p-6 rounded-xl border border-yellow-100 dark:border-yellow-800">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center mr-3">
                <Target className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 dark:text-white">Évaluation du Risque</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormInput
                label="Probabilité"
                name="probabilite"
                type="select"
                value={formData.probabilite}
                onChange={handleInputChange}
                options={[
                  { value: 'Très faible', label: 'Très faible' },
                  { value: 'Faible', label: 'Faible' },
                  { value: 'Moyenne', label: 'Moyenne' },
                  { value: 'Élevée', label: 'Élevée' },
                  { value: 'Très élevée', label: 'Très élevée' }
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
                  { value: 'Critique', label: 'Critique' },
                  { value: 'Catastrophique', label: 'Catastrophique' }
                ]}
                required
              />
            </div>
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
                placeholder="Zone du risque"
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

          {/* Section Mesure corrective */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-6 rounded-xl border border-purple-100 dark:border-purple-800">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mr-3">
                <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 dark:text-white">Mesure Corrective</h4>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormInput
                label="Description de la mesure"
                name="descriptionMesure"
                type="textarea"
                value={formData.descriptionMesure}
                onChange={handleInputChange}
                placeholder="Description de la mesure corrective à mettre en place"
                rows={3}
              />
              
              <FormInput
                label="Type de mesure"
                name="typeMesure"
                type="select"
                value={formData.typeMesure}
                onChange={handleInputChange}
                options={[
                  { value: 'Préventive', label: 'Préventive' },
                  { value: 'Corrective', label: 'Corrective' },
                  { value: 'Palliative', label: 'Palliative' },
                  { value: 'Évitement', label: 'Évitement' }
                ]}
              />
              
              <FormInput
                label="Priorité"
                name="prioriteMesure"
                type="select"
                value={formData.prioriteMesure}
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
              {isSubmitting ? 'Enregistrement...' : 'Enregistrer le risque'}
            </FormButton>
          </div>
        </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de vue de risque */}
      <ViewModal
        isOpen={isViewModalOpen}
        onClose={closeViewModal}
        title="Détails du Risque"
      >
        {selectedRisque && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={closeViewModal}></div>
            <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Détails du Risque</h3>
                <button
                  onClick={closeViewModal}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <div className="p-6">
                <div className="space-y-6">
                  {/* Informations générales */}
                  <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 p-6 rounded-xl border border-orange-100 dark:border-orange-800">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Informations Générales</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Numéro</label>
                        <p className="text-sm text-gray-900 dark:text-white">{selectedRisque.numero}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Titre</label>
                        <p className="text-sm text-gray-900 dark:text-white">{selectedRisque.titre}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Type</label>
                        <p className="text-sm text-gray-900 dark:text-white">{selectedRisque.type}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Catégorie</label>
                        <p className="text-sm text-gray-900 dark:text-white">{selectedRisque.categorie}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Activité</label>
                        <p className="text-sm text-gray-900 dark:text-white">{selectedRisque.activite}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Statut</label>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          selectedRisque.statut === 'Actif' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                          selectedRisque.statut === 'Maîtrisé' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                          selectedRisque.statut === 'En cours de traitement' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                          'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                        }`}>
                          {selectedRisque.statut}
                        </span>
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                      <p className="text-sm text-gray-900 dark:text-white mt-1">{selectedRisque.description}</p>
                    </div>
                  </div>

                  {/* Évaluation du risque */}
                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 p-6 rounded-xl border border-yellow-100 dark:border-yellow-800">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Évaluation du Risque</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Probabilité</label>
                        <p className="text-sm text-gray-900 dark:text-white">{selectedRisque.probabilite}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Gravité</label>
                        <p className="text-sm text-gray-900 dark:text-white">{selectedRisque.gravite}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Niveau de risque</label>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          selectedRisque.niveauRisque === 'Faible' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                          selectedRisque.niveauRisque === 'Modéré' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                          selectedRisque.niveauRisque === 'Élevé' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                          'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {selectedRisque.niveauRisque} ({selectedRisque.scoreRisque})
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Localisation */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-6 rounded-xl border border-green-100 dark:border-green-800">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Localisation</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Zone</label>
                        <p className="text-sm text-gray-900 dark:text-white">{selectedRisque.localisation.zone}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Bâtiment</label>
                        <p className="text-sm text-gray-900 dark:text-white">{selectedRisque.localisation.batiment || 'Non spécifié'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Étage</label>
                        <p className="text-sm text-gray-900 dark:text-white">{selectedRisque.localisation.etage || 'Non spécifié'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-xl border border-blue-100 dark:border-blue-800">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Dates</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date d'évaluation</label>
                        <p className="text-sm text-gray-900 dark:text-white">{formatDate(selectedRisque.dateEvaluation)}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Prochaine évaluation</label>
                        <p className="text-sm text-gray-900 dark:text-white">{formatDate(selectedRisque.prochaineEvaluation)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end p-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={closeViewModal}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors duration-200"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </ViewModal>

      {/* Modal d'édition de risque */}
      <ModalRisque
        isOpen={isEditModalOpen}
        onClose={closeEditModal}
        onSubmit={handleUpdateRisque}
        risque={selectedRisque as any}
        mode="edit"
      />

      {/* Modal de confirmation de suppression */}
      <DeleteConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDeleteRisque}
        title="Confirmer la suppression"
        itemName={risqueToDelete?.titre || ''}
        itemType="le risque"
      />
    </div>
  )
} 