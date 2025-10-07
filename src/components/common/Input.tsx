import React, { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';
import { AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';

const inputVariants = cva(
  "flex w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 transition-all duration-200 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-primary-400 dark:focus:ring-primary-400/20",
  {
    variants: {
      variant: {
        default: "",
        error: "border-red-500 focus:border-red-500 focus:ring-red-500/20 dark:focus:border-red-400 dark:focus:ring-red-400/20",
        success: "border-green-500 focus:border-green-500 focus:ring-green-500/20 dark:focus:border-green-400 dark:focus:ring-green-400/20",
      },
      size: {
        sm: "h-8 px-2 text-xs",
        md: "h-10 px-3 text-sm",
        lg: "h-12 px-4 text-base",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {
  label?: string;
  error?: string;
  success?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  showPasswordToggle?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    variant, 
    size, 
    label, 
    error, 
    success, 
    leftIcon, 
    rightIcon, 
    showPasswordToggle,
    type,
    ...props 
  }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const [inputType, setInputType] = React.useState(type);

    React.useEffect(() => {
      if (type === 'password' && showPasswordToggle) {
        setInputType(showPassword ? 'text' : 'password');
      } else {
        setInputType(type);
      }
    }, [type, showPassword, showPasswordToggle]);

    const getVariant = () => {
      if (error) return 'error';
      if (success) return 'success';
      return variant;
    };

    const getRightIcon = () => {
      if (showPasswordToggle && type === 'password') {
        return (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        );
      }
      return rightIcon;
    };

    return (
      <div className="w-full space-y-2">
        {label && (
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
              {leftIcon}
            </div>
          )}
          <input
            className={cn(
              inputVariants({ variant: getVariant(), size, className }),
              leftIcon && "pl-10",
              (rightIcon || (showPasswordToggle && type === 'password')) && "pr-10"
            )}
            ref={ref}
            type={inputType}
            {...props}
          />
          {getRightIcon() && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
              {getRightIcon()}
            </div>
          )}
        </div>
        {(error || success) && (
          <div className="flex items-center space-x-2 text-sm">
            {error ? (
              <>
                <AlertCircle className="h-4 w-4 text-red-500" />
                <span className="text-red-600 dark:text-red-400">{error}</span>
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-green-600 dark:text-green-400">{success}</span>
              </>
            )}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input, inputVariants }; 