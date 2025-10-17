import React, { useState, useEffect } from 'react';
import { ModalProps } from './ModalMatierePremiere';

const ModalEchantillon: React.FC<ModalProps<any>> = ({ isOpen, onClose, onSave, initialData, title = 'Échantillon', mode = 'create' }) => {
  const [form, setForm] = useState({
    numero: '',
    numeroLot: '',
    produitNom: '',
    produitReference: '',
    typeEchantillon: '',
    conformite: 'En attente',
    datePrelevement: '',
    responsableNom: '',
    responsablePrenom: '',
    poidsNet: '',
    unite: 'g'
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        numero: initialData.numero || '',
        numeroLot: initialData.numeroLot || '',
        produitNom: initialData.produit?.nom || '',
        produitReference: initialData.produit?.reference || '',
        typeEchantillon: initialData.typeEchantillon || '',
        conformite: initialData.resultats?.conformite || 'En attente',
        datePrelevement: initialData.prelevement?.date ? initialData.prelevement.date.substring(0,10) : '',
        responsableNom: initialData.prelevement?.responsable?.nom || '',
        responsablePrenom: initialData.prelevement?.responsable?.prenom || '',
        poidsNet: initialData.mesuresInitiales?.poidsNet?.toString() || '',
        unite: initialData.mesuresInitiales?.unite || 'g'
      });
    } else {
      setForm({
        numero: '',
        numeroLot: '',
        produitNom: '',
        produitReference: '',
        typeEchantillon: '',
        conformite: 'En attente',
        datePrelevement: '',
        responsableNom: '',
        responsablePrenom: '',
        poidsNet: '',
        unite: 'g'
      });
    }
  }, [initialData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const echantillonData = {
      numero: form.numero,
      numeroLot: form.numeroLot,
      produit: {
        nom: form.produitNom,
        reference: form.produitReference
      },
      typeEchantillon: form.typeEchantillon,
      prelevement: {
        date: form.datePrelevement,
        responsable: {
          nom: form.responsableNom,
          prenom: form.responsablePrenom
        }
      },
      resultats: {
        conformite: form.conformite
      },
      mesuresInitiales: {
        poidsNet: form.poidsNet ? parseFloat(form.poidsNet) : undefined,
        unite: form.unite
      }
    };
    onSave?.(echantillonData);
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
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Numéro de lot</label>
              <input 
                value={form.numeroLot} 
                onChange={(e) => setForm({...form, numeroLot: e.target.value})} 
                className="w-full rounded border border-gray-300 px-3 py-2 dark:bg-gray-700 dark:border-gray-600" 
                required 
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Nom du produit</label>
              <input 
                value={form.produitNom} 
                onChange={(e) => setForm({...form, produitNom: e.target.value})} 
                className="w-full rounded border border-gray-300 px-3 py-2 dark:bg-gray-700 dark:border-gray-600" 
                required 
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Référence produit</label>
              <input 
                value={form.produitReference} 
                onChange={(e) => setForm({...form, produitReference: e.target.value})} 
                className="w-full rounded border border-gray-300 px-3 py-2 dark:bg-gray-700 dark:border-gray-600" 
                required 
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Type d'échantillon</label>
              <select 
                value={form.typeEchantillon} 
                onChange={(e) => setForm({...form, typeEchantillon: e.target.value})} 
                className="w-full rounded border border-gray-300 px-3 py-2 dark:bg-gray-700 dark:border-gray-600"
                required
              >
                <option value="">Sélectionner</option>
                <option value="Matière première">Matière première</option>
                <option value="Produit en cours">Produit en cours</option>
                <option value="Produit fini">Produit fini</option>
                <option value="Eau">Eau</option>
                <option value="Surface de ligne">Surface de ligne</option>
                <option value="Environnement">Environnement</option>
                <option value="Autre">Autre</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Poids net</label>
              <input 
                type="number"
                step="0.01"
                value={form.poidsNet}
                onChange={(e) => setForm({...form, poidsNet: e.target.value})}
                className="w-full rounded border border-gray-300 px-3 py-2 dark:bg-gray-700 dark:border-gray-600" 
                required 
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Unité</label>
              <select 
                value={form.unite}
                onChange={(e) => setForm({...form, unite: e.target.value})}
                className="w-full rounded border border-gray-300 px-3 py-2 dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="g">g</option>
                <option value="kg">kg</option>
                <option value="ml">ml</option>
                <option value="l">l</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Date de prélèvement</label>
              <input 
                type="date"
                value={form.datePrelevement} 
                onChange={(e) => setForm({...form, datePrelevement: e.target.value})} 
                className="w-full rounded border border-gray-300 px-3 py-2 dark:bg-gray-700 dark:border-gray-600" 
                required 
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Responsable - Nom</label>
              <input 
                value={form.responsableNom} 
                onChange={(e) => setForm({...form, responsableNom: e.target.value})} 
                className="w-full rounded border border-gray-300 px-3 py-2 dark:bg-gray-700 dark:border-gray-600" 
                required 
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Responsable - Prénom</label>
              <input 
                value={form.responsablePrenom} 
                onChange={(e) => setForm({...form, responsablePrenom: e.target.value})} 
                className="w-full rounded border border-gray-300 px-3 py-2 dark:bg-gray-700 dark:border-gray-600" 
                required 
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Conformité initiale</label>
            <select 
              value={form.conformite}
              onChange={(e) => setForm({...form, conformite: e.target.value})}
              className="w-full rounded border border-gray-300 px-3 py-2 dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="En attente">En attente</option>
              <option value="Conforme">Conforme</option>
              <option value="Non conforme">Non conforme</option>
              <option value="Partiellement conforme">Partiellement conforme</option>
            </select>
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

export default ModalEchantillon;


