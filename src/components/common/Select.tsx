import React, { forwardRef, useState, useRef, useEffect } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';
import { ChevronDown, Check, Search, X } from 'lucide-react';

const selectVariants = cva(
  "relative w-full cursor-pointer rounded-lg border border-gray-300 bg-white text-left shadow-sm transition-all duration-200 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white",
  {
    variants: {
      variant: {
        default: "",
        error: "border-red-500 focus:border-red-500 focus:ring-red-500/20",
        success: "border-green-500 focus:border-green-500 focus:ring-green-500/20",
      },
      size: {
        sm: "h-8 px-2 py-1 text-xs",
        md: "h-10 px-3 py-2 text-sm",
        lg: "h-12 px-4 py-3 text-base",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export interface SelectOption {
  value: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface SelectProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'>,
    VariantProps<typeof selectVariants> {
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  success?: string;
  disabled?: boolean;
  searchable?: boolean;
  multiple?: boolean;
  clearable?: boolean;
  leftIcon?: React.ReactNode;
}

const Select = forwardRef<HTMLDivElement, SelectProps>(
  ({ 
    className, 
    variant, 
    size, 
    options, 
    value, 
    onChange, 
    placeholder = "Sélectionner une option",
    label,
    error,
    success,
    disabled = false,
    searchable = false,
    multiple = false,
    clearable = false,
    leftIcon,
    ...props 
  }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedValues, setSelectedValues] = useState<string[]>(multiple ? (value ? [value] : []) : []);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
      if (!multiple && value) {
        setSelectedValues([value]);
      }
    }, [value, multiple]);

    const getVariant = () => {
      if (error) return 'error';
      if (success) return 'success';
      return variant;
    };

    const filteredOptions = options.filter(option =>
      searchable && searchTerm
        ? option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
          option.description?.toLowerCase().includes(searchTerm.toLowerCase())
        : true
    );

    const handleSelect = (optionValue: string) => {
      if (multiple) {
        const newValues = selectedValues.includes(optionValue)
          ? selectedValues.filter(v => v !== optionValue)
          : [...selectedValues, optionValue];
        setSelectedValues(newValues);
        onChange?.(newValues.join(','));
      } else {
        setSelectedValues([optionValue]);
        onChange?.(optionValue);
        setIsOpen(false);
      }
    };

    const handleClear = () => {
      setSelectedValues([]);
      onChange?.('');
      setSearchTerm('');
    };

    const getDisplayValue = () => {
      if (multiple) {
        if (selectedValues.length === 0) return placeholder;
        if (selectedValues.length === 1) {
          const option = options.find(opt => opt.value === selectedValues[0]);
          return option?.label || placeholder;
        }
        return `${selectedValues.length} éléments sélectionnés`;
      }
      
      const selectedOption = options.find(opt => opt.value === value);
      return selectedOption?.label || placeholder;
    };

    const selectedOptions = options.filter(opt => selectedValues.includes(opt.value));

    return (
      <div className="w-full space-y-2" ref={ref} {...props}>
        {label && (
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
          </label>
        )}
        <div className="relative" ref={dropdownRef}>
          <div
            className={cn(
              selectVariants({ variant: getVariant(), size, className }),
              disabled && "cursor-not-allowed opacity-50",
              isOpen && "border-primary-500 ring-2 ring-primary-500/20"
            )}
            onClick={() => !disabled && setIsOpen(!isOpen)}
          >
            {leftIcon && (
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                {leftIcon}
              </div>
            )}
            
            <div className={cn(
              "flex items-center justify-between",
              leftIcon && "pl-10"
            )}>
              <div className="flex-1 min-w-0">
                {multiple && selectedOptions.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {selectedOptions.slice(0, 2).map(option => (
                      <span
                        key={option.value}
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-primary-100 text-primary-800 rounded-md dark:bg-primary-900 dark:text-primary-200"
                      >
                        {option.label}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelect(option.value);
                          }}
                          className="hover:bg-primary-200 rounded-full p-0.5 dark:hover:bg-primary-800"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                    {selectedOptions.length > 2 && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        +{selectedOptions.length - 2} autres
                      </span>
                    )}
                  </div>
                ) : (
                  <span className={cn(
                    "block truncate",
                    !value && !multiple && "text-gray-500 dark:text-gray-400"
                  )}>
                    {getDisplayValue()}
                  </span>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                {clearable && selectedValues.length > 0 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClear();
                    }}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
                <ChevronDown 
                  className={cn(
                    "h-4 w-4 text-gray-400 transition-transform duration-200",
                    isOpen && "rotate-180"
                  )} 
                />
              </div>
            </div>
          </div>

          {isOpen && (
            <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-auto">
              {searchable && (
                <div className="p-2 border-b border-gray-200 dark:border-gray-700">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Rechercher..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                </div>
              )}

              <div className="py-1">
                {filteredOptions.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400 text-center">
                    Aucune option trouvée
                  </div>
                ) : (
                  filteredOptions.map((option) => (
                    <div
                      key={option.value}
                      className={cn(
                        "relative cursor-pointer select-none px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700",
                        selectedValues.includes(option.value) && "bg-primary-50 text-primary-900 dark:bg-primary-900 dark:text-primary-100",
                        option.disabled && "opacity-50 cursor-not-allowed"
                      )}
                      onClick={() => !option.disabled && handleSelect(option.value)}
                    >
                      <div className="flex items-center space-x-3">
                        {option.icon && (
                          <div className="flex-shrink-0 text-gray-400 dark:text-gray-500">
                            {option.icon}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium">{option.label}</div>
                          {option.description && (
                            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {option.description}
                            </div>
                          )}
                        </div>
                        {selectedValues.includes(option.value) && (
                          <Check className="h-4 w-4 text-primary-600 dark:text-primary-400 flex-shrink-0" />
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
        
        {(error || success) && (
          <div className="flex items-center space-x-2 text-sm">
            {error ? (
              <span className="text-red-600 dark:text-red-400">{error}</span>
            ) : (
              <span className="text-green-600 dark:text-green-400">{success}</span>
            )}
          </div>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";

export { Select, selectVariants }; 