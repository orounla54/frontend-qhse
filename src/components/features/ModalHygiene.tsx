import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import FormInput from '../common/FormInput';
import FormButton from '../common/FormButton';
import { 
  Droplets, 
  Calendar, 
  Users, 
  CheckCircle,
  AlertTriangle,
  FileText,
  Plus,
  Trash2
} from 'lucide-react';

// Interface TypeScript
interface Hygiene {
  _id: string;
  numero: string;
  titre: string;
  description: string;
  type: string;
  statut: string;
  zone: {
    nom: string;
  };
  evaluation: {
    statut: string;
    score: number;
  };
  datePlanification: string;
  responsable: {
    nom: string;
    prenom: string;
  };
  pointsControle: Array<{
    nom: string;
    statut: string;
    observations: string;
  }>;
  actions: Array<{
    description: string;
    responsable: string;
    echeance: string;
  }>;
}

interface ModalHygieneProps {
  isOpen: boolean;
  onClose: () => void;
  hygiene?: Hygiene | null;
  mode: 'create' | 'edit' | 'view';
  onSubmit: (hygiene: any) => void;
}

export default function ModalHygiene({ 
  isOpen, 
  onClose, 
  hygiene, 
  mode, 
  onSubmit 
}: ModalHygieneProps) {
  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    type: '',
    statut: 'Planifie',
    zone: {
      nom: ''
    },
    evaluation: {
      statut: 'En attente',
      score: 0
    },
    datePlanification: '',
    responsable: {
      nom: '',
      prenom: ''
    },
    pointsControle: [{ nom: '', statut: 'En attente', observations: '' }],
    actions: [{ description: '', responsable: '', echeance: '' }]
  });

  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const isReadOnly = mode === 'view';
  console.log('Modal mode:', mode, 'isReadOnly:', isReadOnly);

  // Initialiser les données du formulaire
  useEffect(() => {
    if (hygiene && mode === 'edit') {
      setFormData({
        titre: hygiene.titre || '',
        description: hygiene.description || '',
        type: hygiene.type || '',
        statut: hygiene.statut || 'Planifie',
        zone: {
          nom: hygiene.zone?.nom || ''
        },
        evaluation: {
          statut: hygiene.evaluation?.statut || 'En attente',
          score: hygiene.evaluation?.score || 0
        },
        datePlanification: hygiene.datePlanification ? hygiene.datePlanification.split('T')[0] : '',
        responsable: {
          nom: hygiene.responsable?.nom || '',
          prenom: hygiene.responsable?.prenom || ''
        },
        pointsControle: hygiene.pointsControle || [{ nom: '', statut: 'En attente', observations: '' }],
        actions: hygiene.actions || [{ description: '', responsable: '', echeance: '' }]
      });
    } else if (mode === 'create') {
      resetForm();
    }
  }, [hygiene, mode]);

  const resetForm = () => {
    setFormData({
      titre: '',
      description: '',
      type: '',
      statut: 'Planifie',
      zone: { nom: '' },
      evaluation: { statut: 'En attente', score: 0 },
      datePlanification: '',
      responsable: { nom: '', prenom: '' },
      pointsControle: [{ nom: '', statut: 'En attente', observations: '' }],
      actions: [{ description: '', responsable: '', echeance: '' }]
    });
    setValidationErrors([]);
    setShowSuccessMessage(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    console.log('Input change:', { name, value });
    
    if (name.startsWith('pointControle.')) {
      const parts = name.split('.');
      const index = parseInt(parts[1]);
      const field = parts[2] as keyof typeof formData.pointsControle[0];
      const newPoints = [...formData.pointsControle];
      newPoints[index][field] = value;
      setFormData(prev => ({
        ...prev,
        pointsControle: newPoints
      }));
    } else if (name.startsWith('action.')) {
      const parts = name.split('.');
      const index = parseInt(parts[1]);
      const field = parts[2] as keyof typeof formData.actions[0];
      const newActions = [...formData.actions];
      newActions[index][field] = value;
      setFormData(prev => ({
        ...prev,
        actions: newActions
      }));
    } else if (name.includes('.')) {
      const [parent, child] = name.split('.');
      
      if (parent === 'zone') {
        setFormData(prev => ({
          ...prev,
          zone: { ...prev.zone, [child]: value }
        }));
      } else if (parent === 'evaluation') {
        setFormData(prev => ({
          ...prev,
          evaluation: { ...prev.evaluation, [child]: child === 'score' ? Number(value) : value }
        }));
      } else if (parent === 'responsable') {
        setFormData(prev => ({
          ...prev,
          responsable: { ...prev.responsable, [child]: value }
        }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const addPointControle = () => {
    setFormData(prev => ({
      ...prev,
      pointsControle: [...prev.pointsControle, { nom: '', statut: 'En attente', observations: '' }]
    }));
  };

  const removePointControle = (index: number) => {
    setFormData(prev => ({
      ...prev,
      pointsControle: prev.pointsControle.filter((_, i) => i !== index)
    }));
  };

  const addAction = () => {
    setFormData(prev => ({
      ...prev,
      actions: [...prev.actions, { description: '', responsable: '', echeance: '' }]
    }));
  };

  const removeAction = (index: number) => {
    setFormData(prev => ({
      ...prev,
      actions: prev.actions.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const errors: string[] = [];
    
    if (!formData.titre.trim()) errors.push('Le titre est obligatoire');
    if (!formData.description.trim()) errors.push('La description est obligatoire');
    if (!formData.type) errors.push('Le type de contrôle est obligatoire');
    if (!formData.datePlanification) errors.push('La date de planification est obligatoire');
    if (!formData.responsable.nom.trim()) errors.push('Le nom du responsable est obligatoire');
    if (!formData.responsable.prenom.trim()) errors.push('Le prénom du responsable est obligatoire');
    
    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      console.log('Données à envoyer:', formData);
      await onSubmit(formData);
      setShowSuccessMessage(true);
      
      setTimeout(() => {
        onClose();
        resetForm();
      }, 1500);
      
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getModalTitle = () => {
    switch (mode) {
      case 'create': return 'Nouveau Contrôle d\'Hygiène';
      case 'edit': return 'Modifier le Contrôle d\'Hygiène';
      case 'view': return 'Détails du Contrôle d\'Hygiène';
      default: return 'Contrôle d\'Hygiène';
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={getModalTitle()}
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Message de succès */}
        {showSuccessMessage && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mr-3" />
              <p className="text-green-800 dark:text-green-200">
                {mode === 'create' ? 'Contrôle d\'hygiène créé avec succès!' : 'Contrôle d\'hygiène modifié avec succès!'}
              </p>
            </div>
          </div>
        )}

        {/* Erreurs de validation */}
        {validationErrors.length > 0 && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mr-3 mt-0.5" />
              <div>
                <h4 className="text-red-800 dark:text-red-200 font-medium">Erreurs de validation</h4>
                <ul className="text-red-600 dark:text-red-300 text-sm mt-1 list-disc list-inside">
                  {validationErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Informations générales */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-xl border border-blue-100 dark:border-blue-800">
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mr-3">
              <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h4 className="text-xl font-semibold text-gray-900 dark:text-white">Informations générales</h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Titre du contrôle"
              name="titre"
              type="text"
              value={formData.titre}
              onChange={handleInputChange}
              placeholder="Ex: Contrôle hygiène cuisine"
              required
              disabled={isReadOnly}
            />
            
            <FormInput
              label="Type de contrôle"
              name="type"
              type="select"
              value={formData.type}
              onChange={handleInputChange}
              options={[
                { value: '', label: 'Sélectionner un type' },
                { value: 'Routine', label: 'Routine' },
                { value: 'Exceptionnel', label: 'Exceptionnel' },
                { value: 'Audit', label: 'Audit' },
                { value: 'Inspection', label: 'Inspection' }
              ]}
              required
              disabled={isReadOnly}
            />
            
            <FormInput
              label="Zone contrôlée"
              name="zone.nom"
              type="text"
              value={formData.zone.nom}
              onChange={handleInputChange}
              placeholder="Ex: Cuisine, Atelier, Bureau"
              disabled={isReadOnly}
            />
            
            <FormInput
              label="Statut"
              name="statut"
              type="select"
              value={formData.statut}
              onChange={handleInputChange}
              options={[
                { value: 'Planifie', label: 'Planifié' },
                { value: 'En cours', label: 'En cours' },
                { value: 'Termine', label: 'Terminé' },
                { value: 'Reporte', label: 'Reporté' }
              ]}
              disabled={isReadOnly}
            />
            
            <div className="md:col-span-2">
              <FormInput
                label="Description"
                name="description"
                type="textarea"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Description détaillée du contrôle"
                required
                disabled={isReadOnly}
              />
            </div>
          </div>
        </div>

        {/* Planification */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-6 rounded-xl border border-green-100 dark:border-green-800">
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mr-3">
              <Calendar className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <h4 className="text-xl font-semibold text-gray-900 dark:text-white">Planification</h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Date de planification"
              name="datePlanification"
              type="date"
              value={formData.datePlanification}
              onChange={handleInputChange}
              required
              disabled={isReadOnly}
            />
            
            <FormInput
              label="Statut d'évaluation"
              name="evaluation.statut"
              type="select"
              value={formData.evaluation.statut}
              onChange={handleInputChange}
              options={[
                { value: 'En attente', label: 'En attente' },
                { value: 'Conforme', label: 'Conforme' },
                { value: 'Non conforme', label: 'Non conforme' },
                { value: 'Partiellement conforme', label: 'Partiellement conforme' }
              ]}
              disabled={isReadOnly}
            />
          </div>
        </div>

        {/* Responsable */}
        <div className="bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 p-6 rounded-xl border border-purple-100 dark:border-purple-800">
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mr-3">
              <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <h4 className="text-xl font-semibold text-gray-900 dark:text-white">Responsable</h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Prénom"
              name="responsable.prenom"
              type="text"
              value={formData.responsable.prenom}
              onChange={handleInputChange}
              placeholder="Prénom du responsable"
              required
              disabled={isReadOnly}
            />
            
            <FormInput
              label="Nom"
              name="responsable.nom"
              type="text"
              value={formData.responsable.nom}
              onChange={handleInputChange}
              placeholder="Nom du responsable"
              required
              disabled={isReadOnly}
            />
          </div>
        </div>

        {/* Points de contrôle */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 p-6 rounded-xl border border-amber-100 dark:border-amber-800">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900 rounded-lg flex items-center justify-center mr-3">
                <Droplets className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 dark:text-white">Points de contrôle</h4>
            </div>
            {!isReadOnly && (
              <button
                type="button"
                onClick={addPointControle}
                className="flex items-center text-blue-600 hover:text-blue-800 text-sm"
              >
                <Plus className="w-4 h-4 mr-1" />
                Ajouter un point
              </button>
            )}
          </div>
          
          <div className="space-y-4">
            {formData.pointsControle.map((_, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-3">
                  <h5 className="font-medium text-gray-900 dark:text-white">Point {index + 1}</h5>
                  {!isReadOnly && formData.pointsControle.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removePointControle(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormInput
                    label="Nom du point"
                    name={`pointControle.${index}.nom`}
                    type="text"
                    value={formData.pointsControle[index].nom}
                    onChange={handleInputChange}
                    placeholder="Ex: Nettoyage des surfaces"
                    disabled={false}
                  />
                   
                  <FormInput
                    label="Statut"
                    name={`pointControle.${index}.statut`}
                    type="select"
                    value={formData.pointsControle[index].statut}
                    onChange={handleInputChange}
                    options={[
                      { value: 'En attente', label: 'En attente' },
                      { value: 'Conforme', label: 'Conforme' },
                      { value: 'Non conforme', label: 'Non conforme' }
                    ]}
                    disabled={isReadOnly}
                  />
                  <FormInput
                    label="Observations"
                    name={`pointControle.${index}.observations`}
                    type="textarea"
                    value={formData.pointsControle[index].observations || ''}
                    onChange={handleInputChange}
                    placeholder="Observations"
                    disabled={false}
                    rows={2}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions correctives */}
        <div className="bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 p-6 rounded-xl border border-teal-100 dark:border-teal-800">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900 rounded-lg flex items-center justify-center mr-3">
                <CheckCircle className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 dark:text-white">Actions correctives</h4>
            </div>
            {!isReadOnly && (
              <button
                type="button"
                onClick={addAction}
                className="flex items-center text-blue-600 hover:text-blue-800 text-sm"
              >
                <Plus className="w-4 h-4 mr-1" />
                Ajouter une action
              </button>
            )}
          </div>
          
          <div className="space-y-4">
            {formData.actions.map((_, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-3">
                  <h5 className="font-medium text-gray-900 dark:text-white">Action {index + 1}</h5>
                  {!isReadOnly && formData.actions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeAction(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormInput
                    label="Description"
                    name={`action.${index}.description`}
                    type="textarea"
                    value={formData.actions[index].description || ''}
                    onChange={handleInputChange}
                    placeholder="Description de l'action"
                    disabled={false}
                    rows={2}
                  />
                  <FormInput
                    label="Responsable"
                    name={`action.${index}.responsable`}
                    type="text"
                    value={formData.actions[index].responsable}
                    onChange={handleInputChange}
                    placeholder="Responsable de l'action"
                    disabled={isReadOnly}
                  />
                  <FormInput
                    label="Échéance"
                    name={`action.${index}.echeance`}
                    type="date"
                    value={formData.actions[index].echeance}
                    onChange={handleInputChange}
                    disabled={isReadOnly}
                  />
                </div>
              </div>
            ))}
          </div>
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
              {isSubmitting ? 'Enregistrement...' : mode === 'create' ? 'Créer le contrôle' : 'Modifier le contrôle'}
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