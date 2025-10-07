import React, { useState, useEffect } from 'react';
import { Shield, FileText, Calendar, AlertTriangle, CheckCircle, Plus, Trash2, Upload } from 'lucide-react';

export interface ModalProps<T = any> {
  isOpen: boolean;
  mode?: 'create' | 'edit' | 'view';
  initialData?: T | null;
  onClose: () => void;
  onSave?: (data: T) => void;
  title?: string;
}

const ModalConformite: React.FC<ModalProps<any>> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  initialData, 
  title = 'Conformité & Réglementation',
  mode = 'create'
}) => {
  const [form, setForm] = useState({
    numero: '',
    type: 'Document',
    nom: '',
    description: '',
    reference: '',
    version: '1.0',
    dateCreation: new Date().toISOString().split('T')[0],
    dateApplication: '',
    dateExpiration: '',
    statut: 'Actif',
    responsable: '',
    domaine: 'Qualité',
    norme: 'ISO 9001',
    niveauConformite: 'Conforme',
    score: 100,
    documents: [] as any[],
    certifications: [] as any[],
    obligations: [] as any[],
    evaluations: [] as any[],
    actions: [] as any[]
  });

  const [currentDocument, setCurrentDocument] = useState({
    nom: '',
    type: 'Procédure',
    url: '',
    version: '1.0',
    date: '',
    statut: 'Actif'
  });

  const [currentCertification, setCurrentCertification] = useState({
    type: 'ISO 9001',
    numero: '',
    organisme: '',
    dateObtention: '',
    dateExpiration: '',
    statut: 'Valide',
    conditions: [] as string[]
  });

  const [currentObligation, setCurrentObligation] = useState({
    description: '',
    reference: '',
    niveau: 'National',
    applicable: true,
    dateEcheance: '',
    responsable: '',
    statut: 'En cours'
  });

  const [currentEvaluation, setCurrentEvaluation] = useState({
    date: '',
    evaluateur: '',
    score: 0,
    commentaire: '',
    actions: [] as string[]
  });

  const [currentAction, setCurrentAction] = useState({
    description: '',
    responsable: '',
    dateLimite: '',
    priorite: 'Moyenne',
    statut: 'En attente',
    commentaire: ''
  });

  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  useEffect(() => {
    if (initialData) {
      setForm({
        numero: initialData.numero || '',
        type: initialData.type || 'Document',
        nom: initialData.nom || '',
        description: initialData.description || '',
        reference: initialData.reference || '',
        version: initialData.version || '1.0',
        dateCreation: initialData.dateCreation || new Date().toISOString().split('T')[0],
        dateApplication: initialData.dateApplication || '',
        dateExpiration: initialData.dateExpiration || '',
        statut: initialData.statut || 'Actif',
        responsable: initialData.responsable || '',
        domaine: initialData.domaine || 'Qualité',
        norme: initialData.norme || 'ISO 9001',
        niveauConformite: initialData.niveauConformite || 'Conforme',
        score: initialData.score || 100,
        documents: initialData.documents || [],
        certifications: initialData.certifications || [],
        obligations: initialData.obligations || [],
        evaluations: initialData.evaluations || [],
        actions: initialData.actions || []
      });
    }
  }, [initialData, isOpen]);

  const addDocument = () => {
    if (currentDocument.nom) {
      setForm(prev => ({
        ...prev,
        documents: [...prev.documents, { ...currentDocument, id: Date.now() }]
      }));
      setCurrentDocument({
        nom: '',
        type: 'Procédure',
        url: '',
        version: '1.0',
        date: '',
        statut: 'Actif'
      });
    }
  };

  const addCertification = () => {
    if (currentCertification.type && currentCertification.numero) {
      setForm(prev => ({
        ...prev,
        certifications: [...prev.certifications, { ...currentCertification, id: Date.now() }]
      }));
      setCurrentCertification({
        type: 'ISO 9001',
        numero: '',
        organisme: '',
        dateObtention: '',
        dateExpiration: '',
        statut: 'Valide',
        conditions: []
      });
    }
  };

  const addObligation = () => {
    if (currentObligation.description) {
      setForm(prev => ({
        ...prev,
        obligations: [...prev.obligations, { ...currentObligation, id: Date.now() }]
      }));
      setCurrentObligation({
        description: '',
        reference: '',
        niveau: 'National',
        applicable: true,
        dateEcheance: '',
        responsable: '',
        statut: 'En cours'
      });
    }
  };

  const addEvaluation = () => {
    if (currentEvaluation.date && currentEvaluation.evaluateur) {
      setForm(prev => ({
        ...prev,
        evaluations: [...prev.evaluations, { ...currentEvaluation, id: Date.now() }]
      }));
      setCurrentEvaluation({
        date: '',
        evaluateur: '',
        score: 0,
        commentaire: '',
        actions: []
      });
    }
  };

  const addAction = () => {
    if (currentAction.description) {
      setForm(prev => ({
        ...prev,
        actions: [...prev.actions, { ...currentAction, id: Date.now() }]
      }));
      setCurrentAction({
        description: '',
        responsable: '',
        dateLimite: '',
        priorite: 'Moyenne',
        statut: 'En attente',
        commentaire: ''
      });
    }
  };

  const removeItem = (type: string, index: number) => {
    if (type === 'document') {
      setForm(prev => ({
        ...prev,
        documents: prev.documents.filter((_, i) => i !== index)
      }));
    } else if (type === 'certification') {
      setForm(prev => ({
        ...prev,
        certifications: prev.certifications.filter((_, i) => i !== index)
      }));
    } else if (type === 'obligation') {
      setForm(prev => ({
        ...prev,
        obligations: prev.obligations.filter((_, i) => i !== index)
      }));
    } else if (type === 'evaluation') {
      setForm(prev => ({
        ...prev,
        evaluations: prev.evaluations.filter((_, i) => i !== index)
      }));
    } else if (type === 'action') {
      setForm(prev => ({
        ...prev,
        actions: prev.actions.filter((_, i) => i !== index)
      }));
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setUploadedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  if (!isOpen) return null;

  const types = ['Document', 'Norme', 'Réglementation', 'Certification', 'Audit', 'Formation'];
  const domaines = ['Qualité', 'Sécurité', 'Environnement', 'HACCP', 'ISO 9001', 'ISO 22000', 'BRC', 'IFS', 'Codex Alimentarius'];
  const normes = ['ISO 9001', 'ISO 22000', 'HACCP', 'BRC', 'IFS', 'Codex Alimentarius', 'Autre'];
  const niveauxConformite = ['Conforme', 'Partiellement conforme', 'Non conforme', 'En cours d\'évaluation'];
  const statuts = ['Actif', 'Inactif', 'En révision', 'Obsolète', 'Suspendu'];
  const typesDocument = ['Procédure', 'Instruction', 'Enregistrement', 'Formulaire', 'Rapport', 'Certificat', 'Autre'];
  const niveauxObligation = ['International', 'National', 'Régional', 'Local', 'Sectoriel'];
  const priorites = ['Faible', 'Moyenne', 'Élevée', 'Critique'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-6xl max-h-[90vh] rounded-lg bg-white shadow-xl dark:bg-gray-800 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <Shield className="h-6 w-6 text-primary-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Gestion de la conformité et réglementation
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
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    N° référence
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
                    Type *
                  </label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({...form, type: e.target.value})}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-600 dark:border-gray-500"
                    required
                  >
                    {types.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nom *
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
                    Référence
                  </label>
                  <input
                    type="text"
                    value={form.reference}
                    onChange={(e) => setForm({...form, reference: e.target.value})}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-600 dark:border-gray-500"
                    placeholder="Référence officielle"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Version
                  </label>
                  <input
                    type="text"
                    value={form.version}
                    onChange={(e) => setForm({...form, version: e.target.value})}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-600 dark:border-gray-500"
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
                    {statuts.map(statut => (
                      <option key={statut} value={statut}>{statut}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Domaine *
                  </label>
                  <select
                    value={form.domaine}
                    onChange={(e) => setForm({...form, domaine: e.target.value})}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-600 dark:border-gray-500"
                    required
                  >
                    {domaines.map(domaine => (
                      <option key={domaine} value={domaine}>{domaine}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Norme
                  </label>
                  <select
                    value={form.norme}
                    onChange={(e) => setForm({...form, norme: e.target.value})}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-600 dark:border-gray-500"
                  >
                    {normes.map(norme => (
                      <option key={norme} value={norme}>{norme}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Responsable
                  </label>
                  <input
                    type="text"
                    value={form.responsable}
                    onChange={(e) => setForm({...form, responsable: e.target.value})}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-600 dark:border-gray-500"
                    placeholder="Nom du responsable"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Date création
                  </label>
                  <input
                    type="date"
                    value={form.dateCreation}
                    onChange={(e) => setForm({...form, dateCreation: e.target.value})}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-600 dark:border-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Date application
                  </label>
                  <input
                    type="date"
                    value={form.dateApplication}
                    onChange={(e) => setForm({...form, dateApplication: e.target.value})}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-600 dark:border-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Date expiration
                  </label>
                  <input
                    type="date"
                    value={form.dateExpiration}
                    onChange={(e) => setForm({...form, dateExpiration: e.target.value})}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-600 dark:border-gray-500"
                  />
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
                  placeholder="Description de la conformité/réglementation..."
                />
              </div>
            </div>

            {/* Documents */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Documents associés
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nom
                  </label>
                  <input
                    type="text"
                    value={currentDocument.nom}
                    onChange={(e) => setCurrentDocument({...currentDocument, nom: e.target.value})}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-600 dark:border-gray-500"
                    placeholder="Nom du document"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Type
                  </label>
                  <select
                    value={currentDocument.type}
                    onChange={(e) => setCurrentDocument({...currentDocument, type: e.target.value})}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-600 dark:border-gray-500"
                  >
                    {typesDocument.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Version
                  </label>
                  <input
                    type="text"
                    value={currentDocument.version}
                    onChange={(e) => setCurrentDocument({...currentDocument, version: e.target.value})}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-600 dark:border-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    URL
                  </label>
                  <input
                    type="url"
                    value={currentDocument.url}
                    onChange={(e) => setCurrentDocument({...currentDocument, url: e.target.value})}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-600 dark:border-gray-500"
                    placeholder="Lien vers le document"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    value={currentDocument.date}
                    onChange={(e) => setCurrentDocument({...currentDocument, date: e.target.value})}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-600 dark:border-gray-500"
                  />
                </div>
                <div>
                  <button
                    type="button"
                    onClick={addDocument}
                    className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 flex items-center space-x-2"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Ajouter</span>
                  </button>
                </div>
              </div>

              {/* Liste des documents */}
              <div className="space-y-2">
                {form.documents.map((doc, index) => (
                  <div key={index} className="bg-white dark:bg-gray-800 rounded p-3 border border-gray-200 dark:border-gray-600">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900 dark:text-white">{doc.nom}</span>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          {doc.type}
                        </span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">v{doc.version}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem('document', index)}
                        className="text-red-600 hover:text-red-800 p-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Certifications */}
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                <CheckCircle className="h-5 w-5 mr-2" />
                Certifications
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Type
                  </label>
                  <select
                    value={currentCertification.type}
                    onChange={(e) => setCurrentCertification({...currentCertification, type: e.target.value})}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-600 dark:border-gray-500"
                  >
                    {normes.map(norme => (
                      <option key={norme} value={norme}>{norme}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Numéro
                  </label>
                  <input
                    type="text"
                    value={currentCertification.numero}
                    onChange={(e) => setCurrentCertification({...currentCertification, numero: e.target.value})}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-600 dark:border-gray-500"
                    placeholder="Numéro de certification"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Organisme
                  </label>
                  <input
                    type="text"
                    value={currentCertification.organisme}
                    onChange={(e) => setCurrentCertification({...currentCertification, organisme: e.target.value})}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-600 dark:border-gray-500"
                    placeholder="Organisme certificateur"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Date obtention
                  </label>
                  <input
                    type="date"
                    value={currentCertification.dateObtention}
                    onChange={(e) => setCurrentCertification({...currentCertification, dateObtention: e.target.value})}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-600 dark:border-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Date expiration
                  </label>
                  <input
                    type="date"
                    value={currentCertification.dateExpiration}
                    onChange={(e) => setCurrentCertification({...currentCertification, dateExpiration: e.target.value})}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-600 dark:border-gray-500"
                  />
                </div>
                <div>
                  <button
                    type="button"
                    onClick={addCertification}
                    className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 flex items-center space-x-2"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Ajouter</span>
                  </button>
                </div>
              </div>

              {/* Liste des certifications */}
              <div className="space-y-2">
                {form.certifications.map((cert, index) => (
                  <div key={index} className="bg-white dark:bg-gray-800 rounded p-3 border border-gray-200 dark:border-gray-600">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900 dark:text-white">{cert.type}</span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">{cert.numero}</span>
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                          {cert.statut}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem('certification', index)}
                        className="text-red-600 hover:text-red-800 p-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Organisme: {cert.organisme} | Expiration: {cert.dateExpiration}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Obligations */}
            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Obligations réglementaires
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <input
                    type="text"
                    value={currentObligation.description}
                    onChange={(e) => setCurrentObligation({...currentObligation, description: e.target.value})}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-600 dark:border-gray-500"
                    placeholder="Description de l'obligation"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Référence
                  </label>
                  <input
                    type="text"
                    value={currentObligation.reference}
                    onChange={(e) => setCurrentObligation({...currentObligation, reference: e.target.value})}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-600 dark:border-gray-500"
                    placeholder="Référence réglementaire"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Niveau
                  </label>
                  <select
                    value={currentObligation.niveau}
                    onChange={(e) => setCurrentObligation({...currentObligation, niveau: e.target.value})}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-600 dark:border-gray-500"
                  >
                    {niveauxObligation.map(niveau => (
                      <option key={niveau} value={niveau}>{niveau}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Date échéance
                  </label>
                  <input
                    type="date"
                    value={currentObligation.dateEcheance}
                    onChange={(e) => setCurrentObligation({...currentObligation, dateEcheance: e.target.value})}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-600 dark:border-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Responsable
                  </label>
                  <input
                    type="text"
                    value={currentObligation.responsable}
                    onChange={(e) => setCurrentObligation({...currentObligation, responsable: e.target.value})}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-600 dark:border-gray-500"
                    placeholder="Responsable de l'obligation"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Statut
                  </label>
                  <select
                    value={currentObligation.statut}
                    onChange={(e) => setCurrentObligation({...currentObligation, statut: e.target.value})}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-600 dark:border-gray-500"
                  >
                    <option value="En cours">En cours</option>
                    <option value="Terminé">Terminé</option>
                    <option value="En retard">En retard</option>
                    <option value="Suspendu">Suspendu</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={currentObligation.applicable}
                      onChange={(e) => setCurrentObligation({...currentObligation, applicable: e.target.checked})}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Obligation applicable
                    </span>
                  </label>
                </div>
                <div>
                  <button
                    type="button"
                    onClick={addObligation}
                    className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 flex items-center space-x-2"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Ajouter</span>
                  </button>
                </div>
              </div>

              {/* Liste des obligations */}
              <div className="space-y-2">
                {form.obligations.map((obligation, index) => (
                  <div key={index} className="bg-white dark:bg-gray-800 rounded p-3 border border-gray-200 dark:border-gray-600">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900 dark:text-white">{obligation.description}</span>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          {obligation.niveau}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          obligation.statut === 'Terminé' 
                            ? 'bg-green-100 text-green-800'
                            : obligation.statut === 'En retard'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {obligation.statut}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem('obligation', index)}
                        className="text-red-600 hover:text-red-800 p-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Référence: {obligation.reference} | Responsable: {obligation.responsable} | Échéance: {obligation.dateEcheance}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Upload de fichiers */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <div className="text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-4">
                  <label className="cursor-pointer">
                    <span className="mt-2 block text-sm font-medium text-gray-900 dark:text-white">
                      Glisser-déposer des fichiers ou cliquer pour sélectionner
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
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Fichiers sélectionnés:</h4>
                  <div className="space-y-2">
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 rounded p-2">
                        <span className="text-sm text-gray-700 dark:text-gray-300">{file.name}</span>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          ✕
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
            onClick={() => onSave && onSave(form)}
            className="px-4 py-2 rounded-md bg-primary-600 text-white hover:bg-primary-700"
          >
            {mode === 'create' ? 'Créer conformité' : 'Mettre à jour'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalConformite;