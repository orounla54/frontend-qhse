import React, { useState, useEffect } from 'react';
import { FileText, Plus, Trash2, CheckCircle, Clock, Target, BarChart3 } from 'lucide-react';

export interface ModalProps<T = any> {
  isOpen: boolean;
  mode?: 'create' | 'edit' | 'view';
  initialData?: T | null;
  onClose: () => void;
  onSave?: (data: T) => void;
  title?: string;
}

const ModalPlanControle: React.FC<ModalProps<any>> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  initialData, 
  title = 'Plan de Contrôle',
  mode = 'create'
}) => {
  const [form, setForm] = useState({
    numero: '',
    nom: '',
    description: '',
    type: 'Matière première',
    concerne: {
      type: 'Produit',
      reference: '',
      nom: '',
      version: ''
    },
    statut: 'Brouillon',
    version: {
      numero: '1.0',
      dateCreation: new Date().toISOString().split('T')[0],
      dateRevision: '',
      prochaineRevision: ''
    },
    frequence: 'Chaque lot',
    responsable: '',
    equipe: [] as any[],
    pointsControle: [] as any[],
    criteresAcceptation: {
      conformite: '100%',
      tolerance: 0,
      conditionsParticulieres: [] as string[]
    },
    procedures: [] as any[]
  });

  const [currentPointControle, setCurrentPointControle] = useState({
    nom: '',
    description: '',
    type: 'Visuel',
    parametreCritique: 'pH',
    methode: '',
    appareil: '',
    unite: '',
    seuilMin: 0,
    seuilMax: 0,
    tolerance: 0,
    obligatoire: true,
    frequence: 'Chaque lot',
    echantillonnage: {
      taille: 1,
      methode: '',
      criteres: ''
    },
    norme: '',
    reference: ''
  });

  const [currentMembre, setCurrentMembre] = useState({
    membre: '',
    role: 'Contrôleur',
    competences: [] as string[]
  });

  const [currentProcedure, setCurrentProcedure] = useState({
    nom: '',
    description: '',
    etapes: [] as any[]
  });

  const [currentEtape, setCurrentEtape] = useState({
    numero: 1,
    description: '',
    duree: 0,
    responsable: '',
    documents: [] as string[]
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        numero: initialData.numero || '',
        nom: initialData.nom || '',
        description: initialData.description || '',
        type: initialData.type || 'Matière première',
        concerne: initialData.concerne || form.concerne,
        statut: initialData.statut || 'Brouillon',
        version: initialData.version || form.version,
        frequence: initialData.frequence || 'Chaque lot',
        responsable: initialData.responsable || '',
        equipe: initialData.equipe || [],
        pointsControle: initialData.pointsControle || [],
        criteresAcceptation: initialData.criteresAcceptation || form.criteresAcceptation,
        procedures: initialData.procedures || []
      });
    }
  }, [initialData, isOpen]);

  const addPointControle = () => {
    if (currentPointControle.nom) {
      setForm(prev => ({
        ...prev,
        pointsControle: [...prev.pointsControle, { ...currentPointControle, id: Date.now() }]
      }));
      setCurrentPointControle({
        nom: '',
        description: '',
        type: 'Visuel',
        parametreCritique: 'pH',
        methode: '',
        appareil: '',
        unite: '',
        seuilMin: 0,
        seuilMax: 0,
        tolerance: 0,
        obligatoire: true,
        frequence: 'Chaque lot',
        echantillonnage: {
          taille: 1,
          methode: '',
          criteres: ''
        },
        norme: '',
        reference: ''
      });
    }
  };

  const addMembre = () => {
    if (currentMembre.membre) {
      setForm(prev => ({
        ...prev,
        equipe: [...prev.equipe, { ...currentMembre, id: Date.now() }]
      }));
      setCurrentMembre({
        membre: '',
        role: 'Contrôleur',
        competences: []
      });
    }
  };

  const addEtape = () => {
    if (currentEtape.description) {
      setCurrentProcedure(prev => ({
        ...prev,
        etapes: [...prev.etapes, { ...currentEtape, id: Date.now() }]
      }));
      setCurrentEtape(prev => ({
        numero: prev.numero + 1,
        description: '',
        duree: 0,
        responsable: '',
        documents: []
      }));
    }
  };

  const addProcedure = () => {
    if (currentProcedure.nom) {
      setForm(prev => ({
        ...prev,
        procedures: [...prev.procedures, { ...currentProcedure, id: Date.now() }]
      }));
      setCurrentProcedure({
        nom: '',
        description: '',
        etapes: []
      });
    }
  };

  const removeItem = (type: string, index: number) => {
    if (type === 'point') {
      setForm(prev => ({
        ...prev,
        pointsControle: prev.pointsControle.filter((_, i) => i !== index)
      }));
    } else if (type === 'membre') {
      setForm(prev => ({
        ...prev,
        equipe: prev.equipe.filter((_, i) => i !== index)
      }));
    } else if (type === 'procedure') {
      setForm(prev => ({
        ...prev,
        procedures: prev.procedures.filter((_, i) => i !== index)
      }));
    }
  };

  const generateChecklist = () => {
    return form.pointsControle.map((point, index) => ({
      numero: index + 1,
      nom: point.nom,
      description: point.description,
      type: point.type,
      methode: point.methode,
      appareil: point.appareil,
      unite: point.unite,
      seuilMin: point.seuilMin,
      seuilMax: point.seuilMax,
      obligatoire: point.obligatoire,
      conforme: null,
      valeur: null,
      commentaire: null
    }));
  };

  if (!isOpen) return null;

  const validateForm = () => {
    if (!form.nom || form.nom.trim() === '') {
      alert('Le nom du plan est obligatoire');
      return false;
    }
    if (!form.type || form.type.trim() === '') {
      alert('Le type de plan est obligatoire');
      return false;
    }
    if (!form.concerne.type || form.concerne.type.trim() === '') {
      alert('Le type concerné est obligatoire');
      return false;
    }
    if (!form.frequence || form.frequence.trim() === '') {
      alert('La fréquence est obligatoire');
      return false;
    }
    return true;
  };

  const handleSubmit = () => {
    if (validateForm() && onSave) {
      onSave(form);
    }
  };

  const typesControle = [
    'Visuel', 'Organoleptique', 'Physico-chimique', 'Microbiologique', 'Mesure', 'Test', 'Vérification'
  ];

  const parametresCritiques = [
    'pH', 'Brix', 'Temperature', 'Viscosite', 'Humidite', 'Densite', 'Autre'
  ];

  const frequences = [
    'Chaque lot', 'Aléatoire', 'Quotidien', 'Hebdomadaire', 'Mensuel', 'Sur demande'
  ];

  const roles = [
    'Contrôleur', 'Superviseur', 'Expert', 'Observateur'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-6xl max-h-[90vh] rounded-lg bg-white shadow-xl dark:bg-gray-800 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <FileText className="h-6 w-6 text-primary-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Plan de contrôle configurable
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

        {/* Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onSave && onSave(form);
            }}
            className="space-y-6"
          >
            {/* Informations générales */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Informations générales
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    N° plan
                  </label>
                  <input
                    type="text"
                    value={form.numero}
                    onChange={(e) => setForm({...form, numero: e.target.value})}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-600 dark:border-gray-500"
                    placeholder="Auto-généré"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nom du plan *
                  </label>
                  <input
                    type="text"
                    value={form.nom}
                    onChange={(e) => setForm({...form, nom: e.target.value})}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-600 dark:border-gray-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Type *
                  </label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({...form, type: e.target.value})}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-600 dark:border-gray-500"
                    required
                  >
                    <option value="Matière première">Matière première</option>
                    <option value="Produit fini">Produit fini</option>
                    <option value="Processus">Processus</option>
                    <option value="Équipement">Équipement</option>
                    <option value="Environnement">Environnement</option>
                    <option value="Hygiène">Hygiène</option>
                    <option value="Transport">Transport</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Fréquence *
                  </label>
                  <select
                    value={form.frequence}
                    onChange={(e) => setForm({...form, frequence: e.target.value})}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-600 dark:border-gray-500"
                    required
                  >
                    {frequences.map(freq => (
                      <option key={freq} value={freq}>{freq}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Responsable *
                  </label>
                  <input
                    type="text"
                    value={form.responsable}
                    onChange={(e) => setForm({...form, responsable: e.target.value})}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-600 dark:border-gray-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Statut
                  </label>
                  <select
                    value={form.statut}
                    onChange={(e) => setForm({...form, statut: e.target.value})}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-600 dark:border-gray-500"
                  >
                    <option value="Brouillon">Brouillon</option>
                    <option value="En révision">En révision</option>
                    <option value="Approuvé">Approuvé</option>
                    <option value="Derogation">Derogation</option>
                    <option value="Actif">Actif</option>
                    <option value="Obsolète">Obsolète</option>
                  </select>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({...form, description: e.target.value})}
                  rows={3}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-600 dark:border-gray-500"
                  placeholder="Description du plan de contrôle..."
                />
              </div>
            </div>

            {/* Points de contrôle */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                <Target className="h-5 w-5 mr-2" />
                Points de contrôle
              </h3>
              
              {/* Formulaire d'ajout */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-4">
                <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Nouveau point de contrôle</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nom *
                    </label>
                    <input
                      type="text"
                      value={currentPointControle.nom}
                      onChange={(e) => setCurrentPointControle({...currentPointControle, nom: e.target.value})}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-500"
                      placeholder="Ex: Contrôle pH"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Type
                    </label>
                    <select
                      value={currentPointControle.type}
                      onChange={(e) => setCurrentPointControle({...currentPointControle, type: e.target.value})}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-500"
                    >
                      {typesControle.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Paramètre critique
                    </label>
                    <select
                      value={currentPointControle.parametreCritique}
                      onChange={(e) => setCurrentPointControle({...currentPointControle, parametreCritique: e.target.value})}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-500"
                    >
                      {parametresCritiques.map(param => (
                        <option key={param} value={param}>{param}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Méthode
                    </label>
                    <input
                      type="text"
                      value={currentPointControle.methode}
                      onChange={(e) => setCurrentPointControle({...currentPointControle, methode: e.target.value})}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-500"
                      placeholder="Ex: pH-mètre"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Appareil
                    </label>
                    <input
                      type="text"
                      value={currentPointControle.appareil}
                      onChange={(e) => setCurrentPointControle({...currentPointControle, appareil: e.target.value})}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-500"
                      placeholder="Ex: pH-mètre portable"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Unité
                    </label>
                    <input
                      type="text"
                      value={currentPointControle.unite}
                      onChange={(e) => setCurrentPointControle({...currentPointControle, unite: e.target.value})}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-500"
                      placeholder="Ex: pH, °C, %"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Seuil min
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={currentPointControle.seuilMin}
                      onChange={(e) => setCurrentPointControle({...currentPointControle, seuilMin: parseFloat(e.target.value) || 0})}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Seuil max
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={currentPointControle.seuilMax}
                      onChange={(e) => setCurrentPointControle({...currentPointControle, seuilMax: parseFloat(e.target.value) || 0})}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Fréquence
                    </label>
                    <select
                      value={currentPointControle.frequence}
                      onChange={(e) => setCurrentPointControle({...currentPointControle, frequence: e.target.value})}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-500"
                    >
                      {frequences.map(freq => (
                        <option key={freq} value={freq}>{freq}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="mt-4 flex items-center justify-between">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={currentPointControle.obligatoire}
                      onChange={(e) => setCurrentPointControle({...currentPointControle, obligatoire: e.target.checked})}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Point obligatoire
                    </span>
                  </label>
                  <button
                    type="button"
                    onClick={addPointControle}
                    className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 flex items-center space-x-2"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Ajouter</span>
                  </button>
                </div>
              </div>

              {/* Liste des points de contrôle */}
              <div className="space-y-3">
                {form.pointsControle.map((point, index) => (
                  <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="font-medium text-gray-900 dark:text-white">{point.nom}</h4>
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            {point.type}
                          </span>
                          {point.obligatoire && (
                            <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                              Obligatoire
                            </span>
                          )}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <div>Méthode: {point.methode}</div>
                          <div>Appareil: {point.appareil}</div>
                          <div>Seuils: {point.seuilMin} - {point.seuilMax} {point.unite}</div>
                          <div>Fréquence: {point.frequence}</div>
                        </div>
                        {point.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{point.description}</p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem('point', index)}
                        className="text-red-600 hover:text-red-800 p-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Équipe */}
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                <CheckCircle className="h-5 w-5 mr-2" />
                Équipe de contrôle
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Membre
                  </label>
                  <input
                    type="text"
                    value={currentMembre.membre}
                    onChange={(e) => setCurrentMembre({...currentMembre, membre: e.target.value})}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-600 dark:border-gray-500"
                    placeholder="Nom du membre"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Rôle
                  </label>
                  <select
                    value={currentMembre.role}
                    onChange={(e) => setCurrentMembre({...currentMembre, role: e.target.value})}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-600 dark:border-gray-500"
                  >
                    {roles.map(role => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <button
                    type="button"
                    onClick={addMembre}
                    className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 flex items-center space-x-2"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Ajouter membre</span>
                  </button>
                </div>
              </div>

              {/* Liste des membres */}
              <div className="space-y-2">
                {form.equipe.map((membre, index) => (
                  <div key={index} className="bg-white dark:bg-gray-800 rounded p-3 border border-gray-200 dark:border-gray-600">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900 dark:text-white">{membre.membre}</span>
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                          {membre.role}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem('membre', index)}
                        className="text-red-600 hover:text-red-800 p-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Critères d'acceptation */}
            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Critères d'acceptation
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Conformité requise
                  </label>
                  <select
                    value={form.criteresAcceptation.conformite}
                    onChange={(e) => setForm({
                      ...form,
                      criteresAcceptation: {...form.criteresAcceptation, conformite: e.target.value}
                    })}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-600 dark:border-gray-500"
                  >
                    <option value="100%">100%</option>
                    <option value="95%">95%</option>
                    <option value="90%">90%</option>
                    <option value="85%">85%</option>
                    <option value="80%">80%</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tolérance (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={form.criteresAcceptation.tolerance}
                    onChange={(e) => setForm({
                      ...form,
                      criteresAcceptation: {...form.criteresAcceptation, tolerance: parseFloat(e.target.value) || 0}
                    })}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-600 dark:border-gray-500"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Actions disponibles
              </h3>
              
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    const checklist = generateChecklist();
                    console.log('Checklist générée:', checklist);
                    // Ici on pourrait ouvrir une modal ou exporter la checklist
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2"
                >
                  <FileText className="h-4 w-4" />
                  <span>Générer checklist</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    // Logique d'approbation
                    setForm(prev => ({...prev, statut: 'Approuvé'}));
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center space-x-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  <span>Approuver plan</span>
                </button>
              </div>
            </div>
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
            onClick={handleSubmit}
            className="px-4 py-2 rounded-md bg-primary-600 text-white hover:bg-primary-700"
          >
            {mode === 'create' ? 'Créer plan' : 'Mettre à jour'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalPlanControle;