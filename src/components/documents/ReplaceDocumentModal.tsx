import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Upload } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { AnimatedButton } from '../ui/AnimatedButton';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import type { Document } from '../../types';

interface ReplaceDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenantId: string;
  selectedDoc: Document | null;
  onSuccess: () => void;
}

export const ReplaceDocumentModal: React.FC<ReplaceDocumentModalProps> = ({
  isOpen,
  onClose,
  tenantId,
  selectedDoc,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleClose = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  const handleReplaceDocument = async (file: File) => {
    if (!tenantId || !selectedDoc) return;

    try {
      setIsUploading(true);
      await api.replaceDocument(tenantId, selectedDoc.id, file);
      showToast(t('documents.replaceSuccess', 'Document replaced successfully'), 'success');
      handleClose();
      onSuccess();
    } catch (error: any) {
      console.error('Error replacing document:', error);
      const errorMessage = error?.response?.data?.error || error?.message || t('common.error', 'Failed to replace document');
      showToast(errorMessage, 'error');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={t('documents.replaceDocument', 'Replace Document')}
      size="md"
      footer={(close) => (
        <AnimatedButton
          variant="ghost"
          onClick={close}
          fullWidth
          isDisabled={isUploading}
        >
          {t('common.cancel')}
        </AnimatedButton>
      )}
    >
      <div className="space-y-4">
        <p className="text-sm text-slate-400">
          {t('documents.replaceDocumentDesc', 'This will replace the existing document with a new file. The old content will be removed.')}
        </p>

        {selectedDoc && (
          <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
            <p className="text-xs text-slate-500 mb-1">{t('documents.currentFile', 'Current File')}</p>
            <p className="text-sm text-white truncate">{selectedDoc.name}</p>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              handleReplaceDocument(file);
            }
          }}
          className="hidden"
          accept=".txt,.md,.json,.html,.docx,.pdf"
          disabled={isUploading}
        />

        <div
          onClick={() => {
            if (!isUploading) {
              fileInputRef.current?.click();
            }
          }}
          className={`flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-dashed border-slate-600 transition-all ${isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:border-purple-500/50 hover:bg-slate-800/30 cursor-pointer'}`}
        >
          <Upload size={32} className="text-purple-400" />
          <span className="text-sm text-white">
            {isUploading ? t('documents.uploading', 'Uploading...') : t('documents.selectNewFile', 'Select New File')}
          </span>
          <span className="text-xs text-slate-500">Supported: TXT, MD, JSON, HTML, DOCX, PDF</span>
        </div>
      </div>
    </Modal>
  );
};
