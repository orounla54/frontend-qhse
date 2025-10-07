import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const statCardVariants = cva(
  "relative overflow-hidden rounded-xl border bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md dark:bg-gray-800 dark:border-gray-700",
  {
    variants: {
      variant: {
        default: "border-gray-200",
        elevated: "border-transparent shadow-lg hover:shadow-xl",
        outlined: "border-gray-300 bg-transparent",
        filled: "bg-gray-50 border-gray-200 dark:bg-gray-700 dark:border-gray-600",
      }
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface StatCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof statCardVariants> {
  title: string;
  value: string | number;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  changeLabel?: string;
  icon?: React.ReactNode;
  iconBg?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  description?: string;
  loading?: boolean;
}

const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
  ({ 
    className, 
    variant, 
    title, 
    value, 
    change, 
    changeType, 
    changeLabel, 
    icon, 
    iconBg = "bg-primary-100",
    trend,
    trendValue,
    description,
    loading = false,
    ...props 
  }, ref) => {
    const getChangeColor = () => {
      if (changeType === 'increase') return 'text-green-600 dark:text-green-400';
      if (changeType === 'decrease') return 'text-red-600 dark:text-red-400';
      return 'text-gray-600 dark:text-gray-400';
    };

    const getTrendIcon = () => {
      if (trend === 'up') return <TrendingUp className="h-4 w-4 text-green-500" />;
      if (trend === 'down') return <TrendingDown className="h-4 w-4 text-red-500" />;
      return <Minus className="h-4 w-4 text-gray-500" />;
    };

    const getTrendColor = () => {
      if (trend === 'up') return 'text-green-600 dark:text-green-400';
      if (trend === 'down') return 'text-red-600 dark:text-red-400';
      return 'text-gray-600 dark:text-gray-400';
    };

    if (loading) {
      return (
        <div
          ref={ref}
          className={cn(statCardVariants({ variant, className }), "animate-pulse")}
          {...props}
        >
          <div className="flex items-center justify-between">
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
          </div>
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(statCardVariants({ variant, className }))}
        {...props}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 truncate">
              {title}
            </p>
            <div className="mt-2 flex items-baseline">
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {value}
              </p>
              {change !== undefined && (
                <span className={cn(
                  "ml-2 text-sm font-medium",
                  getChangeColor()
                )}>
                  {change > 0 ? '+' : ''}{change}%
                </span>
              )}
            </div>
            
            {changeLabel && (
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {changeLabel}
              </p>
            )}

            {description && (
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                {description}
              </p>
            )}

            {trend && trendValue && (
              <div className="mt-3 flex items-center gap-2">
                {getTrendIcon()}
                <span className={cn(
                  "text-sm font-medium",
                  getTrendColor()
                )}>
                  {trendValue}
                </span>
              </div>
            )}
          </div>

          {icon && (
            <div className={cn(
              "flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center",
              iconBg
            )}>
              {icon}
            </div>
          )}
        </div>

        {/* Decorative background element */}
        <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 opacity-50"></div>
      </div>
    );
  }
);

StatCard.displayName = "StatCard";

// Predefined stat cards for common QHSE metrics
export const IncidentStatCard: React.FC<{
  title: string;
  value: number;
  change?: number;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  className?: string;
}> = ({ title, value, change, severity = 'medium', className }) => {
  const severityConfig = {
    low: { icon: "🟢", bg: "bg-green-100", changeColor: "text-green-600" },
    medium: { icon: "🟡", bg: "bg-amber-100", changeColor: "text-amber-600" },
    high: { icon: "🟠", bg: "bg-orange-100", changeColor: "text-orange-600" },
    critical: { icon: "🔴", bg: "bg-red-100", changeColor: "text-red-600" },
  };

  const config = severityConfig[severity];

  return (
    <StatCard
      title={title}
      value={value}
      change={change}
      changeType={change && change > 0 ? 'decrease' : 'increase'}
      icon={<span className="text-xl">{config.icon}</span>}
      iconBg={config.bg}
      className={className}
    />
  );
};

export const SafetyStatCard: React.FC<{
  title: string;
  value: number;
  target: number;
  unit?: string;
  className?: string;
}> = ({ title, value, target, unit = "jours", className }) => {
  const percentage = Math.round((value / target) * 100);
  const isOnTarget = percentage >= 100;

  return (
    <StatCard
      title={title}
      value={`${value} ${unit}`}
      change={percentage - 100}
      changeType={isOnTarget ? 'increase' : 'decrease'}
      changeLabel={`${percentage}% de l'objectif (${target} ${unit})`}
      icon={<span className="text-xl">🛡️</span>}
      iconBg={isOnTarget ? "bg-green-100" : "bg-amber-100"}
      className={className}
    />
  );
};

export { StatCard, statCardVariants }; 