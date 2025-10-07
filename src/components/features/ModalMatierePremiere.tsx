import React, { useState, useEffect } from 'react';

export interface ModalProps<T = any> {
  isOpen: boolean;
  mode?: 'create' | 'edit' | 'view';
  initialData?: T | null;
  onClose: () => void;
  onSave?: (data: T) => void;
  title?: string;
}

const ModalMatierePremiere: React.FC<ModalProps<any>> = ({ isOpen, onClose, onSave, initialData, title = 'Matière Première', mode = 'create' }) => {
  const [form, setForm] = useState({
    numero: '',
    nom: '',
    type: '',
    fournisseurNom: '',
    statut: 'Actif'
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        numero: initialData.numero || '',
        nom: initialData.nom || '',
        type: initialData.caracteristiques?.type || '',
        fournisseurNom: initialData.fournisseur?.nom || '',
        statut: initialData.statut || 'Actif'
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-300">✕</button>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSave && onSave({
              numero: form.numero,
              nom: form.nom,
              fournisseur: { nom: form.fournisseurNom },
              caracteristiques: { type: form.type },
              statut: form.statut,
              lots: []
            });
          }}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Numéro</label>
              <input value={form.numero} onChange={(e)=>setForm({...form, numero: e.target.value})} className="w-full rounded border border-gray-300 px-3 py-2 dark:bg-gray-700 dark:border-gray-600" required />
            </div>
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Nom</label>
              <input value={form.nom} onChange={(e)=>setForm({...form, nom: e.target.value})} className="w-full rounded border border-gray-300 px-3 py-2 dark:bg-gray-700 dark:border-gray-600" required />
            </div>
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Type</label>
              <select value={form.type} onChange={(e)=>setForm({...form, type: e.target.value})} className="w-full rounded border border-gray-300 px-3 py-2 dark:bg-gray-700 dark:border-gray-600" required>
                <option value="">Sélectionner un type</option>
                <option value="Végétale">Végétale</option>
                <option value="Animale">Animale</option>
                <option value="Minérale">Minérale</option>
                <option value="Chimique">Chimique</option>
                <option value="Autre">Autre</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Fournisseur</label>
              <input value={form.fournisseurNom} onChange={(e)=>setForm({...form, fournisseurNom: e.target.value})} className="w-full rounded border border-gray-300 px-3 py-2 dark:bg-gray-700 dark:border-gray-600" required />
            </div>
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Statut</label>
              <select value={form.statut} onChange={(e)=>setForm({...form, statut: e.target.value})} className="w-full rounded border border-gray-300 px-3 py-2 dark:bg-gray-700 dark:border-gray-600">
                <option>Actif</option>
                <option>Suspendu</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded border border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-200">Annuler</button>
            <button type="submit" className="px-4 py-2 rounded bg-primary-600 text-white">{mode === 'create' ? 'Créer' : 'Enregistrer'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalMatierePremiere;


