import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import FormInput from '../common/FormInput';
import FormButton from '../common/FormButton';
import { HardHat, Package, Shield, CheckCircle, AlertTriangle } from 'lucide-react';

interface EPI {
  _id: string;
  nom: string;
  type: string;
  statut: string;
  stock: {
    quantiteDisponible: number;
    seuilAlerte: number;
  };
  caracteristiques: {
    marque: string;
    modele: string;
  };
}

interface ModalEPIProps {
  isOpen: boolean;
  onClose: () => void;
  epi?: EPI | null;
  mode: 'create' | 'edit' | 'view';
  onSubmit: (epi: any) => void;
}

export default function ModalEPI({ isOpen, onClose, epi, mode, onSubmit }: ModalEPIProps) {
  const [formData, setFormData] = useState({
    numero: '',
    nom: '',
    description: '',
    reference: '',
    type: '',
    categorie: '',
    statut: 'Actif',
    stock: { 
      quantiteTotale: 0,
      quantiteDisponible: 0, 
      seuilAlerte: 5,
      unite: 'pièce'
    },
    caracteristiques: { 
      marque: '', 
      modele: '',
      taille: '',
      couleur: '',
      materiau: '',
      norme: '',
      classe: '',
      dureeVie: 0
    }
  });

  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const isReadOnly = mode === 'view';

  // Fonction pour générer un numéro EPI
  const generateNumero = () => {
    const timestamp = new Date().getFullYear();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `EPI-${timestamp}-${random}`;
  };

  useEffect(() => {
    if (epi && mode === 'edit') {
      setFormData({
        numero: epi.numero || '',
        nom: epi.nom || '',
        description: epi.description || '',
        reference: epi.reference || '',
        type: epi.type || '',
        categorie: epi.categorie || '',
        statut: epi.statut || 'Actif',
        stock: { 
          quantiteTotale: epi.stock?.quantiteTotale || 0,
          quantiteDisponible: epi.stock?.quantiteDisponible || 0, 
          seuilAlerte: epi.stock?.seuilAlerte || 5,
          unite: epi.stock?.unite || 'pièce'
        },
        caracteristiques: { 
          marque: epi.caracteristiques?.marque || '', 
          modele: epi.caracteristiques?.modele || '',
          taille: epi.caracteristiques?.taille || '',
          couleur: epi.caracteristiques?.couleur || '',
          materiau: epi.caracteristiques?.materiau || '',
          norme: epi.caracteristiques?.norme || '',
          classe: epi.caracteristiques?.classe || '',
          dureeVie: epi.caracteristiques?.dureeVie || 0
        }
      });
    } else if (mode === 'create') {
      setFormData({
        numero: generateNumero(),
        nom: '',
        description: '',
        reference: '',
        type: '',
        categorie: '',
        statut: 'Actif',
        stock: { 
          quantiteTotale: 0,
          quantiteDisponible: 0, 
          seuilAlerte: 5,
          unite: 'pièce'
        },
        caracteristiques: { 
          marque: '', 
          modele: '',
          taille: '',
          couleur: '',
          materiau: '',
          norme: '',
          classe: '',
          dureeVie: 0
        }
      });
    }
  }, [epi, mode]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      if (parent === 'stock') {
        setFormData(prev => ({
          ...prev,
          stock: { 
            ...prev.stock, 
            [child]: child === 'quantiteTotale' || child === 'quantiteDisponible' || child === 'seuilAlerte' ? Number(value) : value 
          }
        }));
      } else if (parent === 'caracteristiques') {
        setFormData(prev => ({
          ...prev,
          caracteristiques: { 
            ...prev.caracteristiques, 
            [child]: child === 'dureeVie' ? Number(value) : value 
          }
        }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const validateForm = () => {
    const errors: string[] = [];
    if (!formData.numero.trim()) errors.push('Le numéro EPI est obligatoire');
    if (!formData.nom.trim()) errors.push('Le nom de l\'EPI est obligatoire');
    if (!formData.type) errors.push('Le type d\'EPI est obligatoire');
    if (!formData.categorie) errors.push('La catégorie d\'EPI est obligatoire');
    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      setShowSuccessMessage(true);
      setTimeout(() => {
        onClose();
        setFormData({
          numero: generateNumero(),
          nom: '',
          description: '',
          reference: '',
          type: '',
          categorie: '',
          statut: 'Actif',
          stock: { 
            quantiteTotale: 0,
            quantiteDisponible: 0, 
            seuilAlerte: 5,
            unite: 'pièce'
          },
          caracteristiques: { 
            marque: '', 
            modele: '',
            taille: '',
            couleur: '',
            materiau: '',
            norme: '',
            classe: '',
            dureeVie: 0
          }
        });
      }, 1500);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getModalTitle = () => {
    switch (mode) {
      case 'create': return 'Nouvel Équipement de Protection Individuelle';
      case 'edit': return 'Modifier l\'EPI';
      case 'view': return 'Détails de l\'EPI';
      default: return 'Équipement de Protection Individuelle';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={getModalTitle()} size="xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        {showSuccessMessage && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mr-3" />
              <p className="text-green-800 dark:text-green-200">
                {mode === 'create' ? 'EPI créé avec succès!' : 'EPI modifié avec succès!'}
              </p>
            </div>
          </div>
        )}

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

        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-xl border border-blue-100 dark:border-blue-800">
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mr-3">
              <HardHat className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h4 className="text-xl font-semibold text-gray-900 dark:text-white">Informations générales</h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Numéro EPI"
              name="numero"
              type="text"
              value={formData.numero}
              onChange={handleInputChange}
              placeholder="Numéro automatique"
              required
              disabled={true}
            />
            
            <FormInput
              label="Nom de l'EPI"
              name="nom"
              type="text"
              value={formData.nom}
              onChange={handleInputChange}
              placeholder="Ex: Casque de sécurité"
              required
              disabled={isReadOnly}
            />
            
            <FormInput
              label="Référence"
              name="reference"
              type="text"
              value={formData.reference}
              onChange={handleInputChange}
              placeholder="Référence produit"
              disabled={isReadOnly}
            />
            
            <div className="md:col-span-2">
              <FormInput
                label="Description"
                name="description"
                type="textarea"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Description de l'EPI"
                disabled={isReadOnly}
              />
            </div>
            
            <FormInput
              label="Type d'EPI"
              name="type"
              type="select"
              value={formData.type}
              onChange={handleInputChange}
              options={[
                { value: '', label: 'Sélectionner un type' },
                { value: 'Casque', label: 'Casque' },
                { value: 'Lunettes', label: 'Lunettes' },
                { value: 'Masque', label: 'Masque' },
                { value: 'Gants', label: 'Gants' },
                { value: 'Chaussures', label: 'Chaussures' },
                { value: 'Vêtement', label: 'Vêtement' },
                { value: 'Harnais', label: 'Harnais' },
                { value: 'Protection auditive', label: 'Protection auditive' },
                { value: 'Autre', label: 'Autre' }
              ]}
              required
              disabled={isReadOnly}
            />
            
            <FormInput
              label="Catégorie d'EPI"
              name="categorie"
              type="select"
              value={formData.categorie}
              onChange={handleInputChange}
              options={[
                { value: '', label: 'Sélectionner une catégorie' },
                { value: 'Protection de la tête', label: 'Protection de la tête' },
                { value: 'Protection des yeux', label: 'Protection des yeux' },
                { value: 'Protection respiratoire', label: 'Protection respiratoire' },
                { value: 'Protection des mains', label: 'Protection des mains' },
                { value: 'Protection des pieds', label: 'Protection des pieds' },
                { value: 'Protection du corps', label: 'Protection du corps' },
                { value: 'Protection contre les chutes', label: 'Protection contre les chutes' },
                { value: 'Protection auditive', label: 'Protection auditive' }
              ]}
              required
              disabled={isReadOnly}
            />
            
            <FormInput
              label="Statut"
              name="statut"
              type="select"
              value={formData.statut}
              onChange={handleInputChange}
              options={[
                { value: 'Actif', label: 'Actif' },
                { value: 'Suspendu', label: 'Suspendu' },
                { value: 'Archivé', label: 'Archivé' },
                { value: 'En révision', label: 'En révision' }
              ]}
              disabled={isReadOnly}
            />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-6 rounded-xl border border-green-100 dark:border-green-800">
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mr-3">
              <Package className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <h4 className="text-xl font-semibold text-gray-900 dark:text-white">Gestion du stock</h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormInput
              label="Quantité totale"
              name="stock.quantiteTotale"
              type="number"
              value={formData.stock.quantiteTotale.toString()}
              onChange={handleInputChange}
              min="0"
              disabled={isReadOnly}
            />
            <FormInput
              label="Quantité disponible"
              name="stock.quantiteDisponible"
              type="number"
              value={formData.stock.quantiteDisponible.toString()}
              onChange={handleInputChange}
              min="0"
              disabled={isReadOnly}
            />
            <FormInput
              label="Seuil d'alerte"
              name="stock.seuilAlerte"
              type="number"
              value={formData.stock.seuilAlerte.toString()}
              onChange={handleInputChange}
              min="0"
              disabled={isReadOnly}
            />
            <FormInput
              label="Unité"
              name="stock.unite"
              type="select"
              value={formData.stock.unite}
              onChange={handleInputChange}
              options={[
                { value: 'pièce', label: 'Pièce' },
                { value: 'paire', label: 'Paire' },
                { value: 'mètre', label: 'Mètre' },
                { value: 'kg', label: 'Kilogramme' }
              ]}
              disabled={isReadOnly}
            />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 p-6 rounded-xl border border-purple-100 dark:border-purple-800">
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mr-3">
              <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <h4 className="text-xl font-semibold text-gray-900 dark:text-white">Caractéristiques</h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Marque"
              name="caracteristiques.marque"
              type="text"
              value={formData.caracteristiques.marque}
              onChange={handleInputChange}
              placeholder="Marque de l'EPI"
              disabled={isReadOnly}
            />
            <FormInput
              label="Modèle"
              name="caracteristiques.modele"
              type="text"
              value={formData.caracteristiques.modele}
              onChange={handleInputChange}
              placeholder="Modèle"
              disabled={isReadOnly}
            />
            <FormInput
              label="Taille"
              name="caracteristiques.taille"
              type="text"
              value={formData.caracteristiques.taille}
              onChange={handleInputChange}
              placeholder="Taille"
              disabled={isReadOnly}
            />
            <FormInput
              label="Couleur"
              name="caracteristiques.couleur"
              type="text"
              value={formData.caracteristiques.couleur}
              onChange={handleInputChange}
              placeholder="Couleur"
              disabled={isReadOnly}
            />
            <FormInput
              label="Matériau"
              name="caracteristiques.materiau"
              type="text"
              value={formData.caracteristiques.materiau}
              onChange={handleInputChange}
              placeholder="Matériau"
              disabled={isReadOnly}
            />
            <FormInput
              label="Norme"
              name="caracteristiques.norme"
              type="text"
              value={formData.caracteristiques.norme}
              onChange={handleInputChange}
              placeholder="Ex: EN 166, EN 374"
              disabled={isReadOnly}
            />
            <FormInput
              label="Classe"
              name="caracteristiques.classe"
              type="text"
              value={formData.caracteristiques.classe}
              onChange={handleInputChange}
              placeholder="Classe de protection"
              disabled={isReadOnly}
            />
            <FormInput
              label="Durée de vie (mois)"
              name="caracteristiques.dureeVie"
              type="number"
              value={formData.caracteristiques.dureeVie.toString()}
              onChange={handleInputChange}
              min="0"
              placeholder="Durée de vie en mois"
              disabled={isReadOnly}
            />
          </div>
        </div>

        {!isReadOnly && (
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            <FormButton type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
              Annuler
            </FormButton>
            <FormButton type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? 'Enregistrement...' : mode === 'create' ? 'Créer l\'EPI' : 'Modifier l\'EPI'}
            </FormButton>
          </div>
        )}

        {isReadOnly && (
          <div className="flex justify-end pt-6 border-t border-gray-200 dark:border-gray-700">
            <FormButton type="button" variant="primary" onClick={onClose}>
              Fermer
            </FormButton>
          </div>
        )}
      </form>
    </Modal>
  );
}