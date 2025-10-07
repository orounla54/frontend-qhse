import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors duration-200",
  {
    variants: {
      variant: {
        default: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
        primary: "bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200",
        secondary: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
        success: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
        warning: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
        danger: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
        info: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
        purple: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
        orange: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
        teal: "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200",
        indigo: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
        pink: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
      },
      size: {
        sm: "px-2 py-0.5 text-xs",
        md: "px-2.5 py-0.5 text-xs",
        lg: "px-3 py-1 text-sm",
      },
      rounded: {
        default: "rounded-full",
        lg: "rounded-lg",
        none: "rounded-none",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "md",
      rounded: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  children: React.ReactNode;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, size, rounded, children, leftIcon, rightIcon, ...props }, ref) => {
    return (
      <div
        className={cn(badgeVariants({ variant, size, rounded, className }))}
        ref={ref}
        {...props}
      >
        {leftIcon && <span className="mr-1">{leftIcon}</span>}
        {children}
        {rightIcon && <span className="ml-1">{rightIcon}</span>}
      </div>
    );
  }
);

Badge.displayName = "Badge";

// Predefined status badges for common use cases
export const StatusBadge: React.FC<{
  status: 'active' | 'inactive' | 'pending' | 'completed' | 'cancelled' | 'draft' | 'published';
  className?: string;
}> = ({ status, className }) => {
  const statusConfig = {
    active: { variant: 'success' as const, label: 'Actif' },
    inactive: { variant: 'secondary' as const, label: 'Inactif' },
    pending: { variant: 'warning' as const, label: 'En attente' },
    completed: { variant: 'success' as const, label: 'Terminé' },
    cancelled: { variant: 'danger' as const, label: 'Annulé' },
    draft: { variant: 'secondary' as const, label: 'Brouillon' },
    published: { variant: 'success' as const, label: 'Publié' },
  };

  const config = statusConfig[status];

  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  );
};

// Priority badge for incidents/risks
export const PriorityBadge: React.FC<{
  priority: 'low' | 'medium' | 'high' | 'critical';
  className?: string;
}> = ({ priority, className }) => {
  const priorityConfig = {
    low: { variant: 'success' as const, label: 'Faible' },
    medium: { variant: 'warning' as const, label: 'Moyenne' },
    high: { variant: 'danger' as const, label: 'Élevée' },
    critical: { variant: 'danger' as const, label: 'Critique' },
  };

  const config = priorityConfig[priority];

  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  );
};

// Severity badge for incidents
export const SeverityBadge: React.FC<{
  severity: 'low' | 'medium' | 'high' | 'critical';
  className?: string;
}> = ({ severity, className }) => {
  const severityConfig = {
    low: { variant: 'success' as const, label: 'Faible' },
    medium: { variant: 'warning' as const, label: 'Moyenne' },
    high: { variant: 'danger' as const, label: 'Élevée' },
    critical: { variant: 'danger' as const, label: 'Critique' },
  };

  const config = severityConfig[severity];

  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  );
};

export { Badge, badgeVariants }; 