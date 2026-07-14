import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from '../ui/Modal';
import { AnimatedButton } from '../ui/AnimatedButton';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import type { Document } from '../../types';

interface ReplaceUrlModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenantId: string;
  selectedDoc: Document | null;
  onSuccess: () => void;
}

export const ReplaceUrlModal: React.FC<ReplaceUrlModalProps> = ({
  isOpen,
  onClose,
  tenantId,
  selectedDoc,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [replaceUrlInput, setReplaceUrlInput] = useState('');

  useEffect(() => {
    if (isOpen && selectedDoc) {
      setReplaceUrlInput(selectedDoc.name);
    }
  }, [isOpen, selectedDoc]);

  const handleClose = () => {
    setReplaceUrlInput('');
    onClose();
  };

  const handleReplaceUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantId || !selectedDoc || !replaceUrlInput) return;

    try {
      setIsUploading(true);
      await api.replaceDocumentUrl(tenantId, selectedDoc.id, replaceUrlInput);
      showToast(t('documents.replaceUrlSuccess', 'Document URL replaced successfully'), 'success');
      handleClose();
      onSuccess();
    } catch (error: any) {
      console.error('Error replacing document URL:', error);
      const errorMessage = error?.response?.data?.error || error?.message || t('documents.ingestError', 'Failed to replace URL');
      showToast(errorMessage, 'error');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={t('documents.replaceUrl', 'Replace Document URL')}
      size="md"
      footer={(close) => (
        <>
          <AnimatedButton
            type="button"
            variant="ghost"
            onClick={close}
            fullWidth
          >
            {t('common.cancel')}
          </AnimatedButton>
          <AnimatedButton
            type="button"
            variant="gradient"
            isLoading={isUploading}
            fullWidth
            onClick={() => {
              const form = document.querySelector('#replace-url-form') as HTMLFormElement;
              if (form) form.requestSubmit();
            }}
          >
            {t('documents.replace', 'Replace')}
          </AnimatedButton>
        </>
      )}
    >
      <form id="replace-url-form" onSubmit={handleReplaceUrl} className="space-y-4">
        <p className="text-sm text-slate-400">
          {t('documents.replaceUrlDesc', 'This will replace the existing URL with a new one. The old content will be removed.')}
        </p>

        {selectedDoc && (
          <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
            <p className="text-xs text-slate-500 mb-1">{t('documents.currentUrl', 'Current URL')}</p>
            <p className="text-sm text-cyan-300 break-all">{selectedDoc.name}</p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            {t('documents.newUrl', 'New URL')}
          </label>
          <input
            type="url"
            value={replaceUrlInput}
            onChange={(e) => setReplaceUrlInput(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700/50
                     text-white placeholder-slate-500
                     focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20
                     outline-none transition-all duration-300"
            placeholder="https://..."
            required
          />
        </div>
      </form>
    </Modal>
  );
};
