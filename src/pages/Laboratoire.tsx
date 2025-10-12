import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  ModalEchantillon,
  ModalAnalyse,
  ModalPlanControle
} from '../components/features';
import StatistiquesLaboratoire from '../components/features/StatistiquesLaboratoire';
import { echantillonService, analyseService, planControleService } from '../services/laboratoireService';
import { 
  Microscope, 
  FlaskConical, 
  FileText, 
  BarChart3, 
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle
} from 'lucide-react';
import ConfirmModal from '../components/common/ConfirmModal';
import DetailModal from '../components/common/DetailModal';
import ModalTracabilite, { TracaData } from '../components/features/ModalTracabilite';

interface Echantillon {
  _id: string;
  numero: string;
  numeroLot: string;
  produit: {
    nom: string;
    reference: string;
  };
  typeEchantillon: string;
  statut: string;
  prelevement: {
    date: string;
    responsable: {
      nom: string;
      prenom: string;
    };
  };
  resultats: {
    conformite: string;
    score: number;
  };
  decisionQualite: {
    statut: string;
    dateDecision: string;
  };
  mesuresInitiales?: {
    poidsNet?: number;
    unite?: string;
  };
}

interface Analyse {
  _id: string;
  numero: string;
  nom: string;
  type: string;
  categorie: string;
  statut: string;
  echantillon: {
    numero: string;
    numeroLot: string;
  };
  resultats: {
    valeur: number;
    unite: string;
    statut: string;
  };
}

interface LaboratoireProps {
  activeTab?: string;
}

const Laboratoire: React.FC<LaboratoireProps> = ({ activeTab: initialTab = 'echantillons' }) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [echantillons, setEchantillons] = useState<Echantillon[]>([]);
  const [analyses, setAnalyses] = useState<Analyse[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatut, setFilterStatut] = useState('');
  const abortRef = useRef<AbortController | null>(null);
  const [echantillonsPage, setEchantillonsPage] = useState(1);
  const [analysesPage, setAnalysesPage] = useState(1);
  const [plansPage, setPlansPage] = useState(1);
  const pageSize = 10;
  
  // Export CSV selon l'onglet actif
  const handleExport = () => {
    const toCsv = (rows: any[], headers: string[], selector: (row: any) => (string | number | undefined | null)[]) => {
      const escape = (val: any) => {
        if (val === undefined || val === null) return '';
        const s = String(val).replace(/"/g, '""');
        return /[",\n]/.test(s) ? `"${s}"` : s;
      };
      const lines = [headers.join(',')].concat(
        rows.map(r => selector(r).map(escape).join(','))
      );
      // Ajouter BOM pour compat Excel
      return new Blob(["\uFEFF" + lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    };

    let blob: Blob | null = null;
    let filename = `export-${activeTab}-${new Date().toISOString().slice(0,10)}.csv`;

    if (activeTab === 'echantillons') {
      const headers = ['Numero', 'Lot', 'Produit', 'Reference', 'Type', 'Statut', 'Conformite', 'Score', 'DatePrelevement'];
      blob = toCsv(filteredEchantillons, headers, (e) => [
        e.numero,
        e.numeroLot,
        e.produit?.nom,
        e.produit?.reference,
        e.typeEchantillon,
        e.statut,
        e.resultats?.conformite,
        e.resultats?.score,
        e.prelevement?.date ? new Date(e.prelevement.date).toLocaleDateString('fr-FR') : ''
      ]);
    } else if (activeTab === 'analyses') {
      const headers = ['Numero', 'Nom', 'Type', 'Categorie', 'Statut', 'Echantillon', 'Lot', 'Valeur', 'Unite'];
      blob = toCsv(filteredAnalyses, headers, (a) => [
        a.numero,
        a.nom,
        a.type,
        a.categorie,
        a.statut,
        a.echantillon?.numero,
        a.echantillon?.numeroLot,
        a.resultats?.valeur,
        a.resultats?.unite
      ]);
    } else if (activeTab === 'plans-controle') {
      const headers = ['Numero', 'Nom', 'Type', 'Statut', 'Frequence', 'Debut', 'Fin'];
      blob = toCsv(filteredPlans, headers, (p) => [
        p.numero,
        p.nom,
        p.type,
        p.statut,
        p.frequence,
        p.dateDebut ? new Date(p.dateDebut).toLocaleDateString('fr-FR') : '',
        p.dateFin ? new Date(p.dateFin).toLocaleDateString('fr-FR') : ''
      ]);
    }

    if (blob) {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }
  };
  
  // États des modals
  const [isEchantillonModalOpen, setIsEchantillonModalOpen] = useState(false);
  const [isAnalyseModalOpen, setIsAnalyseModalOpen] = useState(false);
  const [isPlanControleModalOpen, setIsPlanControleModalOpen] = useState(false);
  const [echantillonInitial, setEchantillonInitial] = useState<any>(null);
  const [analyseInitial, setAnalyseInitial] = useState<any>(null);
  const [planInitial, setPlanInitial] = useState<any>(null);
  const [echantillonMode, setEchantillonMode] = useState<'create'|'edit'>('create');
  const [analyseMode, setAnalyseMode] = useState<'create'|'edit'>('create');
  const [planMode, setPlanMode] = useState<'create'|'edit'>('create');
  const [confirmState, setConfirmState] = useState<{open:boolean; title?:string; message?:string; onConfirm: () => void | Promise<void>}>({open:false, onConfirm: () => {}});
  const [detailState, setDetailState] = useState<{open:boolean; title?:string; content?: React.ReactNode}>({open:false});
  const [tracaState, setTracaState] = useState<{open:boolean; data: TracaData | null}>({open:false, data:null});

  const openTracabiliteForLot = (numeroLot: string, produitNom?: string) => {
    const lotEchantillons = echantillons.filter(e => e.numeroLot === numeroLot);
    const first = lotEchantillons[0];
    const lotAnalyses = analyses.filter(a => a.echantillon?.numeroLot === numeroLot);
    const traca: TracaData = {
      id_lot: numeroLot,
      produit: produitNom || first?.produit?.nom || '',
      laboratoire: {
        id_echantillon: first?.numero,
        poids_net: first?.mesuresInitiales?.poidsNet ? `${first.mesuresInitiales.poidsNet} ${first.mesuresInitiales.unite || ''}`.trim() : undefined,
        analyses_realisees: lotAnalyses.map(a => ({
          nom: a.nom,
          valeur: a.resultats && (a.resultats.valeur !== undefined && a.resultats.unite)
            ? `${a.resultats.valeur} ${a.resultats.unite}`
            : undefined,
          statut: a.statut
        })),
        resultats_analyses: lotAnalyses.length > 0
          ? (lotAnalyses.every(a => a.statut === 'Validée' || a.statut === 'Terminée') ? 'Conforme' : 'En attente')
          : 'En attente'
      },
      qualite: {
        decision_finale: undefined
      },
      hse: {}
    };
    setTracaState({ open: true, data: traca });
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
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Annuler la requête précédente si encore en cours
      if (abortRef.current) {
        abortRef.current.abort();
      }
      abortRef.current = new AbortController();
      const { signal } = abortRef.current;
      const token = localStorage.getItem('qhse-token')?.replace(/^"|"$/g, '');
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      };

      if (activeTab === 'echantillons') {
        const response = await echantillonService.getAll();
        setEchantillons(response.data.echantillons || []);
        setEchantillonsPage(1);
      } else if (activeTab === 'analyses') {
        const response = await analyseService.getAll();
        setAnalyses(response.data.analyses || []);
        setAnalysesPage(1);
      } else if (activeTab === 'plans-controle') {
        const response = await planControleService.getAll();
        setPlans(response.data.plans || response.data.plansControle || []);
        setPlansPage(1);
      }
    } catch (error) {
      if ((error as any)?.name !== 'AbortError') {
      console.error('Erreur lors du chargement des données:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  // Données filtrées et paginées (mémoisées)
  const filteredEchantillons = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    let list = echantillons.filter(e =>
      (!filterStatut || e.statut === filterStatut) &&
      (!term ||
        e.numero.toLowerCase().includes(term) ||
        e.numeroLot.toLowerCase().includes(term) ||
        e.produit?.nom?.toLowerCase().includes(term))
    );
    return list;
  }, [echantillons, searchTerm, filterStatut]);

  const pagedEchantillons = useMemo(() => {
    const start = (echantillonsPage - 1) * pageSize;
    return filteredEchantillons.slice(start, start + pageSize);
  }, [filteredEchantillons, echantillonsPage]);

  const filteredAnalyses = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    let list = analyses.filter(a =>
      (!filterStatut || a.statut === filterStatut) &&
      (!term ||
        a.numero.toLowerCase().includes(term) ||
        a.nom.toLowerCase().includes(term) ||
        a.echantillon?.numero?.toLowerCase().includes(term))
    );
    return list;
  }, [analyses, searchTerm, filterStatut]);

  const pagedAnalyses = useMemo(() => {
    const start = (analysesPage - 1) * pageSize;
    return filteredAnalyses.slice(start, start + pageSize);
  }, [filteredAnalyses, analysesPage]);

  const filteredPlans = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    let list = plans.filter(p =>
      (!filterStatut || p.statut === filterStatut) &&
      (!term ||
        p.numero?.toLowerCase().includes(term) ||
        p.nom?.toLowerCase().includes(term) ||
        p.produit?.nom?.toLowerCase().includes(term))
    );
    return list;
  }, [plans, searchTerm, filterStatut]);

  const pagedPlans = useMemo(() => {
    const start = (plansPage - 1) * pageSize;
    return filteredPlans.slice(start, start + pageSize);
  }, [filteredPlans, plansPage]);

  // Création / Mise à jour Échantillon
  const createEchantillon = async (data: any) => {
    try {
      // Adapter le payload aux champs requis du modèle
      const payload = {
        numero: data.numero,
        numeroLot: data.numeroLot,
        produit: data.produit,
        typeEchantillon: data.typeEchantillon,
        prelevement: {
          date: data.prelevement?.date
        },
        mesuresInitiales: data.mesuresInitiales
      };

      await echantillonService.create(payload);
      setIsEchantillonModalOpen(false);
      setEchantillonInitial(null);
      setEchantillonMode('create');
      await loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const updateEchantillon = async (data: any) => {
    try {
      if (!echantillonInitial?._id) return;
      const token = localStorage.getItem('qhse-token')?.replace(/^"|"$/g, '');
      const payload = {
        numero: data.numero ?? echantillonInitial.numero,
        numeroLot: data.numeroLot ?? echantillonInitial.numeroLot,
        produit: {
          nom: data.produit?.nom ?? echantillonInitial.produit?.nom,
          reference: data.produit?.reference ?? echantillonInitial.produit?.reference
        },
        typeEchantillon: data.typeEchantillon ?? echantillonInitial.typeEchantillon,
        prelevement: {
          date: data.prelevement?.date ?? echantillonInitial.prelevement?.date,
          responsable:
            (echantillonInitial.prelevement?.responsable && (echantillonInitial.prelevement.responsable._id || echantillonInitial.prelevement.responsable))
            || undefined
        },
        mesuresInitiales: {
          poidsNet:
            (data.mesuresInitiales?.poidsNet !== undefined
              ? parseFloat(data.mesuresInitiales.poidsNet)
              : echantillonInitial.mesuresInitiales?.poidsNet) || 0,
          unite: data.mesuresInitiales?.unite ?? echantillonInitial.mesuresInitiales?.unite
        }
      };

      await echantillonService.update(echantillonInitial._id, payload);
      setIsEchantillonModalOpen(false);
      setEchantillonInitial(null);
      setEchantillonMode('create');
      await loadData();
    } catch (e) {
      console.error(e);
    }
  };

  // Création / Mise à jour Analyse
  const createAnalyse = async (data: any) => {
    try {
      // Associer l'analyse à l'échantillon via son ObjectId
      let matchedEchantillon = echantillons.find(e => 
        e.numero === data.echantillonNumero && e.numeroLot === data.echantillonNumeroLot
      );

      // Si non trouvé en mémoire, tenter une recherche côté API par numeroLot puis filtrer par numero
      if (!matchedEchantillon) {
        const token = localStorage.getItem('qhse-token')?.replace(/^"|"$/g, '');
        const headers = {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        };
        const resp = await fetch(`/api/laboratoire/echantillons?numeroLot=${encodeURIComponent(data.echantillonNumeroLot || '')}`, { headers });
        if (resp.ok) {
          const payload = await resp.json();
          const fromApi = (payload?.echantillons || []).find((e: any) => e.numero === data.echantillonNumero);
          if (fromApi) {
            matchedEchantillon = fromApi;
          }
        }
      }

      if (!matchedEchantillon) {
        throw new Error("Échantillon introuvable. Créez l'échantillon d'abord ou vérifiez numéro/lot.");
      }

      const payload = {
        numero: data.numero,
        nom: data.nom,
        type: data.type,
        categorie: data.categorie,
        statut: data.statut,
        datePlanification: data.datePlanification,
        echantillon: matchedEchantillon._id,
        ...(data.valeur || data.unite ? {
          resultats: {
            ...(data.valeur ? { valeur: parseFloat(data.valeur) } : {}),
            ...(data.unite ? { unite: data.unite } : {})
          }
        } : {}),
        commentaire: data.commentaire || ''
      };

      await analyseService.create(payload);
      setIsAnalyseModalOpen(false);
      setAnalyseInitial(null);
      setAnalyseMode('create');
      await loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const updateAnalyse = async (data: any) => {
    try {
      if (!analyseInitial?._id) return;
      const token = localStorage.getItem('qhse-token')?.replace(/^"|"$/g, '');
      const payload = {
        numero: data.numero ?? analyseInitial.numero,
        nom: data.nom ?? analyseInitial.nom,
        type: data.type ?? analyseInitial.type,
        categorie: data.categorie ?? analyseInitial.categorie,
        statut: data.statut ?? analyseInitial.statut,
        datePlanification: data.datePlanification ?? analyseInitial.datePlanification,
        echantillon:
          (analyseInitial.echantillon && (analyseInitial.echantillon._id || analyseInitial.echantillon)) || undefined,
        ...(data.valeur || data.unite
          ? {
              resultats: {
                valeur: data.valeur ? parseFloat(data.valeur) : analyseInitial.resultats?.valeur,
                unite: data.unite ?? analyseInitial.resultats?.unite,
                statut: data.statut ?? analyseInitial.resultats?.statut
              }
            }
          : {})
      };

      await analyseService.update(analyseInitial._id, payload);
      setIsAnalyseModalOpen(false);
      setAnalyseInitial(null);
      setAnalyseMode('create');
      await loadData();
    } catch (e) {
      console.error(e);
    }
  };

  // Création / Mise à jour Plan de contrôle
  const createPlanControle = async (data: any) => {
    try {
      const token = localStorage.getItem('qhse-token')?.replace(/^"|"$/g, '');
      
      // Le backend génère automatiquement le numéro si pas fourni
      // et assigne le responsable depuis req.user
      const payload = {
        ...data,
        // Le numéro sera généré automatiquement par le backend si pas fourni
        // Le responsable sera assigné automatiquement par le backend depuis req.user
      };
      
      await planControleService.create(payload);
      
      setIsPlanControleModalOpen(false);
      setPlanInitial(null);
      setPlanMode('create');
      await loadData();
      alert('Plan de contrôle créé avec succès !');
    } catch (e: any) {
      console.error(e);
      alert(`Erreur: ${e.message}`);
    }
  };

  const updatePlanControle = async (data: any) => {
    try {
      if (!planInitial?._id) return;
      const token = localStorage.getItem('qhse-token')?.replace(/^"|"$/g, '');
      const payload = {
        numero: data.numero ?? planInitial.numero,
        nom: data.nom ?? planInitial.nom,
        description: data.description ?? planInitial.description,
        version: data.version ?? planInitial.version,
        produit: {
          nom: data.produit?.nom ?? planInitial.produit?.nom,
          reference: data.produit?.reference ?? planInitial.produit?.reference,
          famille: data.produit?.famille ?? planInitial.produit?.famille,
          categorie: data.produit?.categorie ?? planInitial.produit?.categorie
        },
        type: data.type ?? planInitial.type,
        frequence: data.frequence ?? planInitial.frequence,
        frequenceDetail: data.frequenceDetail ?? planInitial.frequenceDetail,
        statut: data.statut ?? planInitial.statut,
        dateDebut: data.dateDebut ?? planInitial.dateDebut,
        dateFin: data.dateFin ?? planInitial.dateFin,
        dateRevision: data.dateRevision ?? planInitial.dateRevision
      };

      await planControleService.update(planInitial._id, payload);
      setIsPlanControleModalOpen(false);
      setPlanInitial(null);
      setPlanMode('create');
      await loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const openCreateModalForTab = () => {
    switch (activeTab) {
      case 'echantillons':
        setIsEchantillonModalOpen(true);
        break;
      case 'analyses':
        setIsAnalyseModalOpen(true);
        break;
      case 'plans-controle':
        setIsPlanControleModalOpen(true);
        break;
      default:
        console.log('Action non définie pour cet onglet');
    }
  };

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'Conforme':
      case 'Validé':
      case 'Terminée':
      case 'Actif':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-300 dark:bg-emerald-900/20 dark:border-emerald-800';
      case 'Non conforme':
      case 'Rejeté':
      case 'Critique':
        return 'text-red-700 bg-red-50 border-red-200 dark:text-red-300 dark:bg-red-900/20 dark:border-red-800';
      case 'En attente':
      case 'Planifiée':
      case 'Brouillon':
        return 'text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-300 dark:bg-amber-900/20 dark:border-amber-800';
      case 'En cours':
      case 'En révision':
        return 'text-blue-700 bg-blue-50 border-blue-200 dark:text-blue-300 dark:bg-blue-900/20 dark:border-blue-800';
      case 'Suspendu':
      case 'Archivé':
        return 'text-gray-700 bg-gray-50 border-gray-200 dark:text-gray-300 dark:bg-gray-900/20 dark:border-gray-800';
      default:
        return 'text-gray-700 bg-gray-50 border-gray-200 dark:text-gray-300 dark:bg-gray-900/20 dark:border-gray-800';
    }
  };

  const getConformiteIcon = (conformite: string) => {
    switch (conformite) {
      case 'Conforme':
        return <CheckCircle className="h-4 w-4 text-emerald-600" />;
      case 'Non conforme':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'Partiellement conforme':
        return <AlertTriangle className="h-4 w-4 text-amber-600" />;
      case 'En attente':
        return <Clock className="h-4 w-4 text-amber-600" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const tabs = [
    { id: 'echantillons', label: 'Échantillons', icon: Microscope },
    { id: 'analyses', label: 'Analyses', icon: FlaskConical },
    { id: 'plans-controle', label: 'Plans de Contrôle', icon: FileText },
    { id: 'tracabilite', label: 'Traçabilité', icon: FileText },
    { id: 'statistiques', label: 'Statistiques', icon: BarChart3 }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
            <Microscope className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
              Module Laboratoire
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm lg:text-base">
              Gestion des échantillons, analyses et contrôles qualité
            </p>
          </div>
        </div>
        <button 
          onClick={openCreateModalForTab}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 lg:px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 w-full lg:w-auto"
        >
          <Plus className="h-5 w-5" />
          <span className="font-medium text-sm lg:text-base">
            {activeTab === 'echantillons' ? 'Nouvel échantillon' : 
             activeTab === 'analyses' ? 'Nouvelle analyse' : 
             activeTab === 'plans-controle' ? 'Nouveau plan' : 'Nouveau'}
          </span>
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-1">
        <nav className="flex flex-wrap gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 lg:py-3 px-3 lg:px-4 rounded-lg font-medium text-xs lg:text-sm flex items-center space-x-1 lg:space-x-2 transition-all duration-200 flex-1 lg:flex-none ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par numéro, lot, produit..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>
          <select
            value={filterStatut}
            onChange={(e) => setFilterStatut(e.target.value)}
            className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">Tous les statuts</option>
            <option value="Conforme">Conforme</option>
            <option value="Non conforme">Non conforme</option>
            <option value="En attente">En attente</option>
            <option value="En cours">En cours</option>
            <option value="Terminée">Terminée</option>
            <option value="Validée">Validée</option>
          </select>
          <button className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-2 text-gray-700 dark:text-gray-300 transition-colors">
            <Filter className="h-4 w-4" />
            <span>Filtres</span>
          </button>
          <button onClick={handleExport} className="px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 flex items-center space-x-2 transition-all duration-200 shadow-md hover:shadow-lg">
            <Download className="h-4 w-4" />
            <span>Exporter</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
              <p className="text-gray-600 dark:text-gray-400">Chargement des données...</p>
            </div>
          </div>
        ) : (
          <>
            {activeTab === 'echantillons' && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                        Échantillon
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                        Produit
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                        Statut
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                        Conformité
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {pagedEchantillons.map((echantillon) => (
                      <tr key={echantillon._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                              <Microscope className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-gray-900 dark:text-white">
                                {echantillon.numero}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                Lot: {echantillon.numeroLot}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {echantillon.produit?.nom || ''}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {echantillon.produit?.reference || ''}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {echantillon.typeEchantillon}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full border ${getStatutColor(echantillon.statut)}`}>
                            {echantillon.statut}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            {getConformiteIcon(echantillon.resultats?.conformite || 'En attente')}
                            <span className="text-sm text-gray-900 dark:text-white">
                              {echantillon.resultats?.conformite || 'En attente'}
                            </span>
                            {echantillon.resultats?.score && (
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                ({echantillon.resultats?.score}%)
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {echantillon.prelevement?.date ? new Date(echantillon.prelevement.date).toLocaleDateString('fr-FR') : ''}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button 
                              className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors" 
                              onClick={() => {
                                setDetailState({ open:false });
                                openTracabiliteForLot(echantillon.numeroLot, echantillon.produit?.nom);
                              }}
                              title="Voir la traçabilité"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button 
                              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                              onClick={() => {
                                setEchantillonInitial(echantillon);
                                setEchantillonMode('edit');
                                setIsEchantillonModalOpen(true);
                              }}
                              title="Modifier"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button 
                              className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                              onClick={() => {
                                setConfirmState({
                                  open: true,
                                  title: "Supprimer l'échantillon",
                                  message: 'Cette action est irréversible.',
                                  onConfirm: async () => {
                                    const token = localStorage.getItem('qhse-token')?.replace(/^"|"$/g, '');
                                    const res = await fetch(`/api/laboratoire/echantillons/${echantillon._id}`, {
                                      method: 'DELETE',
                                      headers: {
                                        'Content-Type': 'application/json',
                                        ...(token ? { Authorization: `Bearer ${token}` } : {})
                                      }
                                    });
                                    setConfirmState(s => ({...s, open:false}));
                                    if (!res.ok) return;
                                    await loadData();
                                  }
                                })
                              }}
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

            {activeTab === 'analyses' && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Analyse
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Échantillon
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Résultat
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
                    {pagedAnalyses.map((analyse) => (
                      <tr key={analyse._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {analyse.numero}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {analyse.nom}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {analyse.type}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {analyse.categorie}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {analyse.echantillon?.numero || ''}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            Lot: {analyse.echantillon?.numeroLot || ''}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {analyse.resultats ? (
                            <div className="text-sm text-gray-900 dark:text-white">
                              {analyse.resultats?.valeur} {analyse.resultats?.unite}
                            </div>
                          ) : (
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              En attente
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full border ${getStatutColor(analyse.statut)}`}>
                            {analyse.statut}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button className="text-primary-600 hover:text-primary-900" onClick={() => {
                              setDetailState({ open:false });
                              openTracabiliteForLot(analyse.echantillon?.numeroLot || '');
                            }}>
                              <Eye className="h-4 w-4" />
                            </button>
                            <button className="text-gray-600 hover:text-gray-900" onClick={() => {
                              setAnalyseInitial(analyse);
                              setAnalyseMode('edit');
                              setIsAnalyseModalOpen(true);
                            }}>
                              <Edit className="h-4 w-4" />
                            </button>
                            <button className="text-red-600 hover:text-red-900" onClick={() => {
                              setConfirmState({
                                open: true,
                                title: "Supprimer l'analyse",
                                message: 'Cette action est irréversible.',
                                onConfirm: async () => {
                                  const token = localStorage.getItem('qhse-token')?.replace(/^"|"$/g, '');
                                  const res = await fetch(`/api/laboratoire/analyses/${analyse._id}`, {
                                    method: 'DELETE',
                                    headers: {
                                      'Content-Type': 'application/json',
                                      ...(token ? { Authorization: `Bearer ${token}` } : {})
                                    }
                                  });
                                  setConfirmState(s => ({...s, open:false}));
                                  if (!res.ok) return;
                                  await loadData();
                                }
                              })
                            }}>
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

            {activeTab === 'plans-controle' && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Plan</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Statut</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Fréquence</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Critères</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Période</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {pagedPlans.map((plan) => (
                      <tr key={plan._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{plan.numero}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{plan.nom}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{plan.type}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full border ${getStatutColor(plan.statut || '')}`}>{plan.statut}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{plan.frequence}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{plan.criteres?.length || 0}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {plan.dateDebut ? new Date(plan.dateDebut).toLocaleDateString('fr-FR') : ''} 
                          {plan.dateFin ? ` → ${new Date(plan.dateFin).toLocaleDateString('fr-FR')}` : ''}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button className="text-primary-600 hover:text-primary-900"><Eye className="h-4 w-4" /></button>
                            <button className="text-gray-600 hover:text-gray-900" onClick={() => {
                              setPlanInitial(plan);
                              setPlanMode('edit');
                              setIsPlanControleModalOpen(true);
                            }}><Edit className="h-4 w-4" /></button>
                            <button className="text-red-600 hover:text-red-900" onClick={() => {
                              setConfirmState({
                                open: true,
                                title: 'Supprimer le plan de contrôle',
                                message: 'Cette action est irréversible.',
                                onConfirm: async () => {
                                  const token = localStorage.getItem('qhse-token')?.replace(/^"|"$/g, '');
                                  const res = await fetch(`/api/laboratoire/plans-controle/${plan._id}`, {
                                    method: 'DELETE',
                                    headers: {
                                      'Content-Type': 'application/json',
                                      ...(token ? { Authorization: `Bearer ${token}` } : {})
                                    }
                                  });
                                  setConfirmState(s => ({...s, open:false}));
                                  if (!res.ok) return;
                                  await loadData();
                                }
                              })
                            }}>
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

            {activeTab === 'tracabilite' && (
              <div className="p-6 space-y-6">
                <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-6 bg-white dark:bg-gray-800 shadow-sm">
                  <div className="mb-6">
                    <div className="flex items-center space-x-2 mb-2">
                      <FileText className="h-5 w-5 text-blue-600" />
                      <div className="text-lg font-semibold text-gray-800 dark:text-gray-200">Rechercher un lot</div>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Cliquez sur un lot pour ouvrir la traçabilité complète</div>
                  </div>
                  {(() => {
                    const lotsSet = new Set<string>();
                    echantillons.forEach(e => e.numeroLot && lotsSet.add(e.numeroLot));
                    analyses.forEach(a => a.echantillon?.numeroLot && lotsSet.add(a.echantillon.numeroLot));
                    const lots = Array.from(lotsSet).filter(l => !searchTerm || l.toLowerCase().includes(searchTerm.toLowerCase()));
                    if (lots.length === 0) {
                      return (
                        <div className="text-center py-12">
                          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <div className="text-lg text-gray-500 dark:text-gray-400 mb-2">Aucun lot trouvé</div>
                          <div className="text-sm text-gray-400 dark:text-gray-500">Créez des échantillons ou analyses pour voir les lots</div>
                        </div>
                      );
                    }
                    return (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {lots.map(lot => {
                          const lotEchantillons = echantillons.filter(e => e.numeroLot === lot);
                          const lotAnalyses = analyses.filter(a => a.echantillon?.numeroLot === lot);
                          const conformes = lotEchantillons.filter(e => e.resultats?.conformite === 'Conforme').length;
                          const totalEchantillons = lotEchantillons.length;
                          const conformitePct = totalEchantillons > 0 ? Math.round((conformes / totalEchantillons) * 100) : 0;
                          
                          return (
                            <button
                              key={lot}
                              onClick={() => openTracabiliteForLot(lot)}
                              className="group p-4 rounded-xl border border-gray-200 dark:border-gray-700 text-left hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-lg transition-all duration-200 bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/10"
                            >
                              <div className="flex items-center justify-between mb-3">
                                <div className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-300">
                                  Lot {lot}
                                </div>
                                <div className="p-1 bg-blue-100 dark:bg-blue-900/30 rounded-lg group-hover:bg-blue-200 dark:group-hover:bg-blue-800/40">
                                  <Eye className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                                </div>
                              </div>
                              <div className="space-y-2">
                                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                                  <span>Échantillons: {totalEchantillons}</span>
                                  <span>Analyses: {lotAnalyses.length}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                    <div 
                                      className={`h-2 rounded-full transition-all duration-300 ${
                                        conformitePct >= 80 ? 'bg-gradient-to-r from-emerald-500 to-green-500' :
                                        conformitePct >= 60 ? 'bg-gradient-to-r from-amber-500 to-orange-500' :
                                        'bg-gradient-to-r from-red-500 to-red-600'
                                      }`}
                                      style={{ width: `${conformitePct}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                    {conformitePct}%
                                  </span>
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}

            {activeTab === 'statistiques' && (
              <StatistiquesLaboratoire 
                echantillons={echantillons}
                analyses={analyses}
                plans={plans}
              />
            )}
          </>
        )}
      </div>

      {/* Modals */}
      <ModalEchantillon
        isOpen={isEchantillonModalOpen}
        onClose={() => setIsEchantillonModalOpen(false)}
        onSave={echantillonMode === 'edit' ? updateEchantillon : createEchantillon}
        initialData={echantillonInitial}
        mode={echantillonMode}
        title="Échantillon"
      />
      <ModalAnalyse
        isOpen={isAnalyseModalOpen}
        onClose={() => setIsAnalyseModalOpen(false)}
        onSave={analyseMode === 'edit' ? updateAnalyse : createAnalyse}
        initialData={analyseInitial}
        mode={analyseMode}
        title="Analyse"
      />
      <ModalPlanControle
        isOpen={isPlanControleModalOpen}
        onClose={() => setIsPlanControleModalOpen(false)}
        onSave={planMode === 'edit' ? updatePlanControle : createPlanControle}
        initialData={planInitial}
        mode={planMode}
        title="Plan de Contrôle"
      />
      <ConfirmModal
        isOpen={confirmState.open}
        title={confirmState.title}
        message={confirmState.message}
        onConfirm={confirmState.onConfirm}
        onClose={() => setConfirmState(s => ({...s, open:false}))}
      />
      <DetailModal
        isOpen={detailState.open}
        title={detailState.title}
        onClose={() => setDetailState(s => ({...s, open:false}))}
      >
        {detailState.content}
      </DetailModal>
      <ModalTracabilite
        isOpen={tracaState.open}
        onClose={() => setTracaState({ open:false, data:null })}
        data={tracaState.data}
      />
    </div>
  );
};

export default Laboratoire;
