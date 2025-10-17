import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  HardHat, 
  Droplets, 
  AlertTriangle, 
  BarChart3, 
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  GraduationCap,
  FlaskConical,
  RefreshCw,
  Target,
  MapPin,
  Users,
  Calendar
} from 'lucide-react';

// Imports des modals
import ModalHygiene from '../components/features/ModalHygiene';
import ModalEPI from '../components/features/ModalEPI';
import ModalProduitChimique from '../components/features/ModalProduitChimique';
import ModalIncident from '../components/features/ModalIncident';
import ModalRisque from '../components/features/ModalRisque';
import ModalFormation from '../components/features/ModalFormation';
import { 
  hygieneService, 
  epiService, 
  produitChimiqueService,
  hseStatsService,
  incidentService,
  risqueService,
  formationService
} from '../services/hseService';

interface Hygiene {
  _id: string;
  numero: string;
  titre: string;
  type: string;
  statut: string;
  zone: {
    nom: string;
  };
  evaluation: {
    statut: string;
    score: number;
  };
  datePlanification: string;
}

interface EPI {
  _id: string;
  numero: string;
  nom: string;
  type: string;
  categorie: string;
  statut: string;
  stock: {
    quantiteDisponible: number;
    seuilAlerte: number;
  };
  caracteristiques: {
    marque: string;
    modele: string;
  };
}

interface ProduitChimique {
  _id: string;
  numero: string;
  nom: string;
  classification: {
    type: string;
  };
  statut: string;
  stock: {
    quantiteDisponible: number;
    seuilAlerte: number;
  };
  risques: {
    symboles: string[];
  };
}

interface Incident {
  _id: string;
  numero: string;
  titre: string;
  type: string;
  gravite: string;
  statut: string;
  dateIncident: string;
  description: string;
  declarant: {
    nom: string;
    prenom: string;
  };
}

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
  dateIdentification: string;
  dateEvaluation: string;
  responsable: {
    nom: string;
    prenom: string;
    matricule: string;
  };
  sources: Array<string>;
  consequences: Array<string>;
  mesuresPreventives: Array<{
    description: string;
    type: string;
    responsable: string;
    dateEcheance: string;
    statut: string;
  }>;
  mesuresCorrectives: Array<{
    description: string;
    type: string;
    responsable: string;
    dateEcheance: string;
    statut: string;
  }>;
  indicateurs: Array<{
    nom: string;
    valeur: string;
    seuil: string;
    unite: string;
  }>;
  documents: Array<{
    nom: string;
    type: string;
    url: string;
  }>;
  createdBy: {
    nom: string;
    prenom: string;
  };
}

interface Formation {
  _id: string;
  numero: string;
  titre: string;
  type: string;
  statut: string;
  datePlanification: string;
  duree: number;
  formateur: {
    nom: string;
    prenom: string;
  };
  participants: number;
}

// Interfaces pour les données statistiques (basées sur l'API réelle)
interface Statistiques {
  // Statistiques générales
  generales: {
    hygiene: number;
    epi: number;
    produitsChimiques: number;
    incidents: number;
    risques: number;
    formations: number;
  };
  
  // Statistiques détaillées par module
  hygiene: {
    total: number;
    conformes: number;
    nonConformes: number;
    enCours: number;
    planifies: number;
    tauxConformite: number;
  };
  
  epi: {
    total: number;
    actifs: number;
    inactifs: number;
    enMaintenance: number;
    enAlerte: number;
  };
  
  produitsChimiques: {
    total: number;
    actifs: number;
    inactifs: number;
    enAlerte: number;
    perimes: number;
  };
  
  incidents: {
    total: number;
    critiques: number;
    majeurs: number;
    mineurs: number;
    enCours: number;
    resolus: number;
    tauxResolution: number;
    evolution: Array<{ _id: { year: number; month: number }; count: number }>;
    topZones: Array<{ _id: string; count: number }>;
  };
  
  risques: {
    total: number;
    eleves: number;
    moyens: number;
    faibles: number;
    enCours: number;
    traites: number;
    tauxTraitement: number;
  };
  
  formations: {
    total: number;
    planifiees: number;
    enCours: number;
    terminees: number;
    annulees: number;
  };
  
  // Alertes et notifications
  alertes: Array<{
    type: 'warning' | 'error' | 'info';
    message: string;
    icon: string;
  }>;
  
  // Métadonnées
  periode: {
    debut: string;
    fin: string;
    type: string;
  };
}

interface HSEProps {
  activeTab?: string;
}

const HSE: React.FC<HSEProps> = ({ activeTab: initialTab = 'hygiene' }) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [hygiene, setHygiene] = useState<Hygiene[]>([]);
  const [epi, setEpi] = useState<EPI[]>([]);
  const [produitsChimiques, setProduitsChimiques] = useState<ProduitChimique[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [risques, setRisques] = useState<Risque[]>([]);
  const [formations, setFormations] = useState<Formation[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatut, setFilterStatut] = useState('');

  // États pour les statistiques
  const [statistiques, setStatistiques] = useState<Statistiques | null>(null);
  const [statistiquesLoading, setStatistiquesLoading] = useState(false);
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [vueActive, setVueActive] = useState<'general' | 'incidents' | 'risques' | 'formations' | 'epi' | 'hygiene' | 'produits'>('general');

  // États pour les modals
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedItem, setSelectedItem] = useState<any>(null);

  // Mettre à jour l'onglet actif quand la prop change
  useEffect(() => {
    if (initialTab !== activeTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Charger les données
  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'hygiene') {
        const response = await hygieneService.getAll();
        const data = response.data;
        setHygiene(data.items || data.hygiene || data || []);
      } else if (activeTab === 'epi') {
        const response = await epiService.getAll();
        const data = response.data;
        setEpi(data.items || data.epi || data || []);
      } else if (activeTab === 'produits-chimiques') {
        const response = await produitChimiqueService.getAll();
        const data = response.data;
        console.log('Données produits chimiques chargées:', data);
        setProduitsChimiques(data.items || data.produits || data.produitsChimiques || data || []);
      } else if (activeTab === 'incidents') {
        const response = await incidentService.getAll();
        const data = response.data;
        setIncidents(data.items || data.incidents || data || []);
      } else if (activeTab === 'risques') {
        const response = await risqueService.getAll();
        const data = response.data;
        setRisques(data.items || data.risques || data || []);
      } else if (activeTab === 'formations') {
        const response = await formationService.getAll();
        const data = response.data;
        setFormations(data.items || data.formations || data || []);
      }
    } catch (error: any) {
      console.error('Erreur lors du chargement des données:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      // Handle HTML response (likely an error page)
      if (error.response?.data && typeof error.response.data === 'string' && error.response.data.includes('<!DOCTYPE')) {
        console.error('Received HTML instead of JSON - likely a server error page');
        alert('Erreur serveur - Veuillez réessayer plus tard');
      } else {
        alert('Erreur lors du chargement des données: ' + (error.message || 'Erreur inconnue'));
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'Conforme':
      case 'Validé':
      case 'Actif':
        return 'text-green-600 bg-green-100';
      case 'Non conforme':
      case 'Rejeté':
      case 'Suspendu':
        return 'text-red-600 bg-red-100';
      case 'En attente':
      case 'Planifié':
        return 'text-yellow-600 bg-yellow-100';
      case 'En cours':
        return 'text-blue-600 bg-blue-100';
      case 'Archivé':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getGraviteColor = (gravite: string) => {
    switch (gravite) {
      case 'Critique': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'Grave': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'Modérée': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Légère': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getNiveauRisqueColor = (niveau: string) => {
    switch (niveau) {
      case 'Critique': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'Élevé': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'Modéré': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Faible': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };


  // Charger les statistiques
  const loadStatistiques = async () => {
    setStatistiquesLoading(true);
    try {
      // Utiliser hseStatsService pour obtenir les statistiques
      const params: any = {};
      if (dateDebut && dateFin) {
        params.periode = `${dateDebut}_${dateFin}`;
      } else {
        params.periode = 'mois'; // Période par défaut
      }
      
      const response = await hseStatsService.getStats(params.periode);
      
      console.log('Données du tableau de bord reçues:', response.data);
      setStatistiques(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    } finally {
      setStatistiquesLoading(false);
    }
  };

  // Charger les statistiques quand on change d'onglet vers statistiques
  useEffect(() => {
    if (activeTab === 'statistiques') {
      loadStatistiques();
    }
  }, [activeTab, dateDebut, dateFin]);


  const getStockColor = (quantite: number, seuil: number) => {
    if (quantite <= seuil) {
      return 'text-red-600 bg-red-100';
    } else if (quantite <= seuil * 2) {
      return 'text-yellow-600 bg-yellow-100';
    } else {
      return 'text-green-600 bg-green-100';
    }
  };

  const getConformiteIcon = (statut: string) => {
    switch (statut) {
      case 'Conforme':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'Non conforme':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'En attente':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getRisqueIcon = (symboles: string[]) => {
    if (symboles.includes('Toxique') || symboles.includes('Explosif')) {
      return <AlertCircle className="h-4 w-4 text-red-600" />;
    } else if (symboles.includes('Corrosif') || symboles.includes('Inflammable')) {
      return <AlertTriangle className="h-4 w-4 text-orange-600" />;
    } else {
      return <Shield className="h-4 w-4 text-blue-600" />;
    }
  };


  // Handlers pour les modals
  const handleCreate = () => {
    setSelectedItem(null);
    setModalMode('create');
    setShowModal(true);
  };

  const handleEdit = (item: any) => {
    setSelectedItem(item);
    setModalMode('edit');
    setShowModal(true);
  };

  const handleView = (item: any) => {
    setSelectedItem(item);
    setModalMode('view');
    setShowModal(true);
  };

  const handleDelete = async (item: any) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet élément ?')) {
      try {
        // Utiliser les services appropriés selon le type
        switch(activeTab) {
          case 'hygiene':
            await hygieneService.delete(item._id);
            break;
          case 'epi':
            await epiService.delete(item._id);
            break;
          case 'produits-chimiques':
            await produitChimiqueService.delete(item._id);
            break;
          case 'incidents':
            await incidentService.delete(item._id);
            break;
          case 'risques':
            await risqueService.delete(item._id);
            break;
          case 'formations':
            await formationService.delete(item._id);
            break;
          default:
            throw new Error(`Type ${activeTab} non supporté`);
        }
        
        console.log('Élément supprimé avec succès');
        alert('Élément supprimé avec succès');
        // Recharger les données après suppression
        loadData();
      } catch (error: any) {
        console.error('Erreur lors de la suppression:', error);
        alert('Erreur lors de la suppression: ' + (error.message || 'Erreur inconnue'));
      }
    }
  };

  const handleModalSubmit = async (data: any) => {
    try {
      if (activeTab === 'hygiene') {
        if (modalMode === 'create') {
          console.log('Données envoyées:', data);
          const response = await hygieneService.create(data);
          console.log('Contrôle d\'hygiène créé:', response.data);
          alert('Contrôle d\'hygiène créé avec succès');
        } else if (modalMode === 'edit' && selectedItem) {
          const response = await hygieneService.update(selectedItem._id, data);
          console.log('Contrôle d\'hygiène modifié:', response.data);
          alert('Contrôle d\'hygiène modifié avec succès');
        }
      } else if (activeTab === 'epi') {
        if (modalMode === 'create') {
          console.log('Données EPI envoyées:', data);
          const response = await epiService.create(data);
          console.log('EPI créé:', response.data);
          alert('EPI créé avec succès');
        } else if (modalMode === 'edit' && selectedItem) {
          const response = await epiService.update(selectedItem._id, data);
          console.log('EPI modifié:', response.data);
          alert('EPI modifié avec succès');
        }
      } else if (activeTab === 'produits-chimiques') {
        if (modalMode === 'create') {
          console.log('Données produit chimique envoyées:', data);
          const response = await produitChimiqueService.create(data);
          console.log('Produit chimique créé:', response.data);
          alert('Produit chimique créé avec succès');
        } else if (modalMode === 'edit' && selectedItem) {
          const response = await produitChimiqueService.update(selectedItem._id, data);
          console.log('Produit chimique modifié:', response.data);
          alert('Produit chimique modifié avec succès');
        }
      } else if (activeTab === 'incidents') {
        if (modalMode === 'create') {
          console.log('Données incident envoyées:', data);
          const response = await incidentService.create(data);
          console.log('Incident créé:', response.data);
          alert('Incident créé avec succès');
        } else if (modalMode === 'edit' && selectedItem) {
          const response = await incidentService.update(selectedItem._id, data);
          console.log('Incident modifié:', response.data);
          alert('Incident modifié avec succès');
        }
      } else if (activeTab === 'risques') {
        if (modalMode === 'create') {
          console.log('Données risque envoyées:', data);
          const response = await risqueService.create(data);
          console.log('Risque créé:', response.data);
          alert('Risque créé avec succès');
        } else if (modalMode === 'edit' && selectedItem) {
          const response = await risqueService.update(selectedItem._id, data);
          console.log('Risque modifié:', response.data);
          alert('Risque modifié avec succès');
        }
      } else if (activeTab === 'formations') {
        if (modalMode === 'create') {
          console.log('Données formation envoyées:', data);
          const response = await formationService.create(data);
          console.log('Formation créée:', response.data);
          alert('Formation créée avec succès');
        } else if (modalMode === 'edit' && selectedItem) {
          const response = await formationService.update(selectedItem._id, data);
          console.log('Formation modifiée:', response.data);
          alert('Formation modifiée avec succès');
        }
      }
      
      // Fermer le modal et recharger les données après création/modification
      setShowModal(false);
      setSelectedItem(null);
      loadData();
    } catch (error: any) {
      console.error('Erreur lors de la soumission:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      // Handle HTML response (likely an error page)
      if (error.response?.data && typeof error.response.data === 'string' && error.response.data.includes('<!DOCTYPE')) {
        console.error('Received HTML instead of JSON - likely a server error page');
        alert('Erreur serveur - Veuillez réessayer plus tard');
      } else {
        const errorMessage = error.response?.data?.message || error.message || 'Erreur inconnue';
        alert('Erreur lors de la sauvegarde: ' + errorMessage);
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedItem(null);
  };

  const tabs = [
    { id: 'hygiene', label: 'Hygiène', icon: Droplets },
    { id: 'epi', label: 'EPI', icon: HardHat },
    { id: 'produits-chimiques', label: 'Produits Chimiques', icon: AlertTriangle },
    { id: 'incidents', label: 'Incidents', icon: AlertCircle },
    { id: 'risques', label: 'Gestion des Risques', icon: AlertTriangle },
    { id: 'formations', label: 'Formations QHSE', icon: GraduationCap },
    { id: 'statistiques', label: 'Statistiques', icon: BarChart3 }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Shield className="h-8 w-8 text-primary-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Module HSE
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Gestion de l'hygiène, sécurité et environnement
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={handleCreate}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>
              {activeTab === 'hygiene' && 'Nouveau contrôle hygiène'}
              {activeTab === 'epi' && 'Nouvel EPI'}
              {activeTab === 'produits-chimiques' && 'Nouveau produit chimique'}
              {activeTab === 'incidents' && 'Nouvel incident'}
              {activeTab === 'risques' && 'Nouveau risque'}
              {activeTab === 'formations' && 'Nouvelle formation'}
              {activeTab === 'statistiques' && 'Nouvelles statistiques'}
            </span>
          </button>
          
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder={`Rechercher dans ${tabs.find(t => t.id === activeTab)?.label}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
          <select
            value={filterStatut}
            onChange={(e) => setFilterStatut(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value="">Tous les statuts</option>
            <option value="Conforme">Conforme</option>
            <option value="Non conforme">Non conforme</option>
            <option value="En attente">En attente</option>
            <option value="Actif">Actif</option>
            <option value="Planifié">Planifié</option>
            <option value="En cours">En cours</option>
            <option value="Terminé">Terminé</option>
            <option value="Reporté">Reporté</option>
          </select>
          <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-2 dark:text-white">
            <Filter className="h-4 w-4" />
            <span>Filtres</span>
          </button>
          <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-2 dark:text-white">
            <Download className="h-4 w-4" />
            <span>Exporter</span>
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {activeTab === 'hygiene' && (
          <>
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Droplets className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Contrôles</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{hygiene.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Conformes</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{hygiene.filter(h => h.evaluation?.statut === 'Conforme').length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                  <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Non Conformes</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{hygiene.filter(h => h.evaluation?.statut === 'Non conforme').length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                  <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">En Attente</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{hygiene.filter(h => h.evaluation?.statut === 'En attente').length}</p>
                </div>
              </div>
            </div>
          </>
        )}
        
        {activeTab === 'epi' && (
          <>
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <HardHat className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total EPI</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{epi.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Actifs</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{epi.filter(e => e.statut === 'Actif').length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Stock Faible</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{epi.filter(e => e.stock?.quantiteDisponible <= e.stock?.seuilAlerte).length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                  <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">En Maintenance</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{epi.filter(e => e.statut === 'En maintenance').length}</p>
                </div>
              </div>
            </div>
          </>
        )}
        
        {activeTab === 'produits-chimiques' && (
          <>
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <FlaskConical className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Produits</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{produitsChimiques.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Dangereux</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{produitsChimiques.filter(p => p.risques?.symboles?.includes('Toxique') || p.risques?.symboles?.includes('Corrosif')).length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                  <AlertCircle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Stock Faible</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{produitsChimiques.filter(p => p.stock?.quantiteDisponible <= p.stock?.seuilAlerte).length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Actifs</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{produitsChimiques.filter(p => p.statut === 'Actif').length}</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <>
            {activeTab === 'hygiene' && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Contrôle
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Zone
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Évaluation
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Statut
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {hygiene.map((controle) => (
                      <tr key={controle._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {controle.numero}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {controle.titre}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {controle.type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {controle.zone.nom}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            {getConformiteIcon(controle.evaluation.statut)}
                            <span className="text-sm text-gray-900 dark:text-white">
                              {controle.evaluation.statut}
                            </span>
                            {controle.evaluation.score && (
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                ({controle.evaluation.score}%)
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatutColor(controle.statut)}`}>
                            {controle.statut}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {new Date(controle.datePlanification).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button 
                              onClick={() => handleView(controle)}
                              className="text-primary-600 hover:text-primary-900"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleEdit(controle)}
                              className="text-gray-600 hover:text-gray-900"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleDelete(controle)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'epi' && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        EPI
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Marque/Modèle
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Stock
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
                    {epi.map((equipement) => (
                      <tr key={equipement._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {equipement.numero}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {equipement.nom}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {equipement.type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {equipement.caracteristiques.marque} {equipement.caracteristiques.modele}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStockColor(equipement.stock.quantiteDisponible, equipement.stock.seuilAlerte)}`}>
                              {equipement.stock.quantiteDisponible} disponibles
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatutColor(equipement.statut)}`}>
                            {equipement.statut}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button 
                              onClick={() => handleView(equipement)}
                              className="text-primary-600 hover:text-primary-900"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleEdit(equipement)}
                              className="text-gray-600 hover:text-gray-900"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleDelete(equipement)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'produits-chimiques' && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Produit
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Risques
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Stock
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
                    {produitsChimiques.map((produit) => (
                      <tr key={produit._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {produit.numero}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {produit.nom}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {produit.classification.type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-1">
                            {getRisqueIcon(produit.risques.symboles)}
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {produit.risques.symboles.length} symbole(s)
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStockColor(produit.stock.quantiteDisponible, produit.stock.seuilAlerte)}`}>
                              {produit.stock.quantiteDisponible} disponibles
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatutColor(produit.statut)}`}>
                            {produit.statut}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button 
                              onClick={() => handleView(produit)}
                              className="text-primary-600 hover:text-primary-900"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleEdit(produit)}
                              className="text-gray-600 hover:text-gray-900"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleDelete(produit)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'incidents' && (
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
                        Statut
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Détecteur
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {incidents.map((incident) => (
                      <tr key={incident._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {incident.numero}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {incident.titre}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {incident.type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getGraviteColor(incident.gravite)}`}>
                            {incident.gravite}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatutColor(incident.statut)}`}>
                            {incident.statut}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {incident.declarant?.prenom} {incident.declarant?.nom}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {new Date(incident.dateIncident).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button 
                              onClick={() => handleView(incident)}
                              className="text-primary-600 hover:text-primary-900"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleEdit(incident)}
                              className="text-gray-600 hover:text-gray-900"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleDelete(incident)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'risques' && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Risque
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Niveau
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Probabilité
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Gravité
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Responsable
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {risques.map((risque) => (
                      <tr key={risque._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {risque.numero}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {risque.titre}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {risque.type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getNiveauRisqueColor(risque.niveauRisque)}`}>
                            {risque.niveauRisque}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {risque.probabilite}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {risque.gravite}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {risque.responsable ? `${risque.responsable.prenom} ${risque.responsable.nom}` : 'Non assigné'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button 
                              onClick={() => handleView(risque)}
                              className="text-primary-600 hover:text-primary-900"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleEdit(risque)}
                              className="text-gray-600 hover:text-gray-900"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleDelete(risque)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'formations' && (
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
                        Durée
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Formateur
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
                    {formations.map((formation) => (
                      <tr key={formation._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {formation.numero}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {formation.titre}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {formation.type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {formation.duree}h
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {formation.formateur.prenom} {formation.formateur.nom}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {formation.participants}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatutColor(formation.statut)}`}>
                            {formation.statut}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button 
                              onClick={() => handleView(formation)}
                              className="text-primary-600 hover:text-primary-900"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleEdit(formation)}
                              className="text-gray-600 hover:text-gray-900"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleDelete(formation)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'statistiques' && (
              <div className="p-6 space-y-6">
                {/* Filtres */}
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                  <div className="flex items-center space-x-4 mb-4">
                    <Filter className="h-5 w-5 text-gray-500" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Filtres</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Date de début
                      </label>
                      <input
                        type="date"
                        value={dateDebut}
                        onChange={(e) => setDateDebut(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Date de fin
                      </label>
                      <input
                        type="date"
                        value={dateFin}
                        onChange={(e) => setDateFin(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Période rapide
                      </label>
                      <select
                        onChange={(e) => {
                          const value = e.target.value;
                          const today = new Date();
                          if (value === '7j') {
                            const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                            setDateDebut(weekAgo.toISOString().split('T')[0]);
                            setDateFin(today.toISOString().split('T')[0]);
                          } else if (value === '30j') {
                            const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
                            setDateDebut(monthAgo.toISOString().split('T')[0]);
                            setDateFin(today.toISOString().split('T')[0]);
                          } else if (value === '90j') {
                            const quarterAgo = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000);
                            setDateDebut(quarterAgo.toISOString().split('T')[0]);
                            setDateFin(today.toISOString().split('T')[0]);
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                      >
                        <option value="">Sélectionner...</option>
                        <option value="7j">7 derniers jours</option>
                        <option value="30j">30 derniers jours</option>
                        <option value="90j">90 derniers jours</option>
                      </select>
                    </div>
                    <div className="flex items-end space-x-2">
                      <button
                        onClick={loadStatistiques}
                        className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors flex items-center justify-center space-x-2"
                      >
                        <RefreshCw className="h-4 w-4" />
                        <span>Actualiser</span>
                      </button>
                      <button
                        onClick={() => {
                          setDateDebut('');
                          setDateFin('');
                        }}
                        className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      >
                        Effacer
                      </button>
                    </div>
                  </div>
                </div>

                {/* Navigation des vues */}
                <div className="border-b border-gray-200 dark:border-gray-700">
                  <nav className="-mb-px flex space-x-8">
                    {[
                      { id: 'general', label: 'Vue Générale', icon: BarChart3 },
                      { id: 'incidents', label: 'Incidents', icon: AlertTriangle },
                      { id: 'risques', label: 'Risques', icon: Shield },
                      { id: 'formations', label: 'Formations', icon: GraduationCap },
                      { id: 'epi', label: 'EPI', icon: HardHat },
                      { id: 'hygiene', label: 'Hygiène', icon: Droplets },
                      { id: 'produits', label: 'Produits Chimiques', icon: FlaskConical }
                    ].map((vue) => {
                      const Icon = vue.icon;
                      return (
                        <button
                          key={vue.id}
                          onClick={() => setVueActive(vue.id as any)}
                          className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                            vueActive === vue.id
                              ? 'border-primary-500 text-primary-600'
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                          <span>{vue.label}</span>
                        </button>
                      );
                    })}
                  </nav>
                </div>

                {/* Contenu principal */}
                {statistiquesLoading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                  </div>
                ) : statistiques ? (
                  <div className="space-y-6">
                    {/* Vue Générale */}
                    {vueActive === 'general' && (
                      <>
                        {/* Alertes et notifications */}
                        {statistiques.alertes && statistiques.alertes.length > 0 && (
                          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                              Alertes et Notifications
                            </h3>
                            <div className="space-y-3">
                              {statistiques.alertes.map((alerte, index) => {
                                const IconComponent = alerte.icon === 'HardHat' ? HardHat :
                                                     alerte.icon === 'AlertTriangle' ? AlertTriangle :
                                                     alerte.icon === 'AlertCircle' ? AlertCircle :
                                                     alerte.icon === 'Shield' ? Shield : AlertCircle;
                                
                                return (
                                  <div
                                    key={index}
                                    className={`p-4 rounded-lg border-l-4 ${
                                      alerte.type === 'error' 
                                        ? 'bg-red-50 border-red-400 text-red-800 dark:bg-red-900/20 dark:text-red-200'
                                        : alerte.type === 'warning'
                                        ? 'bg-yellow-50 border-yellow-400 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200'
                                        : 'bg-blue-50 border-blue-400 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200'
                                    }`}
                                  >
                                    <div className="flex items-center">
                                      <IconComponent className="h-5 w-5 mr-3" />
                                      <span className="font-medium">{alerte.message}</span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Statistiques générales */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
                          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                            <div className="flex items-center">
                              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                                <Droplets className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                              </div>
                              <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Hygiène</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{statistiques.generales?.hygiene || 0}</p>
                                {statistiques.hygiene?.tauxConformite !== undefined && (
                                  <p className="text-xs text-green-600 dark:text-green-400">
                                    {statistiques.hygiene.tauxConformite}% conforme
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                            <div className="flex items-center">
                              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                                <HardHat className="h-6 w-6 text-green-600 dark:text-green-400" />
                              </div>
                              <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">EPI</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{statistiques.generales?.epi || 0}</p>
                                {statistiques.epi?.enAlerte !== undefined && statistiques.epi.enAlerte > 0 && (
                                  <p className="text-xs text-red-600 dark:text-red-400">
                                    {statistiques.epi.enAlerte} en alerte
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                            <div className="flex items-center">
                              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                                <FlaskConical className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                              </div>
                              <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Produits</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{statistiques.generales?.produitsChimiques || 0}</p>
                                {statistiques.produitsChimiques?.perimes !== undefined && statistiques.produitsChimiques.perimes > 0 && (
                                  <p className="text-xs text-red-600 dark:text-red-400">
                                    {statistiques.produitsChimiques.perimes} périmés
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                            <div className="flex items-center">
                              <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                                <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
                              </div>
                              <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Incidents</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{statistiques.generales?.incidents || 0}</p>
                                {statistiques.incidents?.tauxResolution !== undefined && (
                                  <p className="text-xs text-green-600 dark:text-green-400">
                                    {statistiques.incidents.tauxResolution}% résolus
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                            <div className="flex items-center">
                              <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                                <Shield className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                              </div>
                              <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Risques</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{statistiques.generales?.risques || 0}</p>
                                {statistiques.risques?.tauxTraitement !== undefined && (
                                  <p className="text-xs text-green-600 dark:text-green-400">
                                    {statistiques.risques.tauxTraitement}% traités
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                            <div className="flex items-center">
                              <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
                                <GraduationCap className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                              </div>
                              <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Formations</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{statistiques.generales?.formations || 0}</p>
                                {statistiques.formations?.terminees !== undefined && (
                                  <p className="text-xs text-green-600 dark:text-green-400">
                                    {statistiques.formations.terminees} terminées
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Graphiques et visualisations */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {/* Graphique des incidents par gravité */}
                          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                            <h3 className="text-lg font-semibold mb-4 flex items-center">
                              <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                              Incidents par Gravité
                            </h3>
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Critiques</span>
                                <div className="flex items-center space-x-2">
                                  <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                    <div 
                                      className="bg-red-600 h-2 rounded-full" 
                                      style={{ 
                                        width: `${statistiques.incidents?.total ? (statistiques.incidents.critiques / statistiques.incidents.total) * 100 : 0}%` 
                                      }}
                                    ></div>
                                  </div>
                                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                                    {statistiques.incidents?.critiques || 0}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Majeurs</span>
                                <div className="flex items-center space-x-2">
                                  <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                    <div 
                                      className="bg-orange-500 h-2 rounded-full" 
                                      style={{ 
                                        width: `${statistiques.incidents?.total ? (statistiques.incidents.majeurs / statistiques.incidents.total) * 100 : 0}%` 
                                      }}
                                    ></div>
                                  </div>
                                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                                    {statistiques.incidents?.majeurs || 0}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Mineurs</span>
                                <div className="flex items-center space-x-2">
                                  <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                    <div 
                                      className="bg-yellow-500 h-2 rounded-full" 
                                      style={{ 
                                        width: `${statistiques.incidents?.total ? (statistiques.incidents.mineurs / statistiques.incidents.total) * 100 : 0}%` 
                                      }}
                                    ></div>
                                  </div>
                                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                                    {statistiques.incidents?.mineurs || 0}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Graphique des risques par niveau */}
                          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                            <h3 className="text-lg font-semibold mb-4 flex items-center">
                              <Shield className="h-5 w-5 text-orange-500 mr-2" />
                              Risques par Niveau
                            </h3>
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Élevés</span>
                                <div className="flex items-center space-x-2">
                                  <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                    <div 
                                      className="bg-red-600 h-2 rounded-full" 
                                      style={{ 
                                        width: `${statistiques.risques?.total ? (statistiques.risques.eleves / statistiques.risques.total) * 100 : 0}%` 
                                      }}
                                    ></div>
                                  </div>
                                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                                    {statistiques.risques?.eleves || 0}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Moyens</span>
                                <div className="flex items-center space-x-2">
                                  <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                    <div 
                                      className="bg-orange-500 h-2 rounded-full" 
                                      style={{ 
                                        width: `${statistiques.risques?.total ? (statistiques.risques.moyens / statistiques.risques.total) * 100 : 0}%` 
                                      }}
                                    ></div>
                                  </div>
                                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                                    {statistiques.risques?.moyens || 0}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Faibles</span>
                                <div className="flex items-center space-x-2">
                                  <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                    <div 
                                      className="bg-green-500 h-2 rounded-full" 
                                      style={{ 
                                        width: `${statistiques.risques?.total ? (statistiques.risques.faibles / statistiques.risques.total) * 100 : 0}%` 
                                      }}
                                    ></div>
                                  </div>
                                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                                    {statistiques.risques?.faibles || 0}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Top zones avec incidents et indicateurs clés */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {/* Top 5 des zones avec le plus d'incidents */}
                          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                            <h3 className="text-lg font-semibold mb-4 flex items-center">
                              <MapPin className="h-5 w-5 text-red-500 mr-2" />
                              Zones à Risque
                            </h3>
                            <div className="space-y-3">
                              {statistiques.incidents?.topZones && statistiques.incidents.topZones.length > 0 ? (
                                statistiques.incidents.topZones.map((zone, index) => (
                                  <div key={index} className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                      {zone._id || `Zone ${index + 1}`}
                                    </span>
                                    <div className="flex items-center space-x-2">
                                      <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                        <div 
                                          className="bg-red-500 h-2 rounded-full" 
                                          style={{ 
                                            width: `${Math.min((zone.count / Math.max(...statistiques.incidents.topZones.map(z => z.count))) * 100, 100)}%` 
                                          }}
                                        ></div>
                                      </div>
                                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                                        {zone.count}
                                      </span>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <p className="text-sm text-gray-500 dark:text-gray-400">Aucune donnée disponible</p>
                              )}
                            </div>
                          </div>

                          {/* Indicateurs de conformité */}
                          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                            <h3 className="text-lg font-semibold mb-4 flex items-center">
                              <Target className="h-5 w-5 mr-2 text-blue-600" />
                              Indicateurs de Performance
                            </h3>
                            <div className="space-y-4">
                              {statistiques.hygiene && (
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-gray-600 dark:text-gray-400">Taux conformité hygiène</span>
                                  <span className="text-sm font-medium text-green-600">
                                    {statistiques.hygiene.tauxConformite}%
                                  </span>
                                </div>
                              )}
                              {statistiques.incidents && (
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-gray-600 dark:text-gray-400">Taux résolution incidents</span>
                                  <span className="text-sm font-medium text-green-600">
                                    {statistiques.incidents.tauxResolution}%
                                  </span>
                                </div>
                              )}
                              {statistiques.risques && (
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-gray-600 dark:text-gray-400">Taux traitement risques</span>
                                  <span className="text-sm font-medium text-green-600">
                                    {statistiques.risques.tauxTraitement}%
                                  </span>
                                </div>
                              )}
                              {statistiques.formations && (
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-gray-600 dark:text-gray-400">Formations terminées</span>
                                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                                    {statistiques.formations.terminees} / {statistiques.formations.total}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                            <h3 className="text-lg font-semibold mb-4 flex items-center">
                              <AlertTriangle className="h-5 w-5 mr-2 text-orange-600" />
                              Alertes et stocks
                            </h3>
                            <div className="space-y-4">
                              {statistiques.epi && (
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-gray-600 dark:text-gray-400">EPI en alerte</span>
                                  <span className={`text-sm font-medium ${statistiques.epi.enAlerte > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                                    {statistiques.epi.enAlerte}
                                  </span>
                                </div>
                              )}
                              {statistiques.produitsChimiques && (
                                <>
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Produits en alerte</span>
                                    <span className={`text-sm font-medium ${statistiques.produitsChimiques.enAlerte > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                                      {statistiques.produitsChimiques.enAlerte}
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Produits périmés</span>
                                    <span className={`text-sm font-medium ${statistiques.produitsChimiques.perimes > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                      {statistiques.produitsChimiques.perimes}
                                    </span>
                                  </div>
                                </>
                              )}
                              {statistiques.incidents && (
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-gray-600 dark:text-gray-400">Incidents en cours</span>
                                  <span className={`text-sm font-medium ${statistiques.incidents.enCours > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                    {statistiques.incidents.enCours}
                                  </span>
                                </div>
                              )}
                              {statistiques.risques && (
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-gray-600 dark:text-gray-400">Risques élevés</span>
                                  <span className={`text-sm font-medium ${statistiques.risques.eleves > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                    {statistiques.risques.eleves}
                                  </span>
                                </div>
                              )}
                              {statistiques.hygiene && (
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-gray-600 dark:text-gray-400">Non conformités</span>
                                  <span className="text-sm font-medium text-red-600">{statistiques.hygiene.nonConformes}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    {/* Vue Incidents */}
                    {vueActive === 'incidents' && (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                          <h3 className="text-lg font-semibold mb-4 flex items-center">
                            <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
                            Incidents par gravité
                          </h3>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                                Critiques
                              </span>
                              <span className="text-sm font-medium text-gray-900 dark:text-white">{statistiques.incidents?.critiques || 0}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                                Majeurs
                              </span>
                              <span className="text-sm font-medium text-gray-900 dark:text-white">{statistiques.incidents?.majeurs || 0}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                                Mineurs
                              </span>
                              <span className="text-sm font-medium text-gray-900 dark:text-white">{statistiques.incidents?.mineurs || 0}</span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                          <h3 className="text-lg font-semibold mb-4 flex items-center">
                            <MapPin className="h-5 w-5 mr-2 text-blue-600" />
                            Top zones à incidents
                          </h3>
                          <div className="space-y-3">
                            {statistiques.incidents?.topZones && statistiques.incidents.topZones.length > 0 ? (
                              statistiques.incidents.topZones.map((item, index) => (
                                <div key={item._id} className="flex items-center justify-between">
                                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                                    {index + 1}. {item._id || 'Non spécifié'}
                                  </span>
                                  <div className="flex items-center space-x-2">
                                    <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                      <div 
                                        className="bg-red-500 h-2 rounded-full" 
                                        style={{ 
                                          width: `${Math.min((item.count / Math.max(...statistiques.incidents.topZones.map(z => z.count))) * 100, 100)}%` 
                                        }}
                                      ></div>
                                    </div>
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">{item.count}</span>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <p className="text-sm text-gray-500 dark:text-gray-400">Aucune donnée disponible</p>
                            )}
                          </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                          <h3 className="text-lg font-semibold mb-4 flex items-center">
                            <Calendar className="h-5 w-5 mr-2 text-purple-600" />
                            Évolution mensuelle
                          </h3>
                          <div className="space-y-3">
                            {(statistiques.incidents?.evolution || []).map((item, index) => (
                              <div key={index} className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                  {item._id.month}/{item._id.year}
                                </span>
                                <span className="text-sm font-medium text-gray-900 dark:text-white">{item.count}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Vue Risques */}
                    {vueActive === 'risques' && (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                          <h3 className="text-lg font-semibold mb-4 flex items-center">
                            <Shield className="h-5 w-5 mr-2 text-orange-600" />
                            Risques par niveau
                          </h3>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                                Élevés
                              </span>
                              <span className="text-sm font-medium text-gray-900 dark:text-white">{statistiques.risques?.eleves || 0}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                                Moyens
                              </span>
                              <span className="text-sm font-medium text-gray-900 dark:text-white">{statistiques.risques?.moyens || 0}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                Faibles
                              </span>
                              <span className="text-sm font-medium text-gray-900 dark:text-white">{statistiques.risques?.faibles || 0}</span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                          <h3 className="text-lg font-semibold mb-4 flex items-center">
                            <Target className="h-5 w-5 mr-2 text-blue-600" />
                            Répartition des risques
                          </h3>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-900 dark:text-white">En cours</span>
                              <span className="text-sm font-medium text-gray-900 dark:text-white">{statistiques.risques?.enCours || 0}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-900 dark:text-white">Traités</span>
                              <span className="text-sm font-medium text-gray-900 dark:text-white">{statistiques.risques?.traites || 0}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-900 dark:text-white">Taux de traitement</span>
                              <span className="text-sm font-medium text-green-600">{statistiques.risques?.tauxTraitement || 0}%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Vue Formations */}
                    {vueActive === 'formations' && (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                          <h3 className="text-lg font-semibold mb-4 flex items-center">
                            <GraduationCap className="h-5 w-5 mr-2 text-indigo-600" />
                            Formations par statut
                          </h3>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                Planifiées
                              </span>
                              <span className="text-sm font-medium text-gray-900 dark:text-white">{statistiques.formations?.planifiees || 0}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                                En cours
                              </span>
                              <span className="text-sm font-medium text-gray-900 dark:text-white">{statistiques.formations?.enCours || 0}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                Terminées
                              </span>
                              <span className="text-sm font-medium text-gray-900 dark:text-white">{statistiques.formations?.terminees || 0}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                                Annulées
                              </span>
                              <span className="text-sm font-medium text-gray-900 dark:text-white">{statistiques.formations?.annulees || 0}</span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                          <h3 className="text-lg font-semibold mb-4 flex items-center">
                            <Users className="h-5 w-5 mr-2 text-blue-600" />
                            Répartition des formations
                          </h3>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-900 dark:text-white">Total formations</span>
                              <span className="text-sm font-medium text-gray-900 dark:text-white">{statistiques.formations?.total || 0}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-900 dark:text-white">Terminées</span>
                              <span className="text-sm font-medium text-green-600">{statistiques.formations?.terminees || 0}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-900 dark:text-white">En cours</span>
                              <span className="text-sm font-medium text-yellow-600">{statistiques.formations?.enCours || 0}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-900 dark:text-white">Planifiées</span>
                              <span className="text-sm font-medium text-blue-600">{statistiques.formations?.planifiees || 0}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Vue EPI */}
                    {vueActive === 'epi' && (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                          <h3 className="text-lg font-semibold mb-4 flex items-center">
                            <HardHat className="h-5 w-5 mr-2 text-green-600" />
                            EPI par statut
                          </h3>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                Actifs
                              </span>
                              <span className="text-sm font-medium text-gray-900 dark:text-white">{statistiques.epi?.actifs || 0}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
                                Inactifs
                              </span>
                              <span className="text-sm font-medium text-gray-900 dark:text-white">{statistiques.epi?.inactifs || 0}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                                En maintenance
                              </span>
                              <span className="text-sm font-medium text-gray-900 dark:text-white">{statistiques.epi?.enMaintenance || 0}</span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                          <h3 className="text-lg font-semibold mb-4 flex items-center">
                            <Target className="h-5 w-5 mr-2 text-blue-600" />
                            Répartition des EPI
                          </h3>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-900 dark:text-white">Total EPI</span>
                              <span className="text-sm font-medium text-gray-900 dark:text-white">{statistiques.epi?.total || 0}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-900 dark:text-white">En alerte de stock</span>
                              <span className={`text-sm font-medium ${statistiques.epi?.enAlerte > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                                {statistiques.epi?.enAlerte || 0}
                              </span>
                            </div>
                          </div>
                        </div>

                      </div>
                    )}

                    {/* Vue Hygiène */}
                    {vueActive === 'hygiene' && statistiques.hygiene && (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                          <h3 className="text-lg font-semibold mb-4 flex items-center">
                            <Droplets className="h-5 w-5 mr-2 text-blue-600" />
                            Conformité Hygiène
                          </h3>
                          <div className="text-center">
                            <div className="text-4xl font-bold text-green-600 mb-2">
                              {Math.round(statistiques.hygiene.tauxConformite)}%
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Taux de conformité</p>
                          </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                          <h3 className="text-lg font-semibold mb-4 flex items-center">
                            <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                            Détail des contrôles
                          </h3>
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600 dark:text-gray-400">Total contrôles</span>
                              <span className="text-sm font-medium text-gray-900 dark:text-white">{statistiques.hygiene.total}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600 dark:text-gray-400">Conformes</span>
                              <span className="text-sm font-medium text-green-600">{statistiques.hygiene.conformes}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600 dark:text-gray-400">Non conformes</span>
                              <span className="text-sm font-medium text-red-600">{statistiques.hygiene.nonConformes}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600 dark:text-gray-400">En cours</span>
                              <span className="text-sm font-medium text-yellow-600">{statistiques.hygiene.enCours}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600 dark:text-gray-400">Planifiés</span>
                              <span className="text-sm font-medium text-blue-600">{statistiques.hygiene.planifies}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Vue Produits Chimiques */}
                    {vueActive === 'produits' && statistiques.produitsChimiques && (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                          <h3 className="text-lg font-semibold mb-4 flex items-center">
                            <FlaskConical className="h-5 w-5 mr-2 text-purple-600" />
                            État des produits
                          </h3>
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600 dark:text-gray-400">Total produits</span>
                              <span className="text-sm font-medium text-gray-900 dark:text-white">{statistiques.produitsChimiques.total}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600 dark:text-gray-400">Actifs</span>
                              <span className="text-sm font-medium text-green-600">{statistiques.produitsChimiques.actifs}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600 dark:text-gray-400">Inactifs</span>
                              <span className="text-sm font-medium text-gray-600">{statistiques.produitsChimiques.inactifs}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600 dark:text-gray-400">En alerte stock</span>
                              <span className="text-sm font-medium text-orange-600">{statistiques.produitsChimiques.enAlerte}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600 dark:text-gray-400">Périmés</span>
                              <span className="text-sm font-medium text-red-600">{statistiques.produitsChimiques.perimes}</span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                          <h3 className="text-lg font-semibold mb-4 flex items-center">
                            <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
                            Alertes sécurité
                          </h3>
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600 dark:text-gray-400">Produits en alerte</span>
                              <span className="text-sm font-medium text-orange-600">{statistiques.produitsChimiques.enAlerte}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600 dark:text-gray-400">Produits périmés</span>
                              <span className="text-sm font-medium text-red-600">{statistiques.produitsChimiques.perimes}</span>
                            </div>
                            <div className="text-center mt-4">
                              <div className="text-2xl font-bold text-red-600">
                                {statistiques.produitsChimiques.enAlerte + statistiques.produitsChimiques.perimes}
                              </div>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Alertes totales</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <BarChart3 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">Aucune donnée disponible</p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      {showModal && (
        <>
          {activeTab === 'hygiene' && (
            <ModalHygiene
              isOpen={showModal}
              onClose={handleCloseModal}
              hygiene={selectedItem}
              mode={modalMode}
              onSubmit={handleModalSubmit}
            />
          )}
          {activeTab === 'epi' && (
            <ModalEPI
              isOpen={showModal}
              onClose={handleCloseModal}
              epi={selectedItem}
              mode={modalMode}
              onSubmit={handleModalSubmit}
            />
          )}
          {activeTab === 'produits-chimiques' && (
            <ModalProduitChimique
              isOpen={showModal}
              onClose={handleCloseModal}
              produit={selectedItem}
              mode={modalMode}
              onSubmit={handleModalSubmit}
            />
          )}
          {activeTab === 'incidents' && (
            <ModalIncident
              isOpen={showModal}
              onClose={handleCloseModal}
              incident={selectedItem}
              mode={modalMode}
              onSubmit={handleModalSubmit}
            />
          )}
          {activeTab === 'risques' && (
            <ModalRisque
              isOpen={showModal}
              onClose={handleCloseModal}
              risque={selectedItem}
              mode={modalMode}
              onSubmit={handleModalSubmit}
            />
          )}
          {activeTab === 'formations' && (
            <ModalFormation
              isOpen={showModal}
              onClose={handleCloseModal}
              formation={selectedItem}
              mode={modalMode}
              onSubmit={handleModalSubmit}
            />
          )}
        </>
      )}
    </div>
  );
};

export default HSE;
