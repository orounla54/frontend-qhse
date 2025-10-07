import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, User, Building, Briefcase, Loader } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Select } from '../common/Select';

interface RegisterFormProps {
  onSwitchToLogin?: () => void;
  onClose?: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSwitchToLogin, onClose }) => {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    password: '',
    confirmPassword: '',
    entreprise: '',
    departement: '',
    poste: '',
    role: 'employe',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const roles = [
    { value: 'employe', label: 'Employé' },
    { value: 'responsable_qhse', label: 'Responsable QHSE' },
    { value: 'manager', label: 'Manager' },
    { value: 'admin', label: 'Administrateur' },
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Validation des champs requis
    if (!formData.nom.trim()) newErrors.nom = 'Le nom est requis';
    if (!formData.prenom.trim()) newErrors.prenom = 'Le prénom est requis';
    if (!formData.email.trim()) newErrors.email = 'L\'email est requis';
    if (!formData.password) newErrors.password = 'Le mot de passe est requis';
    if (!formData.confirmPassword) newErrors.confirmPassword = 'La confirmation est requise';
    if (!formData.entreprise.trim()) newErrors.entreprise = 'L\'entreprise est requise';

    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Format d\'email invalide';
    }

    // Validation mot de passe
    if (formData.password && formData.password.length < 6) {
      newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    }
    
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
    if (formData.password && !passwordRegex.test(formData.password)) {
      newErrors.password = 'Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre';
    }

    // Validation confirmation mot de passe
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const { confirmPassword, ...registerData } = formData;
      await register(registerData);
      if (onClose) {
        onClose();
      }
    } catch (err: any) {
      setErrors({ submit: err.message || 'Erreur lors de l\'inscription' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Nettoyer l'erreur pour ce champ
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const isFormValid = formData.nom && formData.prenom && formData.email && 
                     formData.password && formData.confirmPassword && formData.entreprise;

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-primary-100 dark:bg-primary-900 rounded-full">
            <User className="h-8 w-8 text-primary-600 dark:text-primary-400" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Créer un compte
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Rejoignez l'espace QHSE de votre entreprise
        </p>
      </div>

      {/* Error Message */}
      {errors.submit && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{errors.submit}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nom et Prénom */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="nom" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nom *
            </label>
            <Input
              id="nom"
              name="nom"
              type="text"
              value={formData.nom}
              onChange={handleChange}
              placeholder="Nom"
              required
              autoComplete="family-name"
              className={errors.nom ? 'border-red-300 dark:border-red-600' : ''}
            />
            {errors.nom && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.nom}</p>}
          </div>
          
          <div>
            <label htmlFor="prenom" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Prénom *
            </label>
            <Input
              id="prenom"
              name="prenom"
              type="text"
              value={formData.prenom}
              onChange={handleChange}
              placeholder="Prénom"
              required
              autoComplete="given-name"
              className={errors.prenom ? 'border-red-300 dark:border-red-600' : ''}
            />
            {errors.prenom && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.prenom}</p>}
          </div>
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Adresse email *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-4 w-4 text-gray-400" />
            </div>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className={`pl-9 ${errors.email ? 'border-red-300 dark:border-red-600' : ''}`}
              placeholder="votre.email@entreprise.com"
              required
              autoComplete="email"
            />
          </div>
          {errors.email && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.email}</p>}
        </div>

        {/* Mot de passe */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Mot de passe *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-4 w-4 text-gray-400" />
            </div>
            <Input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              className={`pl-9 pr-9 ${errors.password ? 'border-red-300 dark:border-red-600' : ''}`}
              placeholder="Minimum 6 caractères"
              required
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
              ) : (
                <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
              )}
            </button>
          </div>
          {errors.password && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.password}</p>}
        </div>

        {/* Confirmation mot de passe */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Confirmer le mot de passe *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-4 w-4 text-gray-400" />
            </div>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`pl-9 pr-9 ${errors.confirmPassword ? 'border-red-300 dark:border-red-600' : ''}`}
              placeholder="Répétez le mot de passe"
              required
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
              ) : (
                <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
              )}
            </button>
          </div>
          {errors.confirmPassword && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.confirmPassword}</p>}
        </div>

        {/* Entreprise */}
        <div>
          <label htmlFor="entreprise" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Entreprise *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Building className="h-4 w-4 text-gray-400" />
            </div>
            <Input
              id="entreprise"
              name="entreprise"
              type="text"
              value={formData.entreprise}
              onChange={handleChange}
              className={`pl-9 ${errors.entreprise ? 'border-red-300 dark:border-red-600' : ''}`}
              placeholder="Nom de votre entreprise"
              required
              autoComplete="organization"
            />
          </div>
          {errors.entreprise && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.entreprise}</p>}
        </div>

        {/* Département et Poste */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="departement" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Département
            </label>
            <Input
              id="departement"
              name="departement"
              type="text"
              value={formData.departement}
              onChange={handleChange}
              placeholder="Ex: Production"
              autoComplete="organization-title"
            />
          </div>
          
          <div>
            <label htmlFor="poste" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Poste
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Briefcase className="h-4 w-4 text-gray-400" />
              </div>
              <Input
                id="poste"
                name="poste"
                type="text"
                value={formData.poste}
                onChange={handleChange}
                className="pl-9"
                placeholder="Ex: Technicien"
                autoComplete="job-title"
              />
            </div>
          </div>
        </div>

        {/* Rôle */}
        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Rôle
          </label>
          <Select
            id="role"
            value={formData.role}
            onChange={(value) => setFormData(prev => ({ ...prev, role: value }))}
            options={roles}
            className="w-full"
          />
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={!isFormValid || isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader className="h-4 w-4 mr-2 animate-spin" />
              Création en cours...
            </>
          ) : (
            'Créer le compte'
          )}
        </Button>
      </form>

      {/* Footer */}
      {onSwitchToLogin && (
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Déjà un compte ?{' '}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
            >
              Se connecter
            </button>
          </p>
        </div>
      )}
    </div>
  );
};
