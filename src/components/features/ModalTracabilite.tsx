import React, { useEffect, useState } from 'react';

export type TracaData = {
  id_lot: string;
  produit: string;
  date_production?: string;
  quantite_produite?: string;
  responsable?: string;
  laboratoire?: {
    id_echantillon?: string;
    poids_net?: string;
    analyses_realisees?: Array<{ nom: string; valeur?: string; statut?: string }>;
    resultats_analyses?: string;
    rapport_labo?: string;
  };
  qualite?: {
    controle_mp?: Array<{ designation: string; quantite?: string; lot?: string }>; 
    controle_production?: Array<{ nom: string; valeur: string }>; 
    controle_produit_fini?: Array<{ nom: string; statut: string }>; 
    non_conformites?: string;
    actions_correctives?: string;
    decision_finale?: string;
  };
  hse?: {
    checklist_hygiene?: Array<string>;
    incidents?: string;
    produits_chimiques_utilises?: Array<{ nom: string; quantite?: string }>;
  };
};

type ModalTracabiliteProps = {
  isOpen: boolean;
  onClose: () => void;
  data: TracaData | null;
  mode?: 'view' | 'create' | 'edit';
  onSave?: (payload: any) => void;
  title?: string;
};

const SectionTitle: React.FC<{ title: string }> = ({ title }) => (
  <h3 className="text-sm font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-1">{title}</h3>
);
const KeyValue: React.FC<{ label: string; value?: React.ReactNode }> = ({ label, value }) => (
  <div className="text-sm"><span className="text-gray-500 dark:text-gray-400">{label}:</span> {value ?? '—'}</div>
);

const ModalTracabilite: React.FC<ModalTracabiliteProps> = ({ isOpen, onClose, data, mode = 'view', onSave, title }) => {
  const [form, setForm] = useState({
    type: 'Matière première',
    reference: '',
    nom: '',
    lot: ''
  });

  useEffect(() => {
    if (mode !== 'view') {
      setForm({
        type: (data as any)?.type || 'Matière première',
        reference: (data as any)?.reference || '',
        nom: (data as any)?.nom || '',
        lot: (data as any)?.lot || ''
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-4xl rounded-lg bg-white dark:bg-gray-800 shadow-xl p-6 my-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title || (mode === 'view' ? `Traçabilité du lot ${(data as any)?.id_lot || (data as any)?.lot || ''}` : 'Créer une fiche de traçabilité')}</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">{mode === 'view' ? 'Vue consolidée des informations Lot, Laboratoire, Qualité et HSE' : 'Renseignez les informations minimales pour créer une fiche traçabilité'}</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-300">✕</button>
        </div>

        {mode !== 'view' ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onSave && onSave({
                type: form.type,
                reference: form.reference,
                nom: form.nom,
                lot: form.lot
              });
            }}
            className="space-y-4 mb-6"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Type *</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full rounded border border-gray-300 px-3 py-2 dark:bg-gray-700 dark:border-gray-600"
                >
                  <option>Matière première</option>
                  <option>Produit fini</option>
                  <option>Processus</option>
                  <option>Équipement</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Référence *</label>
                <input
                  value={form.reference}
                  onChange={(e) => setForm({ ...form, reference: e.target.value })}
                  required
                  className="w-full rounded border border-gray-300 px-3 py-2 dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Nom</label>
                <input
                  value={form.nom}
                  onChange={(e) => setForm({ ...form, nom: e.target.value })}
                  className="w-full rounded border border-gray-300 px-3 py-2 dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Lot</label>
                <input
                  value={form.lot}
                  onChange={(e) => setForm({ ...form, lot: e.target.value })}
                  className="w-full rounded border border-gray-300 px-3 py-2 dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={onClose} className="px-4 py-2 rounded border border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-200">Annuler</button>
              <button type="submit" className="px-4 py-2 rounded bg-primary-600 text-white">{mode === 'create' ? 'Créer' : 'Enregistrer'}</button>
            </div>
          </form>
        ) : null}

        {mode === 'view' && data && (
        <>
        {/* 1. Informations générales */}
        <div className="space-y-2 mb-6">
          <SectionTitle title="Informations générales" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
            <KeyValue label="N°" value={(data as any)?.numero || (data as any)?.id_lot} />
            <KeyValue label="Type" value={(data as any)?.type} />
            <KeyValue label="Référence" value={(data as any)?.reference} />
            <KeyValue label="Nom" value={(data as any)?.nom || (data as any)?.produit} />
            <KeyValue label="Lot" value={(data as any)?.lot} />
            <KeyValue label="Statut" value={(data as any)?.statut} />
          </div>
        </div>

        {/* 2. Données Laboratoire */}
        <div className="space-y-2 mb-6">
          <SectionTitle title="Données Laboratoire" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            {data.laboratoire?.id_echantillon && (<KeyValue label="ID Échantillon" value={data.laboratoire.id_echantillon} />)}
            {data.laboratoire?.poids_net && (<KeyValue label="Poids net" value={data.laboratoire.poids_net} />)}
          </div>
          {data.laboratoire?.analyses_realisees && data.laboratoire.analyses_realisees.length > 0 && (
            <div className="text-sm">
              <div className="text-gray-600 dark:text-gray-300 mb-1">Analyses réalisées</div>
              <ul className="list-disc pl-5 space-y-1">
                {data.laboratoire.analyses_realisees.map((a, idx) => (
                  <li key={idx}>{a.nom}{a.valeur ? ` = ${a.valeur}` : ''}{a.statut ? ` (${a.statut})` : ''}</li>
                ))}
              </ul>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            {data.laboratoire?.resultats_analyses && (<KeyValue label="Résultat global" value={data.laboratoire.resultats_analyses} />)}
            {data.laboratoire?.rapport_labo && (
              <div><span className="text-gray-500 dark:text-gray-400">Rapport:</span> <a href={data.laboratoire.rapport_labo} target="_blank" rel="noreferrer" className="text-primary-600 underline">Ouvrir</a></div>
            )}
          </div>
        </div>

        {/* 3. Données Qualité */}
        <div className="space-y-2 mb-6">
          <SectionTitle title="Données Qualité" />
          {data.qualite?.controle_mp && data.qualite.controle_mp.length > 0 && (
            <div className="text-sm">
              <div className="text-gray-600 dark:text-gray-300 mb-1">Contrôle MP</div>
              <ul className="list-disc pl-5 space-y-1">
                {data.qualite.controle_mp.map((m, idx) => (
                  <li key={idx}>{m.designation}{m.quantite ? ` : ${m.quantite}` : ''}{m.lot ? ` (lot ${m.lot})` : ''}</li>
                ))}
              </ul>
            </div>
          )}
          {data.qualite?.controle_production && data.qualite.controle_production.length > 0 && (
            <div className="text-sm">
              <div className="text-gray-600 dark:text-gray-300 mb-1">Contrôle Production</div>
              <ul className="list-disc pl-5 space-y-1">
                {data.qualite.controle_production.map((m, idx) => (
                  <li key={idx}>{m.nom}: {m.valeur}</li>
                ))}
              </ul>
            </div>
          )}
          {data.qualite?.controle_produit_fini && data.qualite.controle_produit_fini.length > 0 && (
            <div className="text-sm">
              <div className="text-gray-600 dark:text-gray-300 mb-1">Contrôle Produit Fini</div>
              <ul className="list-disc pl-5 space-y-1">
                {data.qualite.controle_produit_fini.map((m, idx) => (
                  <li key={idx}>{m.nom}: {m.statut}</li>
                ))}
              </ul>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            {data.qualite?.non_conformites && (<KeyValue label="Non-conformités" value={data.qualite.non_conformites} />)}
            {data.qualite?.actions_correctives && (<KeyValue label="Actions correctives" value={data.qualite.actions_correctives} />)}
            {data.qualite?.decision_finale && (<KeyValue label="Décision finale" value={data.qualite.decision_finale} />)}
          </div>
        </div>

        {/* 4. Données HSE */}
        <div className="space-y-2">
          <SectionTitle title="Données HSE" />
          {data.hse?.checklist_hygiene && data.hse.checklist_hygiene.length > 0 && (
            <div className="text-sm">
              <div className="text-gray-600 dark:text-gray-300 mb-1">Checklist Hygiène</div>
              <ul className="list-disc pl-5 space-y-1">
                {data.hse.checklist_hygiene.map((c, idx) => <li key={idx}>{c}</li>)}
              </ul>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            {data.hse?.incidents && (<div><span className="text-gray-500">Incidents:</span> {data.hse.incidents}</div>)}
          </div>
          {data.hse?.produits_chimiques_utilises && data.hse.produits_chimiques_utilises.length > 0 && (
            <div className="text-sm">
              <div className="text-gray-600 dark:text-gray-300 mb-1">Produits chimiques utilisés</div>
              <ul className="list-disc pl-5 space-y-1">
                {data.hse.produits_chimiques_utilises.map((p, idx) => (
                  <li key={idx}>{p.nom}{p.quantite ? ` : ${p.quantite}` : ''}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* 5. Liens de traçabilité */}
        {'liens' in (data as any) && Array.isArray((data as any).liens) && (
          <div className="space-y-2 mt-6">
            <SectionTitle title="Liens de traçabilité" />
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">Bidirectionnel: relations amont/aval</div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Type lien</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Element</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Quantité</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Commentaire</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {(data as any).liens.map((l: any, idx: number) => (
                    <tr key={idx}>
                      <td className="px-4 py-2 text-sm">{l.type}</td>
                      <td className="px-4 py-2 text-sm">{l.elementType || '—'}</td>
                      <td className="px-4 py-2 text-sm">{l.quantite ? `${l.quantite} ${l.unite || ''}` : '—'}</td>
                      <td className="px-4 py-2 text-sm">{l.date ? new Date(l.date).toLocaleDateString('fr-FR') : '—'}</td>
                      <td className="px-4 py-2 text-sm">{l.commentaire || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 6. Rappels */}
        {'rappels' in (data as any) && Array.isArray((data as any).rappels) && (
          <div className="space-y-2 mt-6">
            <SectionTitle title="Rappels" />
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Type</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Raison</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Quantité</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Statut</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {(data as any).rappels.map((r: any, idx: number) => (
                    <tr key={idx}>
                      <td className="px-4 py-2 text-sm">{r.type}</td>
                      <td className="px-4 py-2 text-sm">{r.date ? new Date(r.date).toLocaleDateString('fr-FR') : '—'}</td>
                      <td className="px-4 py-2 text-sm">{r.raison || '—'}</td>
                      <td className="px-4 py-2 text-sm">{r.quantite ? `${r.quantite} ${r.unite || ''}` : '—'}</td>
                      <td className="px-4 py-2 text-sm">{r.statut || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 7. Historique */}
        {'historique' in (data as any) && Array.isArray((data as any).historique) && (
          <div className="space-y-2 mt-6">
            <SectionTitle title="Historique" />
            <ul className="space-y-1 text-sm">
              {(data as any).historique.map((h: any, idx: number) => (
                <li key={idx} className="flex items-center justify-between">
                  <div>
                    <span className="font-medium">{h.action}</span> — {h.description}
                  </div>
                  <div className="text-gray-500 dark:text-gray-400">
                    {h.date ? new Date(h.date).toLocaleString('fr-FR') : '—'}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
        </>
        )}
      </div>
    </div>
  );
};

export default ModalTracabilite;





