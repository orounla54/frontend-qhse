import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import FormInput from '../common/FormInput';
import FormButton from '../common/FormButton';
import { 
  GraduationCap, 
  Users, 
  Calendar, 
  Plus, 
  Trash2,
  AlertCircle,
  CheckCircle,
  BookOpen,
  Award,
  Target
} from 'lucide-react';

// Interfaces TypeScript
interface Formation {
  _id: string;
  numero: string;
  titre: string;
  description: string;
  type: string;
  categorie: string;
  statut: string;
  priorite: string;
  duree: number;
  datePlanification: string;
  dateDebut: string;
  dateFin: string;
  lieu: string;
  formateur: {
    nom: string;
    prenom: string;
    specialite: string;
  };
  participants: Array<{
    employe: {
      _id?: string;
      nom?: string;
      prenom?: string;
      matricule?: string;
    };
    statut: string;
    evaluation?: {
      note?: number;
      commentaires?: string;
    };
  }>;
  objectifs: Array<{
    description: string;
    type: string;
  }>;
  prerequis: Array<string>;
  materiel: Array<string>;
  evaluation: {
    type: string;
    criteres: Array<string>;
    seuilReussite: number;
  };
  documents: Array<{
    nom: string;
    type: string;
    url: string;
    dateUpload: string;
  }>;
  createdBy: {
    nom: string;
    prenom: string;
  };
}

interface ModalFormationProps {
  isOpen: boolean;
  onClose: () => void;
  formation?: Formation | null;
  mode: 'create' | 'edit' | 'view';
  onSubmit: (formation: Partial<Formation>) => void;
}

export default function ModalFormation({ 
  isOpen, 
  onClose, 
  formation, 
  mode, 
  onSubmit 
}: ModalFormationProps) {
  const [formData, setFormData] = useState({
    numero: '',
    titre: '',
    description: '',
    type: '',
    categorie: '',
    priorite: '',
    niveau: '',
    duree: 0,
    datePlanification: '',
    dateDebut: '',
    dateFin: '',
    lieu: '',
    formateur: { nom: '', prenom: '', specialite: '' },
    participants: [{ employe: { _id: '', nom: '', prenom: '', matricule: '' }, statut: 'Inscrit', evaluation: { note: 0, commentaires: '' } }],
    objectifs: [{ description: '', type: 'Connaissance' }],
    prerequis: [''],
    materiel: [''],
    evaluation: { type: '', criteres: [''], seuilReussite: 70 },
    documents: [{ nom: '', type: '', url: '', dateUpload: '' }]
  });

  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Initialiser les données du formulaire
  useEffect(() => {
    if (formation && mode === 'edit') {
      setFormData({
        numero: formation.numero || '',
        titre: formation.titre || '',
        description: formation.description || '',
        type: formation.type || '',
        categorie: (formation as any).categorie || '',
        priorite: formation.priorite || '',
        niveau: (formation as any).niveau || '',
        duree: formation.duree || 0,
        datePlanification: formation.datePlanification || '',
        dateDebut: formation.dateDebut || '',
        dateFin: formation.dateFin || '',
        lieu: formation.lieu || '',
        formateur: formation.formateur || { nom: '', prenom: '', specialite: '' },
        participants: formation.participants?.map(p => ({
          employe: {
            _id: p.employe?._id || '',
            nom: p.employe?.nom || '',
            prenom: p.employe?.prenom || '',
            matricule: p.employe?.matricule || ''
          },
          statut: p.statut || 'Inscrit',
          evaluation: {
            note: p.evaluation?.note || 0,
            commentaires: p.evaluation?.commentaires || ''
          }
        })) || [{ employe: { _id: '', nom: '', prenom: '', matricule: '' }, statut: 'Inscrit', evaluation: { note: 0, commentaires: '' } }],
        objectifs: (formation as any).objectifs && (formation as any).objectifs.length > 0 
          ? (formation as any).objectifs.map((obj: any) => typeof obj === 'string' ? { description: obj, type: 'Connaissance' } : obj)
          : [{ description: '', type: 'Connaissance' }],
        prerequis: (formation as any).prerequis && (formation as any).prerequis.length > 0 ? (formation as any).prerequis : [''],
        materiel: (formation as any).materiel && (formation as any).materiel.length > 0 ? (formation as any).materiel : [''],
        evaluation: (formation as any).evaluation ? {
          ...(formation as any).evaluation,
          criteres: (formation as any).evaluation.criteres && (formation as any).evaluation.criteres.length > 0 ? (formation as any).evaluation.criteres : ['']
        } : { type: '', criteres: [''], seuilReussite: 70 },
        documents: (formation as any).documents || [{ nom: '', type: '', url: '', dateUpload: '' }]
      });
    } else if (mode === 'create') {
      resetForm();
    }
  }, [formation, mode]);

  const resetForm = () => {
    setFormData({
      numero: '',
      titre: '',
      description: '',
      type: '',
      categorie: '',
      priorite: '',
      niveau: '',
      duree: 0,
      datePlanification: '',
      dateDebut: '',
      dateFin: '',
      lieu: '',
      formateur: { nom: '', prenom: '', specialite: '' },
      participants: [{ employe: { _id: '', nom: '', prenom: '', matricule: '' }, statut: 'Inscrit', evaluation: { note: 0, commentaires: '' } }],
      objectifs: [{ description: '', type: 'Connaissance' }],
      prerequis: [''],
      materiel: [''],
      evaluation: { type: '', criteres: [''], seuilReussite: 70 },
      documents: [{ nom: '', type: '', url: '', dateUpload: '' }]
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('participant.')) {
      const parts = name.split('.');
      const index = parseInt(parts[1]);
      const field = parts[2];
      const newParticipants = [...formData.participants];
      if (field === 'statut') {
        newParticipants[index] = { ...newParticipants[index], [field]: value };
      } else if (field === 'score') {
        newParticipants[index] = { 
          ...newParticipants[index], 
          evaluation: { 
            ...newParticipants[index].evaluation, 
            note: parseInt(value) || 0
          }
        };
      } else if (field === 'commentaires') {
        newParticipants[index] = { 
          ...newParticipants[index], 
          evaluation: { 
            ...newParticipants[index].evaluation, 
            commentaires: value
          }
        };
      } else if (field === 'nom' || field === 'prenom' || field === 'matricule' || field === '_id') {
        newParticipants[index] = { 
          ...newParticipants[index], 
          employe: { 
            ...newParticipants[index].employe, 
            [field]: value 
          }
        };
      }
      setFormData(prev => ({ ...prev, participants: newParticipants }));
    } else if (name.startsWith('objectif.')) {
      const index = parseInt(name.split('.')[1]);
      const newObjectifs = [...formData.objectifs];
      newObjectifs[index] = { ...newObjectifs[index], description: value };
      setFormData(prev => ({ ...prev, objectifs: newObjectifs }));
    } else if (name.startsWith('prerequis.')) {
      const index = parseInt(name.split('.')[1]);
      const newPrerequis = [...formData.prerequis];
      newPrerequis[index] = value;
      setFormData(prev => ({ ...prev, prerequis: newPrerequis }));
    } else if (name.startsWith('materiel.')) {
      const index = parseInt(name.split('.')[1]);
      const newMateriel = [...formData.materiel];
      newMateriel[index] = value;
      setFormData(prev => ({ ...prev, materiel: newMateriel }));
    } else if (name.startsWith('critere.')) {
      const index = parseInt(name.split('.')[1]);
      const newCriteres = [...formData.evaluation.criteres];
      newCriteres[index] = value;
      setFormData(prev => ({ 
        ...prev, 
        evaluation: { ...prev.evaluation, criteres: newCriteres }
      }));
    } else if (name.includes('.')) {
      const [parent, child] = name.split('.');
      
      if (parent === 'formateur') {
        setFormData(prev => ({
          ...prev,
          formateur: {
            ...prev.formateur,
            [child]: value
          }
        }));
      } else if (parent === 'evaluation') {
        setFormData(prev => ({
          ...prev,
          evaluation: {
            ...prev.evaluation,
            [child]: value
          }
        }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const addParticipant = () => {
    setFormData(prev => ({
      ...prev,
      participants: [...prev.participants, { 
        employe: { _id: '', nom: '', prenom: '', matricule: '' }, 
        statut: 'Inscrit', 
        evaluation: { note: 0, commentaires: '' }
      }]
    }));
  };

  const removeParticipant = (index: number) => {
    setFormData(prev => ({
      ...prev,
      participants: prev.participants.filter((_, i) => i !== index)
    }));
  };

  const addObjectif = () => {
    setFormData(prev => ({
      ...prev,
      objectifs: [...prev.objectifs, { description: '', type: 'Connaissance' }]
    }));
  };

  const removeObjectif = (index: number) => {
    setFormData(prev => ({
      ...prev,
      objectifs: prev.objectifs.filter((_, i) => i !== index)
    }));
  };

  const addPrerequis = () => {
    setFormData(prev => ({
      ...prev,
      prerequis: [...prev.prerequis, '']
    }));
  };

  const removePrerequis = (index: number) => {
    setFormData(prev => ({
      ...prev,
      prerequis: prev.prerequis.filter((_, i) => i !== index)
    }));
  };

  const addMateriel = () => {
    setFormData(prev => ({
      ...prev,
      materiel: [...prev.materiel, '']
    }));
  };

  const removeMateriel = (index: number) => {
    setFormData(prev => ({
      ...prev,
      materiel: prev.materiel.filter((_, i) => i !== index)
    }));
  };

  const addCritere = () => {
    setFormData(prev => ({
      ...prev,
      evaluation: { ...prev.evaluation, criteres: [...prev.evaluation.criteres, ''] }
    }));
  };

  const removeCritere = (index: number) => {
    setFormData(prev => ({
      ...prev,
      evaluation: { 
        ...prev.evaluation, 
        criteres: prev.evaluation.criteres.filter((_, i) => i !== index)
      }
    }));
  };


  const validateForm = () => {
    const errors: string[] = [];
    
    if (!formData.titre.trim()) errors.push('Le titre de la formation est requis');
    if (!formData.description.trim()) errors.push('La description de la formation est requise');
    if (!formData.type) errors.push('Le type de formation est requis');
    if (!formData.categorie) errors.push('La catégorie de formation est requise');
    if (!formData.priorite) errors.push('La priorité de la formation est requise');
    if (!formData.duree || formData.duree <= 0) errors.push('La durée doit être supérieure à 0 heure');
    if (formData.duree > 40) errors.push('La durée ne peut pas dépasser 40 heures');
    if (!formData.datePlanification) errors.push('La date de planification est requise');
    if (!formData.lieu) errors.push('Le lieu de la formation est requis');
    if (!formData.formateur.nom.trim()) errors.push('Le nom du formateur est requis');
    if (!formData.formateur.prenom.trim()) errors.push('Le prénom du formateur est requis');
    
    // Validation des objectifs
    const objectifsValides = formData.objectifs.filter(obj => obj.description.trim());
    if (objectifsValides.length === 0) errors.push('Au moins un objectif de formation est requis');
    
    // Validation des participants (ID employé optionnel en attendant le workflow RH)
    // Note: L'ID employé n'est plus obligatoire temporairement
    const participantsAvecNom = formData.participants.filter(p => 
      p.employe?.nom?.trim() && p.employe?.prenom?.trim()
    );
    if (formData.participants.length > 0 && participantsAvecNom.length === 0) {
      errors.push('Au moins un participant avec nom et prénom est requis.');
    }
    
    setValidationErrors(errors);
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (errors.length > 0) return;
    
    setIsSubmitting(true);
    
    try {
      // Transformer les données pour correspondre au modèle backend
      const transformedData = {
        ...formData,
        // Générer un numéro automatiquement si pas fourni
        numero: formData.numero || `FORM-${new Date().getFullYear()}-${Date.now()}`,
        // Transformer les objectifs en objets avec description et type
        objectifs: formData.objectifs
          .filter(obj => obj.description.trim())
          .map(obj => ({
            description: obj.description,
            type: obj.type || 'Connaissance'
          })),
        // Transformer les participants - seulement ceux avec un ObjectId valide
        participants: formData.participants
          .filter(p => (p.employe as any)._id && (p.employe as any)._id.match(/^[0-9a-fA-F]{24}$/))
          .map(p => ({
            employe: (p.employe as any)._id, // Utiliser seulement l'ObjectId valide
            statut: p.statut || 'Inscrit',
            evaluation: {
              note: p.evaluation?.note || 0,
              commentaires: p.evaluation?.commentaires || ''
            }
          }))
      };
      
      await onSubmit(transformedData);
      setShowSuccessMessage(true);
      
      // Afficher un message de confirmation avec le nombre de participants valides
      const participantsValides = transformedData.participants.length;
      console.log(`Formation ${mode === 'create' ? 'créée' : 'modifiée'} avec succès ! ${participantsValides} participant(s) enregistré(s).`);
      
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
      case 'create': return 'Nouvelle Formation';
      case 'edit': return 'Modifier la Formation';
      case 'view': return 'Détails de la Formation';
      default: return 'Formation';
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
                {mode === 'create' ? 'Formation créée avec succès !' : 'Formation modifiée avec succès !'}
              </span>
            </div>
          </div>
        )}

        {/* Section Informations générales */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-xl border border-blue-100 dark:border-blue-800">
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mr-3">
              <GraduationCap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h4 className="text-xl font-semibold text-gray-900 dark:text-white">Informations Générales</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormInput
              label="Numéro de formation"
              name="numero"
              type="text"
              value={formData.numero}
              onChange={handleInputChange}
              placeholder="Auto-généré si vide"
              disabled={isReadOnly}
            />
            
            <FormInput
              label="Titre de la formation"
              name="titre"
              type="text"
              value={formData.titre}
              onChange={handleInputChange}
              placeholder="Ex: Formation Sécurité au Travail"
              required
              disabled={isReadOnly}
            />
            
            <FormInput
              label="Type de formation"
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
              disabled={isReadOnly}
            />
            
            <FormInput
              label="Catégorie"
              name="categorie"
              type="select"
              value={formData.categorie}
              onChange={handleInputChange}
              options={[
                { value: 'Formation initiale', label: 'Formation initiale' },
                { value: 'Formation continue', label: 'Formation continue' },
                { value: 'Recyclage', label: 'Recyclage' },
                { value: 'Formation spécifique', label: 'Formation spécifique' },
                { value: 'Sensibilisation', label: 'Sensibilisation' }
              ]}
              required
              disabled={isReadOnly}
            />
            
            <FormInput
              label="Priorité"
              name="priorite"
              type="select"
              value={formData.priorite}
              onChange={handleInputChange}
              options={[
                { value: 'Basse', label: 'Basse' },
                { value: 'Normale', label: 'Normale' },
                { value: 'Haute', label: 'Haute' },
                { value: 'Critique', label: 'Critique' }
              ]}
              required
              disabled={isReadOnly}
            />
            
            <FormInput
              label="Niveau"
              name="niveau"
              type="select"
              value={formData.niveau}
              onChange={handleInputChange}
              options={[
                { value: 'Débutant', label: 'Débutant' },
                { value: 'Intermédiaire', label: 'Intermédiaire' },
                { value: 'Avancé', label: 'Avancé' },
                { value: 'Expert', label: 'Expert' }
              ]}
              required
              disabled={isReadOnly}
            />
            
            <FormInput
              label="Durée (heures)"
              name="duree"
              type="number"
              value={formData.duree}
              onChange={handleInputChange}
              placeholder="Ex: 8"
              min="1"
              max="40"
              required
              disabled={isReadOnly}
            />
          </div>
          
          <div className="mt-6">
            <FormInput
              label="Description"
              name="description"
              type="textarea"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Décrivez les objectifs pédagogiques, le contenu et les compétences visées par cette formation..."
              required
              disabled={isReadOnly}
            />
          </div>
        </div>

        {/* Section Planning et Lieu */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-6 rounded-xl border border-green-100 dark:border-green-800">
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mr-3">
              <Calendar className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <h4 className="text-xl font-semibold text-gray-900 dark:text-white">Planning et Lieu</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
              label="Date de début"
              name="dateDebut"
              type="date"
              value={formData.dateDebut}
              onChange={handleInputChange}
              disabled={isReadOnly}
            />
            
            <FormInput
              label="Date de fin"
              name="dateFin"
              type="date"
              value={formData.dateFin}
              onChange={handleInputChange}
              disabled={isReadOnly}
            />
            
            <FormInput
              label="Lieu"
              name="lieu"
              type="select"
              value={formData.lieu}
              onChange={handleInputChange}
              options={[
                { value: 'Interne', label: 'Interne' },
                { value: 'Externe', label: 'Externe' },
                { value: 'Virtuel', label: 'Virtuel' }
              ]}
              required
              disabled={isReadOnly}
            />
          </div>
        </div>

        {/* Section Formateur */}
        <div className="bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 p-6 rounded-xl border border-purple-100 dark:border-purple-800">
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mr-3">
              <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <h4 className="text-xl font-semibold text-gray-900 dark:text-white">Formateur</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormInput
              label="Nom du formateur"
              name="formateur.nom"
              type="text"
              value={formData.formateur.nom}
              onChange={handleInputChange}
              placeholder="Ex: Martin"
              required
              disabled={isReadOnly}
            />
            
            <FormInput
              label="Prénom du formateur"
              name="formateur.prenom"
              type="text"
              value={formData.formateur.prenom}
              onChange={handleInputChange}
              placeholder="Ex: Jean"
              required
              disabled={isReadOnly}
            />
            
            <FormInput
              label="Spécialité"
              name="formateur.specialite"
              type="text"
              value={formData.formateur.specialite}
              onChange={handleInputChange}
              placeholder="Ex: Sécurité Industrielle, Qualité ISO 9001"
              disabled={isReadOnly}
            />
          </div>
        </div>

        {/* Section Objectifs */}
        <div className="bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 p-6 rounded-xl border border-yellow-100 dark:border-yellow-800">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center mr-3">
                <Target className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 dark:text-white">Objectifs</h4>
            </div>
            {!isReadOnly && (
              <button
                type="button"
                onClick={addObjectif}
                className="flex items-center px-3 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors duration-200"
              >
                <Plus className="w-4 h-4 mr-2" />
                Ajouter
              </button>
            )}
          </div>
          
          {formData.objectifs.map((objectif, index) => (
            <div key={index} className="mb-4 flex items-center space-x-3">
              <FormInput
                label={`Objectif ${index + 1}`}
                name={`objectif.${index}`}
                type="text"
                value={objectif.description}
                onChange={handleInputChange}
                placeholder="Ex: Comprendre les risques liés aux produits chimiques"
                disabled={isReadOnly}
              />
              {!isReadOnly && (
                <button
                  type="button"
                  onClick={() => removeObjectif(index)}
                  className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Section Prérequis */}
        <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 p-6 rounded-xl border border-orange-100 dark:border-orange-800">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center mr-3">
                <BookOpen className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 dark:text-white">Prérequis</h4>
            </div>
            {!isReadOnly && (
              <button
                type="button"
                onClick={addPrerequis}
                className="flex items-center px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors duration-200"
              >
                <Plus className="w-4 h-4 mr-2" />
                Ajouter
              </button>
            )}
          </div>
          
          {formData.prerequis.map((prerequis, index) => (
            <div key={index} className="mb-4 flex items-center space-x-3">
              <FormInput
                label={`Prérequis ${index + 1}`}
                name={`prerequis.${index}`}
                type="text"
                value={prerequis}
                onChange={handleInputChange}
                placeholder="Ex: Connaissance de base en sécurité"
                disabled={isReadOnly}
              />
              {!isReadOnly && (
                <button
                  type="button"
                  onClick={() => removePrerequis(index)}
                  className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Section Matériel */}
        <div className="bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 p-6 rounded-xl border border-teal-100 dark:border-teal-800">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900 rounded-lg flex items-center justify-center mr-3">
                <Award className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 dark:text-white">Matériel</h4>
            </div>
            {!isReadOnly && (
              <button
                type="button"
                onClick={addMateriel}
                className="flex items-center px-3 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors duration-200"
              >
                <Plus className="w-4 h-4 mr-2" />
                Ajouter
              </button>
            )}
          </div>
          
          {formData.materiel.map((materiel, index) => (
            <div key={index} className="mb-4 flex items-center space-x-3">
              <FormInput
                label={`Matériel ${index + 1}`}
                name={`materiel.${index}`}
                type="text"
                value={materiel}
                onChange={handleInputChange}
                placeholder="Ex: Projecteur, manuels, EPI"
                disabled={isReadOnly}
              />
              {!isReadOnly && (
                <button
                  type="button"
                  onClick={() => removeMateriel(index)}
                  className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Section Évaluation */}
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 p-6 rounded-xl border border-indigo-100 dark:border-indigo-800">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center mr-3">
                <CheckCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 dark:text-white">Évaluation</h4>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormInput
              label="Type d'évaluation"
              name="evaluation.type"
              type="select"
              value={formData.evaluation.type}
              onChange={handleInputChange}
              options={[
                { value: 'QCM', label: 'QCM' },
                { value: 'Pratique', label: 'Pratique' },
                { value: 'Théorique', label: 'Théorique' },
                { value: 'Mixte', label: 'Mixte' },
                { value: 'Pas d\'évaluation', label: 'Pas d\'évaluation' }
              ]}
              disabled={isReadOnly}
            />
            
            <FormInput
              label="Seuil de réussite (%)"
              name="evaluation.seuilReussite"
              type="number"
              value={formData.evaluation.seuilReussite}
              onChange={handleInputChange}
              placeholder="70"
              min="0"
              max="100"
              disabled={isReadOnly}
            />
          </div>
          
          <div className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <h5 className="font-medium text-gray-900 dark:text-white">Critères d'évaluation</h5>
              {!isReadOnly && (
                <button
                  type="button"
                  onClick={addCritere}
                  className="flex items-center px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter
                </button>
              )}
            </div>
            
            {formData.evaluation.criteres.map((critere, index) => (
              <div key={index} className="mb-4 flex items-center space-x-3">
                <FormInput
                  label={`Critère ${index + 1}`}
                  name={`critere.${index}`}
                  type="text"
                  value={critere}
                  onChange={handleInputChange}
                  placeholder="Ex: Maîtrise des procédures de sécurité"
                  disabled={isReadOnly}
                />
                {!isReadOnly && (
                  <button
                    type="button"
                    onClick={() => removeCritere(index)}
                    className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Section Participants */}
        <div className="bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 p-6 rounded-xl border border-pink-100 dark:border-pink-800">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-pink-100 dark:bg-pink-900 rounded-lg flex items-center justify-center mr-3">
                <Users className="w-5 h-5 text-pink-600 dark:text-pink-400" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 dark:text-white">Participants</h4>
            </div>
            {!isReadOnly && (
              <button
                type="button"
                onClick={addParticipant}
                className="flex items-center px-3 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors duration-200"
              >
                <Plus className="w-4 h-4 mr-2" />
                Ajouter
              </button>
            )}
          </div>
          
          {!isReadOnly && (
            <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-yellow-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    Information temporaire
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                    <p>
                      L'<strong>ID Employé</strong> est actuellement <strong>optionnel</strong> en attendant la création du workflow avec le module RH.
                    </p>
                    <p className="mt-1">
                      Seuls le <strong>nom et prénom</strong> sont requis pour enregistrer un participant.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {formData.participants.map((participant, index) => (
            <div key={index} className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg border border-pink-200 dark:border-pink-700">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <h5 className="font-medium text-gray-900 dark:text-white">Participant {index + 1}</h5>
                  {participant.employe?.nom?.trim() && participant.employe?.prenom?.trim() ? (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Valide
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Nom/Prénom requis
                    </span>
                  )}
                  {(participant.employe as any)._id && (participant.employe as any)._id.match(/^[0-9a-fA-F]{24}$/) && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      ID RH
                    </span>
                  )}
                </div>
                {!isReadOnly && (
                  <button
                    type="button"
                    onClick={() => removeParticipant(index)}
                    className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <FormInput
                  label="ID Employé (optionnel)"
                  name={`participant.${index}._id`}
                  type="text"
                  value={participant.employe?._id || ''}
                  onChange={handleInputChange}
                  placeholder="Ex: 507f1f77bcf86cd799439011 (optionnel)"
                  disabled={isReadOnly}
                />
                <FormInput
                  label="Nom"
                  name={`participant.${index}.nom`}
                  type="text"
                  value={participant.employe?.nom || ''}
                  onChange={handleInputChange}
                  placeholder="Ex: Dupont"
                  disabled={isReadOnly}
                />
                <FormInput
                  label="Prénom"
                  name={`participant.${index}.prenom`}
                  type="text"
                  value={participant.employe?.prenom || ''}
                  onChange={handleInputChange}
                  placeholder="Ex: Marie"
                  disabled={isReadOnly}
                />
                <FormInput
                  label="Matricule"
                  name={`participant.${index}.matricule`}
                  type="text"
                  value={participant.employe?.matricule || ''}
                  onChange={handleInputChange}
                  placeholder="Ex: EMP001"
                  disabled={isReadOnly}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormInput
                  label="Statut"
                  name={`participant.${index}.statut`}
                  type="select"
                  value={participant.statut || 'Inscrit'}
                  onChange={handleInputChange}
                  options={[
                    { value: 'Inscrit', label: 'Inscrit' },
                    { value: 'En cours', label: 'En cours' },
                    { value: 'Terminé', label: 'Terminé' },
                    { value: 'Absent', label: 'Absent' }
                  ]}
                  disabled={isReadOnly}
                />
                <FormInput
                  label="Score"
                  name={`participant.${index}.score`}
                  type="number"
                  value={participant.evaluation?.note || 0}
                  onChange={handleInputChange}
                  placeholder="Ex: 85"
                  min="0"
                  max="20"
                  disabled={isReadOnly}
                />
                <FormInput
                  label="Commentaires"
                  name={`participant.${index}.commentaires`}
                  type="text"
                  value={participant.evaluation?.commentaires || ''}
                  onChange={handleInputChange}
                  placeholder="Ex: Très bonne participation"
                  disabled={isReadOnly}
                />
              </div>
            </div>
          ))}
          
          {formData.participants.length > 0 && (
            <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-300">
                  Total participants: {formData.participants.length}
                </span>
                <span className="text-green-600 dark:text-green-400 font-medium">
                  Participants valides: {formData.participants.filter(p => 
                    (p.employe as any)._id && (p.employe as any)._id.match(/^[0-9a-fA-F]{24}$/)
                  ).length}
                </span>
              </div>
            </div>
          )}
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
              {isSubmitting ? 'Enregistrement...' : mode === 'create' ? 'Créer la formation' : 'Modifier la formation'}
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
