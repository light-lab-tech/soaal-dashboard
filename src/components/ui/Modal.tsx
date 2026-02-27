import React, { useEffect, useState, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { AnimatedButton } from './AnimatedButton';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'fullscreen';
  showCloseButton?: boolean;
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
  footerClassName?: string;
}

const sizeConfig = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
  fullscreen: 'max-w-[95vw] max-h-[95vh]',
};

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  showCloseButton = true,
  closeOnBackdropClick = true,
  closeOnEscape = true,
  className,
  headerClassName,
  bodyClassName,
  footerClassName,
}) => {
  const [isClosing, setIsClosing] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsMounted(true);
      setIsClosing(false);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && closeOnEscape && isOpen) {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [closeOnEscape, isOpen]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsMounted(false);
    }, 200);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    // Only close if clicking the backdrop directly, not its children
    if (e.target === e.currentTarget && closeOnBackdropClick) {
      handleClose();
    }
  };

  if (!isMounted && !isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={handleBackdropClick}
        className={cn(
          'absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-200',
          isClosing ? 'opacity-0' : 'opacity-100'
        )}
      />

      {/* Modal Content */}
      <div
        className={cn(
          'relative w-full bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-2xl',
          'transition-all duration-200',
          sizeConfig[size],
          isClosing
            ? 'opacity-0 scale-95 translate-y-4'
            : 'opacity-100 scale-100 translate-y-0',
          className
        )}
        style={{
          animation: !isClosing ? 'modal-enter 0.3s cubic-bezier(0.16, 1, 0.3, 1)' : undefined,
        }}
      >
        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 rounded-t-2xl" />

        {/* Header */}
        {(title || showCloseButton) && (
          <div className={cn(
            'flex items-start justify-between px-6 py-5 border-b border-slate-700/50',
            headerClassName
          )}>
            <div className="flex-1 pr-4">
              {title && (
                <h2 className="text-lg font-semibold text-white">
                  {title}
                </h2>
              )}
              {description && (
                <p className="mt-1 text-sm text-slate-400">
                  {description}
                </p>
              )}
            </div>
            {showCloseButton && (
              <button
                type="button"
                onClick={handleClose}
                className="p-2 rounded-lg hover:bg-slate-800/50 text-slate-400 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className={cn('px-6 py-5', bodyClassName)}>
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className={cn(
            'px-6 py-4 border-t border-slate-700/50 flex items-center justify-end gap-3',
            footerClassName
          )}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

// Confirmation modal preset
export const ConfirmModal: React.FC<
  Omit<ModalProps, 'children' | 'footer'> & {
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: () => void;
    variant?: 'danger' | 'warning' | 'info';
    isLoading?: boolean;
  }
> = ({
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onClose,
  variant = 'danger',
  isLoading,
  ...props
}) => {
  const variantConfig = {
    danger: { button: 'danger', icon: '⚠️' },
    warning: { button: 'secondary', icon: '⚡' },
    info: { button: 'primary', icon: 'ℹ️' },
  };

  const config = variantConfig[variant];

  return (
    <Modal
      {...props}
      onClose={onClose}
      size="sm"
      footer={
        <>
          <AnimatedButton
            variant="ghost"
            onClick={onClose}
            isDisabled={isLoading}
          >
            {cancelLabel}
          </AnimatedButton>
          <AnimatedButton
            variant={config.button as any}
            onClick={onConfirm}
            isLoading={isLoading}
          >
            {confirmLabel}
          </AnimatedButton>
        </>
      }
    >
      <div className="flex items-start gap-4">
        <span className="text-2xl">{config.icon}</span>
        <p className="text-slate-300 leading-relaxed">{message}</p>
      </div>
    </Modal>
  );
};

export default Modal;
