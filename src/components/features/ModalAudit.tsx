import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import FormInput from '../common/FormInput';
import FormButton from '../common/FormButton';
import { auditService } from '../../services/api';
import { 
  FileText, 
  Users, 
  Calendar, 
  Plus, 
  AlertCircle,
  CheckCircle,
  Trash2
} from 'lucide-react';

// Interface pour notre formulaire de modal (plus complète que AuditFormData)
interface AuditModalFormData {
  titre: string;
  description: string;
  type: string;
  domaine: string;
  priorite: string;
  statut: string;
  datePlanification: string;
  dateDebut: string;
  dateFin: string;
  dureeEstimee: number;
  auditeurPrincipal: {
    nom: string;
    prenom: string;
  };
  auditeurs: Array<{
    nom: string;
    prenom: string;
    role: string;
  }>;
  resultats: {
    score: number;
    conclusion: string;
  };
  constatations: Array<{
    description: string;
    type: string;
    priorite: string;
    responsable: {
      nom: string;
      prenom: string;
    };
    dateEcheance: string;
    statut: string;
  }>;
  actionCorrective: {
    description: string;
    type: string;
    priorite: string;
    responsable: {
      nom: string;
      prenom: string;
    };
    dateEcheance: string;
    statut: string;
  };
}

// Interfaces TypeScript
interface Audit {
  _id: string;
  numero: string;
  titre: string;
  description: string;
  type: string;
  domaine: string;
  statut: string;
  priorite: string;
  datePlanification: string;
  dateDebut: string;
  dateFin: string;
  dureeEstimee: number;
  auditeurPrincipal: {
    nom: string;
    prenom: string;
  };
  auditeurs: Array<{
    auditeur: {
      nom: string;
      prenom: string;
    };
    role: string;
  }>;
  resultats: {
    score: number;
    conclusion: string;
    constatations: Array<{
      description: string;
      type: string;
      priorite: string;
      responsable: {
        nom: string;
        prenom: string;
      };
      dateEcheance: string;
      statut: string;
    }>;
  };
  actionsCorrectives: Array<{
    description: string;
    type: string;
    priorite: string;
    responsable: {
      nom: string;
      prenom: string;
    };
    dateEcheance: string;
    statut: string;
  }>;
  createdBy: {
    nom: string;
    prenom: string;
  };
}

interface ModalAuditProps {
  isOpen: boolean;
  onClose: () => void;
  audit?: Audit | null;
  mode: 'create' | 'edit' | 'view';
  onSubmit: (audit: Partial<Audit>) => void;
}

export default function ModalAudit({ 
  isOpen, 
  onClose, 
  audit, 
  mode, 
  onSubmit 
}: ModalAuditProps) {
  const [formData, setFormData] = useState<AuditModalFormData>({
    titre: '',
    description: '',
    type: '',
    domaine: '',
    priorite: '',
    statut: '',
    datePlanification: '',
    dateDebut: '',
    dateFin: '',
    dureeEstimee: 0,
    auditeurPrincipal: { nom: '', prenom: '' },
    auditeurs: [{ nom: '', prenom: '', role: '' }],
    resultats: { score: 0, conclusion: '' },
    constatations: [{ description: '', type: 'Non-conformité', priorite: 'Moyenne', responsable: { nom: '', prenom: '' }, dateEcheance: '', statut: 'À traiter' }],
    actionCorrective: { description: '', type: 'Corrective', priorite: 'Moyenne', responsable: { nom: '', prenom: '' }, dateEcheance: '', statut: 'À traiter' }
  });

  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Initialiser les données du formulaire
  useEffect(() => {
    if (audit && (mode === 'edit' || mode === 'view')) {
      setFormData({
        titre: audit.titre || '',
        description: audit.description || '',
        type: audit.type || '',
        domaine: audit.domaine || '',
        priorite: audit.priorite || '',
        statut: audit.statut || '',
        datePlanification: audit.datePlanification || '',
        dateDebut: audit.dateDebut || '',
        dateFin: audit.dateFin || '',
        dureeEstimee: audit.dureeEstimee || 0,
        auditeurPrincipal: audit.auditeurPrincipal || { nom: '', prenom: '' },
        auditeurs: audit.auditeurs?.length > 0 
          ? audit.auditeurs.map(a => ({
              nom: a.auditeur?.nom || 'Utilisateur',
              prenom: a.auditeur?.prenom || 'Connecté',
              role: a.role || ''
            }))
          : [{ nom: '', prenom: '', role: '' }],
        resultats: {
          score: audit.resultats?.score || 0,
          conclusion: audit.resultats?.conclusion || ''
        },
        constatations: audit.resultats?.constatations?.length > 0 
          ? audit.resultats.constatations.map(c => ({
              description: c.description || '',
              type: c.type || 'Non-conformité',
              priorite: c.priorite || 'Moyenne',
              responsable: {
                nom: c.responsable?.nom || '',
                prenom: c.responsable?.prenom || ''
              },
              dateEcheance: c.dateEcheance || '',
              statut: c.statut || 'À traiter'
            }))
          : [{ description: '', type: 'Non-conformité', priorite: 'Moyenne', responsable: { nom: '', prenom: '' }, dateEcheance: '', statut: 'À traiter' }],
        actionCorrective: audit.actionsCorrectives?.[0] 
          ? {
              description: audit.actionsCorrectives[0].description || '',
              type: audit.actionsCorrectives[0].type || 'Corrective',
              priorite: audit.actionsCorrectives[0].priorite || 'Moyenne',
              responsable: {
                nom: audit.actionsCorrectives[0].responsable?.nom || '',
                prenom: audit.actionsCorrectives[0].responsable?.prenom || ''
              },
              dateEcheance: audit.actionsCorrectives[0].dateEcheance || '',
              statut: audit.actionsCorrectives[0].statut || 'À traiter'
            }
          : { description: '', type: 'Corrective', priorite: 'Moyenne', responsable: { nom: '', prenom: '' }, dateEcheance: '', statut: 'À traiter' }
      });
    } else if (mode === 'create') {
      resetForm();
    }
  }, [audit, mode]);

  const resetForm = () => {
    setFormData({
      titre: '',
      description: '',
      type: '',
      domaine: '',
      priorite: '',
      statut: '',
      datePlanification: '',
      dateDebut: '',
      dateFin: '',
      dureeEstimee: 0,
      auditeurPrincipal: { nom: '', prenom: '' },
      auditeurs: [{ nom: '', prenom: '', role: '' }],
      resultats: { score: 0, conclusion: '' },
      constatations: [{ description: '', type: '', priorite: '', responsable: { nom: '', prenom: '' }, dateEcheance: '', statut: 'À traiter' }],
      actionCorrective: { description: '', type: 'Corrective', priorite: 'Moyenne', responsable: { nom: '', prenom: '' }, dateEcheance: '', statut: 'À traiter' }
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Gestion spécifique des constatations en premier
    if (name.startsWith('constatations.')) {
      const parts = name.split('.');
      const index = parseInt(parts[1]);
      const field = parts[2];
      const newConstatations = [...formData.constatations];
      
      if (field === 'description' || field === 'type' || field === 'priorite' || field === 'dateEcheance' || field === 'statut') {
        newConstatations[index] = { ...newConstatations[index], [field]: value };
        setFormData(prev => ({
          ...prev,
          constatations: newConstatations
        }));
      } else if (field === 'responsable') {
        const subField = parts[3]; // nom ou prenom
        newConstatations[index] = { 
          ...newConstatations[index], 
          responsable: { 
            ...newConstatations[index].responsable, 
            [subField]: value 
          }
        };
        setFormData(prev => ({
          ...prev,
          constatations: newConstatations
        }));
      }
    } else if (name.includes('.')) {
      const [parent, child] = name.split('.');
      
      if (parent === 'auditeurPrincipal') {
        setFormData(prev => ({
          ...prev,
          auditeurPrincipal: {
            ...prev.auditeurPrincipal,
            [child]: value
          }
        }));
      } else if (parent === 'resultats') {
        setFormData(prev => ({
          ...prev,
          resultats: {
            ...prev.resultats,
            [child]: value
          }
        }));
      } else if (parent === 'actionCorrective') {
        if (child === 'responsableNom') {
          setFormData(prev => ({
            ...prev,
            actionCorrective: {
              ...prev.actionCorrective,
              responsable: { ...prev.actionCorrective.responsable, nom: value }
            }
          }));
        } else if (child === 'responsablePrenom') {
          setFormData(prev => ({
            ...prev,
            actionCorrective: {
              ...prev.actionCorrective,
              responsable: { ...prev.actionCorrective.responsable, prenom: value }
            }
          }));
        } else {
          setFormData(prev => ({
            ...prev,
            actionCorrective: {
              ...prev.actionCorrective,
              [child]: value
            }
          }));
        }
      }
    } else if (name.startsWith('auditeur.')) {
      const [field, indexStr] = name.split('.');
      const index = parseInt(indexStr);
      const newAuditeurs = [...formData.auditeurs];
      if (field === 'nom' || field === 'prenom' || field === 'role') {
        newAuditeurs[index] = { ...newAuditeurs[index], [field]: value };
        setFormData(prev => ({ ...prev, auditeurs: newAuditeurs }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const addAuditeur = () => {
    setFormData(prev => ({
      ...prev,
      auditeurs: [...prev.auditeurs, { nom: '', prenom: '', role: '' }]
    }));
  };

  const removeAuditeur = (index: number) => {
    setFormData(prev => ({
      ...prev,
      auditeurs: prev.auditeurs.filter((_, i) => i !== index)
    }));
  };

  const handleAuditeurChange = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      auditeurs: prev.auditeurs.map((auditeur, i) => 
        i === index ? { ...auditeur, [field]: value } : auditeur
      )
    }));
  };



  const validateForm = () => {
    const errors: string[] = [];
    
    if (!formData.titre.trim()) errors.push('Le titre est requis');
    if (!formData.description.trim()) errors.push('La description est requise');
    if (!formData.type) errors.push('Le type d\'audit est requis');
    if (!formData.domaine) errors.push('Le domaine est requis');
    if (!formData.priorite) errors.push('La priorité est requise');
    if (!formData.statut) errors.push('Le statut est requis');
    if (!formData.datePlanification) errors.push('La date de planification est requise');
    if (!formData.auditeurPrincipal.nom.trim()) errors.push('Le nom de l\'auditeur principal est requis');
    if (!formData.auditeurPrincipal.prenom.trim()) errors.push('Le prénom de l\'auditeur principal est requis');
    
    setValidationErrors(errors);
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (errors.length > 0) return;
    
    setIsSubmitting(true);
    
    try {
      // Convertir les données du formulaire vers le format attendu par l'API MongoDB
      const apiData = {
        numero: `AUD-${Date.now()}`, // Générer un numéro temporaire
        titre: formData.titre,
        description: formData.description,
        type: formData.type,
        domaine: formData.domaine === 'Santé' ? 'Hygiène' : formData.domaine, // Corriger Santé -> Hygiène
        priorite: formData.priorite, // Utiliser les nouvelles valeurs
        datePlanification: formData.datePlanification,
        dateDebut: formData.dateDebut,
        dateFin: formData.dateFin,
        dureeEstimee: Number(formData.dureeEstimee) || 0,
        // TODO: Remplacer par de vrais ObjectId d'utilisateurs
        auditeurPrincipal: '507f1f77bcf86cd799439011', // ObjectId factice
        auditeurs: formData.auditeurs
          .filter(auditeur => auditeur.role.trim())
          .map(auditeur => ({
            auditeur: '507f1f77bcf86cd799439012', // ObjectId factice
            role: auditeur.role
          })),
        // TODO: Ajouter demandeur et createdBy obligatoires
        demandeur: '507f1f77bcf86cd799439013', // ObjectId factice 
        createdBy: '507f1f77bcf86cd799439014', // ObjectId factice
        statut: formData.statut
      };

      console.log('📤 Données envoyées à l\'API:', apiData);

      // Données étendues pour le callback (si nécessaire)
      const extendedData = {
        ...formData,
        auditeurs: formData.auditeurs
          .filter(auditeur => auditeur.role.trim())
          .map(auditeur => ({
          auditeur: {
              nom: auditeur.nom || 'Utilisateur',
              prenom: auditeur.prenom || 'Connecté'
          },
          role: auditeur.role
        })),
        resultats: {
          score: Number(formData.resultats.score) || 0,
          conclusion: formData.resultats.conclusion,
          constatations: formData.constatations
            .filter(constatation => constatation.description.trim())
            .map(constatation => ({
              description: constatation.description,
              type: constatation.type,
              priorite: constatation.priorite,
              responsable: {
                nom: constatation.responsable.nom,
                prenom: constatation.responsable.prenom
              },
              dateEcheance: constatation.dateEcheance,
              statut: constatation.statut
            }))
        },
        actionsCorrectives: formData.actionCorrective.description.trim() ? [{
          description: formData.actionCorrective.description,
          type: formData.actionCorrective.type,
          priorite: formData.actionCorrective.priorite,
          responsable: {
            nom: formData.actionCorrective.responsable.nom,
            prenom: formData.actionCorrective.responsable.prenom
          },
          dateEcheance: formData.actionCorrective.dateEcheance,
          statut: formData.actionCorrective.statut
        }] : []
      };
      
      // Utiliser directement l'API si on est en mode création
      if (mode === 'create') {
        const response = await auditService.create(apiData);
        if (response.data) {
          setShowSuccessMessage(true);
          setTimeout(() => {
            onClose();
            // Recharger la page pour voir les nouvelles données
            window.location.reload();
          }, 2000);
        }
      } else if (mode === 'edit' && audit) {
        const response = await auditService.update(audit._id, apiData);
        if (response.data) {
          setShowSuccessMessage(true);
          setTimeout(() => {
            onClose();
            // Recharger la page pour voir les modifications
            window.location.reload();
          }, 2000);
        }
      } else {
        // Fallback vers onSubmit pour compatibilité
        await onSubmit(extendedData);
        setShowSuccessMessage(true);
        setTimeout(() => {
          onClose();
        }, 2000);
      }
      
    } catch (error: any) {
      console.error('Erreur lors de la soumission:', error);
      
      // Afficher les détails de l'erreur API
      if (error.response?.data) {
        console.error('Détails de l\'erreur:', error.response.data);
        
        // Extraire les erreurs de validation spécifiques
        if (error.response.data.errors) {
          const errorMessages = Object.values(error.response.data.errors).map((err: any) => err.message || err);
          setValidationErrors(errorMessages);
        } else if (error.response.data.message) {
          setValidationErrors([error.response.data.message]);
        } else {
          setValidationErrors([`Erreur ${error.response.status}: ${JSON.stringify(error.response.data)}`]);
        }
      } else {
        setValidationErrors(['Erreur de connexion. Veuillez réessayer.']);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTitle = () => {
    switch (mode) {
      case 'create': return 'Nouvel Audit';
      case 'edit': return 'Modifier l\'Audit';
      case 'view': return 'Détails de l\'Audit';
      default: return 'Audit';
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
                {mode === 'create' ? 'Audit créé avec succès !' : 'Audit modifié avec succès !'}
              </span>
            </div>
          </div>
        )}

        {/* Section Informations générales */}
        <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mr-3">
              <FileText className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </div>
            <h4 className="text-xl font-semibold text-gray-900 dark:text-white">Informations Générales</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormInput
              label="Titre de l'audit"
              name="titre"
              type="text"
              value={formData.titre}
              onChange={handleInputChange}
              placeholder="Titre descriptif de l'audit"
              required

            />
            
            <FormInput
              label="Type d'audit"
              name="type"
              type="select"
              value={formData.type}
              onChange={handleInputChange}
              options={[
                { value: 'Interne', label: 'Interne' },
                { value: 'Externe', label: 'Externe' },
                { value: 'Certification', label: 'Certification' },
                { value: 'Surveillance', label: 'Surveillance' },
                { value: 'Suivi', label: 'Suivi' }
              ]}
              required
            />
            
            <FormInput
              label="Domaine"
              name="domaine"
              type="select"
              value={formData.domaine}
              onChange={handleInputChange}
              options={[
                { value: 'Qualité', label: 'Qualité' },
                { value: 'Sécurité', label: 'Sécurité' },
                { value: 'Environnement', label: 'Environnement' },
                  { value: 'Hygiène', label: 'Hygiène' },
                  { value: 'Mixte', label: 'Mixte' }
              ]}
              required
            />
            
            <FormInput
              label="Priorité"
              name="priorite"
              type="select"
              value={formData.priorite}
              onChange={handleInputChange}
                              options={[
                  { value: 'Faible', label: 'Faible' },
                  { value: 'Moyenne', label: 'Moyenne' },
                  { value: 'Élevée', label: 'Élevée' },
                  { value: 'Critique', label: 'Critique' }
                ]}
              required
            />
            
            <FormInput
              label="Statut"
              name="statut"
              type="select"
              value={formData.statut}
              onChange={handleInputChange}
              disabled={isReadOnly}
              options={[
                { value: 'Planifié', label: 'Planifié' },
                { value: 'En cours', label: 'En cours' },
                { value: 'Terminé', label: 'Terminé' },
                { value: 'Annulé', label: 'Annulé' },
                { value: 'Reporté', label: 'Reporté' }
              ]}
              required
            />
            
            <FormInput
              label="Date de planification"
              name="datePlanification"
              type="date"
              value={formData.datePlanification}
              onChange={handleInputChange}
              required
            />
            
            <FormInput
              label="Durée estimée (heures)"
              name="dureeEstimee"
              type="number"
              value={formData.dureeEstimee}
              onChange={handleInputChange}
              placeholder="8"
            />
          </div>
          
          <div className="mt-6">
            <FormInput
              label="Description"
              name="description"
              type="textarea"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Description détaillée de l'audit..."
              required
            />
          </div>
        </div>

        {/* Section Planning */}
        <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mr-3">
              <Calendar className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </div>
            <h4 className="text-xl font-semibold text-gray-900 dark:text-white">Planning</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormInput
              label="Date de début"
              name="dateDebut"
              type="date"
              value={formData.dateDebut}
              onChange={handleInputChange}
            />
            
            <FormInput
              label="Date de fin"
              name="dateFin"
              type="date"
              value={formData.dateFin}
              onChange={handleInputChange}
            />
          </div>
        </div>

        {/* Section Auditeurs */}
        <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mr-3">
                <Users className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 dark:text-white">Auditeurs</h4>
            </div>
            {!isReadOnly && (
              <button
                type="button"
                onClick={addAuditeur}
                className="flex items-center px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
              >
                <Plus className="w-4 h-4 mr-2" />
                Ajouter
              </button>
            )}
          </div>
          
          {/* Auditeur principal */}
          <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
            <h5 className="font-medium text-gray-900 dark:text-white mb-4">Auditeur Principal</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                label="Nom"
                name="auditeurPrincipal.nom"
                type="text"
                value={formData.auditeurPrincipal.nom}
                onChange={handleInputChange}
                placeholder="Nom de l'auditeur"
                required
  
              />
              <FormInput
                label="Prénom"
                name="auditeurPrincipal.prenom"
                type="text"
                value={formData.auditeurPrincipal.prenom}
                onChange={handleInputChange}
                placeholder="Prénom de l'auditeur"
                required
  
              />
            </div>
          </div>

          {/* Auditeurs supplémentaires - Version corrigée */}
          {formData.auditeurs.map((auditeur, index) => (
            <div key={index} className="mb-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
              <div className="flex items-center justify-between mb-4">
                <h5 className="font-medium text-gray-900 dark:text-white">Auditeur {index + 1}</h5>
                {!isReadOnly && (
                  <button
                    type="button"
                    onClick={() => removeAuditeur(index)}
                    className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                  👤 <strong>Auditeur :</strong> Utilisateur connecté (assigné automatiquement)
                </p>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Rôle dans l'audit
                  </label>
                  <select
                    name={`auditeur.${index}.role`}
                    value={auditeur.role}
                    onChange={(e) => handleAuditeurChange(index, 'role', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    required
                  >
                    <option value="">Sélectionner un rôle</option>
                    <option value="Auditeur">Auditeur</option>
                    <option value="Expert technique">Expert technique</option>
                    <option value="Observateur">Observateur</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Section Constatations Prévues */}
        <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-orange-100 dark:bg-orange-800 rounded-lg flex items-center justify-center mr-3">
                <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 dark:text-white">Constatations Prévues</h4>
            </div>
            {!isReadOnly && (
              <button
                type="button"
                onClick={() => setFormData(prev => ({
                  ...prev,
                  constatations: [...prev.constatations, { 
                    description: '', 
                    type: 'Non-conformité', 
                    priorite: 'Moyenne', 
                    responsable: { nom: '', prenom: '' }, 
                    dateEcheance: '', 
                    statut: 'À traiter' 
                  }]
                }))}
                className="flex items-center px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors duration-200"
              >
                <Plus className="w-4 h-4 mr-2" />
                Ajouter
              </button>
            )}
          </div>
          
          {formData.constatations.map((constatation, index) => (
            <div key={index} className="mb-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
              <div className="flex items-center justify-between mb-4">
                <h5 className="font-medium text-gray-900 dark:text-white">Constatation {index + 1}</h5>
                {!isReadOnly && formData.constatations.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({
                      ...prev,
                      constatations: prev.constatations.filter((_, i) => i !== index)
                    }))}
                    className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 gap-4">
                <FormInput
                  label="Description"
                  name={`constatations.${index}.description`}
                  type="textarea"
                  value={constatation.description}
                  onChange={handleInputChange}
                  placeholder="Description de la constatation..."
                  disabled={isReadOnly}
                  required
                />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Type
                    </label>
                    <select
                      name={`constatations.${index}.type`}
                      value={constatation.type}
                      onChange={handleInputChange}
                      disabled={isReadOnly}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="">Sélectionner un type</option>
                      <option value="Non-conformité">Non-conformité</option>
                      <option value="Observation">Observation</option>
                      <option value="Amélioration">Amélioration</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Priorité
                    </label>
                    <select
                      name={`constatations.${index}.priorite`}
                      value={constatation.priorite}
                      onChange={handleInputChange}
                      disabled={isReadOnly}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="">Sélectionner une priorité</option>
                      <option value="Faible">Faible</option>
                      <option value="Moyenne">Moyenne</option>
                      <option value="Élevée">Élevée</option>
                      <option value="Critique">Critique</option>
                    </select>
                  </div>
                  <FormInput
                    label="Date d'échéance"
                    name={`constatations.${index}.dateEcheance`}
                    type="date"
                    value={constatation.dateEcheance}
                    onChange={handleInputChange}
                    disabled={isReadOnly}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormInput
                    label="Responsable - Nom"
                    name={`constatations.${index}.responsable.nom`}
                    type="text"
                    value={constatation.responsable.nom}
                    onChange={handleInputChange}
                    placeholder="Nom du responsable"
                    disabled={isReadOnly}
                  />
                  <FormInput
                    label="Responsable - Prénom"
                    name={`constatations.${index}.responsable.prenom`}
                    type="text"
                    value={constatation.responsable.prenom}
                    onChange={handleInputChange}
                    placeholder="Prénom du responsable"
                    disabled={isReadOnly}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Section Résultats (pour l'édition/consultation) */}
        {(mode === 'edit' || mode === 'view') && (
          <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mr-3">
                  <CheckCircle className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </div>
                <h4 className="text-xl font-semibold text-gray-900 dark:text-white">Résultats</h4>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormInput
                label="Score (%)"
                name="resultats.score"
                type="number"
                value={formData.resultats.score}
                onChange={handleInputChange}
                placeholder="85"
              />
            </div>
            <div className="mt-6">
              <FormInput
                label="Conclusion"
                name="resultats.conclusion"
                type="textarea"
                value={formData.resultats.conclusion}
                onChange={handleInputChange}
                placeholder="Conclusion de l'audit..."
  
              />
            </div>
          </div>
        )}

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
              {isSubmitting ? 'Enregistrement...' : mode === 'create' ? 'Créer l\'audit' : 'Modifier l\'audit'}
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