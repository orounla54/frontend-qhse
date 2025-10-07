import React, { useState, useEffect } from 'react';
import { AlertTriangle, Search, Brain, Target, Plus, Trash2, CheckCircle } from 'lucide-react';

export interface ModalProps<T = any> {
  isOpen: boolean;
  mode?: 'create' | 'edit' | 'view';
  initialData?: T | null;
  onClose: () => void;
  onSave?: (data: T) => void;
  title?: string;
}

const ModalAnalyseNC: React.FC<ModalProps<any>> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  initialData, 
  title = 'Analyse Non-Conformité',
  mode = 'create'
}) => {
  const [activeTab, setActiveTab] = useState('declaration');
  const [form, setForm] = useState({
    // Déclaration NC
    numero: '',
    type: 'Produit',
    description: '',
    lot: '',
    detectePar: '',
    dateDetection: new Date().toISOString().split('T')[0],
    localisation: {
      zone: '',
      ligne: '',
      poste: ''
    },
    
    // Analyse des causes
    gravite: 'Modérée',
    causes: [] as any[],
    analyseCinqPourquoi: [] as any[],
    diagrammeIshikawa: {
      materiel: [] as string[],
      methode: [] as string[],
      mainOeuvre: [] as string[],
      milieu: [] as string[],
      machine: [] as string[],
      mesure: [] as string[]
    },
    amdec: [] as any[],
    
    // Actions CAPA
    actionsCorrectives: [] as any[],
    actionsPreventives: [] as any[],
    
    statut: 'Déclarée'
  });

  const [currentPourquoi, setCurrentPourquoi] = useState({
    question: '',
    reponse: '',
    niveau: 1
  });

  const [currentCause, setCurrentCause] = useState({
    type: 'Humaine',
    description: '',
    facteur: '',
    probabilite: 'Modérée'
  });

  const [currentAction, setCurrentAction] = useState({
    description: '',
    responsable: '',
    dateLimite: '',
    type: 'corrective'
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        numero: initialData.numero || '',
        type: initialData.type || 'Produit',
        description: initialData.description || '',
        lot: initialData.lot || '',
        detectePar: initialData.detectePar || '',
        dateDetection: initialData.dateDetection || new Date().toISOString().split('T')[0],
        localisation: initialData.localisation || form.localisation,
        gravite: initialData.gravite || 'Modérée',
        causes: initialData.causes || [],
        analyseCinqPourquoi: initialData.analyseCinqPourquoi || [],
        diagrammeIshikawa: initialData.diagrammeIshikawa || form.diagrammeIshikawa,
        amdec: initialData.amdec || [],
        actionsCorrectives: initialData.actionsCorrectives || [],
        actionsPreventives: initialData.actionsPreventives || [],
        statut: initialData.statut || 'Déclarée'
      });
    }
  }, [initialData, isOpen]);

  const addCause = () => {
    if (currentCause.description) {
      setForm(prev => ({
        ...prev,
        causes: [...prev.causes, { ...currentCause, id: Date.now() }]
      }));
      setCurrentCause({
        type: 'Humaine',
        description: '',
        facteur: '',
        probabilite: 'Modérée'
      });
    }
  };

  const removeCause = (index: number) => {
    setForm(prev => ({
      ...prev,
      causes: prev.causes.filter((_, i) => i !== index)
    }));
  };

  const addPourquoi = () => {
    if (currentPourquoi.question && currentPourquoi.reponse) {
      setForm(prev => ({
        ...prev,
        analyseCinqPourquoi: [...prev.analyseCinqPourquoi, { 
          ...currentPourquoi, 
          id: Date.now(),
          causeRacine: currentPourquoi.niveau === 5
        }]
      }));
      setCurrentPourquoi({
        question: '',
        reponse: '',
        niveau: Math.min(5, currentPourquoi.niveau + 1)
      });
    }
  };

  const removePourquoi = (index: number) => {
    setForm(prev => ({
      ...prev,
      analyseCinqPourquoi: prev.analyseCinqPourquoi.filter((_, i) => i !== index)
    }));
  };

  const addIshikawa = (categorie: string, valeur: string) => {
    if (valeur.trim()) {
      setForm(prev => ({
        ...prev,
        diagrammeIshikawa: {
          ...prev.diagrammeIshikawa,
          [categorie]: [...prev.diagrammeIshikawa[categorie as keyof typeof prev.diagrammeIshikawa], valeur.trim()]
        }
      }));
    }
  };

  const removeIshikawa = (categorie: string, index: number) => {
    setForm(prev => ({
      ...prev,
      diagrammeIshikawa: {
        ...prev.diagrammeIshikawa,
        [categorie]: prev.diagrammeIshikawa[categorie as keyof typeof prev.diagrammeIshikawa].filter((_, i) => i !== index)
      }
    }));
  };

  const addAction = () => {
    if (currentAction.description) {
      const action = { ...currentAction, id: Date.now(), statut: 'Planifiée' };
      if (currentAction.type === 'corrective') {
        setForm(prev => ({
          ...prev,
          actionsCorrectives: [...prev.actionsCorrectives, action]
        }));
      } else {
        setForm(prev => ({
          ...prev,
          actionsPreventives: [...prev.actionsPreventives, action]
        }));
      }
      setCurrentAction({
        description: '',
        responsable: '',
        dateLimite: '',
        type: 'corrective'
      });
    }
  };

  const removeAction = (type: string, index: number) => {
    if (type === 'corrective') {
      setForm(prev => ({
        ...prev,
        actionsCorrectives: prev.actionsCorrectives.filter((_, i) => i !== index)
      }));
    } else {
      setForm(prev => ({
        ...prev,
        actionsPreventives: prev.actionsPreventives.filter((_, i) => i !== index)
      }));
    }
  };

  if (!isOpen) return null;

  const tabs = [
    { id: 'declaration', label: 'Déclaration', icon: AlertTriangle },
    { id: 'causes', label: 'Analyse causes', icon: Search },
    { id: 'cinq-pourquoi', label: '5 Pourquoi', icon: Brain },
    { id: 'ishikawa', label: 'Ishikawa', icon: Target },
    { id: 'capa', label: 'Actions CAPA', icon: CheckCircle }
  ];

  const categoriesIshikawa = [
    { key: 'materiel', label: 'Matériel', couleur: 'bg-red-100 text-red-800' },
    { key: 'methode', label: 'Méthode', couleur: 'bg-blue-100 text-blue-800' },
    { key: 'mainOeuvre', label: 'Main d\'œuvre', couleur: 'bg-green-100 text-green-800' },
    { key: 'milieu', label: 'Milieu', couleur: 'bg-yellow-100 text-yellow-800' },
    { key: 'machine', label: 'Machine', couleur: 'bg-purple-100 text-purple-800' },
    { key: 'mesure', label: 'Mesure', couleur: 'bg-cyan-100 text-cyan-800' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-6xl max-h-[90vh] rounded-lg bg-white shadow-xl dark:bg-gray-800 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="h-6 w-6 text-red-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Analyse complète des causes et actions correctives
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700 dark:text-gray-300 p-1"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 whitespace-nowrap ${
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

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onSave && onSave(form);
            }}
            className="space-y-6"
          >
            {/* Onglet Déclaration */}
            {activeTab === 'declaration' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      N° NC
                    </label>
                    <input
                      type="text"
                      value={form.numero}
                      onChange={(e) => setForm({...form, numero: e.target.value})}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600"
                      placeholder="Auto-généré"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Type *
                    </label>
                    <select
                      value={form.type}
                      onChange={(e) => setForm({...form, type: e.target.value})}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600"
                    >
                      <option value="Produit">Produit</option>
                      <option value="Processus">Processus</option>
                      <option value="Système">Système</option>
                      <option value="Documentation">Documentation</option>
                      <option value="Formation">Formation</option>
                      <option value="Équipement">Équipement</option>
                      <option value="Fournisseur">Fournisseur</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      N° lot concerné
                    </label>
                    <input
                      type="text"
                      value={form.lot}
                      onChange={(e) => setForm({...form, lot: e.target.value})}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Détecté par *
                    </label>
                    <input
                      type="text"
                      value={form.detectePar}
                      onChange={(e) => setForm({...form, detectePar: e.target.value})}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Date détection *
                    </label>
                    <input
                      type="date"
                      value={form.dateDetection}
                      onChange={(e) => setForm({...form, dateDetection: e.target.value})}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Gravité
                    </label>
                    <select
                      value={form.gravite}
                      onChange={(e) => setForm({...form, gravite: e.target.value})}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600"
                    >
                      <option value="Faible">Faible</option>
                      <option value="Modérée">Modérée</option>
                      <option value="Élevée">Élevée</option>
                      <option value="Critique">Critique</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description de l'anomalie *
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({...form, description: e.target.value})}
                    rows={4}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600"
                    placeholder="Décrire précisément l'anomalie détectée..."
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Zone
                    </label>
                    <input
                      type="text"
                      value={form.localisation.zone}
                      onChange={(e) => setForm({
                        ...form,
                        localisation: {...form.localisation, zone: e.target.value}
                      })}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Ligne
                    </label>
                    <input
                      type="text"
                      value={form.localisation.ligne}
                      onChange={(e) => setForm({
                        ...form,
                        localisation: {...form.localisation, ligne: e.target.value}
                      })}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Poste
                    </label>
                    <input
                      type="text"
                      value={form.localisation.poste}
                      onChange={(e) => setForm({
                        ...form,
                        localisation: {...form.localisation, poste: e.target.value}
                      })}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Onglet Analyse des causes */}
            {activeTab === 'causes' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Causes identifiées</h3>
                  <button
                    type="button"
                    onClick={addCause}
                    className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 flex items-center space-x-2"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Ajouter cause</span>
                  </button>
                </div>

                {/* Formulaire d'ajout de cause */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Nouvelle cause</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Type de cause
                      </label>
                      <select
                        value={currentCause.type}
                        onChange={(e) => setCurrentCause({...currentCause, type: e.target.value})}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-600 dark:border-gray-500"
                      >
                        <option value="Humaine">Humaine</option>
                        <option value="Technique">Technique</option>
                        <option value="Organisationnelle">Organisationnelle</option>
                        <option value="Environnementale">Environnementale</option>
                        <option value="Fournisseur">Fournisseur</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Probabilité
                      </label>
                      <select
                        value={currentCause.probabilite}
                        onChange={(e) => setCurrentCause({...currentCause, probabilite: e.target.value})}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-600 dark:border-gray-500"
                      >
                        <option value="Faible">Faible</option>
                        <option value="Modérée">Modérée</option>
                        <option value="Élevée">Élevée</option>
                        <option value="Certaine">Certaine</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Description
                      </label>
                      <input
                        type="text"
                        value={currentCause.description}
                        onChange={(e) => setCurrentCause({...currentCause, description: e.target.value})}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-600 dark:border-gray-500"
                        placeholder="Décrire la cause identifiée..."
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Facteur contributif
                      </label>
                      <input
                        type="text"
                        value={currentCause.facteur}
                        onChange={(e) => setCurrentCause({...currentCause, facteur: e.target.value})}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-600 dark:border-gray-500"
                        placeholder="Facteur qui a contribué à cette cause..."
                      />
                    </div>
                  </div>
                </div>

                {/* Liste des causes */}
                <div className="space-y-3">
                  {form.causes.map((cause, index) => (
                    <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                              {cause.type}
                            </span>
                            <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                              {cause.probabilite}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                            {cause.description}
                          </p>
                          {cause.facteur && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Facteur: {cause.facteur}
                            </p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeCause(index)}
                          className="text-red-600 hover:text-red-800 p-1"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Onglet 5 Pourquoi */}
            {activeTab === 'cinq-pourquoi' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Analyse des 5 Pourquoi</h3>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Niveau {currentPourquoi.niveau}/5
                  </div>
                </div>

                {/* Formulaire d'ajout */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Ajouter un "Pourquoi"</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Question (Pourquoi {currentPourquoi.niveau} ?)
                      </label>
                      <input
                        type="text"
                        value={currentPourquoi.question}
                        onChange={(e) => setCurrentPourquoi({...currentPourquoi, question: e.target.value})}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-600 dark:border-gray-500"
                        placeholder={`Pourquoi ${currentPourquoi.niveau} ?`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Réponse
                      </label>
                      <textarea
                        value={currentPourquoi.reponse}
                        onChange={(e) => setCurrentPourquoi({...currentPourquoi, reponse: e.target.value})}
                        rows={2}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-600 dark:border-gray-500"
                        placeholder="Réponse détaillée..."
                      />
                    </div>
                  </div>
                  
                  <button
                    type="button"
                    onClick={addPourquoi}
                    className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 flex items-center space-x-2"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Ajouter Pourquoi</span>
                  </button>
                </div>

                {/* Liste des Pourquoi */}
                <div className="space-y-3">
                  {form.analyseCinqPourquoi.map((pourquoi, index) => (
                    <div key={index} className={`bg-white dark:bg-gray-800 rounded-lg p-4 border ${
                      pourquoi.causeRacine 
                        ? 'border-red-300 bg-red-50 dark:bg-red-900/20' 
                        : 'border-gray-200 dark:border-gray-600'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="px-2 py-1 bg-primary-100 text-primary-800 text-xs rounded-full">
                            Niveau {pourquoi.niveau}
                          </span>
                          {pourquoi.causeRacine && (
                            <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                              Cause racine
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => removePourquoi(index)}
                          className="text-red-600 hover:text-red-800 p-1"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {pourquoi.question}
                        </p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {pourquoi.reponse}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Onglet Ishikawa */}
            {activeTab === 'ishikawa' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Diagramme d'Ishikawa (Arête de poisson)</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categoriesIshikawa.map((categorie) => {
                    const items = form.diagrammeIshikawa[categorie.key as keyof typeof form.diagrammeIshikawa] as string[];
                    const [newItem, setNewItem] = useState('');
                    
                    return (
                      <div key={categorie.key} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                        <h4 className={`text-sm font-medium mb-3 px-2 py-1 rounded ${categorie.couleur}`}>
                          {categorie.label}
                        </h4>
                        
                        <div className="space-y-2 mb-3">
                          {items.map((item, index) => (
                            <div key={index} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 rounded p-2">
                              <span className="text-xs text-gray-700 dark:text-gray-300">{item}</span>
                              <button
                                type="button"
                                onClick={() => removeIshikawa(categorie.key, index)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                        
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            value={newItem}
                            onChange={(e) => setNewItem(e.target.value)}
                            className="flex-1 text-xs rounded border border-gray-300 px-2 py-1 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-600 dark:border-gray-500"
                            placeholder="Ajouter..."
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                addIshikawa(categorie.key, newItem);
                                setNewItem('');
                              }
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              addIshikawa(categorie.key, newItem);
                              setNewItem('');
                            }}
                            className="px-2 py-1 bg-primary-600 text-white text-xs rounded hover:bg-primary-700"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Onglet Actions CAPA */}
            {activeTab === 'capa' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Actions CAPA</h3>
                  <div className="flex space-x-2">
                    <select
                      value={currentAction.type}
                      onChange={(e) => setCurrentAction({...currentAction, type: e.target.value})}
                      className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600"
                    >
                      <option value="corrective">Action corrective</option>
                      <option value="preventive">Action préventive</option>
                    </select>
                  </div>
                </div>

                {/* Formulaire d'ajout d'action */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
                    Nouvelle action {currentAction.type === 'corrective' ? 'corrective' : 'préventive'}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Description
                      </label>
                      <textarea
                        value={currentAction.description}
                        onChange={(e) => setCurrentAction({...currentAction, description: e.target.value})}
                        rows={3}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-600 dark:border-gray-500"
                        placeholder="Décrire l'action à mettre en place..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Responsable
                      </label>
                      <input
                        type="text"
                        value={currentAction.responsable}
                        onChange={(e) => setCurrentAction({...currentAction, responsable: e.target.value})}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-600 dark:border-gray-500"
                        placeholder="Nom du responsable"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Date limite
                      </label>
                      <input
                        type="date"
                        value={currentAction.dateLimite}
                        onChange={(e) => setCurrentAction({...currentAction, dateLimite: e.target.value})}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-600 dark:border-gray-500"
                      />
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={addAction}
                      className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 flex items-center space-x-2"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Ajouter</span>
                    </button>
                  </div>
                </div>

                {/* Actions correctives */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Actions correctives</h4>
                  <div className="space-y-3">
                    {form.actionsCorrectives.map((action, index) => (
                      <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                              {action.description}
                            </p>
                            <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                              <span>Responsable: {action.responsable}</span>
                              <span>Échéance: {action.dateLimite}</span>
                              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">
                                {action.statut}
                              </span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeAction('corrective', index)}
                            className="text-red-600 hover:text-red-800 p-1"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions préventives */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Actions préventives</h4>
                  <div className="space-y-3">
                    {form.actionsPreventives.map((action, index) => (
                      <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                              {action.description}
                            </p>
                            <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                              <span>Responsable: {action.responsable}</span>
                              <span>Échéance: {action.dateLimite}</span>
                              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">
                                {action.statut}
                              </span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeAction('preventive', index)}
                            className="text-red-600 hover:text-red-800 p-1"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Annuler
          </button>
          <button
            type="submit"
            onClick={() => onSave && onSave(form)}
            className="px-4 py-2 rounded-md bg-primary-600 text-white hover:bg-primary-700"
          >
            {mode === 'create' ? 'Enregistrer NC' : 'Mettre à jour'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalAnalyseNC;
