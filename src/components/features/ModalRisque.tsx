import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import FormInput from '../common/FormInput';
import FormButton from '../common/FormButton';
import { 
  AlertTriangle, 
  Calendar, 
  Plus, 
  Trash2,
  AlertCircle,
  CheckCircle,
  TrendingUp
} from 'lucide-react';

// Interfaces TypeScript
interface Risque {
  _id: string;
  numero: string;
  titre: string;
  description: string;
  type: string;
  categorie: string;
  probabilite: string;
  gravite: string;
  niveauRisque: string;
  scoreRisque: number;
  activite: string;
  dateIdentification: string;
  dateEvaluation: string;
  responsable: {
    nom: string;
    prenom: string;
    matricule: string;
  };
  sources: Array<string>;
  consequences: Array<string>;
  mesuresPreventives: Array<{
    description: string;
    type: string;
    responsable: string;
    dateEcheance: string;
    statut: string;
  }>;
  mesuresCorrectives: Array<{
    description: string;
    type: string;
    responsable: string;
    dateEcheance: string;
    statut: string;
  }>;
  indicateurs: Array<{
    nom: string;
    valeur: string;
    seuil: string;
    unite: string;
  }>;
  documents: Array<{
    nom: string;
    type: string;
    url: string;
  }>;
  createdBy: {
    nom: string;
    prenom: string;
  };
}

interface ModalRisqueProps {
  isOpen: boolean;
  onClose: () => void;
  risque?: Risque | null;
  mode: 'create' | 'edit' | 'view';
  onSubmit: (risque: Partial<Risque>) => void;
}

export default function ModalRisque({ 
  isOpen, 
  onClose, 
  risque, 
  mode, 
  onSubmit 
}: ModalRisqueProps) {
  const [formData, setFormData] = useState({
    numero: '',
    titre: '',
    description: '',
    type: '',
    categorie: '',
    probabilite: '',
    gravite: '',
    niveauRisque: '',
    scoreRisque: 1,
    activite: '',
    dateIdentification: '',
    dateEvaluation: '',
    responsable: { nom: '', prenom: '', matricule: '' },
    sources: [''],
    consequences: [''],
    mesuresPreventives: [{ description: '', type: '', responsable: '', dateEcheance: '', statut: 'À faire' }],
    mesuresCorrectives: [{ description: '', type: '', responsable: '', dateEcheance: '', statut: 'À faire' }],
    indicateurs: [{ nom: '', valeur: '', seuil: '', unite: '' }],
    documents: [{ nom: '', type: '', url: '' }]
  });

  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Initialiser les données du formulaire
  useEffect(() => {
    if (risque && mode === 'edit') {
      setFormData({
        numero: risque.numero || '',
        titre: risque.titre || '',
        description: risque.description || '',
        type: risque.type || '',
        categorie: risque.categorie || '',
        probabilite: risque.probabilite || '',
        gravite: risque.gravite || '',
        niveauRisque: risque.niveauRisque || '',
        scoreRisque: risque.scoreRisque || 1,
        activite: risque.activite || '',
        dateIdentification: risque.dateIdentification || '',
        dateEvaluation: risque.dateEvaluation || '',
        responsable: risque.responsable || { nom: '', prenom: '', matricule: '' },
        sources: risque.sources || [''],
        consequences: risque.consequences || [''],
        mesuresPreventives: risque.mesuresPreventives || [{ description: '', type: '', responsable: '', dateEcheance: '', statut: 'À faire' }],
        mesuresCorrectives: risque.mesuresCorrectives || [{ description: '', type: '', responsable: '', dateEcheance: '', statut: 'À faire' }],
        indicateurs: risque.indicateurs || [{ nom: '', valeur: '', seuil: '', unite: '' }],
        documents: risque.documents || [{ nom: '', type: '', url: '' }]
      });
    } else if (mode === 'create') {
      resetForm();
    }
  }, [risque, mode]);

  const resetForm = () => {
    setFormData({
      numero: '',
      titre: '',
      description: '',
      type: '',
      categorie: '',
      probabilite: '',
      gravite: '',
      niveauRisque: '',
      scoreRisque: 1,
      activite: '',
      dateIdentification: '',
      dateEvaluation: '',
      responsable: { nom: '', prenom: '', matricule: '' },
      sources: [''],
      consequences: [''],
      mesuresPreventives: [{ description: '', type: '', responsable: '', dateEcheance: '', statut: 'À faire' }],
      mesuresCorrectives: [{ description: '', type: '', responsable: '', dateEcheance: '', statut: 'À faire' }],
      indicateurs: [{ nom: '', valeur: '', seuil: '', unite: '' }],
      documents: [{ nom: '', type: '', url: '' }]
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('source.')) {
      const index = parseInt(name.split('.')[1]);
      const newSources = [...formData.sources];
      newSources[index] = value;
      setFormData(prev => ({ ...prev, sources: newSources }));
    } else if (name.startsWith('consequence.')) {
      const index = parseInt(name.split('.')[1]);
      const newConsequences = [...formData.consequences];
      newConsequences[index] = value;
      setFormData(prev => ({ ...prev, consequences: newConsequences }));
    } else if (name.startsWith('mesurePreventive.')) {
      const parts = name.split('.');
      const index = parseInt(parts[1]);
      const field = parts[2];
      const newMesures = [...formData.mesuresPreventives];
      if (field === 'description' || field === 'type' || field === 'responsable' || field === 'dateEcheance' || field === 'statut') {
        newMesures[index] = { ...newMesures[index], [field]: value };
      }
      setFormData(prev => ({ ...prev, mesuresPreventives: newMesures }));
    } else if (name.startsWith('mesureCorrective.')) {
      const parts = name.split('.');
      const index = parseInt(parts[1]);
      const field = parts[2];
      const newMesures = [...formData.mesuresCorrectives];
      if (field === 'description' || field === 'type' || field === 'responsable' || field === 'dateEcheance' || field === 'statut') {
        newMesures[index] = { ...newMesures[index], [field]: value };
      }
      setFormData(prev => ({ ...prev, mesuresCorrectives: newMesures }));
    } else if (name.startsWith('indicateur.')) {
      const parts = name.split('.');
      const index = parseInt(parts[1]);
      const field = parts[2];
      const newIndicateurs = [...formData.indicateurs];
      if (field === 'nom' || field === 'valeur' || field === 'seuil' || field === 'unite') {
        newIndicateurs[index] = { ...newIndicateurs[index], [field]: value };
      }
      setFormData(prev => ({ ...prev, indicateurs: newIndicateurs }));
    } else if (name.includes('.')) {
      const [parent, child] = name.split('.');
      
      if (parent === 'responsable') {
        setFormData(prev => ({
          ...prev,
          responsable: {
            ...prev.responsable,
            [child]: value
          }
        }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const addSource = () => {
    setFormData(prev => ({
      ...prev,
      sources: [...prev.sources, '']
    }));
  };

  const removeSource = (index: number) => {
    setFormData(prev => ({
      ...prev,
      sources: prev.sources.filter((_, i) => i !== index)
    }));
  };

  const addConsequence = () => {
    setFormData(prev => ({
      ...prev,
      consequences: [...prev.consequences, '']
    }));
  };

  const removeConsequence = (index: number) => {
    setFormData(prev => ({
      ...prev,
      consequences: prev.consequences.filter((_, i) => i !== index)
    }));
  };

  const addMesurePreventive = () => {
    setFormData(prev => ({
      ...prev,
      mesuresPreventives: [...prev.mesuresPreventives, { description: '', type: '', responsable: '', dateEcheance: '', statut: 'À faire' }]
    }));
  };

  const removeMesurePreventive = (index: number) => {
    setFormData(prev => ({
      ...prev,
      mesuresPreventives: prev.mesuresPreventives.filter((_, i) => i !== index)
    }));
  };

  const addMesureCorrective = () => {
    setFormData(prev => ({
      ...prev,
      mesuresCorrectives: [...prev.mesuresCorrectives, { description: '', type: '', responsable: '', dateEcheance: '', statut: 'À faire' }]
    }));
  };

  const removeMesureCorrective = (index: number) => {
    setFormData(prev => ({
      ...prev,
      mesuresCorrectives: prev.mesuresCorrectives.filter((_, i) => i !== index)
    }));
  };

  const addIndicateur = () => {
    setFormData(prev => ({
      ...prev,
      indicateurs: [...prev.indicateurs, { nom: '', valeur: '', seuil: '', unite: '' }]
    }));
  };

  const removeIndicateur = (index: number) => {
    setFormData(prev => ({
      ...prev,
      indicateurs: prev.indicateurs.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const errors: string[] = [];
    
    if (!formData.numero.trim()) errors.push('Le numéro est requis');
    if (!formData.titre.trim()) errors.push('Le titre est requis');
    if (!formData.description.trim()) errors.push('La description est requise');
    if (!formData.type) errors.push('Le type de risque est requis');
    if (!formData.categorie) errors.push('La catégorie est requise');
    if (!formData.activite.trim()) errors.push('L\'activité est requise');
    if (!formData.probabilite) errors.push('La probabilité est requise');
    if (!formData.gravite) errors.push('La gravité est requise');
    if (!formData.niveauRisque) errors.push('Le niveau de risque est requis');
    if (!formData.scoreRisque || formData.scoreRisque < 1 || formData.scoreRisque > 25) errors.push('Le score de risque doit être entre 1 et 25');
    if (!formData.dateIdentification) errors.push('La date d\'identification est requise');
    if (!formData.responsable.nom.trim()) errors.push('Le nom du responsable est requis');
    if (!formData.responsable.prenom.trim()) errors.push('Le prénom du responsable est requis');
    
    setValidationErrors(errors);
    return errors;
  };

  // Fonction pour nettoyer les données avant l'envoi
  const cleanFormData = (data: any) => {
    const cleaned = { ...data };
    
    // Ajouter les champs requis par le backend
    cleaned.createdBy = '507f1f77bcf86cd799439011'; // ObjectId factice pour l'instant
    
    // Filtrer les sources vides
    cleaned.sources = data.sources.filter((source: string) => source.trim() !== '');
    
    // Filtrer les conséquences vides
    cleaned.consequences = data.consequences.filter((consequence: string) => consequence.trim() !== '');
    
    // Filtrer les mesures préventives vides et les mapper vers mesuresExistentes
    cleaned.mesuresExistentes = data.mesuresPreventives.filter((mesure: any) => 
      mesure.description.trim() !== '' || mesure.type.trim() !== ''
    ).map((mesure: any) => ({
      description: mesure.description,
      type: mesure.type,
      efficacite: 'Modérée', // Valeur par défaut
      statut: 'En place' // Valeur par défaut
    }));
    
    // Filtrer les mesures correctives vides
    cleaned.mesuresCorrectives = data.mesuresCorrectives.filter((mesure: any) => 
      mesure.description.trim() !== '' || mesure.type.trim() !== '' || mesure.responsable.trim() !== ''
    ).map((mesure: any) => ({
      description: mesure.description,
      type: mesure.type,
      priorite: 'Normale', // Valeur par défaut
      dateEcheance: mesure.dateEcheance,
      statut: mesure.statut,
      efficaciteAttendue: 'Bonne' // Valeur par défaut
    }));
    
    // Filtrer les indicateurs vides
    cleaned.indicateurs = data.indicateurs.filter((indicateur: any) => 
      indicateur.nom.trim() !== '' || indicateur.valeur.trim() !== '' || indicateur.seuil.trim() !== ''
    );
    
    // Filtrer les documents vides
    cleaned.documents = data.documents.filter((document: any) => 
      document.nom.trim() !== '' || document.type.trim() !== '' || document.url.trim() !== ''
    );
    
    return cleaned;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (errors.length > 0) return;
    
    setIsSubmitting(true);
    
    try {
      const cleanedData = cleanFormData(formData);
      await onSubmit(cleanedData);
      setShowSuccessMessage(true);
      
      setTimeout(() => {
        onClose();
      }, 2000);
      
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTitle = () => {
    switch (mode) {
      case 'create': return 'Nouveau Risque';
      case 'edit': return 'Modifier le Risque';
      case 'view': return 'Détails du Risque';
      default: return 'Risque';
    }
  };

  const isReadOnly = mode === 'view';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={getTitle()}
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Affichage des erreurs de validation */}
        {validationErrors.length > 0 && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
              <h4 className="text-sm font-medium text-red-800 dark:text-red-200">
                Erreurs de validation
              </h4>
            </div>
            <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
              {validationErrors.map((error, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-red-500 mr-2">•</span>
                  {error}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Affichage du message de succès */}
        {showSuccessMessage && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
              <span className="text-sm font-medium text-green-800 dark:text-green-200">
                {mode === 'create' ? 'Risque créé avec succès !' : 'Risque modifié avec succès !'}
              </span>
            </div>
          </div>
        )}

        {/* Section Informations générales */}
        <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 p-6 rounded-xl border border-orange-100 dark:border-orange-800">
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center mr-3">
              <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <h4 className="text-xl font-semibold text-gray-900 dark:text-white">Informations Générales</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormInput
              label="Numéro du risque"
              name="numero"
              type="text"
              value={formData.numero}
              onChange={handleInputChange}
              placeholder="Ex: RISK-2024-001"
              required
              disabled={false}
            />
            
            <FormInput
              label="Titre du risque"
              name="titre"
              type="text"
              value={formData.titre}
              onChange={handleInputChange}
              placeholder="Titre du risque"
              required
              disabled={false}
            />
            
            <FormInput
              label="Type de risque"
              name="type"
              type="select"
              value={formData.type}
              onChange={handleInputChange}
              options={[
                { value: 'Sécurité', label: 'Sécurité' },
                { value: 'Qualité', label: 'Qualité' },
                { value: 'Environnement', label: 'Environnement' },
                { value: 'Hygiène', label: 'Hygiène' },
                { value: 'Santé', label: 'Santé' },
                { value: 'Mixte', label: 'Mixte' }
              ]}
              required
              disabled={false}
            />
            
            <FormInput
              label="Catégorie"
              name="categorie"
              type="select"
              value={formData.categorie}
              onChange={handleInputChange}
              options={[
                { value: 'Risque chimique', label: 'Risque chimique' },
                { value: 'Risque biologique', label: 'Risque biologique' },
                { value: 'Risque physique', label: 'Risque physique' },
                { value: 'Risque ergonomique', label: 'Risque ergonomique' },
                { value: 'Risque psychosocial', label: 'Risque psychosocial' },
                { value: 'Risque environnemental', label: 'Risque environnemental' },
                { value: 'Autre', label: 'Autre' }
              ]}
              required
              disabled={false}
            />
            
            <FormInput
              label="Activité"
              name="activite"
              type="text"
              value={formData.activite}
              onChange={handleInputChange}
              placeholder="Activité concernée par le risque"
              required
              disabled={false}
            />
            
            <FormInput
              label="Probabilité"
              name="probabilite"
              type="select"
              value={formData.probabilite}
              onChange={handleInputChange}
              options={[
                { value: 'Très faible', label: 'Très faible' },
                { value: 'Faible', label: 'Faible' },
                { value: 'Moyenne', label: 'Moyenne' },
                { value: 'Élevée', label: 'Élevée' },
                { value: 'Très élevée', label: 'Très élevée' }
              ]}
              required
              disabled={false}
            />
            
            <FormInput
              label="Gravité"
              name="gravite"
              type="select"
              value={formData.gravite}
              onChange={handleInputChange}
              options={[
                { value: 'Négligeable', label: 'Négligeable' },
                { value: 'Faible', label: 'Faible' },
                { value: 'Modérée', label: 'Modérée' },
                { value: 'Élevée', label: 'Élevée' },
                { value: 'Critique', label: 'Critique' }
              ]}
              required
              disabled={false}
            />
            
            <FormInput
              label="Niveau de risque"
              name="niveauRisque"
              type="select"
              value={formData.niveauRisque}
              onChange={handleInputChange}
              options={[
                { value: 'Faible', label: 'Faible' },
                { value: 'Modéré', label: 'Modéré' },
                { value: 'Élevé', label: 'Élevé' },
                { value: 'Critique', label: 'Critique' }
              ]}
              required
              disabled={false}
            />
            
            <FormInput
              label="Score de risque"
              name="scoreRisque"
              type="number"
              value={formData.scoreRisque}
              onChange={handleInputChange}
              min="1"
              max="25"
              required
              disabled={false}
            />
          </div>
          
          <div className="mt-6">
            <FormInput
              label="Description"
              name="description"
              type="textarea"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Description détaillée du risque..."
              required
              disabled={false}
            />
          </div>
        </div>

        {/* Section Dates et Responsable */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-xl border border-blue-100 dark:border-blue-800">
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mr-3">
              <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h4 className="text-xl font-semibold text-gray-900 dark:text-white">Dates et Responsable</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormInput
              label="Date d'identification"
              name="dateIdentification"
              type="date"
              value={formData.dateIdentification}
              onChange={handleInputChange}
              required
              disabled={false}
            />
            
            <FormInput
              label="Date d'évaluation"
              name="dateEvaluation"
              type="date"
              value={formData.dateEvaluation}
              onChange={handleInputChange}
              disabled={false}
            />
            
            <div className="space-y-4">
              <FormInput
                label="Nom du responsable"
                name="responsable.nom"
                type="text"
                value={formData.responsable.nom}
                onChange={handleInputChange}
                placeholder="Nom du responsable"
                required
                disabled={false}
              />
              
              <FormInput
                label="Prénom du responsable"
                name="responsable.prenom"
                type="text"
                value={formData.responsable.prenom}
                onChange={handleInputChange}
                placeholder="Prénom du responsable"
                required
                disabled={false}
              />
              
              <FormInput
                label="Matricule du responsable"
                name="responsable.matricule"
                type="text"
                value={formData.responsable.matricule}
                onChange={handleInputChange}
                placeholder="Matricule"
                disabled={false}
              />
            </div>
          </div>
        </div>

        {/* Section Sources et Conséquences */}
        <div className="bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 p-6 rounded-xl border border-purple-100 dark:border-purple-800">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Sources */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Sources du risque</h4>
                {!isReadOnly && (
                  <button
                    type="button"
                    onClick={addSource}
                    className="flex items-center px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter
                  </button>
                )}
              </div>
              
              {formData.sources.map((source, index) => (
                <div key={index} className="mb-4 p-3 bg-white dark:bg-gray-800 rounded-lg border border-purple-200 dark:border-purple-700">
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="font-medium text-gray-900 dark:text-white">Source {index + 1}</h5>
                    {!isReadOnly && (
                      <button
                        type="button"
                        onClick={() => removeSource(index)}
                        className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <FormInput
                    label="Description de la source"
                    name={`source.${index}`}
                    type="text"
                    value={source}
                    onChange={handleInputChange}
                    placeholder="Source du risque"
                    disabled={isReadOnly}
                  />
                </div>
              ))}
            </div>

            {/* Conséquences */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Conséquences</h4>
                {!isReadOnly && (
                  <button
                    type="button"
                    onClick={addConsequence}
                    className="flex items-center px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter
                  </button>
                )}
              </div>
              
              {formData.consequences.map((consequence, index) => (
                <div key={index} className="mb-4 p-3 bg-white dark:bg-gray-800 rounded-lg border border-purple-200 dark:border-purple-700">
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="font-medium text-gray-900 dark:text-white">Conséquence {index + 1}</h5>
                    {!isReadOnly && (
                      <button
                        type="button"
                        onClick={() => removeConsequence(index)}
                        className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <FormInput
                    label="Description de la conséquence"
                    name={`consequence.${index}`}
                    type="text"
                    value={consequence}
                    onChange={handleInputChange}
                    placeholder="Conséquence du risque"
                    disabled={isReadOnly}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Section Mesures */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-6 rounded-xl border border-green-100 dark:border-green-800">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Mesures Préventives */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Mesures Préventives</h4>
                {!isReadOnly && (
                  <button
                    type="button"
                    onClick={addMesurePreventive}
                    className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter
                  </button>
                )}
              </div>
              
              {formData.mesuresPreventives.map((mesure, index) => (
                <div key={index} className="mb-4 p-3 bg-white dark:bg-gray-800 rounded-lg border border-green-200 dark:border-green-700">
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="font-medium text-gray-900 dark:text-white">Mesure {index + 1}</h5>
                    {!isReadOnly && (
                      <button
                        type="button"
                        onClick={() => removeMesurePreventive(index)}
                        className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <FormInput
                      label="Description"
                      name={`mesurePreventive.${index}.description`}
                      type="text"
                      value={mesure.description}
                      onChange={handleInputChange}
                      placeholder="Description de la mesure"
                      disabled={false}
                    />
                    <FormInput
                      label="Type"
                      name={`mesurePreventive.${index}.type`}
                      type="select"
                      value={mesure.type}
                      onChange={handleInputChange}
                      options={[
                        { value: 'Prévention', label: 'Prévention' },
                        { value: 'Protection', label: 'Protection' },
                        { value: 'Formation', label: 'Formation' },
                        { value: 'Organisationnelle', label: 'Organisationnelle' }
                      ]}
                      disabled={false}
                    />
                    <FormInput
                      label="Responsable"
                      name={`mesurePreventive.${index}.responsable`}
                      type="text"
                      value={mesure.responsable}
                      onChange={handleInputChange}
                      placeholder="Responsable de la mesure"
                      disabled={false}
                    />
                    <FormInput
                      label="Date d'échéance"
                      name={`mesurePreventive.${index}.dateEcheance`}
                      type="date"
                      value={mesure.dateEcheance}
                      onChange={handleInputChange}
                      disabled={false}
                    />
                    <FormInput
                      label="Statut"
                      name={`mesurePreventive.${index}.statut`}
                      type="select"
                      value={mesure.statut}
                      onChange={handleInputChange}
                      options={[
                        { value: 'À faire', label: 'À faire' },
                        { value: 'En cours', label: 'En cours' },
                        { value: 'Terminé', label: 'Terminé' },
                        { value: 'En retard', label: 'En retard' }
                      ]}
                      disabled={false}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Mesures Correctives */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Mesures Correctives</h4>
                {!isReadOnly && (
                  <button
                    type="button"
                    onClick={addMesureCorrective}
                    className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter
                  </button>
                )}
              </div>
              
              {formData.mesuresCorrectives.map((mesure, index) => (
                <div key={index} className="mb-4 p-3 bg-white dark:bg-gray-800 rounded-lg border border-green-200 dark:border-green-700">
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="font-medium text-gray-900 dark:text-white">Mesure {index + 1}</h5>
                    {!isReadOnly && (
                      <button
                        type="button"
                        onClick={() => removeMesureCorrective(index)}
                        className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <FormInput
                      label="Description"
                      name={`mesureCorrective.${index}.description`}
                      type="text"
                      value={mesure.description}
                      onChange={handleInputChange}
                      placeholder="Description de la mesure"
                      disabled={false}
                    />
                    <FormInput
                      label="Type"
                      name={`mesureCorrective.${index}.type`}
                      type="select"
                      value={mesure.type}
                      onChange={handleInputChange}
                      options={[
                        { value: 'Élimination', label: 'Élimination' },
                        { value: 'Substitution', label: 'Substitution' },
                        { value: 'Protection collective', label: 'Protection collective' },
                        { value: 'Protection individuelle', label: 'Protection individuelle' },
                        { value: 'Formation', label: 'Formation' },
                        { value: 'Organisationnelle', label: 'Organisationnelle' }
                      ]}
                      disabled={false}
                    />
                    <FormInput
                      label="Responsable"
                      name={`mesureCorrective.${index}.responsable`}
                      type="text"
                      value={mesure.responsable}
                      onChange={handleInputChange}
                      placeholder="Responsable de la mesure"
                      disabled={false}
                    />
                    <FormInput
                      label="Date d'échéance"
                      name={`mesureCorrective.${index}.dateEcheance`}
                      type="date"
                      value={mesure.dateEcheance}
                      onChange={handleInputChange}
                      disabled={false}
                    />
                    <FormInput
                      label="Statut"
                      name={`mesureCorrective.${index}.statut`}
                      type="select"
                      value={mesure.statut}
                      onChange={handleInputChange}
                      options={[
                        { value: 'À faire', label: 'À faire' },
                        { value: 'En cours', label: 'En cours' },
                        { value: 'Terminé', label: 'Terminé' },
                        { value: 'En retard', label: 'En retard' }
                      ]}
                      disabled={false}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Section Indicateurs */}
        <div className="bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 p-6 rounded-xl border border-teal-100 dark:border-teal-800">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900 rounded-lg flex items-center justify-center mr-3">
                <TrendingUp className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 dark:text-white">Indicateurs de Suivi</h4>
            </div>
            {!isReadOnly && (
              <button
                type="button"
                onClick={addIndicateur}
                className="flex items-center px-3 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors duration-200"
              >
                <Plus className="w-4 h-4 mr-2" />
                Ajouter
              </button>
            )}
          </div>
          
          {formData.indicateurs.map((indicateur, index) => (
            <div key={index} className="mb-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-teal-200 dark:border-teal-700">
              <div className="flex items-center justify-between mb-4">
                <h5 className="font-medium text-gray-900 dark:text-white">Indicateur {index + 1}</h5>
                {!isReadOnly && (
                  <button
                    type="button"
                    onClick={() => removeIndicateur(index)}
                    className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <FormInput
                  label="Nom"
                  name={`indicateur.${index}.nom`}
                  type="text"
                  value={indicateur.nom}
                  onChange={handleInputChange}
                  placeholder="Nom de l'indicateur"
                  disabled={false}
                />
                <FormInput
                  label="Valeur actuelle"
                  name={`indicateur.${index}.valeur`}
                  type="text"
                  value={indicateur.valeur}
                  onChange={handleInputChange}
                  placeholder="Valeur"
                  disabled={false}
                />
                <FormInput
                  label="Seuil d'alerte"
                  name={`indicateur.${index}.seuil`}
                  type="text"
                  value={indicateur.seuil}
                  onChange={handleInputChange}
                  placeholder="Seuil"
                  disabled={false}
                />
                <FormInput
                  label="Unité"
                  name={`indicateur.${index}.unite`}
                  type="text"
                  value={indicateur.unite}
                  onChange={handleInputChange}
                  placeholder="Unité"
                  disabled={false}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Boutons d'action */}
        {!isReadOnly && (
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            <FormButton
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Annuler
            </FormButton>
            <FormButton
              type="submit"
              variant="primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Enregistrement...' : mode === 'create' ? 'Créer le risque' : 'Modifier le risque'}
            </FormButton>
          </div>
        )}

        {isReadOnly && (
          <div className="flex justify-end pt-6 border-t border-gray-200 dark:border-gray-700">
            <FormButton
              type="button"
              variant="primary"
              onClick={onClose}
            >
              Fermer
            </FormButton>
          </div>
        )}
      </form>
    </Modal>
  );
}
