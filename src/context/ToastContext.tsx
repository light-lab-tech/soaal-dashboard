import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  title?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType, options?: { title?: string; duration?: number; action?: { label: string; onClick: () => void } }) => void;
  showSuccess: (message: string, options?: { title?: string }) => void;
  showError: (message: string, options?: { title?: string }) => void;
  showInfo: (message: string, options?: { title?: string }) => void;
  showWarning: (message: string, options?: { title?: string }) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const toastConfig = {
  success: {
    icon: CheckCircle,
    colors: 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400',
    progressColor: 'bg-emerald-500',
  },
  error: {
    icon: AlertCircle,
    colors: 'border-red-500/50 bg-red-500/10 text-red-400',
    progressColor: 'bg-red-500',
  },
  warning: {
    icon: AlertTriangle,
    colors: 'border-amber-500/50 bg-amber-500/10 text-amber-400',
    progressColor: 'bg-amber-500',
  },
  info: {
    icon: Info,
    colors: 'border-purple-500/50 bg-purple-500/10 text-purple-400',
    progressColor: 'bg-purple-500',
  },
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((
    message: string, 
    type: ToastType = 'info', 
    options?: { title?: string; duration?: number; action?: { label: string; onClick: () => void } }
  ) => {
    const id = Math.random().toString(36).substring(7);
    const newToast: Toast = { 
      id, 
      type, 
      message, 
      title: options?.title,
      duration: options?.duration ?? 5000,
      action: options?.action,
    };

    setToasts((prev) => [...prev, newToast]);

    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, newToast.duration);
    }
  }, []);

  const showSuccess = useCallback((message: string, options?: { title?: string }) => {
    showToast(message, 'success', { title: options?.title || 'Success' });
  }, [showToast]);

  const showError = useCallback((message: string, options?: { title?: string }) => {
    showToast(message, 'error', { title: options?.title || 'Error', duration: 8000 });
  }, [showToast]);

  const showInfo = useCallback((message: string, options?: { title?: string }) => {
    showToast(message, 'info', { title: options?.title || 'Info' });
  }, [showToast]);

  const showWarning = useCallback((message: string, options?: { title?: string }) => {
    showToast(message, 'warning', { title: options?.title || 'Warning' });
  }, [showToast]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const value = useMemo(() => ({ 
    showToast, 
    showSuccess, 
    showError, 
    showInfo, 
    showWarning 
  }), [showToast, showSuccess, showError, showInfo, showWarning]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

const ToastContainer: React.FC<{ toasts: Toast[]; onRemove: (id: string) => void }> = ({ 
  toasts, 
  onRemove 
}) => {
  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none max-w-sm w-full">
      {toasts.map((toast, index) => (
        <ToastItem 
          key={toast.id} 
          toast={toast} 
          onRemove={onRemove}
          index={index}
        />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: Toast; onRemove: (id: string) => void; index: number }> = ({ 
  toast, 
  onRemove,
  index 
}) => {
  const config = toastConfig[toast.type];
  const Icon = config.icon;
  const [progress, setProgress] = useState(100);

  React.useEffect(() => {
    if (!toast.duration || toast.duration <= 0) return;
    
    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev - (100 / (toast.duration! / 50));
        return newProgress <= 0 ? 0 : newProgress;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [toast.duration]);

  return (
    <div
      className={cn(
        'pointer-events-auto relative overflow-hidden rounded-xl border backdrop-blur-xl',
        'shadow-2xl shadow-black/20',
        'transform transition-all duration-300 ease-out',
        'animate-slide-in-right',
        config.colors
      )}
      style={{
        animationDelay: `${index * 50}ms`,
      }}
    >
      {/* Progress bar */}
      {toast.duration && toast.duration > 0 && (
        <div 
          className={cn('absolute bottom-0 left-0 h-0.5 transition-all duration-100', config.progressColor)}
          style={{ width: `${progress}%` }}
        />
      )}

      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className="flex-shrink-0 mt-0.5">
            <Icon size={20} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {toast.title && (
              <h4 className="font-semibold text-white mb-1">{toast.title}</h4>
            )}
            <p className="text-sm text-slate-200 leading-relaxed">{toast.message}</p>
            
            {/* Action button */}
            {toast.action && (
              <button
                onClick={() => {
                  toast.action!.onClick();
                  onRemove(toast.id);
                }}
                className="mt-2 text-sm font-medium underline hover:no-underline opacity-80 hover:opacity-100 transition-opacity"
              >
                {toast.action.label}
              </button>
            )}
          </div>

          {/* Close button */}
          <button
            onClick={() => onRemove(toast.id)}
            className="flex-shrink-0 p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X size={16} className="text-slate-400 hover:text-white transition-colors" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ToastProvider;
