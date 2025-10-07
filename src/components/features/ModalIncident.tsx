import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import FormInput from '../common/FormInput';
import FormButton from '../common/FormButton';
import { 
  AlertTriangle, 
  Users, 
  Calendar, 
  MapPin, 
  CheckCircle,
  FileText,
  Shield
} from 'lucide-react';

// Interfaces TypeScript
interface Incident {
  _id: string;
  numero: string;
  titre: string;
  description: string;
  type: string;
  categorie: string;
  gravite: string;
  urgence: string;
  statut: string;
  dateIncident: string;
  heureIncident: string;
  localisation: {
    zone: string;
    batiment: string;
    etage: string;
  };
  declarant: {
    nom: string;
    prenom: string;
  };
  impacts: {
    humains: {
      blesses: number;
      deces: number;
    };
    materiels: {
      degats: string;
      coutEstime: number;
    };
    environnementaux: {
      pollution: string;
      impact: string;
    };
  };
  personnesImpliquees: any[];
  actionsCorrectives: any[];
}

interface ModalIncidentProps {
  isOpen: boolean;
  onClose: () => void;
  incident?: Incident | null;
  mode: 'create' | 'edit' | 'view';
  onSubmit: (incident: any) => void;
}

export default function ModalIncident({ 
  isOpen, 
  onClose, 
  incident, 
  mode, 
  onSubmit 
}: ModalIncidentProps) {
  const [formData, setFormData] = useState({
    numero: '',
    titre: '',
    description: '',
    type: '',
    categorie: 'Sécurité',
    gravite: '',
    urgence: 'Modérée',
    statut: 'Déclaré',
    dateIncident: '',
    localisation: {
      zone: '',
      batiment: '',
      etage: ''
    },
    declarant: {
      nom: '',
      prenom: ''
    },
    impacts: {
      humains: { 
        blesses: 0, 
        deces: 0,
        arretsTravail: 0
      },
      materiels: { 
        degats: 'Aucun', 
        coutEstime: 0 
      },
      environnementaux: { 
        pollution: 'Aucune', 
        impact: '' 
      },
      production: {
        arretProduction: false,
        dureeArret: 0,
        coutArret: 0
      }
    },
    personnesImpliquees: [],
    actionsCorrectives: []
  });

  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const isReadOnly = mode === 'view';

  // Fonction pour générer un numéro d'incident
  const generateNumero = () => {
    const timestamp = new Date().getFullYear();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `INC-${timestamp}-${random}`;
  };

  // Initialiser les données du formulaire
  useEffect(() => {
    if (incident && mode === 'edit') {
      setFormData({
        numero: incident.numero || '',
        titre: incident.titre || '',
        description: incident.description || '',
        type: incident.type || '',
        categorie: incident.categorie || 'Sécurité',
        gravite: incident.gravite || '',
        urgence: incident.urgence || 'Modérée',
        statut: incident.statut || 'Déclaré',
        dateIncident: incident.dateIncident ? incident.dateIncident.split('T')[0] : '',
        localisation: {
          zone: incident.localisation?.zone || '',
          batiment: incident.localisation?.batiment || '',
          etage: incident.localisation?.etage || ''
        },
        declarant: {
          nom: incident.declarant?.nom || '',
          prenom: incident.declarant?.prenom || ''
        },
        impacts: {
          humains: {
            blesses: incident.impacts?.humains?.blesses || 0,
            deces: incident.impacts?.humains?.deces || 0,
            arretsTravail: incident.impacts?.humains?.arretsTravail || 0
          },
          materiels: {
            degats: incident.impacts?.materiels?.degats || 'Aucun',
            coutEstime: incident.impacts?.materiels?.coutEstime || 0
          },
          environnementaux: {
            pollution: incident.impacts?.environnementaux?.pollution || 'Aucune',
            impact: incident.impacts?.environnementaux?.impact || ''
          },
          production: {
            arretProduction: incident.impacts?.production?.arretProduction || false,
            dureeArret: incident.impacts?.production?.dureeArret || 0,
            coutArret: incident.impacts?.production?.coutArret || 0
          }
        },
        personnesImpliquees: incident.personnesImpliquees || [],
        actionsCorrectives: incident.actionsCorrectives || []
      });
    } else if (mode === 'create') {
      setFormData(prev => ({
        ...prev,
        numero: generateNumero()
      }));
    }
  }, [incident, mode]);

  const resetForm = () => {
    setFormData({
      numero: generateNumero(),
      titre: '',
      description: '',
      type: '',
      categorie: 'Sécurité',
      gravite: '',
      urgence: 'Modérée',
      statut: 'Déclaré',
      dateIncident: '',
      localisation: {
        zone: '',
        batiment: '',
        etage: ''
      },
      declarant: {
        nom: '',
        prenom: ''
      },
      impacts: {
        humains: { 
          blesses: 0, 
          deces: 0,
          arretsTravail: 0
        },
        materiels: { 
          degats: 'Aucun', 
          coutEstime: 0 
        },
        environnementaux: { 
          pollution: 'Aucune', 
          impact: '' 
        },
        production: {
          arretProduction: false,
          dureeArret: 0,
          coutArret: 0
        }
      },
      personnesImpliquees: [],
      actionsCorrectives: []
    });
    setValidationErrors([]);
    setShowSuccessMessage(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Gérer les champs imbriqués
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      
      if (parent === 'localisation') {
        setFormData(prev => ({
          ...prev,
          localisation: {
            ...prev.localisation,
            [child]: value
          }
        }));
      } else if (parent === 'declarant') {
        setFormData(prev => ({
          ...prev,
          declarant: {
            ...prev.declarant,
            [child]: value
          }
        }));
      } else if (parent === 'impacts') {
        const [subParent, subChild] = child.split('.');
        if (subParent && subChild) {
          setFormData(prev => ({
            ...prev,
            impacts: {
              ...prev.impacts,
              [subParent]: {
                ...prev.impacts[subParent as keyof typeof prev.impacts],
                [subChild]: type === 'number' ? Number(value) : 
                          type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
              }
            }
          }));
        }
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'number' ? Number(value) : 
                type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
      }));
    }
  };

  const validateForm = () => {
    const errors: string[] = [];
    
    if (!formData.numero.trim()) errors.push('Le numéro est obligatoire');
    if (!formData.titre.trim()) errors.push('Le titre est obligatoire');
    if (!formData.description.trim()) errors.push('La description est obligatoire');
    if (!formData.type) errors.push('Le type d\'incident est obligatoire');
    if (!formData.gravite) errors.push('La gravité est obligatoire');
    if (!formData.dateIncident) errors.push('La date de l\'incident est obligatoire');
    
    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      const transformedData = {
        numero: formData.numero,
        titre: formData.titre,
        description: formData.description,
        type: formData.type,
        categorie: formData.categorie,
        gravite: formData.gravite,
        urgence: formData.urgence,
        statut: formData.statut,
        dateIncident: formData.dateIncident,
        localisation: formData.localisation,
        impacts: formData.impacts,
        personnesImpliquees: formData.personnesImpliquees,
        actionsCorrectives: formData.actionsCorrectives,
        ...(mode === 'create' && { declarantInfo: formData.declarant })
      };
      
      onSubmit(transformedData);
      
      if (mode === 'create') {
        setFormData(prev => ({
          ...prev,
          numero: generateNumero()
        }));
      }
      
      onClose();
    } catch (error: any) {
      console.error('Erreur lors de la soumission:', error);
      const errorMessage = error instanceof Error ? error.message : 'Une erreur est survenue lors de la soumission.';
      setValidationErrors([errorMessage]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getModalTitle = () => {
    switch (mode) {
      case 'create': return 'Nouvel Incident';
      case 'edit': return 'Modifier l\'Incident';
      case 'view': return 'Détails de l\'Incident';
      default: return 'Incident';
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={getModalTitle()}
      size="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Message de succès */}
        {showSuccessMessage && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mr-3" />
              <p className="text-green-800 dark:text-green-200">
                {mode === 'create' ? 'Incident créé avec succès!' : 'Incident modifié avec succès!'}
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
              label="Numéro d'incident"
              name="numero"
              type="text"
              value={formData.numero}
              onChange={handleInputChange}
              placeholder="Numéro auto-généré"
              required
              disabled={true}
            />
            
            <FormInput
              label="Titre de l'incident"
              name="titre"
              type="text"
              value={formData.titre}
              onChange={handleInputChange}
              placeholder="Titre descriptif de l'incident"
              required
              disabled={isReadOnly}
            />
            
            <FormInput
              label="Type d'incident"
              name="type"
              type="select"
              value={formData.type}
              onChange={handleInputChange}
              options={[
                { value: '', label: 'Sélectionner un type' },
                { value: 'Accident', label: 'Accident' },
                { value: 'Incident', label: 'Incident' },
                { value: 'Presqu\'accident', label: 'Presqu\'accident' },
                { value: 'Maladie', label: 'Maladie' },
                { value: 'Accident du travail', label: 'Accident du travail' },
                { value: 'Accident de trajet', label: 'Accident de trajet' },
                { value: 'Maladie professionnelle', label: 'Maladie professionnelle' },
                { value: 'Incident environnemental', label: 'Incident environnemental' },
                { value: 'Incident qualité', label: 'Incident qualité' },
                { value: 'Incident sécurité', label: 'Incident sécurité' },
                { value: 'Autre', label: 'Autre' }
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
                { value: 'Sécurité', label: 'Sécurité' },
                { value: 'Qualité', label: 'Qualité' },
                { value: 'Environnement', label: 'Environnement' },
                { value: 'Hygiène', label: 'Hygiène' },
                { value: 'Santé', label: 'Santé' }
              ]}
              disabled={isReadOnly}
            />
            
            <FormInput
              label="Gravité"
              name="gravite"
              type="select"
              value={formData.gravite}
              onChange={handleInputChange}
              options={[
                { value: '', label: 'Sélectionner la gravité' },
                { value: 'Légère', label: 'Légère' },
                { value: 'Modérée', label: 'Modérée' },
                { value: 'Grave', label: 'Grave' },
                { value: 'Critique', label: 'Critique' }
              ]}
              required
              disabled={isReadOnly}
            />
            
            <FormInput
              label="Urgence"
              name="urgence"
              type="select"
              value={formData.urgence}
              onChange={handleInputChange}
              options={[
                { value: 'Faible', label: 'Faible' },
                { value: 'Modérée', label: 'Modérée' },
                { value: 'Élevée', label: 'Élevée' },
                { value: 'Immédiate', label: 'Immédiate' }
              ]}
              disabled={isReadOnly}
            />
            
            <FormInput
              label="Statut"
              name="statut"
              type="select"
              value={formData.statut}
              onChange={handleInputChange}
              options={[
                { value: 'Déclaré', label: 'Déclaré' },
                { value: 'En cours d\'investigation', label: 'En cours d\'investigation' },
                { value: 'En cours de traitement', label: 'En cours de traitement' },
                { value: 'Résolu', label: 'Résolu' },
                { value: 'Fermé', label: 'Fermé' },
                { value: 'Clôturé', label: 'Clôturé' }
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
                placeholder="Description détaillée de l'incident"
                required
                disabled={isReadOnly}
              />
            </div>
          </div>
        </div>

        {/* Date */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-6 rounded-xl border border-green-100 dark:border-green-800">
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mr-3">
              <Calendar className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <h4 className="text-xl font-semibold text-gray-900 dark:text-white">Date de l'incident</h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Date de l'incident"
              name="dateIncident"
              type="date"
              value={formData.dateIncident}
              onChange={handleInputChange}
              required
              disabled={isReadOnly}
            />
          </div>
        </div>

        {/* Localisation */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 p-6 rounded-xl border border-amber-100 dark:border-amber-800">
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900 rounded-lg flex items-center justify-center mr-3">
              <MapPin className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <h4 className="text-xl font-semibold text-gray-900 dark:text-white">Localisation</h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormInput
              label="Zone"
              name="localisation.zone"
              type="text"
              value={formData.localisation.zone}
              onChange={handleInputChange}
              placeholder="Zone où s'est produit l'incident"
              disabled={isReadOnly}
            />
            <FormInput
              label="Bâtiment"
              name="localisation.batiment"
              type="text"
              value={formData.localisation.batiment}
              onChange={handleInputChange}
              placeholder="Bâtiment"
              disabled={isReadOnly}
            />
            <FormInput
              label="Étage"
              name="localisation.etage"
              type="text"
              value={formData.localisation.etage}
              onChange={handleInputChange}
              placeholder="Étage ou niveau"
              disabled={isReadOnly}
            />
          </div>
        </div>

        {/* Déclarant */}
        <div className="bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 p-6 rounded-xl border border-purple-100 dark:border-purple-800">
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mr-3">
              <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <h4 className="text-xl font-semibold text-gray-900 dark:text-white">Déclarant</h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Nom du déclarant"
              name="declarant.nom"
              type="text"
              value={formData.declarant.nom}
              onChange={handleInputChange}
              placeholder="Nom du déclarant"
              required
              disabled={isReadOnly}
            />
            
            <FormInput
              label="Prénom du déclarant"
              name="declarant.prenom"
              type="text"
              value={formData.declarant.prenom}
              onChange={handleInputChange}
              placeholder="Prénom du déclarant"
              required
              disabled={isReadOnly}
            />
          </div>
        </div>

        {/* Impacts */}
        <div className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 p-6 rounded-xl border border-red-100 dark:border-red-800">
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center mr-3">
              <Shield className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <h4 className="text-xl font-semibold text-gray-900 dark:text-white">Impacts</h4>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Impacts humains */}
            <div>
              <h5 className="font-medium text-gray-900 dark:text-white mb-3">Impacts humains</h5>
              <div className="space-y-3">
                <FormInput
                  label="Nombre de blessés"
                  name="impacts.humains.blesses"
                  type="number"
                  value={formData.impacts.humains.blesses.toString()}
                  onChange={handleInputChange}
                  min="0"
                  disabled={isReadOnly}
                />
                <FormInput
                  label="Nombre de décès"
                  name="impacts.humains.deces"
                  type="number"
                  value={formData.impacts.humains.deces.toString()}
                  onChange={handleInputChange}
                  min="0"
                  disabled={isReadOnly}
                />
                <FormInput
                  label="Arrêts de travail"
                  name="impacts.humains.arretsTravail"
                  type="number"
                  value={formData.impacts.humains.arretsTravail.toString()}
                  onChange={handleInputChange}
                  min="0"
                  disabled={isReadOnly}
                />
              </div>
            </div>

            {/* Impacts matériels */}
            <div>
              <h5 className="font-medium text-gray-900 dark:text-white mb-3">Impacts matériels</h5>
              <div className="space-y-3">
                <FormInput
                  label="Dégâts"
                  name="impacts.materiels.degats"
                  type="select"
                  value={formData.impacts.materiels.degats}
                  onChange={handleInputChange}
                  options={[
                    { value: 'Aucun', label: 'Aucun' },
                    { value: 'Légers', label: 'Légers' },
                    { value: 'Modérés', label: 'Modérés' },
                    { value: 'Importants', label: 'Importants' },
                    { value: 'Critiques', label: 'Critiques' }
                  ]}
                  disabled={isReadOnly}
                />
                <FormInput
                  label="Coût estimé (€)"
                  name="impacts.materiels.coutEstime"
                  type="number"
                  value={formData.impacts.materiels.coutEstime.toString()}
                  onChange={handleInputChange}
                  min="0"
                  disabled={isReadOnly}
                />
              </div>
            </div>

            {/* Impacts environnementaux */}
            <div>
              <h5 className="font-medium text-gray-900 dark:text-white mb-3">Impacts environnementaux</h5>
              <div className="space-y-3">
                <FormInput
                  label="Pollution"
                  name="impacts.environnementaux.pollution"
                  type="select"
                  value={formData.impacts.environnementaux.pollution}
                  onChange={handleInputChange}
                  options={[
                    { value: 'Aucune', label: 'Aucune' },
                    { value: 'Légère', label: 'Légère' },
                    { value: 'Modérée', label: 'Modérée' },
                    { value: 'Importante', label: 'Importante' }
                  ]}
                  disabled={isReadOnly}
                />
                <FormInput
                  label="Description de l'impact"
                  name="impacts.environnementaux.impact"
                  type="textarea"
                  value={formData.impacts.environnementaux.impact}
                  onChange={handleInputChange}
                  placeholder="Description détaillée de l'impact environnemental"
                  disabled={isReadOnly}
                />
              </div>
            </div>

            {/* Impacts production */}
            <div>
              <h5 className="font-medium text-gray-900 dark:text-white mb-3">Impacts production</h5>
              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="impacts.production.arretProduction"
                    checked={formData.impacts.production.arretProduction}
                    onChange={handleInputChange}
                    disabled={isReadOnly}
                    className="mr-2"
                  />
                  <label className="text-sm text-gray-700 dark:text-gray-300">
                    Arrêt de production
                  </label>
                </div>
                <FormInput
                  label="Durée d'arrêt (heures)"
                  name="impacts.production.dureeArret"
                  type="number"
                  value={formData.impacts.production.dureeArret.toString()}
                  onChange={handleInputChange}
                  min="0"
                  disabled={isReadOnly}
                />
                <FormInput
                  label="Coût d'arrêt (€)"
                  name="impacts.production.coutArret"
                  type="number"
                  value={formData.impacts.production.coutArret.toString()}
                  onChange={handleInputChange}
                  min="0"
                  disabled={isReadOnly}
                />
              </div>
            </div>
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
              {isSubmitting ? 'Enregistrement...' : mode === 'create' ? 'Créer l\'incident' : 'Modifier l\'incident'}
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