/**
 * Utilitaires pour la validation des formulaires
 */

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export const validateField = (value: any, rules: ValidationRule, fieldName: string): string | null => {
  // Validation required
  if (rules.required && (!value || value.toString().trim() === '')) {
    return `${fieldName} est requis`;
  }

  if (!value) return null; // Si pas de valeur et pas required, pas d'erreur

  const stringValue = value.toString();

  // Validation minLength
  if (rules.minLength && stringValue.length < rules.minLength) {
    return `${fieldName} doit contenir au moins ${rules.minLength} caractères`;
  }

  // Validation maxLength
  if (rules.maxLength && stringValue.length > rules.maxLength) {
    return `${fieldName} doit contenir au maximum ${rules.maxLength} caractères`;
  }

  // Validation pattern
  if (rules.pattern && !rules.pattern.test(stringValue)) {
    return `${fieldName} n'est pas au bon format`;
  }

  // Validation custom
  if (rules.custom) {
    return rules.custom(value);
  }

  return null;
};

export const validateForm = (data: Record<string, any>, rules: Record<string, ValidationRule>): ValidationResult => {
  const errors: Record<string, string> = {};

  Object.keys(rules).forEach(fieldName => {
    const fieldRules = rules[fieldName];
    const fieldValue = data[fieldName];
    const error = validateField(fieldValue, fieldRules, fieldName);
    
    if (error) {
      errors[fieldName] = error;
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Règles de validation communes
export const commonValidationRules = {
  required: { required: true },
  email: { 
    required: true, 
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    custom: (value: string) => {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return "Format d'email invalide";
      }
      return null;
    }
  },
  phone: {
    pattern: /^(\+33|0)[1-9](\d{8})$/,
    custom: (value: string) => {
      if (!/^(\+33|0)[1-9](\d{8})$/.test(value)) {
        return "Format de téléphone invalide";
      }
      return null;
    }
  },
  password: {
    required: true,
    minLength: 8,
    custom: (value: string) => {
      if (value.length < 8) {
        return "Le mot de passe doit contenir au moins 8 caractères";
      }
      if (!/(?=.*[a-z])/.test(value)) {
        return "Le mot de passe doit contenir au moins une minuscule";
      }
      if (!/(?=.*[A-Z])/.test(value)) {
        return "Le mot de passe doit contenir au moins une majuscule";
      }
      if (!/(?=.*\d)/.test(value)) {
        return "Le mot de passe doit contenir au moins un chiffre";
      }
      return null;
    }
  }
};

// Validation spécifique pour les audits
export const auditValidationRules = {
  titre: { required: true, minLength: 3, maxLength: 100 },
  auditeurPrincipal: { required: true, minLength: 2 },
  dateDebut: { required: true },
  dateFin: { 
    required: true,
    custom: (value: string, allData?: any) => {
      if (allData?.dateDebut && new Date(value) <= new Date(allData.dateDebut)) {
        return "La date de fin doit être postérieure à la date de début";
      }
      return null;
    }
  }
};
