import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

// Formatage des dates
export const formatDate = (date: Date | string, formatStr: string = 'dd/MM/yyyy'): string => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, formatStr, { locale: fr });
  } catch (error) {
    return 'Date invalide';
  }
};

export const formatDateTime = (date: Date | string): string => {
  return formatDate(date, 'dd/MM/yyyy HH:mm');
};

// Formatage des nombres
export const formatNumber = (num: number, decimals: number = 2): string => {
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
};

export const formatCurrency = (amount: number, currency: string = 'EUR'): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency,
  }).format(amount);
};

// Gestion des statuts
export const getStatusColor = (status: string): string => {
  const statusColors: Record<string, string> = {
    'Planifié': 'bg-blue-100 text-blue-800',
    'En cours': 'bg-yellow-100 text-yellow-800',
    'Terminé': 'bg-green-100 text-green-800',
    'Annulé': 'bg-red-100 text-red-800',
    'Résolu': 'bg-green-100 text-green-800',
    'Conforme': 'bg-green-100 text-green-800',
    'Non conforme': 'bg-red-100 text-red-800',
  };
  
  return statusColors[status] || 'bg-gray-100 text-gray-800';
};

// Gestion des erreurs
export const getErrorMessage = (error: any): string => {
  if (typeof error === 'string') return error;
  if (error?.message) return error.message;
  if (error?.response?.data?.message) return error.response.data.message;
  return 'Une erreur inattendue s\'est produite';
};

// Gestion du stockage local
export const setLocalStorage = (key: string, value: any): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Erreur lors de la sauvegarde en localStorage:', error);
  }
};

export const getLocalStorage = <T>(key: string, defaultValue?: T): T | null => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue || null;
  } catch (error) {
    console.error('Erreur lors de la lecture du localStorage:', error);
    return defaultValue || null;
  }
}; 