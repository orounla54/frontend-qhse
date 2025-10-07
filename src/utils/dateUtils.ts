/**
 * Utilitaires pour la gestion des dates
 */

export const formatDate = (date: Date | string, locale: string = 'fr-FR'): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString(locale);
};

export const formatDateTime = (date: Date | string, locale: string = 'fr-FR'): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleString(locale);
};

export const formatRelativeTime = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInMs = now.getTime() - dateObj.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) return "Aujourd'hui";
  if (diffInDays === 1) return "Hier";
  if (diffInDays < 7) return `Il y a ${diffInDays} jours`;
  if (diffInDays < 30) return `Il y a ${Math.floor(diffInDays / 7)} semaines`;
  if (diffInDays < 365) return `Il y a ${Math.floor(diffInDays / 30)} mois`;
  return `Il y a ${Math.floor(diffInDays / 365)} ans`;
};

export const isDateValid = (date: any): boolean => {
  const dateObj = new Date(date);
  return dateObj instanceof Date && !isNaN(dateObj.getTime());
};

export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const addMonths = (date: Date, months: number): Date => {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
};

export const getDaysBetween = (startDate: Date, endDate: Date): number => {
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const isWeekend = (date: Date): boolean => {
  const day = date.getDay();
  return day === 0 || day === 6;
};

export const getWorkingDays = (startDate: Date, endDate: Date): number => {
  let workingDays = 0;
  const current = new Date(startDate);
  
  while (current <= endDate) {
    if (!isWeekend(current)) {
      workingDays++;
    }
    current.setDate(current.getDate() + 1);
  }
  
  return workingDays;
};
