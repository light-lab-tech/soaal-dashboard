import React, { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { AnimatedButton } from './AnimatedButton';

export interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: ReactNode;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  color?: 'purple' | 'cyan' | 'emerald' | 'amber' | 'default';
}

const colorConfig = {
  purple: {
    icon: 'text-purple-400',
    iconBg: 'from-purple-500/20 via-purple-400/10 to-transparent',
    glow: 'shadow-purple-500/20',
  },
  cyan: {
    icon: 'text-cyan-400',
    iconBg: 'from-cyan-500/20 via-cyan-400/10 to-transparent',
    glow: 'shadow-cyan-500/20',
  },
  emerald: {
    icon: 'text-emerald-400',
    iconBg: 'from-emerald-500/20 via-emerald-400/10 to-transparent',
    glow: 'shadow-emerald-500/20',
  },
  amber: {
    icon: 'text-amber-400',
    iconBg: 'from-amber-500/20 via-amber-400/10 to-transparent',
    glow: 'shadow-amber-500/20',
  },
  default: {
    icon: 'text-slate-400',
    iconBg: 'from-slate-500/20 via-slate-400/10 to-transparent',
    glow: 'shadow-slate-500/20',
  },
};

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  className = '',
  size = 'md',
  color = 'purple',
}) => {
  const colors = colorConfig[color];
  
  const sizeConfig = {
    sm: { icon: 32, container: 'py-8 px-6', title: 'text-base', desc: 'text-xs' },
    md: { icon: 48, container: 'py-12 px-8', title: 'text-lg', desc: 'text-sm' },
    lg: { icon: 64, container: 'py-16 px-12', title: 'text-xl', desc: 'text-base' },
  };

  const config = sizeConfig[size];

  return (
    <GlassCard 
      variant="outlined" 
      className={`text-center ${config.container} ${className}`}
    >
      {/* Animated icon container */}
      <div className="relative inline-flex mb-6">
        {/* Glow effect */}
        <div className={`
          absolute inset-0 rounded-full blur-2xl opacity-50
          bg-gradient-to-br ${colors.iconBg}
        `} />
        
        {/* Icon background */}
        <div className={`
          relative w-20 h-20 rounded-2xl flex items-center justify-center
          bg-gradient-to-br ${colors.iconBg}
          border border-white/10
          ${colors.glow} shadow-2xl
          animate-float-gentle
        `}>
          <Icon 
            size={config.icon} 
            className={`${colors.icon} drop-shadow-lg`}
            strokeWidth={1.5}
          />
        </div>
        
        {/* Floating particles */}
        <div className="absolute -top-2 -right-2 w-3 h-3 rounded-full bg-white/20 animate-ping" style={{ animationDuration: '3s' }} />
        <div className="absolute -bottom-1 -left-1 w-2 h-2 rounded-full bg-white/10 animate-ping" style={{ animationDuration: '2s', animationDelay: '0.5s' }} />
      </div>

      {/* Title */}
      <h3 className={`${config.title} font-bold text-white mb-2`}>
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p className={`${config.desc} text-slate-400 max-w-sm mx-auto mb-6 leading-relaxed`}>
          {description}
        </p>
      )}

      {/* Actions */}
      {(action || secondaryAction) && (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {action && (
            <AnimatedButton
              onClick={action.onClick}
              icon={action.icon}
              variant="gradient"
            >
              {action.label}
            </AnimatedButton>
          )}
          {secondaryAction && (
            <AnimatedButton
              onClick={secondaryAction.onClick}
              variant="ghost"
            >
              {secondaryAction.label}
            </AnimatedButton>
          )}
        </div>
      )}
    </GlassCard>
  );
};

// Compact empty state for inline usage
export const InlineEmptyState: React.FC<{
  icon: LucideIcon;
  message: string;
  color?: 'purple' | 'cyan' | 'emerald' | 'amber' | 'default';
}> = ({ icon: Icon, message, color = 'default' }) => {
  const colors = colorConfig[color];
  
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <div className={`
        w-12 h-12 rounded-xl flex items-center justify-center mb-3
        bg-gradient-to-br ${colors.iconBg}
      `}>
        <Icon size={24} className={colors.icon} />
      </div>
      <p className="text-sm text-slate-400">{message}</p>
    </div>
  );
};

export default EmptyState;
