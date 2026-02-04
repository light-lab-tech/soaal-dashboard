import React from 'react';
import { Logo } from '../Logo';

export interface LoadingScreenProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  fullscreen?: boolean;
  showLogo?: boolean;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = 'Loading...',
  size = 'md',
  fullscreen = true,
  showLogo = true,
}) => {
  const sizeConfig = {
    sm: { spinner: 32, logo: 24 },
    md: { spinner: 48, logo: 36 },
    lg: { spinner: 64, logo: 48 },
  };

  const content = (
    <div className="flex flex-col items-center gap-4">
      {/* Premium spinner with logo */}
      <div className="relative">
        {/* Outer rotating ring */}
        <div 
          className="rounded-full border-2 border-slate-700/50 border-t-purple-500 border-r-purple-400 animate-spin"
          style={{ width: sizeConfig[size].spinner, height: sizeConfig[size].spinner }}
        />
        
        {/* Inner rotating ring (opposite direction) */}
        <div 
          className="absolute inset-2 rounded-full border-2 border-slate-700/30 border-b-purple-500 border-l-purple-400 animate-spin"
          style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}
        />
        
        {/* Center logo */}
        {showLogo && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Logo size={sizeConfig[size].logo / 2} variant="icon-only" />
          </div>
        )}
      </div>

      {/* Loading text with dots animation */}
      <div className="flex flex-col items-center gap-2">
        <p className="text-slate-400 text-sm font-medium">{message}</p>
        <div className="flex gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );

  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[300px]">
      {content}
    </div>
  );
};

// Skeleton card for loading states
export const SkeletonCard: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('bg-slate-800/50 rounded-xl p-4 animate-pulse', className)}>
    <div className="flex items-center gap-3 mb-4">
      <div className="w-10 h-10 rounded-lg bg-slate-700/50" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-3/4 rounded bg-slate-700/50" />
        <div className="h-3 w-1/2 rounded bg-slate-700/50" />
      </div>
    </div>
    <div className="space-y-2">
      <div className="h-3 rounded bg-slate-700/50" />
      <div className="h-3 w-5/6 rounded bg-slate-700/50" />
    </div>
  </div>
);

// Skeleton stat card
export const SkeletonStatCard: React.FC = () => (
  <div className="bg-slate-800/50 rounded-xl p-4 animate-pulse">
    <div className="flex items-start justify-between mb-3">
      <div className="w-10 h-10 rounded-xl bg-slate-700/50" />
      <div className="w-12 h-5 rounded-full bg-slate-700/50" />
    </div>
    <div className="h-8 w-16 rounded bg-slate-700/50 mb-1" />
    <div className="h-3 w-24 rounded bg-slate-700/50" />
  </div>
);

// Multiple skeleton cards grid
export const SkeletonGrid: React.FC<{ count?: number; className?: string }> = ({ 
  count = 4,
  className 
}) => (
  <div className={cn('grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4', className)}>
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonStatCard key={i} />
    ))}
  </div>
);

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default LoadingScreen;
