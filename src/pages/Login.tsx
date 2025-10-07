import React, { useState } from 'react';
import { LoginForm } from '../components/auth/LoginForm';
import { RegisterForm } from '../components/auth/RegisterForm';
import { Shield, Users, Lock, UserPlus, ArrowRight, CheckCircle } from 'lucide-react';

export const Login: React.FC = () => {
  const [isLoginMode, setIsLoginMode] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-primary-900 to-slate-800 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background patterns */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 32 32%27 width=%2732%27 height=%2732%27 fill=%27none%27 stroke=%27rgb(148 163 184 / 0.05)%27%3e%3cpath d=%27m0 .5 32 32M32 .5 0 32%27/%3e%3c/svg%3e')] opacity-20"></div>
      
      <div className="w-full max-w-7xl flex items-center justify-center relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 w-full">
          
          {/* Left Side - Branding */}
          <div className="hidden lg:flex flex-col justify-center space-y-8 text-white px-8">
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                  <Shield className="h-12 w-12 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    Module QHSE
                  </h1>
                  <p className="text-lg text-gray-300">Trafrule ERP - Gestion QHSE</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold">
                  Plateforme intégrée de gestion QHSE
                </h2>
                <p className="text-gray-300 text-lg leading-relaxed">
                  Gérez efficacement la qualité, l'hygiène, la sécurité et l'environnement 
                  de votre entreprise avec notre solution complète.
                </p>
              </div>

              <div className="space-y-4">
                {[
                  { icon: CheckCircle, text: "Audits et contrôles qualité" },
                  { icon: CheckCircle, text: "Gestion des incidents et risques" },
                  { icon: CheckCircle, text: "Formations et certifications" },
                  { icon: CheckCircle, text: "Conformité réglementaire" }
                ].map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <feature.icon className="h-5 w-5 text-green-400" />
                    <span className="text-gray-300">{feature.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Side - Auth Forms */}
          <div className="flex flex-col justify-center">
            <div className="w-full max-w-md mx-auto">
              
              {/* Mobile Header */}
              <div className="lg:hidden text-center mb-8">
                <div className="flex justify-center mb-6">
                  <div className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                    <Shield className="h-16 w-16 text-white" />
                  </div>
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  Module QHSE
                </h1>
                <p className="text-gray-300">
                  Trafrule ERP - Gestion QHSE
                </p>
              </div>

              {/* Modern Toggle */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-1 mb-8">
                <div className="grid grid-cols-2 gap-1">
                  <button
                    onClick={() => setIsLoginMode(true)}
                    className={`flex items-center justify-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                      isLoginMode
                        ? 'bg-white text-gray-900 shadow-lg'
                        : 'text-white/70 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Lock className="h-4 w-4" />
                    <span>Connexion</span>
                  </button>
                  <button
                    onClick={() => setIsLoginMode(false)}
                    className={`flex items-center justify-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                      !isLoginMode
                        ? 'bg-white text-gray-900 shadow-lg'
                        : 'text-white/70 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <UserPlus className="h-4 w-4" />
                    <span>Inscription</span>
                  </button>
                </div>
              </div>

              {/* Form Container */}
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 shadow-2xl">
                {isLoginMode ? (
                  <LoginForm onSwitchToRegister={() => setIsLoginMode(false)} />
                ) : (
                  <RegisterForm onSwitchToLogin={() => setIsLoginMode(true)} />
                )}
              </div>

              {/* Footer */}
              <div className="text-center mt-8">
                <p className="text-sm text-white/60">
                  © 2024 Trafrule. Tous droits réservés.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
