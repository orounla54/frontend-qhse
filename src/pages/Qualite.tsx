import React, { useState, useEffect } from 'react';
import {
  ModalMatierePremiere,
  ModalControleProduction,
  ModalDecisionQualite,
  ModalViewDetails,
  ModalReceptionLot,
  ModalAnalyseNC,
  ModalPlanControle,
  ModalTracabilite,
  ModalConformite,
  ModalAuditQualite,
  ModalStatistiques
} from '../components/features';
import StatistiquesQualite from '../components/features/StatistiquesQualite';
import { 
  CheckCircle, 
  AlertTriangle, 
  Package, 
  FileText, 
  BarChart3, 
  Plus,
  Search,
  Download,
  Eye,
  Edit,
  Trash2,
  Clock,
  XCircle,
  Shield
} from 'lucide-react';

interface MatierePremiere {
  _id: string;
  numero: string;
  nom: string;
  fournisseur: {
    nom: string;
  };
  caracteristiques: {
    type: string;
  };
  statut: string;
  lots: Array<{
    numeroLot: string;
    dateReception: string;
    quantite: number;
    statut: string;
    decisionQualite: {
      statut: string;
    };
  }>;
}

interface ControleQualite {
  _id: string;
  numero: string;
  titre: string;
  type: string;
  statut: string;
  localisation: {
    zone: string;
  };
  evaluation: {
    statut: string;
    score: number;
  };
  datePlanification: string;
}

interface NonConformite {
  _id: string;
  numero: string;
  titre: string;
  type: string;
  categorie: string;
  gravite: string;
  statut: string;
  detection: {
    date: string;
    detecteur: {
      nom: string;
      prenom: string;
    };
  };
}

interface DecisionQualite {
  _id: string;
  numero: string;
  titre: string;
  type: string;
  statut: string;
  dateDecision: string;
  decisionnaire: {
    nom: string;
    prenom: string;
  };
  matierePremiere: {
    nom: string;
    numero: string;
  };
  justification: string;
}

interface Audit {
  _id: string;
  numero: string;
  titre: string;
  type: string;
  domaine: string;
  statut: string;
  datePlanification: string;
  auditeurPrincipal: {
    nom: string;
    prenom: string;
  };
  resultats: {
    score: number;
    conclusion: string;
  };
}

interface Conformite {
  _id: string;
  numero: string;
  titre: string;
  type: string;
  statut: string;
  dateEvaluation: string;
  evaluateur: {
    nom: string;
    prenom: string;
  };
  score: number;
  exigences: string[];
}

interface QualiteProps {
  activeTab?: string;
}

const Qualite: React.FC<QualiteProps> = ({ activeTab: initialTab = 'matieres-premieres' }) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [matieresPremieres, setMatieresPremieres] = useState<MatierePremiere[]>([]);
  const [controlesQualite, setControlesQualite] = useState<ControleQualite[]>([]);
  const [nonConformites, setNonConformites] = useState<NonConformite[]>([]);
  const [decisionsQualite, setDecisionsQualite] = useState<DecisionQualite[]>([]);
  const [audits, setAudits] = useState<Audit[]>([]);
  const [conformites, setConformites] = useState<Conformite[]>([]);
  const [tracabilites, setTracabilites] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatut, setFilterStatut] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterGravite, setFilterGravite] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  // États pour les modals
  const [isMpModalOpen, setIsMpModalOpen] = useState(false);
  const [isReceptionLotModalOpen, setIsReceptionLotModalOpen] = useState(false);
  const [isCtrlModalOpen, setIsCtrlModalOpen] = useState(false);
  const [isNcModalOpen, setIsNcModalOpen] = useState(false);
  const [isDecisionModalOpen, setIsDecisionModalOpen] = useState(false);
  const [isPlanControleModalOpen, setIsPlanControleModalOpen] = useState(false);
  const [isTracabiliteModalOpen, setIsTracabiliteModalOpen] = useState(false);
  const [tracabiliteMode, setTracabiliteMode] = useState<'view' | 'create' | 'edit'>('view');
  const [isConformiteModalOpen, setIsConformiteModalOpen] = useState(false);
  const [isAuditQualiteModalOpen, setIsAuditQualiteModalOpen] = useState(false);
  const [isStatistiquesModalOpen, setIsStatistiquesModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [notifications, setNotifications] = useState<Array<{id: string, type: 'success' | 'error' | 'warning' | 'info', message: string}>>([]);

  const openCreateModalForTab = () => {
    switch (activeTab) {
      case 'matieres-premieres':
        setIsMpModalOpen(true);
        break;
      case 'controles-qualite':
        setIsCtrlModalOpen(true);
        break;
      case 'non-conformites':
        setIsNcModalOpen(true);
        break;
      case 'decisions-qualite':
        setIsDecisionModalOpen(true);
        break;
      case 'plans-controle':
        setIsPlanControleModalOpen(true);
        break;
      case 'tracabilite':
        setTracabiliteMode('create');
        setSelectedItem({ type: 'Matière première', reference: '', nom: '', lot: '' });
        setIsTracabiliteModalOpen(true);
        break;
      case 'audits':
        setIsAuditQualiteModalOpen(true);
        break;
      case 'conformite':
        setIsConformiteModalOpen(true);
        break;
      case 'statistiques':
        setIsStatistiquesModalOpen(true);
        break;
      default:
        break;
    }
  };

  // Mettre à jour l'onglet actif quand la prop change
  useEffect(() => {
    if (initialTab !== activeTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Charger les données
  useEffect(() => {
    loadData();
  }, [activeTab, searchTerm, filterStatut, filterType, filterGravite, sortBy, sortOrder, currentPage]);


  // Gestion des actions sur les éléments
  const handleView = (item: any) => {
    setSelectedItem(item);
    setIsViewModalOpen(true);
  };


  const addNotification = (type: 'success' | 'error' | 'warning' | 'info', message: string) => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  const handleDelete = async (itemId: string, type: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet élément ?')) return;
    
    try {
      const token = localStorage.getItem('qhse-token')?.replace(/^"|"$/g, '');
      const authHeaders: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
      
      const endpoint = `/api/qualite/${type}/${itemId}`;
      const response = await fetch(endpoint, {
        method: 'DELETE',
        headers: authHeaders
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Suppression échouée');
      }
      
      addNotification('success', 'Élément supprimé avec succès');
      await loadData();
    } catch (error: any) {
      console.error('Erreur lors de la suppression:', error);
      addNotification('error', error.message || 'Erreur lors de la suppression');
    }
  };

  const buildQueryParams = () => {
    const params = new URLSearchParams();
    if (searchTerm) params.append('search', searchTerm);
    if (filterStatut) params.append('statut', filterStatut);
    if (filterType) params.append('type', filterType);
    if (filterGravite) params.append('gravite', filterGravite);
    if (sortBy) params.append('sortBy', sortBy);
    if (sortOrder) params.append('sortOrder', sortOrder);
    params.append('page', currentPage.toString());
    params.append('limit', '10');
    return params.toString();
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('qhse-token')?.replace(/^"|"$/g, '');
      const authHeaders: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
      const queryParams = buildQueryParams();
      
      if (activeTab === 'matieres-premieres') {
        const response = await fetch(`/api/qualite/matieres-premieres?${queryParams}`, { headers: authHeaders });
        const data = await response.json();
        setMatieresPremieres(data.matieresPremieres || []);
        setTotalPages(data.totalPages || 1);
        setTotal(data.total || 0);
      } else if (activeTab === 'controles-qualite') {
        const response = await fetch(`/api/qualite/controles-qualite?${queryParams}`, { headers: authHeaders });
        const data = await response.json();
        setControlesQualite(data.controles || []);
        setTotalPages(data.totalPages || 1);
        setTotal(data.total || 0);
      } else if (activeTab === 'non-conformites') {
        const response = await fetch(`/api/qualite/non-conformites?${queryParams}`, { headers: authHeaders });
        const data = await response.json();
        setNonConformites(data.nonConformites || []);
        setTotalPages(data.totalPages || 1);
        setTotal(data.total || 0);
      } else if (activeTab === 'decisions-qualite') {
        const response = await fetch(`/api/qualite/decisions-qualite?${queryParams}`, { headers: authHeaders });
        const data = await response.json();
        setDecisionsQualite(data.decisions || []);
        setTotalPages(data.totalPages || 1);
        setTotal(data.total || 0);
      } else if (activeTab === 'audits') {
        const response = await fetch(`/api/qualite/audits?${queryParams}`, { headers: authHeaders });
        const data = await response.json();
        setAudits(data.audits || []);
        setTotalPages(data.totalPages || 1);
        setTotal(data.total || 0);
      } else if (activeTab === 'conformite') {
        const response = await fetch(`/api/qualite/conformite?${queryParams}`, { headers: authHeaders });
        const data = await response.json();
        const mapped = (data.conformites || []).map((c: any) => ({
          _id: c._id,
          numero: c.numero,
          titre: c.titre,
          type: c.type,
          statut: c.statutConformite,
          dateEvaluation: c.derniereEvaluation?.date,
          evaluateur: c.derniereEvaluation?.evaluateur || { nom: '', prenom: '' },
          score: typeof c.scoreConformite === 'number' ? c.scoreConformite : 0,
          exigences: Array.isArray(c.obligations) ? c.obligations : []
        }));
        setConformites(mapped);
        setTotalPages(data.totalPages || 1);
        setTotal(data.total || 0);
      } else if (activeTab === 'tracabilite') {
        const response = await fetch(`/api/qualite/tracabilite?${queryParams}`, { headers: authHeaders });
        const data = await response.json();
        setTracabilites(data.tracabilites || []);
        setTotalPages(data.totalPages || 1);
        setTotal(data.total || 0);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
  };

  // Créations
  const createMatierePremiere = async (data: any) => {
    try {
      const token = localStorage.getItem('qhse-token')?.replace(/^"|"$/g, '');
      // Adapter le payload du modal (réception lot) au schéma attendu par le backend MatierePremiere
      const payload = {
        numero: `MP-${Date.now()}`,
        nom: (data?.nom && String(data.nom).trim().length > 0) ? data.nom : `Matière ${data?.numeroLot || ''}`.trim(),
        fournisseur: { nom: data?.fournisseur || 'Inconnu' },
        caracteristiques: {
          type: 'Autre',
          unite: data?.unite || 'kg'
        },
        statut: 'Actif',
        lots: [
          {
            numeroLot: data?.numeroLot || `LOT-${Date.now()}`,
            dateReception: data?.dateReception || new Date().toISOString(),
            quantite: typeof data?.quantite === 'number' ? data.quantite : parseFloat(data?.quantite) || 0,
            unite: data?.unite || 'kg',
            statut:
              data?.statut === 'Rejeté'
                ? 'Rejeté'
                : data?.resultatControle === 'Conforme' || data?.statut === 'Accepté'
                ? 'En stock'
                : 'En stock',
            decisionQualite: {
              statut:
                data?.statut === 'Rejeté'
                  ? 'Rejeté'
                  : data?.statut === 'Sous réserve'
                  ? 'Sous réserve'
                  : 'Accepté',
              commentaire: data?.commentaires || ''
            }
          }
        ]
      };

      const res = await fetch('/api/qualite/matieres-premieres', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Création échouée');
      }
      addNotification('success', 'Matière première créée avec succès');
      setIsMpModalOpen(false);
      await loadData();
    } catch (e: any) {
      console.error(e);
      addNotification('error', e.message || 'Erreur lors de la création');
    }
  };

  const createControleQualite = async (data: any) => {
    try {
      const token = localStorage.getItem('qhse-token')?.replace(/^"|"$/g, '');
      // Adapter le payload du modal au schéma backend ControleQualite
      const titre = data?.titre && String(data.titre).trim().length > 0
        ? data.titre
        : `Contrôle ${data?.produit || ''} ${data?.ligne ? '- ' + data.ligne : ''}`.trim();

      const type = 'Contrôle en cours de production';
      const datePlanification = data?.dateControle
        ? new Date(data.dateControle).toISOString()
        : new Date().toISOString();

      const payload = {
        numero: data?.numero && String(data.numero).trim().length > 0 ? data.numero : `CQ-${Date.now()}`,
        titre,
        type,
        description: data?.observations || '',
        produit: {
          nom: data?.produit || 'Produit',
          reference: '',
          lot: '',
          version: ''
        },
        localisation: {
          zone: data?.ligne || '',
          ligne: data?.ligne || '',
          poste: data?.machine || ''
        },
        datePlanification,
        priorite: 'Normale',
        evaluation: {
          score: typeof data?.score === 'number' ? data.score : 0,
          statut: data?.resultat || 'En attente',
          commentaire: data?.observations || ''
        },
        statut: data?.resultat === 'Conforme' ? 'Terminé' : 'En cours'
      };

      const res = await fetch('/api/qualite/controles-qualite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Création échouée');
      }
      addNotification('success', 'Contrôle qualité créé avec succès');
      setIsCtrlModalOpen(false);
      await loadData();
    } catch (e: any) {
      console.error(e);
      addNotification('error', e.message || 'Erreur lors de la création');
    }
  };

  // Gestionnaires de création pour tous les modals
  const createPlanControle = async (data: any) => {
    try {
      const token = localStorage.getItem('qhse-token')?.replace(/^"|"$/g, '');
      // Adapter le payload au schéma backend PlanControle
      const payload = {
        numero: data?.numero && String(data.numero).trim().length > 0 ? data.numero : `PC-${Date.now()}`,
        nom: data?.nom || `Plan ${Date.now()}`,
        description: data?.description || '',
        type: data?.type || 'Processus',
        concerne: {
          type: data?.concerne?.type || (data?.type === 'Matière première' ? 'Matière première' : 'Processus'),
          reference: data?.concerne?.reference || '',
          nom: data?.concerne?.nom || '',
          version: data?.concerne?.version || ''
        },
        statut: data?.statut || 'Brouillon',
        version: {
          numero: (data?.version?.numero && String(data.version.numero).trim().length > 0) ? data.version.numero : '1.0',
          dateCreation: new Date().toISOString(),
          dateRevision: undefined,
          prochaineRevision: undefined
        },
        frequence: data?.frequence || 'Ponctuel',
        pointsControle: Array.isArray(data?.pointsControle) ? data.pointsControle.map((p: any) => ({
          nom: p?.nom || 'Point de contrôle',
          description: p?.description || '',
          type: p?.type || 'Visuel',
          parametreCritique: p?.parametreCritique || 'Autre',
          methode: p?.methode || '',
          appareil: p?.appareil || '',
          unite: p?.unite || '',
          seuilMin: typeof p?.seuilMin === 'number' ? p.seuilMin : undefined,
          seuilMax: typeof p?.seuilMax === 'number' ? p.seuilMax : undefined,
          tolerance: typeof p?.tolerance === 'number' ? p.tolerance : undefined,
          obligatoire: typeof p?.obligatoire === 'boolean' ? p.obligatoire : true,
          frequence: p?.frequence || 'Chaque lot',
          echantillonnage: p?.echantillonnage || undefined,
          norme: p?.norme || '',
          reference: p?.reference || ''
        })) : []
      };

      const res = await fetch('/api/qualite/plans-controle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Création échouée');
      }
      addNotification('success', 'Plan de contrôle créé avec succès');
      setIsPlanControleModalOpen(false);
      await loadData();
    } catch (e: any) {
      console.error(e);
      addNotification('error', e.message || 'Erreur lors de la création');
    }
  };


  const createTracabilite = async (data: any) => {
    try {
      const token = localStorage.getItem('qhse-token')?.replace(/^"|"$/g, '');
      // Adapter le payload au schéma backend Tracabilite
      const payload = {
        numero: data?.numero && String(data.numero).trim().length > 0 ? data.numero : `TR-${Date.now()}`,
        type: data?.type || 'Matière première',
        reference: data?.reference || data?.nom || 'Référence',
        nom: data?.nom || '',
        version: data?.version || '',
        lot: data?.lot || '',
        origine: {
          type: data?.origine?.type || 'Fournisseur',
          fournisseur: data?.origine?.fournisseur || undefined,
          dateReception: data?.origine?.dateReception ? new Date(data.origine.dateReception).toISOString() : undefined,
          quantite: typeof data?.origine?.quantite === 'number' ? data.origine.quantite : undefined,
          unite: data?.origine?.unite || undefined,
          documents: data?.origine?.documents || []
        },
        destination: data?.destination || undefined,
        transformation: data?.transformation || [],
        liens: data?.liens || [],
        controles: data?.controles || [],
        nonConformites: data?.nonConformites || [],
        rappels: data?.rappels || [],
        statut: data?.statut || 'En stock',
        dates: {
          creation: new Date().toISOString(),
          premiereUtilisation: data?.dates?.premiereUtilisation ? new Date(data.dates.premiereUtilisation).toISOString() : undefined,
          derniereUtilisation: data?.dates?.derniereUtilisation ? new Date(data.dates.derniereUtilisation).toISOString() : undefined,
          peremption: data?.dates?.peremption ? new Date(data.dates.peremption).toISOString() : undefined,
          destruction: data?.dates?.destruction ? new Date(data.dates.destruction).toISOString() : undefined
        },
        documents: data?.documents || []
      };

      const res = await fetch('/api/qualite/tracabilite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Création échouée');
      }
      addNotification('success', 'Fiche traçabilité créée avec succès');
      setIsTracabiliteModalOpen(false);
      setTracabiliteMode('view');
      await loadData();
    } catch (e: any) {
      console.error(e);
      addNotification('error', e.message || 'Erreur lors de la création');
    }
  };

  const createConformite = async (data: any) => {
    try {
      const token = localStorage.getItem('qhse-token')?.replace(/^"|"$/g, '');
      
      // Payload minimal et sûr pour éviter les erreurs de validation
      const payload = {
        numero: `CONF-${Date.now()}`,
        titre: data?.nom || 'Conformité',
        description: data?.description || 'Description de conformité',
        type: 'Norme',
        domaine: 'Qualité'
      };

      console.log('📤 Payload envoyé:', JSON.stringify(payload, null, 2));

      const res = await fetch('/api/qualite/conformite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('❌ Erreur backend:', res.status, errorText);
        throw new Error(`Erreur ${res.status}: ${errorText}`);
      }
      
      const result = await res.json();
      console.log('✅ Conformité créée:', result);
      
      addNotification('success', 'Conformité créée avec succès');
      setIsConformiteModalOpen(false);
      await loadData();
    } catch (e: any) {
      console.error('❌ Erreur création conformité:', e);
      addNotification('error', e.message || 'Erreur lors de la création');
    }
  };

  const createAuditQualite = async (data: any) => {
    try {
      const token = localStorage.getItem('qhse-token')?.replace(/^"|"$/g, '');
      // Adapter le payload au schéma backend Audit
      const payload = {
        numero: data?.numero && String(data.numero).trim().length > 0 ? data.numero : `AUD-${Date.now()}`,
        titre: data?.titre || 'Audit',
        description: data?.description || '',
        type: data?.type || 'Interne',
        domaine: 'Qualité',
        datePlanification: data?.datePlanification ? new Date(data.datePlanification).toISOString() : new Date().toISOString(),
        dateDebut: data?.dateDebut ? new Date(data.dateDebut).toISOString() : undefined,
        dateFin: data?.dateFin ? new Date(data.dateFin).toISOString() : undefined,
        dureeEstimee: typeof data?.dureeEstimee === 'number' ? data.dureeEstimee : 8,
        statut: data?.statut || 'Planifié',
        priorite: data?.priorite || 'Moyenne',
        perimetre: data?.perimetre || undefined,
        criteres: data?.criteres || [],
        checklist: data?.checklist || undefined,
        constatations: data?.constatations || [],
        actionsCorrectives: data?.actionsCorrectives || [],
        resultats: data?.resultats || undefined,
        documents: data?.documents || []
      };

      const res = await fetch('/api/qualite/audits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Création échouée');
      }
      addNotification('success', 'Audit qualité créé avec succès');
      setIsAuditQualiteModalOpen(false);
      await loadData();
    } catch (e: any) {
      console.error(e);
      addNotification('error', e.message || 'Erreur lors de la création');
    }
  };

  const createReceptionLot = async (data: any) => {
    try {
      const token = localStorage.getItem('qhse-token')?.replace(/^"|"$/g, '');
      const res = await fetch(`/api/qualite/matieres-premieres/${selectedItem._id}/lots`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(data)
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Création échouée');
      }
      addNotification('success', 'Lot créé avec succès');
      setIsReceptionLotModalOpen(false);
      await loadData();
    } catch (e: any) {
      console.error(e);
      addNotification('error', e.message || 'Erreur lors de la création');
    }
  };

  const createNonConformite = async (data: any) => {
    try {
      const token = localStorage.getItem('qhse-token')?.replace(/^"|"$/g, '');
      // Adapter le payload du modal au schéma backend NonConformite
      const payload = {
        numero: data?.numero && String(data.numero).trim().length > 0 ? data.numero : `NC-${Date.now()}`,
        titre: (data?.titre && String(data.titre).trim().length > 0)
          ? data.titre
          : `NC ${data?.type || ''} ${data?.lot ? '- Lot ' + data.lot : ''}`.trim(),
        description: data?.description || 'Anomalie détectée',
        type: data?.type || 'Produit',
        categorie: ['Critique','Majeure','Mineure','Observation'].includes(data?.categorie)
          ? data.categorie
          : 'Mineure',
        gravite: ['Faible','Modérée','Élevée','Critique'].includes(data?.gravite)
          ? data.gravite
          : 'Modérée',
        detection: {
          date: data?.dateDetection ? new Date(data.dateDetection).toISOString() : new Date().toISOString(),
          methode: 'Signalement',
          source: data?.detectePar || ''
        },
        localisation: {
          zone: data?.localisation?.zone || '',
          ligne: data?.localisation?.ligne || '',
          poste: data?.localisation?.poste || ''
        },
        concerne: {
          type: data?.type || 'Produit',
          reference: '',
          lot: data?.lot || '',
          version: ''
        },
        statut: data?.statut || 'Déclarée',
        priorite: 'Normale'
      };

      const res = await fetch('/api/qualite/non-conformites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Création échouée');
      }
      addNotification('success', 'Non-conformité créée avec succès');
      setIsNcModalOpen(false);
      await loadData();
    } catch (e: any) {
      console.error(e);
      addNotification('error', e.message || 'Erreur lors de la création');
    }
  };

  const createDecisionQualite = async (data: any) => {
    try {
      const token = localStorage.getItem('qhse-token')?.replace(/^"|"$/g, '');
      // Adapter le payload du modal au schéma backend DecisionQualite
      const payload = {
        numero: data?.numero && String(data.numero).trim().length > 0 ? data.numero : `DQ-${Date.now()}`,
        titre: data?.titre || `Décision ${data?.type || ''}`.trim(),
        description: data?.description || '',
        type: data?.type || 'Acceptation',
        contexte: {
          type: data?.contexte?.type || 'Matière première',
          reference: data?.contexte?.reference || '',
          lot: data?.contexte?.lot || '',
          quantite: data?.contexte?.quantite,
          unite: data?.contexte?.unite || ''
        },
        justification: data?.justification || 'Décision requise',
        priorite: data?.priorite || 'Normale',
        dateDecision: new Date().toISOString(),
        validation: {
          niveau: 'Responsable Qualité',
          statut: 'En attente'
        },
        statut: 'En attente'
      };

      const res = await fetch('/api/qualite/decisions-qualite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Création échouée');
      }
      addNotification('success', 'Décision qualité créée avec succès');
      setIsDecisionModalOpen(false);
      await loadData();
    } catch (e: any) {
      console.error(e);
      addNotification('error', e.message || 'Erreur lors de la création');
    }
  };

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'Conforme':
      case 'Validé':
      case 'Actif':
      case 'Accepté':
        return 'text-green-600 bg-green-100';
      case 'Non conforme':
      case 'Rejeté':
      case 'Suspendu':
        return 'text-red-600 bg-red-100';
      case 'En attente':
      case 'Planifié':
      case 'Déclarée':
        return 'text-yellow-600 bg-yellow-100';
      case 'En cours':
      case 'En investigation':
        return 'text-blue-600 bg-blue-100';
      case 'Résolue':
      case 'Fermée':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getGraviteColor = (gravite: string) => {
    switch (gravite) {
      case 'Critique':
        return 'text-red-600 bg-red-100';
      case 'Élevée':
        return 'text-orange-600 bg-orange-100';
      case 'Modérée':
        return 'text-yellow-600 bg-yellow-100';
      case 'Faible':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getConformiteIcon = (statut: string) => {
    switch (statut) {
      case 'Conforme':
      case 'Accepté':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'Non conforme':
      case 'Rejeté':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'En attente':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-600" />;
    }
  };

  const openTracabiliteDetails = (item: any) => {
    setSelectedItem(item);
    setTracabiliteMode('view');
    setIsTracabiliteModalOpen(true);
  };

  const tabs = [
    { id: 'matieres-premieres', label: 'Matières Premières', icon: Package },
    { id: 'controles-qualite', label: 'Contrôles Qualité', icon: CheckCircle },
    { id: 'non-conformites', label: 'Non-Conformités', icon: AlertTriangle },
    { id: 'decisions-qualite', label: 'Décisions Qualité', icon: CheckCircle },
    { id: 'plans-controle', label: 'Plans de Contrôle', icon: FileText },
    { id: 'tracabilite', label: 'Traçabilité', icon: Shield },
    { id: 'audits', label: 'Audits', icon: FileText },
    { id: 'conformite', label: 'Conformité', icon: Shield },
    { id: 'statistiques', label: 'Statistiques', icon: BarChart3 }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`p-4 rounded-lg shadow-lg max-w-sm ${
              notification.type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' :
              notification.type === 'error' ? 'bg-red-100 text-red-800 border border-red-200' :
              notification.type === 'warning' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
              'bg-blue-100 text-blue-800 border border-blue-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{notification.message}</span>
              <button
                onClick={() => setNotifications(prev => prev.filter(n => n.id !== notification.id))}
                className="ml-2 text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Shield className="h-8 w-8 text-primary-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Module Qualité
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Gestion des matières premières, contrôles qualité et non-conformités
            </p>
          </div>
        </div>
        <button onClick={openCreateModalForTab} className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>{
            activeTab === 'matieres-premieres' ? 'Nouvelle matière' : 
            activeTab === 'controles-qualite' ? 'Nouveau contrôle' : 
            activeTab === 'non-conformites' ? 'Nouvelle NC' : 
            activeTab === 'decisions-qualite' ? 'Nouvelle décision' :
            activeTab === 'plans-controle' ? 'Nouveau plan' :
            activeTab === 'tracabilite' ? 'Nouvelle traçabilité' :
            activeTab === 'audits' ? 'Nouvel audit' :
            activeTab === 'conformite' ? 'Nouvelle conformité' :
            activeTab === 'statistiques' ? 'Voir statistiques' :
            'Nouveau'
          }</span>
        </button>
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
      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterStatut}
            onChange={(e) => setFilterStatut(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">Tous les statuts</option>
            <option value="Conforme">Conforme</option>
            <option value="Non conforme">Non conforme</option>
            <option value="En attente">En attente</option>
            <option value="Actif">Actif</option>
            <option value="Planifié">Planifié</option>
            <option value="En cours">En cours</option>
            <option value="Terminé">Terminé</option>
            <option value="Validé">Validé</option>
            <option value="Rejeté">Rejeté</option>
          </select>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">Tous les types</option>
            <option value="Végétale">Végétale</option>
            <option value="Animale">Animale</option>
            <option value="Minérale">Minérale</option>
            <option value="Chimique">Chimique</option>
            <option value="Réception matières premières">Réception matières premières</option>
            <option value="Contrôle en cours de production">Contrôle en cours de production</option>
            <option value="Contrôle produit fini">Contrôle produit fini</option>
            <option value="Produit">Produit</option>
            <option value="Processus">Processus</option>
            <option value="Système">Système</option>
          </select>
          <select
            value={filterGravite}
            onChange={(e) => setFilterGravite(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">Toutes les gravités</option>
            <option value="Faible">Faible</option>
            <option value="Modérée">Modérée</option>
            <option value="Élevée">Élevée</option>
            <option value="Critique">Critique</option>
          </select>
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>Exporter</span>
          </button>
        </div>
        
        {/* Tri et pagination */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded text-sm"
            >
              <option value="createdAt">Date de création</option>
              <option value="datePlanification">Date de planification</option>
              <option value="detection.date">Date de détection</option>
              <option value="numero">Numéro</option>
              <option value="titre">Titre</option>
              <option value="statut">Statut</option>
            </select>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded text-sm"
            >
              <option value="desc">Décroissant</option>
              <option value="asc">Croissant</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">
              {total} élément(s) - Page {currentPage} sur {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Précédent
            </button>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Suivant
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <>
            {activeTab === 'matieres-premieres' && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Matière Première
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Fournisseur
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Statut
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Lots
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {matieresPremieres.map((matiere) => (
                      <tr key={matiere._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {matiere.numero}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {matiere.nom}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {matiere.fournisseur?.nom || 'Non défini'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {matiere.caracteristiques.type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatutColor(matiere.statut)}`}>
                            {matiere.statut}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {matiere.lots?.length || 0} lot(s)
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {matiere.lots?.filter(lot => lot.statut === 'En stock').length || 0} en stock
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button 
                              onClick={() => handleView(matiere)}
                              className="text-primary-600 hover:text-primary-900"
                              title="Voir les détails"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => {
                                setSelectedItem(matiere);
                                setIsReceptionLotModalOpen(true);
                              }}
                              className="text-green-600 hover:text-green-900"
                              title="Réception Lot"
                            >
                              <Package className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleDelete(matiere._id, 'matieres-premieres')}
                              className="text-red-600 hover:text-red-900"
                              title="Supprimer"
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

            {activeTab === 'controles-qualite' && (
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
                    {controlesQualite.map((controle) => (
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
                          {controle.localisation.zone}
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
                            <button className="text-primary-600 hover:text-primary-900">
                              <Eye className="h-4 w-4" />
                            </button>
                            <button className="text-gray-600 hover:text-gray-900">
                              <Edit className="h-4 w-4" />
                            </button>
                            <button className="text-red-600 hover:text-red-900">
                              <Trash2 className="h-4 w-4" onClick={() => handleDelete(controle._id, 'controles-qualite')} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'non-conformites' && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Non-Conformité
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
                    {nonConformites.map((nc) => (
                      <tr key={nc._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {nc.numero}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {nc.titre}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {nc.type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getGraviteColor(nc.gravite)}`}>
                            {nc.gravite}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatutColor(nc.statut)}`}>
                            {nc.statut}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {nc.detection.detecteur ? `${nc.detection.detecteur.prenom || ''} ${nc.detection.detecteur.nom || ''}`.trim() || 'Non défini' : 'Non défini'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {new Date(nc.detection.date).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button className="text-primary-600 hover:text-primary-900">
                              <Eye className="h-4 w-4" />
                            </button>
                            <button className="text-gray-600 hover:text-gray-900">
                              <Edit className="h-4 w-4" />
                            </button>
                            <button className="text-red-600 hover:text-red-900">
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

            {activeTab === 'decisions-qualite' && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Décision
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Matière Première
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Décisionnaire
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
                    {decisionsQualite.map((decision) => (
                      <tr key={decision._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {decision.numero}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {decision.titre}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {decision.type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {decision.matierePremiere?.nom || (decision as any)?.contexte?.reference || '—'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {(decision.decisionnaire?.prenom || '')} {(decision.decisionnaire?.nom || '')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatutColor(decision.statut)}`}>
                            {decision.statut}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {new Date(decision.dateDecision).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button className="text-primary-600 hover:text-primary-900">
                              <Eye className="h-4 w-4" />
                            </button>
                            <button className="text-gray-600 hover:text-gray-900">
                              <Edit className="h-4 w-4" />
                            </button>
                            <button className="text-red-600 hover:text-red-900">
                              <Trash2 className="h-4 w-4" onClick={() => handleDelete(decision._id, 'decisions-qualite')} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'audits' && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Audit
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Domaine
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Auditeur
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Score
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
                    {audits.map((audit) => (
                      <tr key={audit._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {audit.numero}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {audit.titre}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {audit.type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {audit.domaine}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {audit.auditeurPrincipal ? `${audit.auditeurPrincipal.prenom || ''} ${audit.auditeurPrincipal.nom || ''}`.trim() || 'Non défini' : 'Non défini'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {audit.resultats.score}%
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatutColor(audit.statut)}`}>
                            {audit.statut}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button className="text-primary-600 hover:text-primary-900">
                              <Eye className="h-4 w-4" />
                            </button>
                            <button className="text-gray-600 hover:text-gray-900">
                              <Edit className="h-4 w-4" />
                            </button>
                            <button className="text-red-600 hover:text-red-900">
                              <Trash2 className="h-4 w-4" onClick={() => handleDelete(audit._id, 'audits')} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'conformite' && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Conformité
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Score
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Évaluateur
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Exigences
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
                    {conformites.map((conformite) => (
                      <tr key={conformite._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {conformite.numero}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {conformite.titre}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {conformite.type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {conformite.score}%
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {conformite.evaluateur ? `${conformite.evaluateur.prenom || ''} ${conformite.evaluateur.nom || ''}`.trim() || 'Non défini' : 'Non défini'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {conformite.exigences.length} exigence(s)
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatutColor(conformite.statut)}`}>
                            {conformite.statut}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button className="text-primary-600 hover:text-primary-900">
                              <Eye className="h-4 w-4" />
                            </button>
                            <button className="text-gray-600 hover:text-gray-900">
                              <Edit className="h-4 w-4" />
                            </button>
                            <button className="text-red-600 hover:text-red-900">
                              <Trash2 className="h-4 w-4" onClick={() => handleDelete(conformite._id, 'conformite')} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'tracabilite' && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Référence</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Lot</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Produit</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Statut</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {tracabilites.map((t) => (
                      <tr key={t._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{t.reference || t.numero || '—'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{t.lot || '—'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{t.nom || t.produit || '—'}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatutColor(t.statut || '')}`}>
                            {t.statut || '—'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button className="text-primary-600 hover:text-primary-900" onClick={() => openTracabiliteDetails(t)}>
                              <Eye className="h-4 w-4" />
                            </button>
                            <button className="text-red-600 hover:text-red-900" onClick={() => handleDelete(t._id, 'tracabilite')}>
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
              <StatistiquesQualite />
            )}
          </>
        )}
      </div>
      {/* Modals */}
      <ModalReceptionLot
        isOpen={isMpModalOpen}
        onClose={() => setIsMpModalOpen(false)}
        onSave={createMatierePremiere}
        initialData={null}
        mode="create"
        title="Matière Première"
/>
     
      <ModalControleProduction
        isOpen={isCtrlModalOpen}
        onClose={() => setIsCtrlModalOpen(false)}
        onSave={createControleQualite}
        initialData={null}
        mode="create"
        title="Contrôle Qualité"
      />
      <ModalAnalyseNC
        isOpen={isNcModalOpen}
        onClose={() => setIsNcModalOpen(false)}
        onSave={createNonConformite}
        initialData={null}
        mode="create"
        title="Non-Conformité"
      />
      <ModalDecisionQualite
        isOpen={isDecisionModalOpen}
        onClose={() => setIsDecisionModalOpen(false)}
        onSave={createDecisionQualite}
        initialData={null}
        mode="create"
        title="Décision Qualité"
      />
      <ModalPlanControle
        isOpen={isPlanControleModalOpen}
        onClose={() => setIsPlanControleModalOpen(false)}
        onSave={createPlanControle}
        initialData={null}
        mode="create"
        title="Plan de Contrôle"
      />
      <ModalTracabilite
        isOpen={isTracabiliteModalOpen}
        onClose={() => setIsTracabiliteModalOpen(false)}
        data={selectedItem}
        mode={tracabiliteMode}
        onSave={tracabiliteMode !== 'view' ? createTracabilite : undefined}
        title={tracabiliteMode === 'create' ? 'Créer une fiche de traçabilité' : undefined}
      />
      <ModalConformite
        isOpen={isConformiteModalOpen}
        onClose={() => setIsConformiteModalOpen(false)}
        onSave={createConformite}
        initialData={null}
        mode="create"
        title="Conformité"
      />
      <ModalAuditQualite
        isOpen={isAuditQualiteModalOpen}
        onClose={() => setIsAuditQualiteModalOpen(false)}
        onSave={createAuditQualite}
        initialData={null}
        mode="create"
        title="Audit Qualité"
      />
      <ModalStatistiques
        isOpen={isStatistiquesModalOpen}
        onClose={() => setIsStatistiquesModalOpen(false)}
        onSave={() => {}} // Pas de sauvegarde pour les statistiques
        initialData={null}
        mode="view"
        title="Statistiques"
      />
      <ModalViewDetails
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        item={selectedItem}
        type={activeTab === 'matieres-premieres' ? 'matiere' : 
              activeTab === 'controles-qualite' ? 'controle' : 
              activeTab === 'non-conformites' ? 'nc' : 
              activeTab === 'audits' ? 'audit' : 
              activeTab === 'conformite' ? 'conformite' : 'matiere'}
      />
    </div>
  );
};

export default Qualite;
