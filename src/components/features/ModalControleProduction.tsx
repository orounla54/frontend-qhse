import React, { useState, useEffect } from 'react';
import { Clock, Thermometer, Droplets, Gauge, User, FileText, CheckCircle, AlertTriangle } from 'lucide-react';

export interface ModalProps<T = any> {
  isOpen: boolean;
  mode?: 'create' | 'edit' | 'view';
  initialData?: T | null;
  onClose: () => void;
  onSave?: (data: T) => void;
  title?: string;
}

const ModalControleProduction: React.FC<ModalProps<any>> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  initialData, 
  title = 'Contrôle Production',
  mode = 'create'
}) => {
  const [form, setForm] = useState({
    numero: '',
    produit: '',
    ligne: '',
    machine: '',
    dateControle: new Date().toISOString().slice(0, 16),
    operateur: '',
    parametres: {
      brix: { valeur: 0, conforme: false, seuilMin: 0, seuilMax: 0 },
      pH: { valeur: 0, conforme: false, seuilMin: 0, seuilMax: 0 },
      temperature: { valeur: 0, conforme: false, seuilMin: 0, seuilMax: 0 },
      viscosite: { valeur: 0, conforme: false, seuilMin: 0, seuilMax: 0 },
      pression: { valeur: 0, conforme: false, seuilMin: 0, seuilMax: 0 },
      debit: { valeur: 0, conforme: false, seuilMin: 0, seuilMax: 0 }
    },
    observations: '',
    resultat: 'En attente',
    statut: 'En cours'
  });

  const [parametresCritiques] = useState([
    { key: 'brix', label: '°Brix', icon: Droplets, unite: '°Brix', couleur: 'text-blue-600' },
    { key: 'pH', label: 'pH', icon: Gauge, unite: '', couleur: 'text-green-600' },
    { key: 'temperature', label: 'Température', icon: Thermometer, unite: '°C', couleur: 'text-red-600' },
    { key: 'viscosite', label: 'Viscosité', icon: Droplets, unite: 'cP', couleur: 'text-purple-600' },
    { key: 'pression', label: 'Pression', icon: Gauge, unite: 'bar', couleur: 'text-orange-600' },
    { key: 'debit', label: 'Débit', icon: Droplets, unite: 'L/h', couleur: 'text-cyan-600' }
  ]);

  useEffect(() => {
    if (initialData) {
      setForm({
        numero: initialData.numero || '',
        produit: initialData.produit || '',
        ligne: initialData.ligne || '',
        machine: initialData.machine || '',
        dateControle: initialData.dateControle || new Date().toISOString().slice(0, 16),
        operateur: initialData.operateur || '',
        parametres: initialData.parametres || form.parametres,
        observations: initialData.observations || '',
        resultat: initialData.resultat || 'En attente',
        statut: initialData.statut || 'En cours'
      });
    }
  }, [initialData, isOpen]);

  const updateParametre = (parametre: string, field: string, value: any) => {
    setForm(prev => ({
      ...prev,
      parametres: {
        ...prev.parametres,
        [parametre]: {
          ...prev.parametres[parametre as keyof typeof prev.parametres],
          [field]: value
        }
      }
    }));
  };

  const calculerConformite = () => {
    const parametresConformes = Object.values(form.parametres).filter(p => p.conforme).length;
    const totalParametres = Object.keys(form.parametres).length;
    
    if (parametresConformes === totalParametres) {
      return 'Conforme';
    } else if (parametresConformes > 0) {
      return 'Sous réserve';
    } else {
      return 'Non conforme';
    }
  };

  const calculerScore = () => {
    const parametresConformes = Object.values(form.parametres).filter(p => p.conforme).length;
    const totalParametres = Object.keys(form.parametres).length;
    return Math.round((parametresConformes / totalParametres) * 100);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-5xl max-h-[90vh] rounded-lg bg-white shadow-xl dark:bg-gray-800 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <Clock className="h-6 w-6 text-primary-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Contrôle en cours de production
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
              const resultat = calculerConformite();
              const score = calculerScore();
              onSave && onSave({
                ...form,
                resultat,
                score,
                statut: resultat === 'Conforme' ? 'Terminé' : 'En cours'
              });
            }}
            className="space-y-6"
          >
            {/* Informations générales */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Informations générales
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    N° contrôle
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
                    Produit en cours *
                  </label>
                  <input
                    type="text"
                    value={form.produit}
                    onChange={(e) => setForm({...form, produit: e.target.value})}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-600 dark:border-gray-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Ligne / Machine *
                  </label>
                  <input
                    type="text"
                    value={form.ligne}
                    onChange={(e) => setForm({...form, ligne: e.target.value})}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-600 dark:border-gray-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Date & heure contrôle *
                  </label>
                  <input
                    type="datetime-local"
                    value={form.dateControle}
                    onChange={(e) => setForm({...form, dateControle: e.target.value})}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-600 dark:border-gray-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nom opérateur *
                  </label>
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={form.operateur}
                      onChange={(e) => setForm({...form, operateur: e.target.value})}
                      className="flex-1 rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-600 dark:border-gray-500"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Machine
                  </label>
                  <input
                    type="text"
                    value={form.machine}
                    onChange={(e) => setForm({...form, machine: e.target.value})}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-600 dark:border-gray-500"
                  />
                </div>
              </div>
            </div>

            {/* Paramètres mesurés */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                <CheckCircle className="h-5 w-5 mr-2" />
                Paramètres mesurés
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {parametresCritiques.map((param) => {
                  const Icon = param.icon;
                  const parametre = form.parametres[param.key as keyof typeof form.parametres];
                  
                  return (
                    <div key={param.key} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                      <div className="flex items-center space-x-2 mb-3">
                        <Icon className={`h-5 w-5 ${param.couleur}`} />
                        <h4 className="font-medium text-gray-900 dark:text-white">{param.label}</h4>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                            Valeur mesurée
                          </label>
                          <div className="flex space-x-2">
                            <input
                              type="number"
                              step="0.01"
                              value={parametre.valeur}
                              onChange={(e) => updateParametre(param.key, 'valeur', parseFloat(e.target.value) || 0)}
                              className="flex-1 rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-500"
                              placeholder="0.00"
                            />
                            <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                              {param.unite}
                            </span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                              Seuil min
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              value={parametre.seuilMin}
                              onChange={(e) => updateParametre(param.key, 'seuilMin', parseFloat(e.target.value) || 0)}
                              className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-500"
                              placeholder="Min"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                              Seuil max
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              value={parametre.seuilMax}
                              onChange={(e) => updateParametre(param.key, 'seuilMax', parseFloat(e.target.value) || 0)}
                              className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-500"
                              placeholder="Max"
                            />
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={parametre.conforme}
                              onChange={(e) => updateParametre(param.key, 'conforme', e.target.checked)}
                              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                            />
                            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                              Conforme
                            </span>
                          </label>
                          
                          {parametre.valeur > 0 && (
                            <div className={`text-xs px-2 py-1 rounded ${
                              parametre.conforme 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                                : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                            }`}>
                              {parametre.conforme ? 'OK' : 'HORS LIMITE'}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Résultat et observations */}
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Résultat et observations
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Résultat final
                  </label>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {calculerConformite()} ({calculerScore()}%)
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {Object.values(form.parametres).filter(p => p.conforme).length} / {Object.keys(form.parametres).length} paramètres conformes
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Commentaires / observations
                  </label>
                  <textarea
                    value={form.observations}
                    onChange={(e) => setForm({...form, observations: e.target.value})}
                    rows={4}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-600 dark:border-gray-500"
                    placeholder="Observations sur le contrôle, anomalies détectées, actions correctives..."
                  />
                </div>
              </div>
            </div>

            {/* Résumé des paramètres */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Résumé des paramètres
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {parametresCritiques.map((param) => {
                  const parametre = form.parametres[param.key as keyof typeof form.parametres];
                  const Icon = param.icon;
                  
                  return (
                    <div key={param.key} className="flex items-center justify-between bg-white dark:bg-gray-800 rounded p-3 border border-gray-200 dark:border-gray-600">
                      <div className="flex items-center space-x-2">
                        <Icon className={`h-4 w-4 ${param.couleur}`} />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {param.label}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">
                          {parametre.valeur} {param.unite}
                        </div>
                        <div className={`text-xs ${
                          parametre.conforme 
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}>
                          {parametre.conforme ? 'Conforme' : 'Non conforme'}
                        </div>
                      </div>
                    </div>
                  );
                })}
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
            onClick={() => {
              const resultat = calculerConformite();
              const score = calculerScore();
              onSave && onSave({
                ...form,
                resultat,
                score,
                statut: resultat === 'Conforme' ? 'Terminé' : 'En cours'
              });
            }}
            className="px-4 py-2 rounded-md bg-primary-600 text-white hover:bg-primary-700"
          >
            {mode === 'create' ? 'Enregistrer contrôle' : 'Mettre à jour'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalControleProduction;
