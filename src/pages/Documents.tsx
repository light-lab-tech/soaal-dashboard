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
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});

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
        return <Check size={20} className="text-emerald-400" />;
      case 'processing':
        return <AlertCircle size={20} className="text-amber-400 animate-pulse" />;
      case 'failed':
        return <AlertCircle size={20} className="text-red-400" />;
      default:
        return <AlertCircle size={20} className="text-glass-textSecondary" />;
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
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="glass-card flex items-center gap-4">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-glass-text">{t('common.loading')}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            {t('documents.title')} - {tenant?.name}
          </h1>
          <p className="text-glass-textSecondary">
            {documents.length} {documents.length === 1 ? 'document' : 'documents'}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowUrlModal(true)}
            className="glass-button px-6 py-3 rounded-xl font-semibold flex items-center gap-2"
          >
            <LinkIcon size={20} />
            {t('documents.ingestUrl')}
          </button>
          <button
            {...getRootProps()}
            className="glass-button px-6 py-3 rounded-xl font-semibold flex items-center gap-2"
          >
            <Upload size={20} />
            {t('documents.uploadDocument')}
          </button>
          <input {...getInputProps()} />
        </div>
      </div>

      {/* Drop Zone */}
      <div
        {...getRootProps()}
        className={`glass-card p-8 text-center cursor-pointer transition-all ${
          isDragActive ? 'border-primary-400 bg-primary-500/10' : 'hover:border-primary-400/50'
        }`}
      >
        <input {...getInputProps()} />
        <Upload size={48} className="mx-auto mb-4 text-primary-400" />
        <p className="text-lg font-semibold text-white mb-2">
          {isDragActive ? 'Drop files here' : t('documents.dragDrop')}
        </p>
        <p className="text-sm text-glass-textSecondary">{t('documents.supportedFormats')}</p>
      </div>

      {/* Documents Grid */}
      {documents.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map((document) => (
            <div key={document.id} className="glass-card group hover:scale-105 transition-transform duration-300">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600">
                  <FileText size={24} className="text-white" />
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(document.status)}
                </div>
              </div>

              <h3 className="text-lg font-semibold text-white mb-1 truncate" title={document.name}>
                {document.name}
              </h3>
              <p className="text-sm text-glass-textSecondary mb-2 capitalize">
                {document.file_type}
              </p>
              {document.file_size && (
                <p className="text-sm text-glass-textSecondary mb-4">
                  {formatFileSize(document.file_size)}
                </p>
              )}

              <div className="text-xs text-glass-textSecondary mb-4">
                Uploaded {new Date(document.created_at).toLocaleDateString()}
              </div>

              <button
                onClick={() => handleDeleteDocument(document.id)}
                className="w-full glass-button-secondary px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 text-red-400 hover:text-red-300"
              >
                <Trash2 size={16} />
                {t('documents.deleteDocument')}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {documents.length === 0 && (
        <div className="glass-card p-12 text-center">
          <FileText size={64} className="mx-auto mb-4 text-glass-textSecondary" />
          <h3 className="text-xl font-semibold text-white mb-2">No documents yet</h3>
          <p className="text-glass-textSecondary mb-6">
            Upload or ingest documents to build your knowledge base
          </p>
        </div>
      )}

      {/* URL Ingest Modal */}
      {showUrlModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-strong w-full max-w-md p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">{t('documents.ingestUrl')}</h2>
              <button
                onClick={() => setShowUrlModal(false)}
                className="p-2 rounded-lg glass-button-secondary"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleIngestUrl} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-glass-text mb-2">
                  URL
                </label>
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="glass-input w-full px-4 py-3 rounded-xl"
                  placeholder="https://example.com/about"
                  required
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowUrlModal(false)}
                  className="flex-1 glass-button-secondary px-6 py-3 rounded-xl"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="flex-1 glass-button px-6 py-3 rounded-xl"
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
