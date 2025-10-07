'use client'

import { useState, useEffect, useMemo } from 'react'
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  Plus, 
  Search, 
  Calendar,
  FileText,
  TrendingUp,
  Target,
  Gavel,
  AlertCircle,
  X
} from 'lucide-react'

import FormInput from '../components/common/FormInput'
import FormButton from '../components/common/FormButton'
import { ViewModal, DeleteConfirmModal, InfoSection, InfoField, ActionButtons } from '../components/common'
import ModalConformite from '../components/features/ModalConformite'
import { conformiteService } from '../services/api'

// Interfaces TypeScript
interface Conformite {
  _id: string;
  numero: string;
  titre: string;
  description: string;
  type: string;
  domaine: string;
  reference: {
    texte: string;
    article: string;
    organisme: string;
    dateEntreeVigueur: string;
  };
  statutConformite: string;
  niveauConformite: string;
  scoreConformite: number;
  prochaineEvaluation: string;
  derniereEvaluation: {
    date: string;
    resultat: string;
    observations: string;
  };
  actionsConformite: Array<{
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
  certifications: Array<{
    nom: string;
    organisme: string;
    numero: string;
    dateObtention: string;
    dateExpiration: string;
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
    Conforme: number;
    'Non conforme': number;
    'En cours de mise en conformité': number;
    'Non applicable': number;
    'À évaluer': number;
  };
  parType: {
    Législation: number;
    Réglementation: number;
    Norme: number;
    Certification: number;
    Accréditation: number;
    Autorisation: number;
  };
  scoreMoyen: number;
  expirantes: number;
}

export default function ConformitePage() {
  const [conformites, setConformites] = useState<Conformite[]>([
    {
      _id: '1',
      numero: 'CONF-2024-001',
      titre: 'Conformité RGPD',
      description: 'Respect du règlement général sur la protection des données personnelles',
      type: 'Réglementation',
      domaine: 'Qualité',
      reference: {
        texte: 'Règlement UE 2016/679',
        article: 'Art. 32',
        organisme: 'Union Européenne',
        dateEntreeVigueur: '2018-05-25'
      },
      statutConformite: 'Conforme',
      niveauConformite: 'Bon',
      scoreConformite: 85,
      prochaineEvaluation: '2024-12-15',
      derniereEvaluation: {
        date: '2024-06-15',
        resultat: 'Conforme',
        observations: 'Toutes les mesures de protection sont en place'
      },
      actionsConformite: [],
      certifications: [
        {
          nom: 'Certification ISO 27001',
          organisme: 'AFNOR',
          numero: 'ISO-27001-2024',
          dateObtention: '2024-01-15',
          dateExpiration: '2027-01-15',
          statut: 'Valide'
        }
      ],
      createdBy: { nom: 'Martin', prenom: 'Sophie' }
    },
    {
      _id: '2',
      numero: 'CONF-2024-002',
      titre: 'Sécurité au travail',
      description: 'Conformité aux règles de sécurité et de prévention des accidents',
      type: 'Législation',
      domaine: 'Sécurité',
      reference: {
        texte: 'Code du travail',
        article: 'Art. L4121-1',
        organisme: 'Ministère du Travail',
        dateEntreeVigueur: '2016-01-01'
      },
      statutConformite: 'Non conforme',
      niveauConformite: 'Insuffisant',
      scoreConformite: 45,
      prochaineEvaluation: '2024-11-30',
      derniereEvaluation: {
        date: '2024-05-30',
        resultat: 'Non conforme',
        observations: 'Formation sécurité manquante pour 3 employés'
      },
      actionsConformite: [
        {
          description: 'Organiser formation sécurité obligatoire',
          type: 'Corrective',
          priorite: 'Élevée',
          responsable: { nom: 'Dupont', prenom: 'Jean' },
          dateEcheance: '2024-10-15',
          statut: 'En cours'
        }
      ],
      certifications: [],
      createdBy: { nom: 'Bernard', prenom: 'Pierre' }
    }
  ])
  const [stats, setStats] = useState<Stats | null>({
    total: 2,
    parStatut: {
      Conforme: 1,
      'Non conforme': 1,
      'En cours de mise en conformité': 0,
      'Non applicable': 0,
      'À évaluer': 0
    },
    parType: {
      Législation: 1,
      Réglementation: 1,
      Norme: 0,
      Certification: 0,
      Accréditation: 0,
      Autorisation: 0
    },
    scoreMoyen: 65,
    expirantes: 0
  })
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState('mois')
  const [filters, setFilters] = useState({
    statutConformite: '',
    type: '',
    domaine: ''
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedConformite, setSelectedConformite] = useState<Conformite | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [conformiteToDelete, setConformiteToDelete] = useState<Conformite | null>(null)
  
  // Form state
  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    type: '',
    domaine: '',
    texte: '',
    article: '',
    organisme: '',
    dateEntreeVigueur: '',
    niveauConformite: '',
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
      
      // Récupérer les conformités depuis l'API
      const conformitesResponse = await conformiteService.getAll()
      if (conformitesResponse.data) {
        setConformites(conformitesResponse.data.conformites || conformitesResponse.data)
      }
      
      // Calculer les stats localement en attendant l'API stats
      const conformitesData = conformitesResponse.data.conformites || conformitesResponse.data || []
      const statsCalculated = {
        total: conformitesData.length,
        conformes: conformitesData.filter((c: Conformite) => c.statutConformite === 'Conforme').length,
        nonConformes: conformitesData.filter((c: Conformite) => c.statutConformite === 'Non conforme').length,
        aEvaluer: conformitesData.filter((c: Conformite) => c.statutConformite === 'À évaluer').length,
        expirantes: conformitesData.filter((c: Conformite) => {
          if (!c.prochaineEvaluation) return false
          const prochaineDate = new Date(c.prochaineEvaluation)
          const maintenant = new Date()
          const dans30Jours = new Date()
          dans30Jours.setDate(maintenant.getDate() + 30)
          return prochaineDate <= dans30Jours
        }).length,
        scoreGlobal: conformitesData.reduce((acc: number, c: Conformite) => 
          acc + (c.scoreConformite || 0), 0) / (conformitesData.length || 1)
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

  const getStatutConformiteColor = (statut: string) => {
    switch (statut) {
      case 'Conforme': return 'text-green-600 bg-green-50'
      case 'Non conforme': return 'text-red-600 bg-red-50'
      case 'En cours de mise en conformité': return 'text-orange-600 bg-orange-50'
      case 'Non applicable': return 'text-gray-600 bg-gray-50'
      case 'À évaluer': return 'text-yellow-600 bg-yellow-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Législation': return 'text-red-600 bg-red-50'
      case 'Réglementation': return 'text-orange-600 bg-orange-50'
      case 'Norme': return 'text-blue-600 bg-blue-50'
      case 'Certification': return 'text-green-600 bg-green-50'
      case 'Accréditation': return 'text-purple-600 bg-purple-50'
      case 'Autorisation': return 'text-teal-600 bg-teal-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getNiveauConformiteColor = (niveau: string) => {
    switch (niveau) {
      case 'Exemplaire': return 'text-green-600 bg-green-50'
      case 'Bon': return 'text-blue-600 bg-blue-50'
      case 'Acceptable': return 'text-yellow-600 bg-yellow-50'
      case 'Insuffisant': return 'text-orange-600 bg-orange-50'
      case 'Critique': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const filteredConformites = useMemo(() => conformites.filter(conformite =>
    conformite.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conformite.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conformite.reference.texte.toLowerCase().includes(searchTerm.toLowerCase())
  ), [conformites, searchTerm])

  // Calculer les statistiques de statut en temps réel avec useMemo pour optimiser les performances
  const conformitesExpirantes = useMemo(() => conformites.filter(conformite =>
    new Date(conformite.prochaineEvaluation) <= new Date()
  ), [conformites])

  const nonConformites = useMemo(() => conformites.filter(conformite =>
    conformite.statutConformite === 'Non conforme' || 
    conformite.statutConformite === 'En cours de mise en conformité'
  ), [conformites])

  const conformitesConformes = useMemo(() => conformites.filter(conformite => 
    conformite.statutConformite === 'Conforme'
  ), [conformites])
  
  const conformitesAEvaluer = useMemo(() => conformites.filter(conformite => 
    conformite.statutConformite === 'À évaluer'
  ), [conformites])

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
      const conformiteData = {
        titre: formData.titre,
        description: formData.description,
        type: formData.type,
        domaine: formData.domaine,
        reference: {
          texte: formData.texte,
          article: formData.article,
          organisme: formData.organisme,
          dateEntreeVigueur: formData.dateEntreeVigueur
        },
        statutConformite: 'À évaluer',
        niveauConformite: formData.niveauConformite,
        scoreConformite: 0,
        prochaineEvaluation: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        derniereEvaluation: {
          date: new Date().toISOString().split('T')[0],
          resultat: 'À évaluer',
          observations: ''
        },
        actionsConformite: formData.descriptionAction.trim() ? [{
          description: formData.descriptionAction,
          type: formData.typeAction,
          priorite: formData.prioriteAction,
          responsable: {
            nom: formData.responsableNom,
            prenom: formData.responsablePrenom
          },
          dateEcheance: formData.dateEcheance,
          statut: 'À traiter'
        }] : [],
        certifications: []
      }
      
      // Appel de l'API réelle pour créer la conformité
      const response = await conformiteService.create(conformiteData as any)
      
      // Ajouter la nouvelle conformité à la liste
      if (response.data) {
        setConformites(prev => [response.data, ...prev])
      
        // Mettre à jour les stats
        if (stats) {
          setStats(prev => prev ? {
            ...prev,
            total: prev.total + 1,
            parStatut: {
              ...prev.parStatut,
              'À évaluer': prev.parStatut['À évaluer'] + 1
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
      console.error('Erreur lors de l\'ajout de la conformité:', error)
      
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
        
        setValidationErrors(errorMessages.length > 0 ? errorMessages : ['Erreur lors de la création de la conformité. Veuillez réessayer.'])
      } else {
        setValidationErrors(['Erreur lors de la création de la conformité. Veuillez réessayer.'])
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
      texte: '',
      article: '',
      organisme: '',
      dateEntreeVigueur: '',
      niveauConformite: '',
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
    if (!formData.type) errors.push('Le type de conformité est requis')
    if (!formData.domaine) errors.push('Le domaine est requis')
    if (!formData.texte.trim()) errors.push('Le texte de référence est requis')
    if (!formData.organisme.trim()) errors.push('L\'organisme est requis')
    if (!formData.niveauConformite) errors.push('Le niveau de conformité est requis')
    
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

  // Fonctions pour gérer les actions sur les conformités
  const handleViewConformite = (conformite: Conformite) => {
    setSelectedConformite(conformite)
    setIsViewModalOpen(true)
  }

  const handleEditConformite = (conformite: Conformite) => {
    setSelectedConformite(conformite)
    setIsEditModalOpen(true)
  }

  const handleDeleteConformite = (conformite: Conformite) => {
    setConformiteToDelete(conformite)
    setShowDeleteConfirm(true)
  }

  const confirmDeleteConformite = async () => {
    if (!conformiteToDelete) return

    try {
      // Appel API réel pour supprimer la conformité
      await conformiteService.delete(conformiteToDelete._id)
      
      // Supprimer la conformité de la liste
      setConformites(prev => prev.filter(conformite => conformite._id !== conformiteToDelete._id))
      
      // Mettre à jour les stats
      if (stats) {
        setStats(prev => prev ? {
          ...prev,
          total: prev.total - 1,
          parStatut: {
            ...prev.parStatut,
            [conformiteToDelete.statutConformite]: prev.parStatut[conformiteToDelete.statutConformite as keyof typeof prev.parStatut] - 1
          }
        } : null)
      }
      
      setShowDeleteConfirm(false)
      setConformiteToDelete(null)
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
    }
  }

  const closeViewModal = () => {
    setIsViewModalOpen(false)
    setSelectedConformite(null)
  }

  const closeEditModal = () => {
    setIsEditModalOpen(false)
    setSelectedConformite(null)
  }

  const handleUpdateConformite = async (updatedData: any) => {
    if (!selectedConformite) return

    try {
      // Appel API réel pour mettre à jour la conformité
      const response = await conformiteService.update(selectedConformite._id, updatedData)
      
      // Mettre à jour la conformité dans la liste
      if (response.data) {
        setConformites(prev => prev.map(conformite => 
          conformite._id === selectedConformite._id 
            ? response.data
            : conformite
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
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg">
                <Shield className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Conformité Réglementaire
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Suivi et gestion de la conformité QHSE
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
                Nouvelle Conformité
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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Conformités</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats?.total || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-green-600 dark:text-green-400">
              <TrendingUp className="w-4 h-4 mr-1" />
              <span>+8% ce mois</span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Conformes</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats?.parStatut?.Conforme || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-green-600 dark:text-green-400">
              <CheckCircle className="w-4 h-4 mr-1" />
              <span>Conformité validée</span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Non Conformes</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {nonConformites.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-red-600 dark:text-red-400">
              <AlertTriangle className="w-4 h-4 mr-1" />
              <span>À corriger</span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">À Évaluer</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {conformitesExpirantes.length}
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

        {/* Score de conformité global */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-8">
          <div className="p-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Score de Conformité Global
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Moyenne des scores de conformité
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {stats?.scoreMoyen ? Math.round(stats.scoreMoyen) : 0}%
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Score moyen
                </div>
              </div>
            </div>
            <div className="mt-6">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${stats?.scoreMoyen || 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Filtres et recherche */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-8">
          <div className="p-8">
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Rechercher une conformité..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <select
                  value={filters.statutConformite}
                  onChange={(e) => setFilters({...filters, statutConformite: e.target.value})}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Tous les statuts</option>
                  <option value="Conforme">Conforme</option>
                  <option value="Non conforme">Non conforme</option>
                  <option value="En cours de mise en conformité">En cours</option>
                  <option value="Non applicable">Non applicable</option>
                  <option value="À évaluer">À évaluer</option>
                </select>
                
                <select
                  value={filters.type}
                  onChange={(e) => setFilters({...filters, type: e.target.value})}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Tous les types</option>
                  <option value="Législation">Législation</option>
                  <option value="Réglementation">Réglementation</option>
                  <option value="Norme">Norme</option>
                  <option value="Certification">Certification</option>
                  <option value="Accréditation">Accréditation</option>
                  <option value="Autorisation">Autorisation</option>
                </select>
                
                <select
                  value={filters.domaine}
                  onChange={(e) => setFilters({...filters, domaine: e.target.value})}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Tous les domaines</option>
                  <option value="Sécurité">Sécurité</option>
                  <option value="Qualité">Qualité</option>
                  <option value="Environnement">Environnement</option>
                  <option value="Hygiène">Hygiène</option>
                  <option value="Santé">Santé</option>
                  <option value="Mixte">Mixte</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Liste des conformités */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="px-8 py-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Liste des Conformités ({filteredConformites.length})
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-8 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Conformité
                  </th>
                  <th className="px-8 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Référence
                  </th>
                  <th className="px-8 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-8 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-8 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-8 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Prochaine Évaluation
                  </th>
                  <th className="px-8 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredConformites.map((conformite) => (
                  <tr key={conformite._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {conformite.numero}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {conformite.titre}
                        </div>
                        <div className="text-xs text-gray-400 dark:text-gray-500">
                          {conformite.domaine}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {conformite.reference.texte}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {conformite.reference.organisme}
                      </div>
                      <div className="text-xs text-gray-400 dark:text-gray-500">
                        Art. {conformite.reference.article}
                      </div>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(conformite.type)}`}>
                        {conformite.type}
                      </span>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="flex flex-col space-y-1">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatutConformiteColor(conformite.statutConformite)}`}>
                          {conformite.statutConformite}
                        </span>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getNiveauConformiteColor(conformite.niveauConformite)}`}>
                          {conformite.niveauConformite}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {conformite.scoreConformite}%
                        </div>
                        <div className="ml-2 w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                          <div 
                            className={`h-1 rounded-full ${
                              conformite.scoreConformite >= 80 ? 'bg-green-500' :
                              conformite.scoreConformite >= 60 ? 'bg-yellow-500' :
                              'bg-red-500'
                            }`}
                            style={{ width: `${conformite.scoreConformite}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatDate(conformite.prochaineEvaluation)}
                      </div>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap text-sm font-medium">
                      <ActionButtons
                        onView={() => handleViewConformite(conformite)}
                        onEdit={() => handleEditConformite(conformite)}
                        onDelete={() => handleDeleteConformite(conformite)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal d'ajout de conformité */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={closeAddModal}></div>
            <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Nouvelle Conformité</h3>
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
                  Conformité créée avec succès ! Le modal se fermera automatiquement...
                </span>
              </div>
            </div>
          )}

          {/* Section Informations générales */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-6 rounded-xl border border-green-100 dark:border-green-800">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mr-3">
                <Shield className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 dark:text-white">Informations Générales</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormInput
                label="Titre de la conformité"
                name="titre"
                type="text"
                value={formData.titre}
                onChange={handleInputChange}
                placeholder="Titre descriptif de la conformité"
                required
              />
              
              <FormInput
                label="Type de conformité"
                name="type"
                type="select"
                value={formData.type}
                onChange={handleInputChange}
                options={[
                  { value: 'Législation', label: 'Législation' },
                  { value: 'Réglementation', label: 'Réglementation' },
                  { value: 'Norme', label: 'Norme' },
                  { value: 'Certification', label: 'Certification' },
                  { value: 'Accréditation', label: 'Accréditation' },
                  { value: 'Autorisation', label: 'Autorisation' }
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
                  { value: 'Sécurité', label: 'Sécurité' },
                  { value: 'Qualité', label: 'Qualité' },
                  { value: 'Environnement', label: 'Environnement' },
                  { value: 'Hygiène', label: 'Hygiène' },
                  { value: 'Santé', label: 'Santé' },
                  { value: 'Mixte', label: 'Mixte' }
                ]}
                required
              />
              
              <FormInput
                label="Niveau de conformité"
                name="niveauConformite"
                type="select"
                value={formData.niveauConformite}
                onChange={handleInputChange}
                options={[
                  { value: 'Exemplaire', label: 'Exemplaire' },
                  { value: 'Bon', label: 'Bon' },
                  { value: 'Acceptable', label: 'Acceptable' },
                  { value: 'Insuffisant', label: 'Insuffisant' },
                  { value: 'Critique', label: 'Critique' }
                ]}
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
              <h4 className="text-xl font-semibold text-gray-900 dark:text-white">Description de la Conformité</h4>
            </div>
            <FormInput
              label="Description détaillée"
              name="description"
              type="textarea"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Description complète de la conformité, exigences, objectifs..."
              rows={4}
              required
            />
          </div>

          {/* Section Référence */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-6 rounded-xl border border-purple-100 dark:border-purple-800">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mr-3">
                <Gavel className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 dark:text-white">Référence Réglementaire</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormInput
                label="Texte de référence"
                name="texte"
                type="text"
                value={formData.texte}
                onChange={handleInputChange}
                placeholder="Nom du texte réglementaire"
                required
              />
              
              <FormInput
                label="Article"
                name="article"
                type="text"
                value={formData.article}
                onChange={handleInputChange}
                placeholder="Article concerné"
              />
              
              <FormInput
                label="Organisme"
                name="organisme"
                type="text"
                value={formData.organisme}
                onChange={handleInputChange}
                placeholder="Organisme émetteur"
                required
              />
              
              <FormInput
                label="Date d'entrée en vigueur"
                name="dateEntreeVigueur"
                type="date"
                value={formData.dateEntreeVigueur}
                onChange={handleInputChange}
              />
            </div>
          </div>

          {/* Section Action de conformité */}
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 p-6 rounded-xl border border-orange-100 dark:border-orange-800">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center mr-3">
                <Target className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 dark:text-white">Action de Conformité</h4>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormInput
                label="Description de l'action"
                name="descriptionAction"
                type="textarea"
                value={formData.descriptionAction}
                onChange={handleInputChange}
                placeholder="Description de l'action à mettre en place pour assurer la conformité"
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
                  { value: 'Amélioration', label: 'Amélioration' },
                  { value: 'Formation', label: 'Formation' }
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
              {isSubmitting ? 'Enregistrement...' : 'Enregistrer la conformité'}
            </FormButton>
          </div>
        </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de vue de conformité */}
      <ViewModal
        isOpen={isViewModalOpen}
        onClose={closeViewModal}
        title="Détails de la Conformité"
      >
        {selectedConformite && (
          <div className="space-y-6">
            {/* Informations générales */}
            <InfoSection
              title="Informations Générales"
              gradientFrom="from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20"
              gradientTo=""
              borderColor="border-green-100 dark:border-green-800"
              icon={<Shield className="w-5 h-5 text-green-600 dark:text-green-400" />}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoField label="Numéro" value={selectedConformite.numero} />
                <InfoField label="Titre" value={selectedConformite.titre} />
                <InfoField label="Type" value={selectedConformite.type} />
                <InfoField label="Domaine" value={selectedConformite.domaine} />
                <InfoField 
                  label="Statut de conformité" 
                  value={
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      selectedConformite.statutConformite === 'Conforme' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                      selectedConformite.statutConformite === 'Non conforme' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                      selectedConformite.statutConformite === 'En cours de mise en conformité' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                      selectedConformite.statutConformite === 'Non applicable' ? 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' :
                      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    }`}>
                      {selectedConformite.statutConformite}
                    </span>
                  } 
                />
                <InfoField 
                  label="Niveau de conformité" 
                  value={
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      selectedConformite.niveauConformite === 'Exemplaire' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                      selectedConformite.niveauConformite === 'Bon' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                      selectedConformite.niveauConformite === 'Acceptable' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                      selectedConformite.niveauConformite === 'Insuffisant' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                      'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {selectedConformite.niveauConformite}
                    </span>
                  } 
                />
              </div>
              <div className="mt-4">
                <InfoField label="Description" value={selectedConformite.description} />
              </div>
            </InfoSection>

            {/* Référence réglementaire */}
            <InfoSection
              title="Référence Réglementaire"
              gradientFrom="from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20"
              gradientTo=""
              borderColor="border-purple-100 dark:border-purple-800"
              icon={<Gavel className="w-5 h-5 text-purple-600 dark:text-purple-400" />}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoField label="Texte de référence" value={selectedConformite.reference.texte} />
                <InfoField label="Article" value={selectedConformite.reference.article} />
                <InfoField label="Organisme" value={selectedConformite.reference.organisme} />
                <InfoField label="Date d'entrée en vigueur" value={formatDate(selectedConformite.reference.dateEntreeVigueur)} />
              </div>
            </InfoSection>

            {/* Score et évaluation */}
            <InfoSection
              title="Score et Évaluation"
              gradientFrom="from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20"
              gradientTo=""
              borderColor="border-blue-100 dark:border-blue-800"
              icon={<Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoField 
                  label="Score de conformité" 
                  value={
                    <div className="flex items-center">
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">{selectedConformite.scoreConformite}%</span>
                      <div className="ml-3 w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            selectedConformite.scoreConformite >= 80 ? 'bg-green-500' :
                            selectedConformite.scoreConformite >= 60 ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${selectedConformite.scoreConformite}%` }}
                        ></div>
                      </div>
                    </div>
                  } 
                />
                <InfoField label="Prochaine évaluation" value={formatDate(selectedConformite.prochaineEvaluation)} />
              </div>
            </InfoSection>
          </div>
        )}
      </ViewModal>

      {/* Modal d'édition de conformité */}
      <ModalConformite
        isOpen={isEditModalOpen}
        onClose={closeEditModal}
        conformite={selectedConformite ? {
          ...selectedConformite,
          statut: selectedConformite.statutConformite,
          priorite: 'Moyenne', // valeur par défaut
          dateEvaluation: selectedConformite.derniereEvaluation.date || '',
          dateEcheance: selectedConformite.prochaineEvaluation,
          responsable: selectedConformite.createdBy,
          exigences: [],
          actionsCorrectives: selectedConformite.actionsConformite,
          documents: []
        } : null}
        mode="edit"
        onSubmit={handleUpdateConformite}
      />

      {/* Modal de confirmation de suppression */}
      <DeleteConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDeleteConformite}
        title="Confirmer la suppression"
        itemName={conformiteToDelete?.titre || ''}
        itemType="la conformité"
      />
    </div>
  )
} 