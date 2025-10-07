import React, { useState, useEffect } from 'react';
import { FileText, Calendar, Users, CheckCircle, AlertTriangle, BarChart3, Plus, Trash2 } from 'lucide-react';

export interface ModalProps<T = any> {
  isOpen: boolean;
  mode?: 'create' | 'edit' | 'view';
  initialData?: T | null;
  onClose: () => void;
  onSave?: (data: T) => void;
  title?: string;
}

const ModalAuditQualite: React.FC<ModalProps<any>> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  initialData, 
  title = 'Audit Qualité',
  mode = 'create'
}) => {
  const [form, setForm] = useState({
    numero: '',
    type: 'Interne',
    domaine: 'Qualité',
    objet: '',
    datePrevue: '',
    dateReelle: '',
    duree: 0,
    statut: 'Planifié',
    audite: '',
    auditeur: '',
    equipe: [] as any[],
    checklist: [] as any[],
    constatations: [] as any[],
    ecarts: [] as any[],
    recommandations: [] as any[],
    score: 0,
    conclusion: 'Conforme'
  });

  const [currentMembre, setCurrentMembre] = useState({
    nom: '',
    role: 'Auditeur',
    competences: [] as string[]
  });

  const [currentQuestion, setCurrentQuestion] = useState({
    question: '',
    critere: '',
    poids: 1,
    reponse: '',
    preuve: '',
    score: 0,
    commentaire: ''
  });

  const [currentConstatation, setCurrentConstatation] = useState({
    type: 'Conformité',
    description: '',
    gravite: 'Mineure',
    localisation: '',
    preuve: '',
    action: ''
  });

  const [currentEcart, setCurrentEcart] = useState({
    description: '',
    cause: '',
    impact: '',
    action: '',
    responsable: '',
    dateLimite: '',
    statut: 'Ouvert'
  });

  const [currentRecommandation, setCurrentRecommandation] = useState({
    description: '',
    priorite: 'Moyenne',
    responsable: '',
    dateLimite: '',
    statut: 'En attente'
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        numero: initialData.numero || '',
        type: initialData.type || 'Interne',
        domaine: initialData.domaine || 'Qualité',
        objet: initialData.objet || '',
        datePrevue: initialData.datePrevue || '',
        dateReelle: initialData.dateReelle || '',
        duree: initialData.duree || 0,
        statut: initialData.statut || 'Planifié',
        audite: initialData.audite || '',
        auditeur: initialData.auditeur || '',
        equipe: initialData.equipe || [],
        checklist: initialData.checklist || [],
        constatations: initialData.constatations || [],
        ecarts: initialData.ecarts || [],
        recommandations: initialData.recommandations || [],
        score: initialData.score || 0,
        conclusion: initialData.conclusion || 'Conforme'
      });
    }
  }, [initialData, isOpen]);

  const addMembre = () => {
    if (currentMembre.nom) {
      setForm(prev => ({
        ...prev,
        equipe: [...prev.equipe, { ...currentMembre, id: Date.now() }]
      }));
      setCurrentMembre({
        nom: '',
        role: 'Auditeur',
        competences: []
      });
    }
  };

  const addQuestion = () => {
    if (currentQuestion.question) {
      setForm(prev => ({
        ...prev,
        checklist: [...prev.checklist, { ...currentQuestion, id: Date.now() }]
      }));
      setCurrentQuestion({
        question: '',
        critere: '',
        poids: 1,
        reponse: '',
        preuve: '',
        score: 0,
        commentaire: ''
      });
    }
  };

  const addConstatation = () => {
    if (currentConstatation.description) {
      setForm(prev => ({
        ...prev,
        constatations: [...prev.constatations, { ...currentConstatation, id: Date.now() }]
      }));
      setCurrentConstatation({
        type: 'Conformité',
        description: '',
        gravite: 'Mineure',
        localisation: '',
        preuve: '',
        action: ''
      });
    }
  };

  const addEcart = () => {
    if (currentEcart.description) {
      setForm(prev => ({
        ...prev,
        ecarts: [...prev.ecarts, { ...currentEcart, id: Date.now() }]
      }));
      setCurrentEcart({
        description: '',
        cause: '',
        impact: '',
        action: '',
        responsable: '',
        dateLimite: '',
        statut: 'Ouvert'
      });
    }
  };

  const addRecommandation = () => {
    if (currentRecommandation.description) {
      setForm(prev => ({
        ...prev,
        recommandations: [...prev.recommandations, { ...currentRecommandation, id: Date.now() }]
      }));
      setCurrentRecommandation({
        description: '',
        priorite: 'Moyenne',
        responsable: '',
        dateLimite: '',
        statut: 'En attente'
      });
    }
  };

  const removeItem = (type: string, index: number) => {
    if (type === 'membre') {
      setForm(prev => ({
        ...prev,
        equipe: prev.equipe.filter((_, i) => i !== index)
      }));
    } else if (type === 'question') {
      setForm(prev => ({
        ...prev,
        checklist: prev.checklist.filter((_, i) => i !== index)
      }));
    } else if (type === 'constatation') {
      setForm(prev => ({
        ...prev,
        constatations: prev.constatations.filter((_, i) => i !== index)
      }));
    } else if (type === 'ecart') {
      setForm(prev => ({
        ...prev,
        ecarts: prev.ecarts.filter((_, i) => i !== index)
      }));
    } else if (type === 'recommandation') {
      setForm(prev => ({
        ...prev,
        recommandations: prev.recommandations.filter((_, i) => i !== index)
      }));
    }
  };

  const calculerScore = () => {
    const totalPoints = form.checklist.reduce((sum, q) => sum + (q.poids * q.score), 0);
    const totalPoids = form.checklist.reduce((sum, q) => sum + q.poids, 0);
    return totalPoids > 0 ? Math.round((totalPoints / totalPoids) * 100) : 0;
  };

  const determinerConclusion = () => {
    const score = calculerScore();
    const ecartsCritiques = form.ecarts.filter(e => e.gravite === 'Critique').length;
    
    if (ecartsCritiques > 0) return 'Non conforme';
    if (score >= 90) return 'Conforme';
    if (score >= 70) return 'Conforme avec réserves';
    return 'Non conforme';
  };

  if (!isOpen) return null;

  const types = ['Interne', 'Externe', 'Fournisseur', 'Certification', 'Processus', 'Produit'];
  const domaines = ['Qualité', 'Sécurité', 'Environnement', 'HACCP', 'ISO 9001', 'ISO 22000', 'BRC', 'IFS'];
  const statuts = ['Planifié', 'En cours', 'Terminé', 'Reporté', 'Annulé'];
  const roles = ['Auditeur', 'Co-auditeur', 'Observateur', 'Expert'];
  const gravites = ['Mineure', 'Majeure', 'Critique'];
  const priorites = ['Faible', 'Moyenne', 'Élevée', 'Critique'];

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
                Planification et suivi d'audit
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
              const score = calculerScore();
              const conclusion = determinerConclusion();
              onSave && onSave({
                ...form,
                score,
                conclusion
              });
            }}
            className="space-y-6"
          >
            {/* Informations générales */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Informations générales
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    N° audit
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
                    Objet *
                  </label>
                  <input
                    type="text"
                    value={form.objet}
                    onChange={(e) => setForm({...form, objet: e.target.value})}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-600 dark:border-gray-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Date prévue
                  </label>
                  <input
                    type="date"
                    value={form.datePrevue}
                    onChange={(e) => setForm({...form, datePrevue: e.target.value})}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-600 dark:border-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Date réelle
                  </label>
                  <input
                    type="date"
                    value={form.dateReelle}
                    onChange={(e) => setForm({...form, dateReelle: e.target.value})}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-600 dark:border-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Durée (heures)
                  </label>
                  <input
                    type="number"
                    value={form.duree}
                    onChange={(e) => setForm({...form, duree: parseInt(e.target.value) || 0})}
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
                    Audité
                  </label>
                  <input
                    type="text"
                    value={form.audite}
                    onChange={(e) => setForm({...form, audite: e.target.value})}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-600 dark:border-gray-500"
                    placeholder="Service/Processus audité"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Auditeur principal
                  </label>
                  <input
                    type="text"
                    value={form.auditeur}
                    onChange={(e) => setForm({...form, auditeur: e.target.value})}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-600 dark:border-gray-500"
                    placeholder="Nom de l'auditeur"
                  />
                </div>
              </div>
            </div>

            {/* Équipe d'audit */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Équipe d'audit
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nom
                  </label>
                  <input
                    type="text"
                    value={currentMembre.nom}
                    onChange={(e) => setCurrentMembre({...currentMembre, nom: e.target.value})}
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
                <div>
                  <button
                    type="button"
                    onClick={addMembre}
                    className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 flex items-center space-x-2"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Ajouter</span>
                  </button>
                </div>
              </div>

              {/* Liste des membres */}
              <div className="space-y-2">
                {form.equipe.map((membre, index) => (
                  <div key={index} className="bg-white dark:bg-gray-800 rounded p-3 border border-gray-200 dark:border-gray-600">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900 dark:text-white">{membre.nom}</span>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
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

            {/* Checklist */}
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                <CheckCircle className="h-5 w-5 mr-2" />
                Checklist d'audit
              </h3>
              
              <div className="space-y-4 mb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Question
                    </label>
                    <input
                      type="text"
                      value={currentQuestion.question}
                      onChange={(e) => setCurrentQuestion({...currentQuestion, question: e.target.value})}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-600 dark:border-gray-500"
                      placeholder="Question d'audit"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Critère
                    </label>
                    <input
                      type="text"
                      value={currentQuestion.critere}
                      onChange={(e) => setCurrentQuestion({...currentQuestion, critere: e.target.value})}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-600 dark:border-gray-500"
                      placeholder="Critère de référence"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Poids
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="5"
                      value={currentQuestion.poids}
                      onChange={(e) => setCurrentQuestion({...currentQuestion, poids: parseInt(e.target.value) || 1})}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-600 dark:border-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Score (0-5)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="5"
                      value={currentQuestion.score}
                      onChange={(e) => setCurrentQuestion({...currentQuestion, score: parseInt(e.target.value) || 0})}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-600 dark:border-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Réponse
                    </label>
                    <select
                      value={currentQuestion.reponse}
                      onChange={(e) => setCurrentQuestion({...currentQuestion, reponse: e.target.value})}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-600 dark:border-gray-500"
                    >
                      <option value="">Sélectionner</option>
                      <option value="Conforme">Conforme</option>
                      <option value="Non conforme">Non conforme</option>
                      <option value="Non applicable">Non applicable</option>
                      <option value="Observation">Observation</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Preuve
                    </label>
                    <input
                      type="text"
                      value={currentQuestion.preuve}
                      onChange={(e) => setCurrentQuestion({...currentQuestion, preuve: e.target.value})}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-600 dark:border-gray-500"
                      placeholder="Preuve documentaire"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Commentaire
                  </label>
                  <textarea
                    value={currentQuestion.commentaire}
                    onChange={(e) => setCurrentQuestion({...currentQuestion, commentaire: e.target.value})}
                    rows={2}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-600 dark:border-gray-500"
                    placeholder="Commentaire sur la question..."
                  />
                </div>
                
                <button
                  type="button"
                  onClick={addQuestion}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Ajouter question</span>
                </button>
              </div>

              {/* Liste des questions */}
              <div className="space-y-3">
                {form.checklist.map((question, index) => (
                  <div key={index} className="bg-white dark:bg-gray-800 rounded p-4 border border-gray-200 dark:border-gray-600">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {question.question}
                        </span>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          Poids: {question.poids}
                        </span>
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                          Score: {question.score}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem('question', index)}
                        className="text-red-600 hover:text-red-800 p-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <p><strong>Critère:</strong> {question.critere}</p>
                      <p><strong>Réponse:</strong> {question.reponse}</p>
                      {question.preuve && <p><strong>Preuve:</strong> {question.preuve}</p>}
                      {question.commentaire && <p><strong>Commentaire:</strong> {question.commentaire}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Constatations */}
            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Constatations
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Type
                  </label>
                  <select
                    value={currentConstatation.type}
                    onChange={(e) => setCurrentConstatation({...currentConstatation, type: e.target.value})}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-600 dark:border-gray-500"
                  >
                    <option value="Conformité">Conformité</option>
                    <option value="Non-conformité">Non-conformité</option>
                    <option value="Observation">Observation</option>
                    <option value="Point fort">Point fort</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Gravité
                  </label>
                  <select
                    value={currentConstatation.gravite}
                    onChange={(e) => setCurrentConstatation({...currentConstatation, gravite: e.target.value})}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-600 dark:border-gray-500"
                  >
                    {gravites.map(gravite => (
                      <option key={gravite} value={gravite}>{gravite}</option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={currentConstatation.description}
                    onChange={(e) => setCurrentConstatation({...currentConstatation, description: e.target.value})}
                    rows={3}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-600 dark:border-gray-500"
                    placeholder="Description de la constatation..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Localisation
                  </label>
                  <input
                    type="text"
                    value={currentConstatation.localisation}
                    onChange={(e) => setCurrentConstatation({...currentConstatation, localisation: e.target.value})}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-600 dark:border-gray-500"
                    placeholder="Zone/Processus concerné"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Preuve
                  </label>
                  <input
                    type="text"
                    value={currentConstatation.preuve}
                    onChange={(e) => setCurrentConstatation({...currentConstatation, preuve: e.target.value})}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-600 dark:border-gray-500"
                    placeholder="Preuve documentaire"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Action requise
                  </label>
                  <input
                    type="text"
                    value={currentConstatation.action}
                    onChange={(e) => setCurrentConstatation({...currentConstatation, action: e.target.value})}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-600 dark:border-gray-500"
                    placeholder="Action à mettre en place"
                  />
                </div>
              </div>
              
              <button
                type="button"
                onClick={addConstatation}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 flex items-center space-x-2 mb-4"
              >
                <Plus className="h-4 w-4" />
                <span>Ajouter constatation</span>
              </button>

              {/* Liste des constatations */}
              <div className="space-y-3">
                {form.constatations.map((constatation, index) => (
                  <div key={index} className="bg-white dark:bg-gray-800 rounded p-4 border border-gray-200 dark:border-gray-600">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {constatation.description}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          constatation.type === 'Conformité' 
                            ? 'bg-green-100 text-green-800'
                            : constatation.type === 'Non-conformité'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {constatation.type}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          constatation.gravite === 'Critique' 
                            ? 'bg-red-100 text-red-800'
                            : constatation.gravite === 'Majeure'
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {constatation.gravite}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem('constatation', index)}
                        className="text-red-600 hover:text-red-800 p-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <p><strong>Localisation:</strong> {constatation.localisation}</p>
                      {constatation.preuve && <p><strong>Preuve:</strong> {constatation.preuve}</p>}
                      {constatation.action && <p><strong>Action:</strong> {constatation.action}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Résumé et conclusion */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Résumé et conclusion
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {calculerScore()}%
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Score global</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {form.constatations.length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Constatations</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {form.ecarts.length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Écarts</div>
                </div>
              </div>
              
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Conclusion
                </label>
                <div className="text-lg font-semibold text-gray-900 dark:text-white">
                  {determinerConclusion()}
                </div>
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
              const score = calculerScore();
              const conclusion = determinerConclusion();
              onSave && onSave({
                ...form,
                score,
                conclusion
              });
            }}
            className="px-4 py-2 rounded-md bg-primary-600 text-white hover:bg-primary-700"
          >
            {mode === 'create' ? 'Créer audit' : 'Mettre à jour'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalAuditQualite;
