import React, { ReactNode } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Loader, Shield, Lock } from 'lucide-react';
import { Button } from '../common/Button';

interface ProtectedRouteProps {
  children: ReactNode;
  permissions?: string[];
  roles?: string[];
  fallback?: ReactNode;
  onUnauthorized?: () => void;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  permissions = [],
  roles = [],
  fallback,
  onUnauthorized
}) => {
  const { isAuthenticated, isLoading, user, hasPermission, hasRole } = useAuth();

  // Afficher le loader pendant la vérification de l'authentification
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            Vérification de l'authentification...
          </p>
        </div>
      </div>
    );
  }

  // Utilisateur non connecté
  if (!isAuthenticated || !user) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="max-w-md w-full mx-auto p-6">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-red-100 dark:bg-red-900/20 rounded-full">
                <Shield className="h-12 w-12 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Authentification requise
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Vous devez être connecté pour accéder à cette page.
            </p>
            <Button
              onClick={onUnauthorized}
              className="w-full"
            >
              Se connecter
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Vérification des permissions
  if (permissions.length > 0) {
    const hasRequiredPermission = permissions.some(permission => hasPermission(permission));
    if (!hasRequiredPermission) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="max-w-md w-full mx-auto p-6">
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-orange-100 dark:bg-orange-900/20 rounded-full">
                  <Lock className="h-12 w-12 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Accès non autorisé
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Vous n'avez pas les permissions nécessaires pour accéder à cette page.
              </p>
              <div className="text-sm text-gray-500 dark:text-gray-500 mb-6">
                <p>Permissions requises : {permissions.join(', ')}</p>
                <p>Vos permissions : {user.permissions.join(', ') || 'Aucune'}</p>
              </div>
              <Button
                onClick={() => window.history.back()}
                variant="secondary"
                className="w-full"
              >
                Retour
              </Button>
            </div>
          </div>
        </div>
      );
    }
  }

  // Vérification des rôles
  if (roles.length > 0) {
    const hasRequiredRole = hasRole(roles);
    if (!hasRequiredRole) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="max-w-md w-full mx-auto p-6">
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-orange-100 dark:bg-orange-900/20 rounded-full">
                  <Lock className="h-12 w-12 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Rôle insuffisant
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Votre rôle ne vous permet pas d'accéder à cette page.
              </p>
              <div className="text-sm text-gray-500 dark:text-gray-500 mb-6">
                <p>Rôles autorisés : {roles.join(', ')}</p>
                <p>Votre rôle : {user.role}</p>
              </div>
              <Button
                onClick={() => window.history.back()}
                variant="secondary"
                className="w-full"
              >
                Retour
              </Button>
            </div>
          </div>
        </div>
      );
    }
  }

  // Utilisateur autorisé, afficher le contenu
  return <>{children}</>;
};

// Hook pour vérifier les permissions sans composant
export const usePermissionCheck = () => {
  const { hasPermission, hasRole, user, isAuthenticated } = useAuth();

  const checkPermission = (permission: string): boolean => {
    return isAuthenticated && hasPermission(permission);
  };

  const checkRole = (role: string | string[]): boolean => {
    return isAuthenticated && hasRole(role);
  };

  const checkAny = (permissions: string[] = [], roles: string[] = []): boolean => {
    if (!isAuthenticated) return false;
    
    const hasAnyPermission = permissions.length === 0 || permissions.some(p => hasPermission(p));
    const hasAnyRole = roles.length === 0 || hasRole(roles);
    
    return hasAnyPermission && hasAnyRole;
  };

  return {
    checkPermission,
    checkRole,
    checkAny,
    user,
    isAuthenticated
  };
};
