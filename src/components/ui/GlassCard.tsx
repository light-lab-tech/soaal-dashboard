import React, { ReactNode } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility for cleaner tailwind class merging
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface GlassCardProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'interactive' | 'outlined' | 'glow';
  hover?: 'lift' | 'scale' | 'glow' | 'none';
  animate?: boolean;
  onClick?: () => void;
  glowColor?: string;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className,
  variant = 'default',
  hover = 'none',
  animate = false,
  onClick,
  glowColor = 'rgba(139, 0, 232, 0.3)',
}) => {
  const baseStyles = 'relative overflow-hidden rounded-2xl backdrop-blur-xl border transition-all duration-300';
  
  const variantStyles = {
    default: 'bg-slate-800/60 border-slate-700/50',
    elevated: 'bg-slate-800/80 border-slate-600/50 shadow-2xl shadow-black/20',
    interactive: 'bg-slate-800/70 border-slate-700/50 cursor-pointer',
    outlined: 'bg-transparent border-slate-600/50',
    glow: 'bg-slate-800/60 border-slate-700/50',
  };

  const hoverStyles = {
    lift: 'hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-500/10 hover:border-purple-500/30',
    scale: 'hover:scale-[1.02] active:scale-[0.98]',
    glow: 'hover:shadow-lg',
    none: '',
  };

  const glowStyle = variant === 'glow' ? {
    boxShadow: `0 0 40px -10px ${glowColor}`,
  } : {};

  return (
    <div
      onClick={onClick}
      className={cn(
        baseStyles,
        variantStyles[variant],
        hoverStyles[hover],
        onClick && 'cursor-pointer',
        animate && 'animate-page-enter',
        className
      )}
      style={glowStyle}
    >
      {/* Shimmer effect overlay */}
      {variant === 'interactive' && (
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        </div>
      )}
      
      {/* Top accent line */}
      {(variant === 'elevated' || variant === 'glow') && (
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
      )}
      
      {children}
    </div>
  );
};

// Compact variant for smaller cards
export const CompactCard: React.FC<GlassCardProps> = (props) => (
  <GlassCard {...props} className={cn('p-4', props.className)} />
);

// Featured card with gradient border effect
export const FeaturedCard: React.FC<GlassCardProps & { gradient?: string }> = ({
  children,
  className,
  gradient = 'from-purple-500 via-pink-500 to-purple-500',
  ...props
}) => (
  <div className={cn('relative p-[1px] rounded-2xl', className)}>
    {/* Animated gradient border */}
    <div className={cn(
      'absolute inset-0 rounded-2xl bg-gradient-to-r opacity-60 blur-sm',
      gradient
    )} />
    <div className={cn(
      'absolute inset-[1px] rounded-2xl bg-gradient-to-r',
      gradient
    )} />
    <GlassCard 
      {...props} 
      className="relative bg-slate-900/95 border-0 rounded-[14px]"
    >
      {children}
    </GlassCard>
  </div>
);

export default GlassCard;
