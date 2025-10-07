import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  // État pour stocker la valeur
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      // Si l'item est null ou undefined, retourner initialValue
      if (item === null || item === undefined) {
        return initialValue;
      }
      // Si l'item est une chaîne vide et que initialValue est null, retourner null
      if (item === '' && initialValue === null) {
        return initialValue;
      }
      // Sinon, parser l'item
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Fonction pour définir la valeur
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      
      // Si la valeur est null ou undefined, supprimer la clé du localStorage
      if (valueToStore === null || valueToStore === undefined) {
        window.localStorage.removeItem(key);
      } else {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue] as const;
}
