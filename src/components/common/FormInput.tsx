import React from 'react';

interface FormInputProps {
  label: string;
  name: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'date' | 'time' | 'textarea' | 'select';
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  options?: { value: string; label: string }[];
  rows?: number;
  className?: string;
  min?: string;
  max?: string;
}

export default function FormInput({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  error,
  options = [],
  rows = 3,
  className = '',
  min,
  max
}: FormInputProps) {
  const baseClasses = "w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors";
  const errorClasses = "border-red-300 focus:ring-red-500";
  const normalClasses = "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white";
  const disabledClasses = "bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed";
  
  const inputClasses = `${baseClasses} ${error ? errorClasses : normalClasses} ${disabled ? disabledClasses : ''} ${className}`;

  const renderInput = () => {
    switch (type) {
      case 'textarea':
        return (
          <textarea
            name={name}
            value={value || ''}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            rows={rows}
            className={inputClasses}
          />
        );
      
      case 'select':
        return (
          <select
            name={name}
            value={value || ''}
            onChange={onChange}
            required={required}
            disabled={disabled}
            className={inputClasses}
          >
            <option value="">Sélectionner...</option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      
      default:
        return (
          <input
            type={type}
            name={name}
            value={value || ''}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            min={min}
            max={max}
            className={inputClasses}
          />
        );
    }
  };

  return (
    <div className="mb-4">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {renderInput()}
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
} 