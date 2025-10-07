import { useState, useEffect } from 'react';

// Hook pour afficher l'heure en temps réel
export const useRealTime = (updateInterval: number = 1000) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, updateInterval);

    return () => clearInterval(interval);
  }, [updateInterval]);

  return currentTime;
};

// Hook pour formater l'heure selon les préférences locales
export const useFormattedTime = (updateInterval: number = 1000) => {
  const currentTime = useRealTime(updateInterval);
  
  const formatTime = (date: Date) => {
    return {
      time: date.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }),
      date: date.toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      fullDateTime: date.toLocaleString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }),
      shortDateTime: date.toLocaleString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    };
  };

  return formatTime(currentTime);
};
