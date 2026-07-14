import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDropzone } from 'react-dropzone';
import { Upload, AlertCircle, File } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';

interface DocumentDropzoneProps {
  tenantId: string;
  onSuccess: () => void;
}

export const DocumentDropzone: React.FC<DocumentDropzoneProps> = ({
  tenantId,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    accept: {
      'text/plain': ['.txt'],
      'text/markdown': ['.md'],
      'application/json': ['.json'],
      'text/html': ['.html'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    onDrop: async (acceptedFiles) => {
      if (!tenantId) return;

      for (const file of acceptedFiles) {
        await uploadDocument(file);
      }
    },
  });

  const uploadDocument = async (file: File) => {
    if (!tenantId) return;
    try {
      setUploadProgress((prev) => ({ ...prev, [file.name]: 0 }));

      const interval = setInterval(() => {
        setUploadProgress((prev) => ({
          ...prev,
          [file.name]: Math.min((prev[file.name] || 0) + 10, 90),
        }));
      }, 200);

      await api.uploadDocument(tenantId, file);

      clearInterval(interval);
      setUploadProgress((prev) => ({ ...prev, [file.name]: 100 }));

      setTimeout(() => {
        setUploadProgress((prev) => {
          const newProgress = { ...prev };
          delete newProgress[file.name];
          return newProgress;
        });
      }, 500);

      onSuccess();
      showToast(t('documents.uploadSuccess', 'Document uploaded successfully'), 'success');
    } catch (error: any) {
      console.error('Error uploading document:', error);
      const errorMessage =
        error?.response?.data?.error || error?.message || t('common.error', 'An error occurred');
      showToast(errorMessage, 'error');
    }
  };

  return (
    <>
      <div
        {...getRootProps()}
        className={`
          relative overflow-hidden rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer
          ${
            isDragActive
              ? 'border-purple-500 bg-purple-500/10 scale-[1.02]'
              : isDragReject
                ? 'border-red-500 bg-red-500/10'
                : 'border-slate-700/50 bg-slate-800/30 hover:border-slate-600/50 hover:bg-slate-800/50'
          }
        `}
      >
        <input {...getInputProps()} id="file-upload" />

        <div
          className={`
          absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/5 to-purple-500/0
          transition-transform duration-1000
          ${isDragActive ? 'translate-x-full' : '-translate-x-full'}
        `}
        />

        <div className="relative p-10 text-center">
          <div
            className={`
            w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center
            transition-all duration-300
            ${
              isDragActive
                ? 'bg-purple-500 shadow-lg shadow-purple-500/40 scale-110'
                : 'bg-slate-700/50'
            }
          `}
          >
            <Upload
              size={28}
              className={`transition-colors ${isDragActive ? 'text-white' : 'text-purple-400'}`}
            />
          </div>

          <p className="text-lg font-medium text-white mb-2">
            {isDragActive ? t('documents.dropFilesHere') : t('documents.dragDrop')}
          </p>
          <p className="text-sm text-slate-400">{t('documents.supportedFormats')}</p>

          {isDragReject && (
            <p className="mt-3 text-sm text-red-400 flex items-center justify-center gap-1">
              <AlertCircle size={14} />
              {t('documents.invalidFileType')}
            </p>
          )}
        </div>
      </div>

      {/* Upload Progress */}
      {Object.keys(uploadProgress).length > 0 && (
        <div className="space-y-3">
          {Object.entries(uploadProgress).map(([fileName, progress]) => (
            <GlassCard key={fileName} variant="outlined" className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <File size={16} className="text-purple-400" />
                <span className="text-sm text-white flex-1 truncate">{fileName}</span>
                <span className="text-xs text-slate-400">{progress}%</span>
              </div>
              <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </>
  );
};
