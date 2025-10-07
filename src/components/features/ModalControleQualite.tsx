import React, { useEffect, useState } from 'react';
import { ModalProps } from './ModalMatierePremiere';

const ModalControleQualite: React.FC<ModalProps<any>> = ({ isOpen, onClose, onSave, initialData, title = 'Contrôle Qualité', mode = 'create' }) => {
  const [form, setForm] = useState({
    numero: '',
    titre: '',
    type: '',
    zone: '',
    datePlanification: ''
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        numero: initialData.numero || '',
        titre: initialData.titre || '',
        type: initialData.type || '',
        zone: initialData.localisation?.zone || '',
        datePlanification: initialData.datePlanification ? initialData.datePlanification.substring(0,10) : ''
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
          onSubmit={(e)=>{
            e.preventDefault();
            onSave && onSave({
              numero: form.numero,
              titre: form.titre,
              type: form.type,
              localisation: { zone: form.zone },
              datePlanification: form.datePlanification,
              statut: 'Planifié'
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
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Titre</label>
              <input value={form.titre} onChange={(e)=>setForm({...form, titre: e.target.value})} className="w-full rounded border border-gray-300 px-3 py-2 dark:bg-gray-700 dark:border-gray-600" required />
            </div>
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Type</label>
              <input value={form.type} onChange={(e)=>setForm({...form, type: e.target.value})} className="w-full rounded border border-gray-300 px-3 py-2 dark:bg-gray-700 dark:border-gray-600" required />
            </div>
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Zone</label>
              <input value={form.zone} onChange={(e)=>setForm({...form, zone: e.target.value})} className="w-full rounded border border-gray-300 px-3 py-2 dark:bg-gray-700 dark:border-gray-600" required />
            </div>
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Date</label>
              <input type="date" value={form.datePlanification} onChange={(e)=>setForm({...form, datePlanification: e.target.value})} className="w-full rounded border border-gray-300 px-3 py-2 dark:bg-gray-700 dark:border-gray-600" required />
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

export default ModalControleQualite;


