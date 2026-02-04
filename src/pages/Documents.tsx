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
  AlertCircle,
  File,
  FileJson,
  FileCode,
  FileType2,
  ArrowLeft,
} from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { AnimatedButton, IconButton } from '../components/ui/AnimatedButton';
import { EmptyState } from '../components/ui/EmptyState';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';

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
  const [uploadProgress, setUploadProgress] = useState<{[key: string]: number}>({});

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
      setIsUploading(true);
      setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));
      
      // Simulate progress
      const interval = setInterval(() => {
        setUploadProgress(prev => ({
          ...prev,
          [file.name]: Math.min((prev[file.name] || 0) + 10, 90)
        }));
      }, 200);
      
      await api.uploadDocument(tenantId, file);
      
      clearInterval(interval);
      setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));
      
      setTimeout(() => {
        setUploadProgress(prev => {
          const newProgress = { ...prev };
          delete newProgress[file.name];
          return newProgress;
        });
      }, 500);
      
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

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'json':
        return <FileJson size={20} className="text-cyan-400" />;
      case 'html':
        return <FileCode size={20} className="text-orange-400" />;
      case 'md':
        return <FileType2 size={20} className="text-blue-400" />;
      case 'txt':
      default:
        return <FileText size={20} className="text-purple-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="success" size="sm" dot>Completed</Badge>;
      case 'processing':
        return <Badge variant="warning" size="sm" dot pulse>Processing</Badge>;
      case 'failed':
        return <Badge variant="danger" size="sm" dot>Failed</Badge>;
      default:
        return <Badge variant="default" size="sm">{status}</Badge>;
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
      <div className="space-y-6 animate-page-enter">
        <div className="h-8 w-64 bg-slate-800/50 rounded animate-pulse" />
        <div className="h-32 bg-slate-800/50 rounded-xl animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-40 bg-slate-800/50 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-page-enter">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <IconButton
            variant="ghost"
            onClick={() => navigate(`/tenants/${tenantId}`)}
            icon={<ArrowLeft size={20} />}
          />
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">
              {t('documents.title')}
            </h1>
            <p className="text-slate-400">
              {tenant?.name} • {documents.length} documents
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <AnimatedButton
            variant="secondary"
            onClick={() => setShowUrlModal(true)}
            icon={<LinkIcon size={16} />}
          >
            {t('documents.ingestUrl')}
          </AnimatedButton>
          <AnimatedButton
            variant="gradient"
            onClick={() => document.getElementById('file-upload')?.click()}
            icon={<Upload size={16} />}
          >
            {t('documents.uploadDocument')}
          </AnimatedButton>
        </div>
      </div>

      {/* Drop Zone */}
      <div
        {...getRootProps()}
        className={`
          relative overflow-hidden rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer
          ${isDragActive 
            ? 'border-purple-500 bg-purple-500/10 scale-[1.02]' 
            : isDragReject
              ? 'border-red-500 bg-red-500/10'
              : 'border-slate-700/50 bg-slate-800/30 hover:border-slate-600/50 hover:bg-slate-800/50'
          }
        `}
      >
        <input {...getInputProps()} id="file-upload" />
        
        {/* Animated background */}
        <div className={`
          absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/5 to-purple-500/0 
          transition-transform duration-1000
          ${isDragActive ? 'translate-x-full' : '-translate-x-full'}
        `} />
        
        <div className="relative p-10 text-center">
          <div className={`
            w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center
            transition-all duration-300
            ${isDragActive 
              ? 'bg-purple-500 shadow-lg shadow-purple-500/40 scale-110' 
              : 'bg-slate-700/50'
            }
          `}>
            <Upload 
              size={28} 
              className={`transition-colors ${isDragActive ? 'text-white' : 'text-purple-400'}`} 
            />
          </div>
          
          <p className="text-lg font-medium text-white mb-2">
            {isDragActive ? t('documents.dropFilesHere') : t('documents.dragDrop')}
          </p>
          <p className="text-sm text-slate-400">
            {t('documents.supportedFormats')}
          </p>
          
          {isDragReject && (
            <p className="mt-3 text-sm text-red-400 flex items-center justify-center gap-1">
              <AlertCircle size={14} />
              Invalid file type
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

      {/* Documents Grid */}
      {documents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
          {documents.map((doc, index) => (
            <GlassCard
              key={doc.id}
              variant="default"
              hover="lift"
              className="group"
              animate
            >
              <div className="p-5" style={{ animationDelay: `${index * 50}ms` }}>
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-xl bg-slate-700/50">
                    {getFileIcon(doc.file_type)}
                  </div>
                  {getStatusBadge(doc.status)}
                </div>

                <h3 className="font-medium text-white mb-1 truncate" title={doc.name}>
                  {doc.name}
                </h3>
                
                <p className="text-sm text-slate-400 mb-4">
                  {doc.file_type.toUpperCase()}
                  {doc.file_size && ` • ${formatFileSize(doc.file_size)}`}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
                  <span className="text-xs text-slate-500">
                    {new Date(doc.created_at).toLocaleDateString()}
                  </span>
                  <IconButton
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteDocument(doc.id)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    icon={<Trash2 size={16} />}
                  />
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={FileText}
          title={t('documents.noDocumentsYet')}
          description={t('documents.noDocumentsDesc')}
          action={{
            label: t('documents.uploadDocument'),
            onClick: () => document.getElementById('file-upload')?.click(),
            icon: <Upload size={18} />,
          }}
          secondaryAction={{
            label: t('documents.ingestUrl'),
            onClick: () => setShowUrlModal(true),
          }}
          color="purple"
        />
      )}

      {/* URL Ingest Modal */}
      <Modal
        isOpen={showUrlModal}
        onClose={() => setShowUrlModal(false)}
        title={t('documents.ingestUrl')}
        size="sm"
      >
        <form onSubmit={handleIngestUrl} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              {t('documents.url')}
            </label>
            <div className="relative">
              <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700/50 
                         text-white placeholder-slate-500
                         focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 
                         outline-none transition-all duration-300"
                placeholder="https://example.com/about"
                required
              />
            </div>
          </div>
          <div className="flex gap-3">
            <AnimatedButton
              variant="ghost"
              onClick={() => setShowUrlModal(false)}
              fullWidth
            >
              {t('common.cancel')}
            </AnimatedButton>
            <AnimatedButton
              type="submit"
              variant="gradient"
              isLoading={isUploading}
              fullWidth
            >
              {t('common.create')}
            </AnimatedButton>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Documents;
