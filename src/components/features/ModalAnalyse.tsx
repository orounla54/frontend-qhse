import React, { useState, useEffect } from 'react';
import { ModalProps } from './ModalMatierePremiere';

const ModalAnalyse: React.FC<ModalProps<any>> = ({ isOpen, onClose, onSave, initialData, title = 'Analyse', mode = 'create' }) => {
  const [form, setForm] = useState({
    numero: '',
    nom: '',
    type: '', // Physico-chimique, Microbiologique, Organoleptique, Sensorielles, Autre
    categorie: '', // pH, Humidité, ...
    statut: 'Planifiée',
    echantillonNumero: '',
    echantillonNumeroLot: '',
    valeur: '',
    unite: '',
    commentaire: '',
    datePlanification: ''
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        numero: initialData.numero || '',
        nom: initialData.nom || '',
        type: initialData.type || '',
        categorie: initialData.categorie || '',
        statut: initialData.statut || 'Planifiée',
        echantillonNumero: initialData.echantillon?.numero || '',
        echantillonNumeroLot: initialData.echantillon?.numeroLot || '',
        valeur: initialData.resultats?.valeur || '',
        unite: initialData.resultats?.unite || '',
        commentaire: initialData.commentaire || '',
        datePlanification: initialData.datePlanification ? initialData.datePlanification.substring(0,10) : ''
      });
    } else {
      setForm({
        numero: '',
        nom: '',
        type: '',
        categorie: '',
        statut: 'Planifiée',
        echantillonNumero: '',
        echantillonNumeroLot: '',
        valeur: '',
        unite: '',
        commentaire: '',
        datePlanification: ''
      });
    }
  }, [initialData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Pass the flat form data, let the parent handle the structure
    onSave?.(form);
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-300">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Numéro</label>
              <input 
                value={form.numero} 
                onChange={(e) => setForm({...form, numero: e.target.value})} 
                className="w-full rounded border border-gray-300 px-3 py-2 dark:bg-gray-700 dark:border-gray-600" 
                required 
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Nom</label>
              <input 
                value={form.nom} 
                onChange={(e) => setForm({...form, nom: e.target.value})} 
                className="w-full rounded border border-gray-300 px-3 py-2 dark:bg-gray-700 dark:border-gray-600" 
                required 
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Type</label>
              <select 
                value={form.type} 
                onChange={(e) => setForm({...form, type: e.target.value})} 
                className="w-full rounded border border-gray-300 px-3 py-2 dark:bg-gray-700 dark:border-gray-600"
                required
              >
                <option value="">Sélectionner</option>
                <option value="Physico-chimique">Physico-chimique</option>
                <option value="Microbiologique">Microbiologique</option>
                <option value="Organoleptique">Organoleptique</option>
                <option value="Sensorielles">Sensorielles</option>
                <option value="Autre">Autre</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Catégorie</label>
              <select 
                value={form.categorie} 
                onChange={(e) => setForm({...form, categorie: e.target.value})} 
                className="w-full rounded border border-gray-300 px-3 py-2 dark:bg-gray-700 dark:border-gray-600"
                required
              >
                <option value="">Sélectionner</option>
                <option value="pH">pH</option>
                <option value="Humidité">Humidité</option>
                <option value="Bactéries totales">Bactéries totales</option>
                <option value="Coliformes">Coliformes</option>
                <option value="E. coli">E. coli</option>
                <option value="Levures">Levures</option>
                <option value="Moisissures">Moisissures</option>
                <option value="Goût">Goût</option>
                <option value="Odeur">Odeur</option>
                <option value="Texture">Texture</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Statut</label>
              <select 
                value={form.statut} 
                onChange={(e) => setForm({...form, statut: e.target.value})} 
                className="w-full rounded border border-gray-300 px-3 py-2 dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="Planifiée">Planifiée</option>
                <option value="En cours">En cours</option>
                <option value="Terminée">Terminée</option>
                <option value="Validée">Validée</option>
                <option value="Rejetée">Rejetée</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Échantillon - Numéro</label>
              <input 
                value={form.echantillonNumero} 
                onChange={(e) => setForm({...form, echantillonNumero: e.target.value})} 
                className="w-full rounded border border-gray-300 px-3 py-2 dark:bg-gray-700 dark:border-gray-600" 
                required 
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Échantillon - Lot</label>
              <input 
                value={form.echantillonNumeroLot} 
                onChange={(e) => setForm({...form, echantillonNumeroLot: e.target.value})} 
                className="w-full rounded border border-gray-300 px-3 py-2 dark:bg-gray-700 dark:border-gray-600" 
                required 
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Valeur</label>
              <input 
                type="number"
                step="0.01"
                value={form.valeur} 
                onChange={(e) => setForm({...form, valeur: e.target.value})} 
                className="w-full rounded border border-gray-300 px-3 py-2 dark:bg-gray-700 dark:border-gray-600" 
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Unité</label>
              <input 
                value={form.unite} 
                onChange={(e) => setForm({...form, unite: e.target.value})} 
                className="w-full rounded border border-gray-300 px-3 py-2 dark:bg-gray-700 dark:border-gray-600" 
                placeholder="mg/kg, %, ppm, etc."
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Date de planification</label>
            <input 
              type="date"
              value={form.datePlanification}
              onChange={(e) => setForm({...form, datePlanification: e.target.value})}
              className="w-full rounded border border-gray-300 px-3 py-2 dark:bg-gray-700 dark:border-gray-600"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Commentaire</label>
            <textarea 
              value={form.commentaire} 
              onChange={(e) => setForm({...form, commentaire: e.target.value})} 
              className="w-full rounded border border-gray-300 px-3 py-2 dark:bg-gray-700 dark:border-gray-600" 
              rows={3}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded border border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-200">
              Annuler
            </button>
            <button type="submit" className="px-4 py-2 rounded bg-primary-600 text-white">
              {mode === 'create' ? 'Créer' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalAnalyse;


