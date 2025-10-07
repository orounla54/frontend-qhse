import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import FormInput from '../common/FormInput';
import FormButton from '../common/FormButton';
import { FlaskConical, AlertTriangle, Shield, CheckCircle } from 'lucide-react';

interface ProduitChimique {
  _id: string;
  nom: string;
  type: string;
  statut: string;
  stock: {
    quantiteDisponible: number;
    seuilAlerte: number;
  };
  caracteristiques: {
    formule: string;
    cas: string;
  };
  securite: {
    classeDanger: string;
  };
}

interface ModalProduitChimiqueProps {
  isOpen: boolean;
  onClose: () => void;
  produit?: ProduitChimique | null;
  mode: 'create' | 'edit' | 'view';
  onSubmit: (produit: any) => void;
}

export default function ModalProduitChimique({ isOpen, onClose, produit, mode, onSubmit }: ModalProduitChimiqueProps) {
  const [formData, setFormData] = useState({
    numero: '',
    nom: '',
    nomCommercial: '',
    description: '',
    reference: '',
    classification: {
      type: '',
      categorie: '',
      usage: ''
    },
    proprietes: {
      etat: '',
      couleur: '',
      odeur: ''
    },
    stock: { 
      quantiteTotale: 0,
      quantiteDisponible: 0, 
      seuilAlerte: 1,
      unite: 'L'
    },
    risques: {
      symboles: [],
      classeDanger: ''
    }
  });

  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const isReadOnly = mode === 'view';

  // Fonction pour générer un numéro produit chimique
  const generateNumero = () => {
    const timestamp = new Date().getFullYear();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `CHIM-${timestamp}-${random}`;
  };

  useEffect(() => {
    if (produit && mode === 'edit') {
      setFormData({
        numero: produit.numero || '',
        nom: produit.nom || '',
        nomCommercial: produit.nomCommercial || '',
        description: produit.description || '',
        reference: produit.reference || '',
        classification: {
          type: produit.classification?.type || '',
          categorie: produit.classification?.categorie || '',
          usage: produit.classification?.usage || ''
        },
        proprietes: {
          etat: produit.proprietes?.etat || '',
          couleur: produit.proprietes?.couleur || '',
          odeur: produit.proprietes?.odeur || ''
        },
        stock: { 
          quantiteTotale: produit.stock?.quantiteTotale || 0,
          quantiteDisponible: produit.stock?.quantiteDisponible || 0, 
          seuilAlerte: produit.stock?.seuilAlerte || 1,
          unite: produit.stock?.unite || 'L'
        },
        risques: {
          symboles: produit.risques?.symboles || [],
          classeDanger: produit.risques?.classeDanger || ''
        }
      });
    } else if (mode === 'create') {
      setFormData({
        numero: generateNumero(),
        nom: '',
        nomCommercial: '',
        description: '',
        reference: '',
        classification: {
          type: '',
          categorie: '',
          usage: ''
        },
        proprietes: {
          etat: '',
          couleur: '',
          odeur: ''
        },
        stock: { 
          quantiteTotale: 0,
          quantiteDisponible: 0, 
          seuilAlerte: 1,
          unite: 'L'
        },
        risques: {
          symboles: [],
          classeDanger: ''
        }
      });
    }
  }, [produit, mode]);

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
      } else if (parent === 'classification') {
        setFormData(prev => ({
          ...prev,
          classification: { ...prev.classification, [child]: value }
        }));
      } else if (parent === 'proprietes') {
        setFormData(prev => ({
          ...prev,
          proprietes: { ...prev.proprietes, [child]: value }
        }));
      } else if (parent === 'risques') {
        setFormData(prev => ({
          ...prev,
          risques: { ...prev.risques, [child]: value }
        }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const validateForm = () => {
    const errors: string[] = [];
    if (!formData.numero.trim()) errors.push('Le numéro produit chimique est obligatoire');
    if (!formData.nom.trim()) errors.push('Le nom du produit chimique est obligatoire');
    if (!formData.classification.type) errors.push('Le type de produit est obligatoire');
    if (!formData.proprietes.etat) errors.push('L\'état du produit est obligatoire');
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
          nomCommercial: '',
          description: '',
          reference: '',
          classification: {
            type: '',
            categorie: '',
            usage: ''
          },
          proprietes: {
            etat: '',
            couleur: '',
            odeur: ''
          },
          stock: { 
            quantiteTotale: 0,
            quantiteDisponible: 0, 
            seuilAlerte: 1,
            unite: 'L'
          },
          risques: {
            symboles: [],
            classeDanger: ''
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
      case 'create': return 'Nouveau Produit Chimique';
      case 'edit': return 'Modifier le Produit Chimique';
      case 'view': return 'Détails du Produit Chimique';
      default: return 'Produit Chimique';
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
                {mode === 'create' ? 'Produit chimique créé avec succès!' : 'Produit chimique modifié avec succès!'}
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
              <FlaskConical className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h4 className="text-xl font-semibold text-gray-900 dark:text-white">Informations générales</h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Numéro produit"
              name="numero"
              type="text"
              value={formData.numero}
              onChange={handleInputChange}
              placeholder="Numéro automatique"
              required
              disabled={true}
            />
            
            <FormInput
              label="Nom du produit"
              name="nom"
              type="text"
              value={formData.nom}
              onChange={handleInputChange}
              placeholder="Ex: Acide chlorhydrique"
              required
              disabled={isReadOnly}
            />
            
            <FormInput
              label="Nom commercial"
              name="nomCommercial"
              type="text"
              value={formData.nomCommercial}
              onChange={handleInputChange}
              placeholder="Nom commercial"
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
                placeholder="Description du produit"
                disabled={isReadOnly}
              />
            </div>
            
            <FormInput
              label="Type de produit"
              name="classification.type"
              type="select"
              value={formData.classification.type}
              onChange={handleInputChange}
              options={[
                { value: '', label: 'Sélectionner un type' },
                { value: 'Détergent', label: 'Détergent' },
                { value: 'Désinfectant', label: 'Désinfectant' },
                { value: 'Solvant', label: 'Solvant' },
                { value: 'Acide', label: 'Acide' },
                { value: 'Base', label: 'Base' },
                { value: 'Oxydant', label: 'Oxydant' },
                { value: 'Réducteur', label: 'Réducteur' },
                { value: 'Autre', label: 'Autre' }
              ]}
              required
              disabled={isReadOnly}
            />
            
            <FormInput
              label="Usage"
              name="classification.usage"
              type="select"
              value={formData.classification.usage}
              onChange={handleInputChange}
              options={[
                { value: '', label: 'Sélectionner un usage' },
                { value: 'Nettoyage', label: 'Nettoyage' },
                { value: 'Désinfection', label: 'Désinfection' },
                { value: 'Dégraissage', label: 'Dégraissage' },
                { value: 'Décapage', label: 'Décapage' },
                { value: 'Traitement', label: 'Traitement' },
                { value: 'Autre', label: 'Autre' }
              ]}
              disabled={isReadOnly}
            />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-6 rounded-xl border border-green-100 dark:border-green-800">
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mr-3">
              <FlaskConical className="w-5 h-5 text-green-600 dark:text-green-400" />
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
              step="0.01"
              disabled={isReadOnly}
            />
            <FormInput
              label="Quantité disponible"
              name="stock.quantiteDisponible"
              type="number"
              value={formData.stock.quantiteDisponible.toString()}
              onChange={handleInputChange}
              min="0"
              step="0.01"
              disabled={isReadOnly}
            />
            <FormInput
              label="Seuil d'alerte"
              name="stock.seuilAlerte"
              type="number"
              value={formData.stock.seuilAlerte.toString()}
              onChange={handleInputChange}
              min="0"
              step="0.01"
              disabled={isReadOnly}
            />
            <FormInput
              label="Unité"
              name="stock.unite"
              type="select"
              value={formData.stock.unite}
              onChange={handleInputChange}
              options={[
                { value: 'L', label: 'Litre (L)' },
                { value: 'ml', label: 'Millilitre (ml)' },
                { value: 'kg', label: 'Kilogramme (kg)' },
                { value: 'g', label: 'Gramme (g)' },
                { value: 'pièce', label: 'Pièce' }
              ]}
              disabled={isReadOnly}
            />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 p-6 rounded-xl border border-purple-100 dark:border-purple-800">
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mr-3">
              <FlaskConical className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <h4 className="text-xl font-semibold text-gray-900 dark:text-white">Caractéristiques chimiques</h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormInput
              label="État"
              name="proprietes.etat"
              type="select"
              value={formData.proprietes.etat}
              onChange={handleInputChange}
              options={[
                { value: '', label: 'Sélectionner un état' },
                { value: 'Solide', label: 'Solide' },
                { value: 'Liquide', label: 'Liquide' },
                { value: 'Gaz', label: 'Gaz' },
                { value: 'Poudre', label: 'Poudre' }
              ]}
              required
              disabled={isReadOnly}
            />
            <FormInput
              label="Couleur"
              name="proprietes.couleur"
              type="text"
              value={formData.proprietes.couleur}
              onChange={handleInputChange}
              placeholder="Ex: Transparent, Jaune"
              disabled={isReadOnly}
            />
            <FormInput
              label="Odeur"
              name="proprietes.odeur"
              type="text"
              value={formData.proprietes.odeur}
              onChange={handleInputChange}
              placeholder="Ex: Aucune, Piquante"
              disabled={isReadOnly}
            />
          </div>
        </div>

        <div className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 p-6 rounded-xl border border-red-100 dark:border-red-800">
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center mr-3">
              <Shield className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <h4 className="text-xl font-semibold text-gray-900 dark:text-white">Informations de sécurité</h4>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            <FormInput
              label="Classe de danger"
              name="risques.classeDanger"
              type="text"
              value={formData.risques.classeDanger}
              onChange={handleInputChange}
              placeholder="Ex: Classe 8 - Corrosif"
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
              {isSubmitting ? 'Enregistrement...' : mode === 'create' ? 'Créer le produit' : 'Modifier le produit'}
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