import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import ErrorBoundary from '../common/ErrorBoundary';

// Pages
import Dashboard from '../../pages/Dashboard';
import Configuration from '../../pages/Configuration';
import Laboratoire from '../../pages/Laboratoire';
import Qualite from '../../pages/Qualite';
import HSE from '../../pages/HSE';
import { Login } from '../../pages/Login';

// Composant de protection des routes
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Composant principal du routeur
const AppRouter: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  // Si en cours de chargement
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Chargement...</p>
        </div>
      </div>
    );
  }

  // Si non authentifié, afficher seulement la page de connexion
  if (!isAuthenticated) {
    return (
      <ErrorBoundary>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </ErrorBoundary>
    );
  }

  // Si authentifié, afficher l'interface complète
  return (
    <ErrorBoundary>
      <Routes>
      {/* Route de connexion */}
      <Route path="/login" element={<Navigate to="/dashboard" replace />} />
      
      {/* Routes protégées */}
      <Route path="/" element={
        <ProtectedRoute>
          <Navigate to="/dashboard" replace />
        </ProtectedRoute>
      } />
      
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      
      <Route path="/configuration" element={
        <ProtectedRoute>
          <Configuration />
        </ProtectedRoute>
      } />
      
      {/* Module Laboratoire */}
      <Route path="/laboratoire" element={
        <ProtectedRoute>
          <Laboratoire />
        </ProtectedRoute>
      } />
      <Route path="/laboratoire/echantillons" element={
        <ProtectedRoute>
          <Laboratoire activeTab="echantillons" />
        </ProtectedRoute>
      } />
      <Route path="/laboratoire/analyses" element={
        <ProtectedRoute>
          <Laboratoire activeTab="analyses" />
        </ProtectedRoute>
      } />
      <Route path="/laboratoire/plans-controle" element={
        <ProtectedRoute>
          <Laboratoire activeTab="plans-controle" />
        </ProtectedRoute>
      } />
      <Route path="/laboratoire/tracabilite" element={
        <ProtectedRoute>
          <Laboratoire activeTab="tracabilite" />
        </ProtectedRoute>
      } />
      <Route path="/laboratoire/statistiques" element={
        <ProtectedRoute>
          <Laboratoire activeTab="statistiques" />
        </ProtectedRoute>
      } />
      
      {/* Module Qualité */}
      <Route path="/qualite" element={
        <ProtectedRoute>
          <Qualite />
        </ProtectedRoute>
      } />
      <Route path="/qualite/matieres-premieres" element={
        <ProtectedRoute>
          <Qualite activeTab="matieres-premieres" />
        </ProtectedRoute>
      } />
      <Route path="/qualite/controles-qualite" element={
        <ProtectedRoute>
          <Qualite activeTab="controles-qualite" />
        </ProtectedRoute>
      } />
      <Route path="/qualite/non-conformites" element={
        <ProtectedRoute>
          <Qualite activeTab="non-conformites" />
        </ProtectedRoute>
      } />
      <Route path="/qualite/decisions-qualite" element={
        <ProtectedRoute>
          <Qualite activeTab="decisions-qualite" />
        </ProtectedRoute>
      } />
      <Route path="/qualite/plans-controle" element={
        <ProtectedRoute>
          <Qualite activeTab="plans-controle" />
        </ProtectedRoute>
      } />
      <Route path="/qualite/tracabilite" element={
        <ProtectedRoute>
          <Qualite activeTab="tracabilite" />
        </ProtectedRoute>
      } />
      <Route path="/qualite/audits" element={
        <ProtectedRoute>
          <Qualite activeTab="audits" />
        </ProtectedRoute>
      } />
      <Route path="/qualite/conformite" element={
        <ProtectedRoute>
          <Qualite activeTab="conformite" />
        </ProtectedRoute>
      } />
      <Route path="/qualite/statistiques" element={
        <ProtectedRoute>
          <Qualite activeTab="statistiques" />
        </ProtectedRoute>
      } />
      
      {/* Module HSE */}
      <Route path="/hse" element={
        <ProtectedRoute>
          <HSE />
        </ProtectedRoute>
      } />
      <Route path="/hse/hygiene" element={
        <ProtectedRoute>
          <HSE activeTab="hygiene" />
        </ProtectedRoute>
      } />
      <Route path="/hse/epi" element={
        <ProtectedRoute>
          <HSE activeTab="epi" />
        </ProtectedRoute>
      } />
      <Route path="/hse/produits-chimiques" element={
        <ProtectedRoute>
          <HSE activeTab="produits-chimiques" />
        </ProtectedRoute>
      } />
      <Route path="/hse/incidents" element={
        <ProtectedRoute>
          <HSE activeTab="incidents" />
        </ProtectedRoute>
      } />
      <Route path="/hse/risques" element={
        <ProtectedRoute>
          <HSE activeTab="risques" />
        </ProtectedRoute>
      } />
      <Route path="/hse/formations" element={
        <ProtectedRoute>
          <HSE activeTab="formations" />
        </ProtectedRoute>
      } />
      <Route path="/hse/statistiques" element={
        <ProtectedRoute>
          <HSE activeTab="statistiques" />
        </ProtectedRoute>
      } />
      
      {/* Route par défaut - redirection vers dashboard */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </ErrorBoundary>
  );
};

export default AppRouter;
