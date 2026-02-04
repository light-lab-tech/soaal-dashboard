import React from 'react';
import { TrendingUp, TrendingDown, LucideIcon } from 'lucide-react';
import { GlassCard } from './GlassCard';

export interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  color?: 'purple' | 'cyan' | 'emerald' | 'amber' | 'pink' | 'blue' | 'red';
  onClick?: () => void;
  className?: string;
  delay?: number;
}

const colorConfig = {
  purple: {
    gradient: 'from-purple-500 to-purple-600',
    shadow: 'shadow-purple-500/30',
    text: 'text-purple-400',
    bg: 'bg-purple-500/10',
  },
  cyan: {
    gradient: 'from-cyan-400 to-cyan-500',
    shadow: 'shadow-cyan-500/30',
    text: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
  },
  emerald: {
    gradient: 'from-emerald-400 to-emerald-500',
    shadow: 'shadow-emerald-500/30',
    text: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
  },
  amber: {
    gradient: 'from-amber-400 to-amber-500',
    shadow: 'shadow-amber-500/30',
    text: 'text-amber-400',
    bg: 'bg-amber-500/10',
  },
  pink: {
    gradient: 'from-pink-400 to-pink-500',
    shadow: 'shadow-pink-500/30',
    text: 'text-pink-400',
    bg: 'bg-pink-500/10',
  },
  blue: {
    gradient: 'from-blue-400 to-blue-500',
    shadow: 'shadow-blue-500/30',
    text: 'text-blue-400',
    bg: 'bg-blue-500/10',
  },
  red: {
    gradient: 'from-red-400 to-red-500',
    shadow: 'shadow-red-500/30',
    text: 'text-red-400',
    bg: 'bg-red-500/10',
  },
};

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  trend,
  color = 'purple',
  onClick,
  className,
  delay = 0,
}) => {
  const colors = colorConfig[color];

  return (
    <GlassCard
      variant="elevated"
      hover={onClick ? 'lift' : 'none'}
      onClick={onClick}
      className={className}
      animate
    >
      <div 
        className="p-5"
        style={{ animationDelay: `${delay}ms` }}
      >
        <div className="flex items-start justify-between mb-4">
          <div className={`
            p-3 rounded-xl bg-gradient-to-br ${colors.gradient} 
            ${colors.shadow} shadow-lg
            transform transition-transform duration-300 group-hover:scale-110
          `}>
            <Icon size={20} className="text-white" />
          </div>
          
          {trend && (
            <div className={`
              flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold
              ${trend.isPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}
            `}>
              {trend.isPositive ? (
                <TrendingUp size={12} />
              ) : (
                <TrendingDown size={12} />
              )}
              <span>{trend.value}</span>
            </div>
          )}
        </div>

        <div className="space-y-1">
          <h3 className="text-2xl font-bold text-white tracking-tight">
            {value}
          </h3>
          <p className="text-sm text-slate-400 font-medium">
            {title}
          </p>
        </div>
      </div>

      {/* Subtle gradient overlay on hover */}
      <div className={`
        absolute inset-0 bg-gradient-to-br ${colors.gradient} opacity-0 
        transition-opacity duration-500 pointer-events-none
        group-hover:opacity-5
      `} />
    </GlassCard>
  );
};

// Mini stat card for compact layouts
export const MiniStatCard: React.FC<Omit<StatCardProps, 'trend'>> = ({
  title,
  value,
  icon: Icon,
  color = 'purple',
  onClick,
  className,
}) => {
  const colors = colorConfig[color];

  return (
    <GlassCard
      variant="default"
      hover={onClick ? 'scale' : 'none'}
      onClick={onClick}
      className={className}
    >
      <div className="p-4 flex items-center gap-3">
        <div className={`
          p-2.5 rounded-lg bg-gradient-to-br ${colors.gradient} ${colors.shadow} shadow-md
        `}>
          <Icon size={16} className="text-white" />
        </div>
        <div>
          <p className="text-xs text-slate-400 font-medium">{title}</p>
          <p className="text-lg font-bold text-white">{value}</p>
        </div>
      </div>
    </GlassCard>
  );
};

export default StatCard;
