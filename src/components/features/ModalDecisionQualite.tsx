import React, { useEffect, useState } from 'react';
import { ModalProps } from './ModalMatierePremiere';

type DecisionForm = {
  numero?: string;
  titre: string;
  description?: string;
  type: string;
  contexte: {
    type: string;
    reference?: string;
    lot?: string;
    quantite?: number;
    unite?: string;
  };
  justification: string;
  priorite: 'Faible' | 'Normale' | 'Élevée' | 'Critique';
};

const ModalDecisionQualite: React.FC<ModalProps<any>> = ({ isOpen, onClose, onSave, initialData, mode = 'create', title = 'Décision Qualité' }) => {
  const [form, setForm] = useState<DecisionForm>({
    titre: '',
    description: '',
    type: 'Acceptation',
    contexte: {
      type: 'Matière première',
      reference: '',
      lot: '',
      quantite: undefined,
      unite: ''
    },
    justification: '',
    priorite: 'Normale'
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        numero: initialData.numero || undefined,
        titre: initialData.titre || '',
        description: initialData.description || '',
        type: initialData.type || 'Acceptation',
        contexte: {
          type: initialData.contexte?.type || 'Matière première',
          reference: initialData.contexte?.reference || '',
          lot: initialData.contexte?.lot || '',
          quantite: initialData.contexte?.quantite,
          unite: initialData.contexte?.unite || ''
        },
        justification: initialData.justification || '',
        priorite: initialData.priorite || 'Normale'
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-3xl rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-300">✕</button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSave && onSave({
              numero: form.numero,
              titre: form.titre,
              description: form.description,
              type: form.type,
              contexte: form.contexte,
              justification: form.justification,
              priorite: form.priorite
            });
          }}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Titre *</label>
              <input
                value={form.titre}
                onChange={(e) => setForm({ ...form, titre: e.target.value })}
                required
                className="w-full rounded border border-gray-300 px-3 py-2 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Type de décision *</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full rounded border border-gray-300 px-3 py-2 dark:bg-gray-700 dark:border-gray-600"
              >
                <option>Acceptation</option>
                <option>Acceptation sous réserve</option>
                <option>Rejet</option>
                <option>Mise en quarantaine</option>
                <option>Destruction</option>
                <option>Retour fournisseur</option>
                <option>Retraitement</option>
                <option>Dégradation</option>
                <option>Autre</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Contexte *</label>
              <select
                value={form.contexte.type}
                onChange={(e) => setForm({ ...form, contexte: { ...form.contexte, type: e.target.value } })}
                className="w-full rounded border border-gray-300 px-3 py-2 dark:bg-gray-700 dark:border-gray-600"
              >
                <option>Matière première</option>
                <option>Produit fini</option>
                <option>Processus</option>
                <option>Équipement</option>
                <option>Système</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Priorité *</label>
              <select
                value={form.priorite}
                onChange={(e) => setForm({ ...form, priorite: e.target.value as any })}
                className="w-full rounded border border-gray-300 px-3 py-2 dark:bg-gray-700 dark:border-gray-600"
              >
                <option>Faible</option>
                <option>Normale</option>
                <option>Élevée</option>
                <option>Critique</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Description</label>
              <textarea
                value={form.description || ''}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                className="w-full rounded border border-gray-300 px-3 py-2 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Référence</label>
              <input
                value={form.contexte.reference || ''}
                onChange={(e) => setForm({ ...form, contexte: { ...form.contexte, reference: e.target.value } })}
                className="w-full rounded border border-gray-300 px-3 py-2 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Lot</label>
              <input
                value={form.contexte.lot || ''}
                onChange={(e) => setForm({ ...form, contexte: { ...form.contexte, lot: e.target.value } })}
                className="w-full rounded border border-gray-300 px-3 py-2 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Quantité</label>
              <input
                type="number"
                step="0.01"
                value={form.contexte.quantite ?? ''}
                onChange={(e) => setForm({ ...form, contexte: { ...form.contexte, quantite: e.target.value ? Number(e.target.value) : undefined } })}
                className="w-full rounded border border-gray-300 px-3 py-2 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Unité</label>
              <input
                value={form.contexte.unite || ''}
                onChange={(e) => setForm({ ...form, contexte: { ...form.contexte, unite: e.target.value } })}
                className="w-full rounded border border-gray-300 px-3 py-2 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Justification *</label>
            <textarea
              value={form.justification}
              onChange={(e) => setForm({ ...form, justification: e.target.value })}
              required
              rows={4}
              className="w-full rounded border border-gray-300 px-3 py-2 dark:bg-gray-700 dark:border-gray-600"
            />
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

export default ModalDecisionQualite;


