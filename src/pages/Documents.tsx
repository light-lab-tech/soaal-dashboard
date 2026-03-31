import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDropzone } from 'react-dropzone';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import type { Document, Tenant, CrawlOptions, DocumentMetadata } from '../types';
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
  FileSpreadsheet,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Globe,
  Settings,
  RefreshCw,
  Edit,
  ExternalLink,
  Database,
  RotateCcw,
} from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { AnimatedButton, IconButton } from '../components/ui/AnimatedButton';
import { EmptyState } from '../components/ui/EmptyState';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import { ConfirmModal } from '../components/ui/Modal';
import BackgroundJobs from '../components/BackgroundJobs';

const Documents: React.FC = () => {
  const { t } = useTranslation();
  const { tenantId } = useParams<{ tenantId: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [showUrlModal, setShowUrlModal] = useState(false);
  const [showReplaceModal, setShowReplaceModal] = useState(false);
  const [showReplaceUrlModal, setShowReplaceUrlModal] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [urlInput, setUrlInput] = useState('');
  const [replaceUrlInput, setReplaceUrlInput] = useState('');
  const [uploadProgress, setUploadProgress] = useState<{[key: string]: number}>({});
  const [crawlEnabled, setCrawlEnabled] = useState(false);
  const [showCrawlOptions, setShowCrawlOptions] = useState(false);
  const [pollingDocs, setPollingDocs] = useState<Set<string>>(new Set());
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [docToDelete, setDocToDelete] = useState<Document | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const [crawlOptions, setCrawlOptions] = useState<CrawlOptions>({
    max_pages: 10,
    max_depth: 1,
    include_sitemap: true,
    include_hreflang: true,
    same_domain_only: true,
    excluded_paths: ['/api/', '/admin/', '/login', '/signup', '/logout', '/cart', '/checkout', '/account'],
    allowed_paths: [],
  });

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!tenantId) {
      navigate('/tenants');
      return;
    }
    loadData();
  }, [tenantId]);

  // Auto-poll for documents in processing status
  useEffect(() => {
    const processingDocs = documents.filter(d => d.status === 'processing');

    if (processingDocs.length === 0) {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
      setPollingDocs(new Set());
      return;
    }

    // Start polling if not already running
    if (!pollIntervalRef.current) {
      pollIntervalRef.current = setInterval(async () => {
        if (!tenantId) return;

        try {
          const updatedDocs = [...documents];
          let hasChanges = false;
          const stillProcessing = new Set<string>();

          for (const doc of processingDocs) {
            try {
              const response = await api.getDocumentStatus(tenantId, doc.id);
              const updatedDoc = response.data.document;

              const index = updatedDocs.findIndex(d => d.id === updatedDoc.id);
              if (index !== -1) {
                updatedDocs[index] = updatedDoc;
                hasChanges = true;

                if (updatedDoc.status === 'processing') {
                  stillProcessing.add(updatedDoc.id);
                } else if (updatedDoc.status === 'completed') {
                  showToast(
                    t('documents.documentReady', '{{name}} is now ready', { name: updatedDoc.name }),
                    'success'
                  );
                } else if (updatedDoc.status === 'failed') {
                  showToast(
                    t('documents.documentFailed', '{{name}} processing failed', { name: updatedDoc.name }),
                    'error'
                  );
                }
              }
            } catch (error) {
              console.error('Error polling document status:', error);
            }
          }

          if (hasChanges) {
            setDocuments(updatedDocs);
          }

          setPollingDocs(stillProcessing);

          // Stop polling if no more processing documents
          if (stillProcessing.size === 0) {
            clearInterval(pollIntervalRef.current!);
            pollIntervalRef.current = null;
          }
        } catch (error) {
          console.error('Error polling documents:', error);
        }
      }, 3000); // Poll every 3 seconds
    }
  }, [documents, tenantId, showToast, t]);

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
      showToast(t('documents.uploadSuccess', 'Document uploaded successfully'), 'success');
    } catch (error: any) {
      console.error('Error uploading document:', error);
      const errorMessage = error?.response?.data?.error || error?.message || t('common.error', 'An error occurred');
      showToast(errorMessage, 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleIngestUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantId || !urlInput) return;

    try {
      setIsUploading(true);
      const data = crawlEnabled
        ? { url: urlInput, crawl: true, options: crawlOptions }
        : { url: urlInput };

      const response = await api.ingestUrl(tenantId, data);
      setShowUrlModal(false);
      setUrlInput('');
      setCrawlEnabled(false);
      setShowCrawlOptions(false);

      if (crawlEnabled && response.data.pages_crawled) {
        showToast(
          t('documents.crawlSuccess', 'Crawled {{count}} pages successfully', { count: response.data.pages_crawled }),
          'success'
        );
      } else {
        showToast(
          t('documents.ingestSuccess', 'URL ingestion started'),
          'success'
        );
      }

      await loadData();
    } catch (error: any) {
      console.error('Error ingesting URL:', error);
      const errorMessage = error?.response?.data?.error || error?.message || t('documents.ingestError', 'Failed to ingest URL');
      showToast(errorMessage, 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleReplaceDocument = async (file: File) => {
    if (!tenantId || !selectedDoc) return;

    try {
      setIsUploading(true);
      await api.replaceDocument(tenantId, selectedDoc.id, file);
      setShowReplaceModal(false);
      setSelectedDoc(null);
      showToast(t('documents.replaceSuccess', 'Document replaced successfully'), 'success');
      await loadData();
    } catch (error: any) {
      console.error('Error replacing document:', error);
      const errorMessage = error?.response?.data?.error || error?.message || t('common.error', 'Failed to replace document');
      showToast(errorMessage, 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleReplaceUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantId || !selectedDoc || !replaceUrlInput) return;

    try {
      setIsUploading(true);
      await api.replaceDocumentUrl(tenantId, selectedDoc.id, replaceUrlInput);
      setShowReplaceUrlModal(false);
      setSelectedDoc(null);
      setReplaceUrlInput('');
      showToast(t('documents.replaceUrlSuccess', 'Document URL replaced successfully'), 'success');
      await loadData();
    } catch (error: any) {
      console.error('Error replacing document URL:', error);
      const errorMessage = error?.response?.data?.error || error?.message || t('documents.ingestError', 'Failed to replace URL');
      showToast(errorMessage, 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteDocument = async (doc: Document) => {
    setDocToDelete(doc);
    setShowDeleteModal(true);
  };

  const confirmDeleteDocument = async () => {
    if (!tenantId || !docToDelete) return;

    try {
      setIsDeleting(true);
      await api.deleteDocument(tenantId, docToDelete.id);
      setDocuments(documents.filter((doc) => doc.id !== docToDelete.id));
      setShowDeleteModal(false);
      setDocToDelete(null);
      showToast(t('documents.deleteSuccess', 'Document deleted successfully'), 'success');
    } catch (error: any) {
      console.error('Error deleting document:', error);
      const errorMessage = error?.response?.data?.error || error?.message || t('common.error', 'Failed to delete document');
      showToast(errorMessage, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRefreshDocument = async (documentId: string) => {
    if (!tenantId) return;
    try {
      const response = await api.getDocumentStatus(tenantId, documentId);
      const updatedDoc = response.data.document;
      setDocuments(docs => docs.map(d => d.id === updatedDoc.id ? updatedDoc : d));
    } catch (error) {
      console.error('Error refreshing document:', error);
    }
  };

  const handleReindexDocument = async (documentId: string) => {
    if (!tenantId) return;
    try {
      await api.reindexDocument(tenantId, documentId);
      showToast(t('documents.reindexStarted', 'Document reindex started'), 'success');
      // Update document status to processing
      setDocuments(docs => docs.map(d => d.id === documentId ? { ...d, status: 'processing' as const } : d));
    } catch (error) {
      console.error('Error reindexing document:', error);
      showToast(t('common.error'), 'error');
    }
  };

  const handleRecrawlDocument = async (documentId: string) => {
    if (!tenantId) return;
    try {
      await api.recrawlDocument(tenantId, documentId);
      showToast(t('documents.recrawlStarted', 'Document recrawl started'), 'success');
      // Update document status to processing
      setDocuments(docs => docs.map(d => d.id === documentId ? { ...d, status: 'processing' as const } : d));
    } catch (error) {
      console.error('Error recrawling document:', error);
      showToast(t('common.error'), 'error');
    }
  };

  const getFileIcon = (fileType: string) => {
    const type = fileType?.toLowerCase() || '';
    if (type.includes('json') || type === 'application/json') {
      return <FileJson size={20} className="text-cyan-400" />;
    }
    if (type.includes('html') || type === 'text/html') {
      return <FileCode size={20} className="text-orange-400" />;
    }
    if (type.includes('sheet') || type.includes('excel') || type.includes('xls') || type.includes('csv')) {
      return <FileSpreadsheet size={20} className="text-green-400" />;
    }
    if (type.includes('word') || type.includes('docx') || type.includes('doc')) {
      return <FileText size={20} className="text-blue-400" />;
    }
    if (type.includes('md') || type.includes('markdown')) {
      return <FileType2 size={20} className="text-purple-400" />;
    }
    return <FileText size={20} className="text-slate-400" />;
  };

  const getFileTypeDisplay = (fileType: string) => {
    const type = fileType?.toLowerCase() || '';
    if (type.includes('pdf')) return 'PDF';
    if (type.includes('json') || type === 'application/json') return 'JSON';
    if (type.includes('html') || type === 'text/html') return 'HTML';
    if (type.includes('sheet') || type.includes('excel') || type.includes('xls')) return 'Spreadsheet';
    if (type.includes('word') || type.includes('docx') || type.includes('doc')) return 'Word';
    if (type.includes('md') || type.includes('markdown')) return 'Markdown';
    if (type.includes('txt') || type.includes('text')) return 'Text';
    return 'Document';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="success" size="sm" dot>{t('documents.completed')}</Badge>;
      case 'processing':
        return (
          <div className="flex items-center gap-2">
            <Badge variant="warning" size="sm" dot pulse>{t('documents.processing')}</Badge>
            <RefreshCw size={12} className="text-purple-400 animate-spin" />
          </div>
        );
      case 'failed':
        return <Badge variant="danger" size="sm" dot>{t('documents.failed')}</Badge>;
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

  const isUrlBasedDoc = (doc: Document) => {
    return doc.name.startsWith('http://') || doc.name.startsWith('https://');
  };

  const getSourceKindBadge = (metadata?: DocumentMetadata) => {
    if (!metadata?.source_kind) return null;
    const kind = metadata.source_kind;
    const kindConfig = {
      upload: { label: 'Upload', color: 'bg-blue-500/20 text-blue-300' },
      url: { label: 'URL', color: 'bg-cyan-500/20 text-cyan-300' },
      crawl: { label: 'Crawl', color: 'bg-purple-500/20 text-purple-300' },
    }[kind];
    return kindConfig ? (
      <span className={`px-2 py-0.5 rounded text-xs font-medium ${kindConfig.color}`}>
        {kindConfig.label}
      </span>
    ) : null;
  };

  const renderMetadata = (metadata?: DocumentMetadata) => {
    if (!metadata) return null;

    const items: React.ReactNode[] = [];

    // Source kind
    if (metadata.source_kind) {
      items.push(getSourceKindBadge(metadata));
    }

    // Crawl source
    if (metadata.crawl_source) {
      const crawlLabel = {
        seed: 'Seed',
        sitemap: 'Sitemap',
        link: 'Link',
        hreflang: 'Hreflang',
      }[metadata.crawl_source] || metadata.crawl_source;
      items.push(
        <span key="crawl" className="px-2 py-0.5 rounded text-xs font-medium bg-slate-700/50 text-slate-300">
          {crawlLabel}
        </span>
      );
    }

    // Chunks count
    if (metadata.chunk_count) {
      items.push(
        <span key="chunks" className="px-2 py-0.5 rounded text-xs font-medium bg-slate-700/50 text-slate-300">
          {metadata.chunk_count} chunks
        </span>
      );
    }

    // Source host
    if (metadata.source_host) {
      items.push(
        <span key="host" className="px-2 py-0.5 rounded text-xs font-medium bg-slate-700/50 text-slate-400" title={metadata.source_host}>
          🌐 {metadata.source_host.length > 20 ? metadata.source_host.substring(0, 20) + '...' : metadata.source_host}
        </span>
      );
    }

    // Processing error
    if (metadata.processing_error) {
      items.push(
        <span key="error" className="px-2 py-0.5 rounded text-xs font-medium bg-red-500/20 text-red-300" title={metadata.processing_error}>
          ⚠️ Error
        </span>
      );
    }

    if (items.length === 0) return null;

    return (
      <div className="flex flex-wrap items-center gap-2 mb-3">
        {items}
      </div>
    );
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
            icon={<ArrowLeft size={20} className="rtl-flip" />}
          />
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">
              {t('documents.title')}
            </h1>
            <p className="text-slate-400">
              {tenant?.name} • {documents.length} {t('documents.documents', 'documents')}
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
                <div className="flex items-start gap-3 mb-4">
                  <div className="p-3 rounded-xl bg-slate-700/50">
                    {isUrlBasedDoc(doc) ? <ExternalLink size={20} className="text-cyan-400" /> : getFileIcon(doc.file_type)}
                  </div>
                  <div className="flex flex-col gap-1">
                    {getStatusBadge(doc.status)}
                    {pollingDocs.has(doc.id) && (
                      <span className="text-[10px] text-slate-500">{t('documents.polling', 'Checking...')}</span>
                    )}
                  </div>
                </div>

                <h3 className="font-medium text-white mb-1 truncate" title={doc.name}>
                  {isUrlBasedDoc(doc) ? (
                    <a
                      href={doc.name}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-300 hover:text-cyan-200"
                    >
                      {doc.name.length > 40 ? doc.name.substring(0, 40) + '...' : doc.name}
                    </a>
                  ) : (
                    doc.name
                  )}
                </h3>

                <p className="text-sm text-slate-400 mb-2">
                  {isUrlBasedDoc(doc) ? 'Web Page' : getFileTypeDisplay(doc.file_type)}
                  {doc.file_size && ` • ${formatFileSize(doc.file_size)}`}
                </p>

                {/* Document Metadata */}
                {renderMetadata(doc.metadata)}

                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-4 border-t border-slate-700/50">
                  <span className="text-xs text-slate-500">
                    {new Date(doc.created_at).toLocaleDateString()}
                  </span>
                  <div className="flex gap-1 ml-auto">
                    {/* Refresh button for processing documents */}
                    {doc.status === 'processing' && (
                      <IconButton
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRefreshDocument(doc.id)}
                        className="text-purple-400 hover:text-purple-300"
                        icon={<RefreshCw size={14} />}
                      />
                    )}

                    {/* Replace button */}
                    {doc.status !== 'processing' && (
                      <IconButton
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedDoc(doc);
                          if (isUrlBasedDoc(doc)) {
                            setReplaceUrlInput(doc.name);
                            setShowReplaceUrlModal(true);
                          } else {
                            // Reset file input and show modal
                            if (fileInputRef.current) {
                              fileInputRef.current.value = '';
                            }
                            setShowReplaceModal(true);
                          }
                        }}
                        className="text-blue-400 hover:text-blue-300"
                        icon={<Edit size={14} />}
                      />
                    )}

                    {/* Reindex button - for all documents */}
                    {doc.status !== 'processing' && (
                      <IconButton
                        variant="ghost"
                        size="sm"
                        onClick={() => handleReindexDocument(doc.id)}
                        className="text-emerald-400 hover:text-emerald-300"
                        icon={<Database size={14} />}
                      />
                    )}

                    {/* Recrawl button - only for URL/crawl documents */}
                    {doc.status !== 'processing' && doc.metadata?.source_kind && ['url', 'crawl'].includes(doc.metadata.source_kind) && (
                      <IconButton
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRecrawlDocument(doc.id)}
                        className="text-orange-400 hover:text-orange-300"
                        icon={<RotateCcw size={14} />}
                      />
                    )}

                    {/* Delete button */}
                    <IconButton
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteDocument(doc)}
                      className="text-red-400 hover:text-red-300"
                      icon={<Trash2 size={14} />}
                    />
                  </div>
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

      {/* Background Jobs Section */}
      <div className="glass-card p-4">
        <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
          <RefreshCw size={18} className="text-[#8B00E8]" />
          {t('tenants.backgroundJobs', 'Background Jobs')}
        </h2>
        <BackgroundJobs tenantId={tenantId!} />
      </div>

      {/* URL Ingest Modal */}
      <Modal
        isOpen={showUrlModal}
        onClose={() => {
          setShowUrlModal(false);
          setCrawlEnabled(false);
          setShowCrawlOptions(false);
          setUrlInput('');
        }}
        title={t('documents.ingestUrl')}
        size="lg"
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
                const form = document.querySelector('#url-ingest-form') as HTMLFormElement;
                if (form) form.requestSubmit();
              }}
            >
              {crawlEnabled ? t('documents.startCrawl', 'Start Crawling') : t('common.create')}
            </AnimatedButton>
          </>
        )}
      >
        <form id="url-ingest-form" onSubmit={handleIngestUrl} className="space-y-4">
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
                placeholder="https://..."
                required
              />
            </div>
          </div>

          {/* Crawl Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/20">
                <Globe size={18} className="text-purple-400" />
              </div>
              <div>
                <label className="text-sm font-medium text-white">{t('documents.enableCrawl', 'Enable Multi-Page Crawling')}</label>
                <p className="text-xs text-slate-400">{t('documents.crawlDesc', 'Crawl multiple pages from the website')}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setCrawlEnabled(!crawlEnabled);
                if (!crawlEnabled) setShowCrawlOptions(true);
              }}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-300 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 ${
                crawlEnabled ? 'bg-purple-500' : 'bg-slate-600'
              }`}
            >
              <span
                aria-hidden="true"
                className={`pointer-events-none absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition duration-300 ease-inout ${
                  crawlEnabled
                    ? 'ltr:translate-x-6 rtl:-translate-x-6'
                    : 'ltr:translate-x-0.5 rtl:-translate-x-0.5'
                }`}
              />
            </button>
          </div>

          {/* Crawl Options */}
          {crawlEnabled && (
            <div className="space-y-4 p-4 rounded-xl bg-slate-800/30 border border-slate-700/50">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-white flex items-center gap-2">
                  <Settings size={16} className="text-slate-400" />
                  {t('documents.crawlOptions', 'Crawl Options')}
                </h3>
                <button
                  type="button"
                  onClick={() => setShowCrawlOptions(!showCrawlOptions)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  {showCrawlOptions ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
              </div>

              {showCrawlOptions && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1.5">
                        {t('documents.maxPages', 'Max Pages')}
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={100}
                        value={crawlOptions.max_pages}
                        onChange={(e) => setCrawlOptions({ ...crawlOptions, max_pages: Math.min(Number(e.target.value), 100) })}
                        className="w-full px-3 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50
                                 text-white text-sm
                                 focus:border-purple-500/50 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1.5">
                        {t('documents.maxDepth', 'Max Depth')}
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={5}
                        value={crawlOptions.max_depth}
                        onChange={(e) => setCrawlOptions({ ...crawlOptions, max_depth: Math.min(Number(e.target.value), 5) })}
                        className="w-full px-3 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50
                                 text-white text-sm
                                 focus:border-purple-500/50 outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-sm text-slate-300">{t('documents.includeSitemap', 'Include Sitemap')}</span>
                      <input
                        type="checkbox"
                        checked={crawlOptions.include_sitemap}
                        onChange={(e) => setCrawlOptions({ ...crawlOptions, include_sitemap: e.target.checked })}
                        className="w-5 h-5 rounded border-slate-600 bg-slate-800 text-purple-500 focus:ring-purple-500"
                      />
                    </label>
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-sm text-slate-300">{t('documents.includeHreflang', 'Include Hreflang')}</span>
                      <input
                        type="checkbox"
                        checked={crawlOptions.include_hreflang}
                        onChange={(e) => setCrawlOptions({ ...crawlOptions, include_hreflang: e.target.checked })}
                        className="w-5 h-5 rounded border-slate-600 bg-slate-800 text-purple-500 focus:ring-purple-500"
                      />
                    </label>
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-sm text-slate-300">{t('documents.sameDomainOnly', 'Same Domain Only')}</span>
                      <input
                        type="checkbox"
                        checked={crawlOptions.same_domain_only}
                        onChange={(e) => setCrawlOptions({ ...crawlOptions, same_domain_only: e.target.checked })}
                        className="w-5 h-5 rounded border-slate-600 bg-slate-800 text-purple-500 focus:ring-purple-500"
                      />
                    </label>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">
                      {t('documents.excludedPaths', 'Excluded Paths')}
                    </label>
                    <textarea
                      value={crawlOptions.excluded_paths?.join(', ') || ''}
                      onChange={(e) => setCrawlOptions({
                        ...crawlOptions,
                        excluded_paths: e.target.value.split(',').map(p => p.trim()).filter(Boolean)
                      })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50
                               text-white text-sm placeholder-slate-500
                               focus:border-purple-500/50 outline-none resize-none"
                      rows={2}
                      placeholder="/api/, /admin/, /login"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">
                      {t('documents.allowedPaths', 'Allowed Paths')}
                    </label>
                    <textarea
                      value={crawlOptions.allowed_paths?.join(', ') || ''}
                      onChange={(e) => setCrawlOptions({
                        ...crawlOptions,
                        allowed_paths: e.target.value.split(',').map(p => p.trim()).filter(Boolean)
                      })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50
                               text-white text-sm placeholder-slate-500
                               focus:border-purple-500/50 outline-none resize-none"
                      rows={2}
                      placeholder="/blog/, /docs/"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </form>
      </Modal>

      {/* Replace Document Modal (File) */}
      <Modal
        isOpen={showReplaceModal}
        onClose={() => {
          setShowReplaceModal(false);
          setSelectedDoc(null);
        }}
        title={t('documents.replaceDocument', 'Replace Document')}
        size="md"
        footer={(close) => (
          <AnimatedButton
            variant="ghost"
            onClick={close}
            fullWidth
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
                setShowReplaceModal(false);
                handleReplaceDocument(file);
              }
            }}
            className="hidden"
            accept=".txt,.md,.json,.html,.docx,.pdf"
          />

          <div
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-dashed border-slate-600 hover:border-purple-500/50 hover:bg-slate-800/30 transition-all cursor-pointer"
          >
            <Upload size={32} className="text-purple-400" />
            <span className="text-sm text-white">{t('documents.selectNewFile', 'Select New File')}</span>
            <span className="text-xs text-slate-500">Supported: TXT, MD, JSON, HTML, DOCX, PDF</span>
          </div>
        </div>
      </Modal>

      {/* Replace URL Modal */}
      <Modal
        isOpen={showReplaceUrlModal}
        onClose={() => {
          setShowReplaceUrlModal(false);
          setSelectedDoc(null);
          setReplaceUrlInput('');
        }}
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

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDocToDelete(null);
        }}
        onConfirm={confirmDeleteDocument}
        message={docToDelete ? t('documents.deleteConfirmMessage', 'Are you sure you want to delete "{{name}}"? This action cannot be undone.', { name: docToDelete.name }) : ''}
        confirmLabel={t('documents.delete', 'Delete')}
        cancelLabel={t('common.cancel', 'Cancel')}
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default Documents;
