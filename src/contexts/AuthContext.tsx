import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { authService } from '../services/api';

// Types pour l'authentification
export interface User {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  role: 'admin' | 'manager' | 'responsable_qhse' | 'employe';
  permissions: string[];
  entreprise: string;
  departement?: string;
  poste?: string;
  preferences?: {
    theme: 'light' | 'dark' | 'auto';
    language: 'fr' | 'en';
    notifications: {
      email: boolean;
      incidents: boolean;
      audits: boolean;
      formations: boolean;
    };
  };
  lastLogin?: string;
  createdAt?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  nom: string;
  prenom: string;
  email: string;
  password: string;
  entreprise: string;
  departement?: string;
  poste?: string;
  role?: string;
}

export interface AuthContextType {
  // État d'authentification
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions d'authentification
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  
  // Gestion du profil
  updateProfile: (data: Partial<User>) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  
  // Utilitaires
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string | string[]) => boolean;
  getFullName: () => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useLocalStorage<string>('qhse-token', '');
  const [refreshTokenValue, setRefreshToken] = useLocalStorage<string>('qhse-refresh-token', '');



  // Fonction pour nettoyer complètement l'authentification
  const clearAuth = () => {
    setToken('');
    setRefreshToken('');
    setUser(null);
    // Nettoyer aussi le localStorage directement au cas où
    localStorage.removeItem('qhse-token');
    localStorage.removeItem('qhse-refresh-token');
  };

  // Vérifier l'authentification au chargement
  const checkAuth = async () => {
    if (!token || token.trim() === '') {
      setIsLoading(false);
      return;
    }

    try {
      const response = await authService.getProfile();
      setUser(response.data.user);
    } catch (error: any) {
      console.error('Erreur lors de la vérification de l\'authentification:', error);
      
      // Si c'est une erreur 401 ou token invalide, nettoyer complètement
      if (error.message?.includes('Token') || 
          error.message?.includes('invalide') ||
          error.response?.status === 401) {
        console.log('🧹 Token invalide détecté, nettoyage de l\'authentification');
        clearAuth();
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Connexion
  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      const response = await authService.login(credentials);
      const { user: userData, token: newToken, refreshToken: newRefreshToken } = response.data;
      
      setUser(userData);
      setToken(newToken);
      setRefreshToken(newRefreshToken);
    } catch (error: any) {
      throw error; // L'erreur est déjà formatée par le service
    } finally {
      setIsLoading(false);
    }
  };

  // Inscription
  const register = async (data: RegisterData) => {
    setIsLoading(true);
    try {
      const response = await authService.register(data);
      const { user: userData, token: newToken, refreshToken: newRefreshToken } = response.data;
      
      setUser(userData);
      setToken(newToken);
      setRefreshToken(newRefreshToken);
    } catch (error: any) {
      throw error; // L'erreur est déjà formatée par le service
    } finally {
      setIsLoading(false);
    }
  };

  // Déconnexion
  const logout = async () => {
    setIsLoading(true);
    try {
      if (token && refreshTokenValue) {
        await authService.logout(refreshTokenValue);
      }
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      clearAuth();
      setIsLoading(false);
    }
  };

  // Rafraîchir le token
  const refreshTokenFunc = async () => {
    if (!refreshTokenValue) {
      throw new Error('Aucun token de rafraîchissement disponible');
    }

    try {
      const response = await authService.refreshToken(refreshTokenValue);
      setToken(response.token);
    } catch (error) {
      // Token de rafraîchissement invalide, forcer la déconnexion
      await logout();
      throw error;
    }
  };

  // Mettre à jour le profil
  const updateProfile = async (data: Partial<User>) => {
    try {
      const response = await authService.updateProfile(data);
      setUser(response.data.user);
    } catch (error: any) {
      throw error; // L'erreur est déjà formatée par le service
    }
  };

  // Changer le mot de passe
  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      await authService.changePassword(currentPassword, newPassword);
    } catch (error: any) {
      throw error; // L'erreur est déjà formatée par le service
    }
  };

  // Vérifier les permissions
  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    return user.permissions.includes('admin') || user.permissions.includes(permission);
  };

  // Vérifier les rôles
  const hasRole = (role: string | string[]): boolean => {
    if (!user) return false;
    const roles = Array.isArray(role) ? role : [role];
    return roles.includes(user.role);
  };

  // Obtenir le nom complet
  const getFullName = (): string => {
    if (!user) return '';
    return `${user.prenom} ${user.nom}`;
  };

  // Écouter les événements de déconnexion
  useEffect(() => {
    const handleLogout = () => {
      clearAuth();
    };

    window.addEventListener('auth:logout', handleLogout);
    return () => {
      window.removeEventListener('auth:logout', handleLogout);
    };
  }, []);

  // Vérifier l'authentification au montage
  useEffect(() => {
    checkAuth();
  }, []); // Pas de dépendance pour éviter les boucles

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    refreshToken: refreshTokenFunc,
    updateProfile,
    changePassword,
    hasPermission,
    hasRole,
    getFullName,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook personnalisé pour utiliser le contexte d'authentification
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  return context;
};

export default AuthProvider;
