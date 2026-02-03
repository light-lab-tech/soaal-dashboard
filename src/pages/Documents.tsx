import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDropzone } from 'react-dropzone';
import { api } from '../services/api';
import type { Document, Tenant } from '../types';
import {
  Upload,
  FileText,
  Trash2,
  Link as LinkIcon,
  X,
  Check,
  AlertCircle,
} from 'lucide-react';

const Documents: React.FC = () => {
  const { t } = useTranslation();
  const { tenantId } = useParams<{ tenantId: string }>();
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [showUrlModal, setShowUrlModal] = useState(false);
  const [urlInput, setUrlInput] = useState('');

  useEffect(() => {
    if (!tenantId) {
      navigate('/tenants');
      return;
    }
    loadData();
  }, [tenantId]);

  const loadData = async () => {
    if (!tenantId) return;
    try {
      setIsLoading(true);
      const [docsResponse, tenantResponse] = await Promise.all([
        api.getDocuments(tenantId),
        api.getTenant(tenantId),
      ]);
      setDocuments(docsResponse.data.documents);
      setTenant(tenantResponse.data.tenant);
    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
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
      setIsUploading(true);
      await api.uploadDocument(tenantId, file);
      await loadData();
    } catch (error) {
      console.error('Error uploading document:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleIngestUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantId || !urlInput) return;
    
    try {
      setIsUploading(true);
      await api.ingestUrl(tenantId, { url: urlInput });
      setShowUrlModal(false);
      setUrlInput('');
      await loadData();
    } catch (error) {
      console.error('Error ingesting URL:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    if (!tenantId) return;
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      await api.deleteDocument(tenantId, documentId);
      setDocuments(documents.filter((doc) => doc.id !== documentId));
    } catch (error) {
      console.error('Error deleting document:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <Check size={14} className="text-emerald-400" />;
      case 'processing':
        return <AlertCircle size={14} className="text-amber-400 animate-pulse" />;
      case 'failed':
        return <AlertCircle size={14} className="text-red-400" />;
      default:
        return <AlertCircle size={14} className="text-glass-textSecondary" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="glass-card flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-[#8B00E8] border-t-transparent rounded-full animate-spin"></div>
          <span className="text-glass-text text-sm">{t('common.loading')}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-white mb-0.5">
            {t('documents.title')} - {tenant?.name}
          </h1>
          <p className="text-sm text-glass-textSecondary">
            {documents.length} {documents.length === 1 ? t('documents.document') : t('documents.documents')}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowUrlModal(true)}
            className="glass-button-secondary px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5"
          >
            <LinkIcon size={14} />
            {t('documents.ingestUrl')}
          </button>
          <button
            {...getRootProps()}
            className="glass-button px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5"
          >
            <Upload size={14} />
            {t('documents.uploadDocument')}
          </button>
          <input {...getInputProps()} />
        </div>
      </div>

      {/* Drop Zone */}
      <div
        {...getRootProps()}
        className={`glass-card p-6 text-center cursor-pointer transition-all ${
          isDragActive ? 'border-[#8B00E8] bg-[#A855F7]/10' : 'hover:border-[#8B00E8]/50'
        }`}
      >
        <input {...getInputProps()} />
        <Upload size={32} className="mx-auto mb-3 text-[#8B00E8]" />
        <p className="text-sm font-medium text-white mb-1">
          {isDragActive ? t('documents.dropFilesHere') : t('documents.dragDrop')}
        </p>
        <p className="text-xs text-glass-textSecondary">{t('documents.supportedFormats')}</p>
      </div>

      {/* Documents Grid */}
      {documents.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {documents.map((document) => (
            <div key={document.id} className="glass-card group hover:scale-[1.02] transition-transform duration-200 p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-[#8B00E8] to-[#7C3AED]">
                  <FileText size={16} className="text-white" />
                </div>
                <div className="flex items-center gap-1.5">
                  {getStatusIcon(document.status)}
                  <span className={`text-[10px] font-medium ${
                    document.status === 'completed' ? 'text-emerald-400' :
                    document.status === 'processing' ? 'text-amber-400' : 'text-red-400'
                  }`}>
                    {document.status}
                  </span>
                </div>
              </div>

              <h3 className="text-sm font-medium text-white mb-1 truncate" title={document.name}>
                {document.name}
              </h3>
              <p className="text-[11px] text-glass-textSecondary capitalize">
                {document.file_type}
                {document.file_size && ` • ${formatFileSize(document.file_size)}`}
              </p>

              <div className="text-[10px] text-glass-textSecondary mt-2 mb-3">
                {new Date(document.created_at).toLocaleDateString()}
              </div>

              <button
                onClick={() => handleDeleteDocument(document.id)}
                className="w-full glass-button-secondary px-3 py-1.5 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10"
              >
                <Trash2 size={14} />
                {t('documents.deleteDocument')}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {documents.length === 0 && (
        <div className="glass-card p-8 text-center">
          <FileText size={36} className="mx-auto mb-3 text-glass-textSecondary" />
          <h3 className="text-base font-semibold text-white mb-1">{t('documents.noDocumentsYet')}</h3>
          <p className="text-sm text-glass-textSecondary">
            {t('documents.noDocumentsDesc')}
          </p>
        </div>
      )}

      {/* URL Ingest Modal */}
      {showUrlModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-strong w-full max-w-sm p-5 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">{t('documents.ingestUrl')}</h2>
              <button
                onClick={() => setShowUrlModal(false)}
                className="p-1.5 rounded-lg glass-button-secondary"
              >
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleIngestUrl} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-glass-text mb-1.5">
                  {t('documents.url')}
                </label>
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="glass-input w-full px-3 py-2 rounded-lg text-sm"
                  placeholder="https://example.com/about"
                  required
                />
              </div>
              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowUrlModal(false)}
                  className="flex-1 glass-button-secondary px-4 py-2 rounded-lg text-sm"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="flex-1 glass-button px-4 py-2 rounded-lg text-sm"
                >
                  {isUploading ? t('common.loading') : t('common.create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Documents;
