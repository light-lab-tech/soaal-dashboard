import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  animate?: boolean;
  pulse?: boolean;
  className?: string;
  dot?: boolean;
}

const variantStyles = {
  default: 'bg-slate-700/50 text-slate-300 border-slate-600/50',
  primary: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  success: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  warning: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  danger: 'bg-red-500/20 text-red-400 border-red-500/30',
  info: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  outline: 'bg-transparent border-slate-600 text-slate-400',
};

const sizeStyles = {
  sm: 'px-2 py-0.5 text-[10px]',
  md: 'px-2.5 py-1 text-xs',
  lg: 'px-3 py-1.5 text-sm',
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  animate = false,
  pulse = false,
  className,
  dot = false,
}) => {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-medium rounded-full border backdrop-blur-sm transition-all duration-200',
        variantStyles[variant],
        sizeStyles[size],
        animate && 'animate-scale-in-bounce',
        pulse && 'relative',
        className
      )}
    >
      {/* Pulse ring */}
      {pulse && (
        <span className={cn(
          'absolute inset-0 rounded-full animate-ping opacity-30',
          variant === 'success' && 'bg-emerald-500',
          variant === 'warning' && 'bg-amber-500',
          variant === 'danger' && 'bg-red-500',
          variant === 'primary' && 'bg-purple-500',
          variant === 'info' && 'bg-cyan-500',
        )} />
      )}
      
      {/* Status dot */}
      {dot && (
        <span className={cn(
          'w-1.5 h-1.5 rounded-full flex-shrink-0',
          variant === 'success' && 'bg-emerald-400',
          variant === 'warning' && 'bg-amber-400',
          variant === 'danger' && 'bg-red-400',
          variant === 'primary' && 'bg-purple-400',
          variant === 'info' && 'bg-cyan-400',
          variant === 'default' && 'bg-slate-400',
        )} />
      )}
      
      <span className="relative">{children}</span>
    </span>
  );
};

// Status badge with icon
export const StatusBadge: React.FC<{
  status: 'active' | 'inactive' | 'pending' | 'error' | 'warning' | 'success';
  label?: string;
  pulse?: boolean;
}> = ({ status, label, pulse = false }) => {
  const config = {
    active: { variant: 'success', label: 'Active' },
    inactive: { variant: 'default', label: 'Inactive' },
    pending: { variant: 'warning', label: 'Pending' },
    error: { variant: 'danger', label: 'Error' },
    warning: { variant: 'warning', label: 'Warning' },
    success: { variant: 'success', label: 'Success' },
  };

  const { variant, label: defaultLabel } = config[status];

  return (
    <Badge 
      variant={variant as any} 
      dot 
      pulse={pulse}
      size="sm"
    >
      {label || defaultLabel}
    </Badge>
  );
};

// Counter badge
export const CounterBadge: React.FC<{
  count: number;
  max?: number;
  variant?: 'default' | 'primary' | 'danger';
}> = ({ count, max = 99, variant = 'danger' }) => {
  const display = count > max ? `${max}+` : count;
  
  return (
    <span className={cn(
      'inline-flex items-center justify-center min-w-[18px] h-[18px] px-1.5',
      'rounded-full text-[10px] font-bold',
      variant === 'default' && 'bg-slate-600 text-white',
      variant === 'primary' && 'bg-purple-500 text-white',
      variant === 'danger' && 'bg-red-500 text-white',
    )}>
      {display}
    </span>
  );
};

export default Badge;
