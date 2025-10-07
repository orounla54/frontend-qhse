import React, { useState, useEffect } from 'react';
import { Upload, X, FileText, CheckCircle, AlertTriangle, Package } from 'lucide-react';

export interface ModalProps<T = any> {
  isOpen: boolean;
  mode?: 'create' | 'edit' | 'view';
  initialData?: T | null;
  onClose: () => void;
  onSave?: (data: T) => void;
  title?: string;
  matierePremiere?: any;
}

const ModalReceptionLot: React.FC<ModalProps<any>> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  initialData, 
  title = 'Réception Lot MP',
  mode = 'create',
  matierePremiere
}) => {
  const [form, setForm] = useState({
    numeroLot: '',
    dateReception: new Date().toISOString().split('T')[0],
    quantite: 0,
    unite: 'kg',
    fournisseur: '',
    resultatControle: 'En attente',
    commentaires: '',
    documents: [] as any[],
    controles: {
      inspectionVisuelle: {
        couleur: '',
        odeur: '',
        proprete: '',
        aspect: '',
        conforme: false
      },
      analysesLabo: {
        brix: { valeur: 0, conforme: false },
        pH: { valeur: 0, conforme: false },
        humidite: { valeur: 0, conforme: false },
        contaminants: { valeur: 0, conforme: false }
      }
    },
    statut: 'En attente'
  });

  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  useEffect(() => {
    if (initialData) {
      setForm({
        numeroLot: initialData.numeroLot || '',
        dateReception: initialData.dateReception || new Date().toISOString().split('T')[0],
        quantite: initialData.quantite || 0,
        unite: initialData.unite || 'kg',
        fournisseur: initialData.fournisseur || '',
        resultatControle: initialData.resultatControle || 'En attente',
        commentaires: initialData.commentaires || '',
        documents: initialData.documents || [],
        controles: initialData.controles || form.controles,
        statut: initialData.statut || 'En attente'
      });
    }
  }, [initialData, isOpen]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setUploadedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const updateControleVisuel = (field: string, value: any) => {
    setForm(prev => ({
      ...prev,
      controles: {
        ...prev.controles,
        inspectionVisuelle: {
          ...prev.controles.inspectionVisuelle,
          [field]: value
        }
      }
    }));
  };

  const updateAnalyseLabo = (parametre: string, field: string, value: any) => {
    setForm(prev => ({
      ...prev,
      controles: {
        ...prev.controles,
        analysesLabo: {
          ...prev.controles.analysesLabo,
          [parametre]: {
            ...prev.controles.analysesLabo[parametre as keyof typeof prev.controles.analysesLabo],
            [field]: value
          }
        }
      }
    }));
  };

  const calculerResultatFinal = () => {
    const { inspectionVisuelle, analysesLabo } = form.controles;
    
    const visuelConforme = inspectionVisuelle.conforme;
    const laboConforme = Object.values(analysesLabo).every(analyse => analyse.conforme);
    
    if (visuelConforme && laboConforme) {
      return 'Conforme';
    } else if (!visuelConforme && !laboConforme) {
      return 'Rejeté';
    } else {
      return 'Accepté sous réserve';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-4xl max-h-[90vh] rounded-lg bg-white shadow-xl dark:bg-gray-800 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <Package className="h-6 w-6 text-primary-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h2>
              {matierePremiere && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {matierePremiere.nom} - {matierePremiere.numero}
                </p>
              )}
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700 dark:text-gray-300 p-1"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const resultatFinal = calculerResultatFinal();
              onSave && onSave({
                ...form,
                resultatControle: resultatFinal,
                statut: resultatFinal === 'Conforme' ? 'Accepté' : resultatFinal === 'Rejeté' ? 'Rejeté' : 'Sous réserve'
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
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    N° lot fournisseur *
                  </label>
                  <input
                    type="text"
                    value={form.numeroLot}
                    onChange={(e) => setForm({...form, numeroLot: e.target.value})}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-600 dark:border-gray-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Date réception *
                  </label>
                  <input
                    type="date"
                    value={form.dateReception}
                    onChange={(e) => setForm({...form, dateReception: e.target.value})}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-600 dark:border-gray-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Quantité reçue *
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      step="0.01"
                      value={form.quantite}
                      onChange={(e) => setForm({...form, quantite: parseFloat(e.target.value) || 0})}
                      className="flex-1 rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-600 dark:border-gray-500"
                      required
                    />
                    <select
                      value={form.unite}
                      onChange={(e) => setForm({...form, unite: e.target.value})}
                      className="rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-600 dark:border-gray-500"
                    >
                      <option value="kg">kg</option>
                      <option value="g">g</option>
                      <option value="l">l</option>
                      <option value="ml">ml</option>
                      <option value="pièce">pièce</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Fournisseur
                  </label>
                  <input
                    type="text"
                    value={form.fournisseur}
                    onChange={(e) => setForm({...form, fournisseur: e.target.value})}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-600 dark:border-gray-500"
                  />
                </div>
              </div>
            </div>

            {/* Contrôle réception */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                <CheckCircle className="h-5 w-5 mr-2" />
                Contrôle réception
              </h3>
              
              {/* Inspection visuelle */}
              <div className="mb-6">
                <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">Inspection visuelle</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Couleur
                    </label>
                    <select
                      value={form.controles.inspectionVisuelle.couleur}
                      onChange={(e) => updateControleVisuel('couleur', e.target.value)}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-600 dark:border-gray-500"
                    >
                      <option value="">Sélectionner</option>
                      <option value="Conforme">Conforme</option>
                      <option value="Non conforme">Non conforme</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Odeur
                    </label>
                    <select
                      value={form.controles.inspectionVisuelle.odeur}
                      onChange={(e) => updateControleVisuel('odeur', e.target.value)}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-600 dark:border-gray-500"
                    >
                      <option value="">Sélectionner</option>
                      <option value="Conforme">Conforme</option>
                      <option value="Non conforme">Non conforme</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Propreté
                    </label>
                    <select
                      value={form.controles.inspectionVisuelle.proprete}
                      onChange={(e) => updateControleVisuel('proprete', e.target.value)}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-600 dark:border-gray-500"
                    >
                      <option value="">Sélectionner</option>
                      <option value="Conforme">Conforme</option>
                      <option value="Non conforme">Non conforme</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Aspect général
                    </label>
                    <select
                      value={form.controles.inspectionVisuelle.aspect}
                      onChange={(e) => updateControleVisuel('aspect', e.target.value)}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-600 dark:border-gray-500"
                    >
                      <option value="">Sélectionner</option>
                      <option value="Conforme">Conforme</option>
                      <option value="Non conforme">Non conforme</option>
                    </select>
                  </div>
                </div>
                
                <div className="mt-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={form.controles.inspectionVisuelle.conforme}
                      onChange={(e) => updateControleVisuel('conforme', e.target.checked)}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Inspection visuelle conforme
                    </span>
                  </label>
                </div>
              </div>

              {/* Analyses laboratoire */}
              <div>
                <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">Résultats analyses labo</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      °Brix
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="number"
                        step="0.1"
                        value={form.controles.analysesLabo.brix.valeur}
                        onChange={(e) => updateAnalyseLabo('brix', 'valeur', parseFloat(e.target.value) || 0)}
                        className="flex-1 rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-600 dark:border-gray-500"
                        placeholder="Valeur"
                      />
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={form.controles.analysesLabo.brix.conforme}
                          onChange={(e) => updateAnalyseLabo('brix', 'conforme', e.target.checked)}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="ml-1 text-sm text-gray-700 dark:text-gray-300">OK</span>
                      </label>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      pH
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="number"
                        step="0.1"
                        value={form.controles.analysesLabo.pH.valeur}
                        onChange={(e) => updateAnalyseLabo('pH', 'valeur', parseFloat(e.target.value) || 0)}
                        className="flex-1 rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-600 dark:border-gray-500"
                        placeholder="Valeur"
                      />
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={form.controles.analysesLabo.pH.conforme}
                          onChange={(e) => updateAnalyseLabo('pH', 'conforme', e.target.checked)}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="ml-1 text-sm text-gray-700 dark:text-gray-300">OK</span>
                      </label>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Humidité (%)
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="number"
                        step="0.1"
                        value={form.controles.analysesLabo.humidite.valeur}
                        onChange={(e) => updateAnalyseLabo('humidite', 'valeur', parseFloat(e.target.value) || 0)}
                        className="flex-1 rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-600 dark:border-gray-500"
                        placeholder="Valeur"
                      />
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={form.controles.analysesLabo.humidite.conforme}
                          onChange={(e) => updateAnalyseLabo('humidite', 'conforme', e.target.checked)}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="ml-1 text-sm text-gray-700 dark:text-gray-300">OK</span>
                      </label>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Contaminants
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="number"
                        step="0.01"
                        value={form.controles.analysesLabo.contaminants.valeur}
                        onChange={(e) => updateAnalyseLabo('contaminants', 'valeur', parseFloat(e.target.value) || 0)}
                        className="flex-1 rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-600 dark:border-gray-500"
                        placeholder="Valeur"
                      />
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={form.controles.analysesLabo.contaminants.conforme}
                          onChange={(e) => updateAnalyseLabo('contaminants', 'conforme', e.target.checked)}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="ml-1 text-sm text-gray-700 dark:text-gray-300">OK</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Résultat final */}
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Statut final
              </h3>
              
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Résultat contrôle
                  </label>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {calculerResultatFinal()}
                  </div>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Commentaires
                  </label>
                  <textarea
                    value={form.commentaires}
                    onChange={(e) => setForm({...form, commentaires: e.target.value})}
                    rows={3}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-600 dark:border-gray-500"
                    placeholder="Commentaires sur la réception..."
                  />
                </div>
              </div>
            </div>

            {/* Documents liés */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <div className="text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-4">
                  <label className="cursor-pointer">
                    <span className="mt-2 block text-sm font-medium text-gray-900 dark:text-white">
                      Glisser-déposer des documents (COA, certificat de conformité) ou cliquer pour sélectionner
                    </span>
                    <input
                      type="file"
                      multiple
                      onChange={handleFileUpload}
                      className="sr-only"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    />
                  </label>
                  <p className="mt-1 text-xs text-gray-500">
                    PDF, DOC, DOCX, JPG, PNG jusqu'à 10MB
                  </p>
                </div>
              </div>
              
              {uploadedFiles.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Documents sélectionnés:</h4>
                  <div className="space-y-2">
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 rounded p-2">
                        <span className="text-sm text-gray-700 dark:text-gray-300">{file.name}</span>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
              const resultatFinal = calculerResultatFinal();
              onSave && onSave({
                ...form,
                resultatControle: resultatFinal,
                statut: resultatFinal === 'Conforme' ? 'Accepté' : resultatFinal === 'Rejeté' ? 'Rejeté' : 'Sous réserve'
              });
            }}
            className="px-4 py-2 rounded-md bg-primary-600 text-white hover:bg-primary-700"
          >
            {mode === 'create' ? 'Enregistrer réception' : 'Mettre à jour'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalReceptionLot;
