import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, Shield, Loader, ArrowRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../common/Button';
import { Input } from '../common/Input';

interface LoginFormProps {
  onSwitchToRegister?: () => void;
  onClose?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToRegister, onClose }) => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    setError('');
    setIsLoading(true);

    try {
      await login(formData);
      if (onClose) {
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Erreur de connexion');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Nettoyer l'erreur quand l'utilisateur tape
    if (error) setError('');
  };

  const isFormValid = formData.email && formData.password;

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl border border-white/30">
            <Lock className="h-8 w-8 text-white" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-white">
          Connexion
        </h2>
        <p className="text-white/70 mt-2">
          Accédez à votre espace de travail
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-500/20 backdrop-blur-sm border border-red-400/30 rounded-xl">
          <p className="text-sm text-red-200">{error}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-white/90 mb-2">
            Adresse email
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-white/50" />
            </div>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40 transition-all duration-200"
              placeholder="votre.email@entreprise.com"
              required
              autoComplete="email"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-white/90 mb-2">
            Mot de passe
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-white/50" />
            </div>
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              className="w-full pl-10 pr-12 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40 transition-all duration-200"
              placeholder="Votre mot de passe"
              required
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5 text-white/50 hover:text-white/70 transition-colors" />
              ) : (
                <Eye className="h-5 w-5 text-white/50 hover:text-white/70 transition-colors" />
              )}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!isFormValid || isLoading}
          className="w-full py-3 px-6 bg-white text-gray-900 font-semibold rounded-xl hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-white/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
        >
          {isLoading ? (
            <>
              <Loader className="h-4 w-4 animate-spin" />
              <span>Connexion en cours...</span>
            </>
          ) : (
            <>
              <span>Se connecter</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>

      {/* Footer */}
      {onSwitchToRegister && (
        <div className="mt-6 text-center">
          <p className="text-sm text-white/70">
            Pas encore de compte ?{' '}
            <button
              type="button"
              onClick={onSwitchToRegister}
              className="font-medium text-white hover:text-white/80 underline underline-offset-2 transition-colors"
            >
              Créer un compte
            </button>
          </p>
        </div>
      )}

      {/* Demo Credentials */}
      {/* <div className="mt-8 p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl">
        <h4 className="text-sm font-medium text-white/90 mb-3">
          Comptes de test disponibles :
        </h4>
        <div className="space-y-2 text-xs text-white/70">
          <div className="p-3 bg-white/5 rounded-xl border-l-4 border-red-400">
            <p><strong className="text-red-300">🔴 Administrateur :</strong></p>
            <p className="mt-1">admin@trafrule.com / Admin2024!</p>
          </div>
          
          <div className="p-3 bg-white/5 rounded-xl border-l-4 border-blue-400">
            <p><strong className="text-blue-300">🔵 Responsable QHSE :</strong></p>
            <p className="mt-1">arsene.orounla@trafrule.com / QHSE2024!</p>
          </div>
          
          <div className="p-3 bg-white/5 rounded-xl border-l-4 border-green-400">
            <p><strong className="text-green-300">🟢 Manager :</strong></p>
            <p className="mt-1">manager@trafrule.com / Manager2024!</p>
          </div>
          
          <div className="p-3 bg-white/5 rounded-xl border-l-4 border-yellow-400">
            <p><strong className="text-yellow-300">🟡 Employé :</strong></p>
            <p className="mt-1">employe@trafrule.com / Employe2024!</p>
          </div>
        </div>
      </div> */}
    </div>
  );
};
