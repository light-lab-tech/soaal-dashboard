import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import type { Document, Tenant } from '../types';
import {
  Upload,
  Link as LinkIcon,
  ArrowLeft,
  RefreshCw,
} from 'lucide-react';
import { AnimatedButton, IconButton } from '../components/ui/AnimatedButton';
import { ConfirmModal } from '../components/ui/Modal';
import BackgroundJobs from '../components/BackgroundJobs';

// Extracted components
import { DocumentDropzone } from '../components/documents/DocumentDropzone';
import { DocumentList } from '../components/documents/DocumentList';
import { IngestUrlModal } from '../components/documents/IngestUrlModal';
import { ReplaceDocumentModal } from '../components/documents/ReplaceDocumentModal';
import { ReplaceUrlModal } from '../components/documents/ReplaceUrlModal';

const Documents: React.FC = () => {
  const { t } = useTranslation();
  const { tenantId } = useParams<{ tenantId: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [documents, setDocuments] = useState<Document[]>([]);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modals state
  const [showUrlModal, setShowUrlModal] = useState(false);
  const [showReplaceModal, setShowReplaceModal] = useState(false);
  const [showReplaceUrlModal, setShowReplaceUrlModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [docToDelete, setDocToDelete] = useState<Document | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [pollingDocs, setPollingDocs] = useState<Set<string>>(new Set());
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

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
      setDocuments(docs => docs.map(d => d.id === documentId ? { ...d, status: 'processing' as const } : d));
    } catch (error) {
      console.error('Error recrawling document:', error);
      showToast(t('common.error'), 'error');
    }
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
      <DocumentDropzone tenantId={tenantId!} onSuccess={loadData} />

      {/* Documents Grid */}
      <DocumentList
        documents={documents}
        pollingDocs={pollingDocs}
        onRefreshDocument={handleRefreshDocument}
        onReindexDocument={handleReindexDocument}
        onRecrawlDocument={handleRecrawlDocument}
        onDeleteDocument={(doc) => {
          setDocToDelete(doc);
          setShowDeleteModal(true);
        }}
        onReplaceFile={(doc) => {
          setSelectedDoc(doc);
          setShowReplaceModal(true);
        }}
        onReplaceUrl={(doc) => {
          setSelectedDoc(doc);
          setShowReplaceUrlModal(true);
        }}
        onUploadClick={() => document.getElementById('file-upload')?.click()}
        onIngestUrlClick={() => setShowUrlModal(true)}
      />

      {/* Background Jobs Section */}
      <div className="glass-card p-4">
        <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
          <RefreshCw size={18} className="text-[#8B00E8]" />
          {t('tenants.backgroundJobs', 'Background Jobs')}
        </h2>
        <BackgroundJobs tenantId={tenantId!} />
      </div>

      <IngestUrlModal
        isOpen={showUrlModal}
        onClose={() => setShowUrlModal(false)}
        tenantId={tenantId!}
        onSuccess={loadData}
      />

      <ReplaceDocumentModal
        isOpen={showReplaceModal}
        onClose={() => {
          setShowReplaceModal(false);
          setSelectedDoc(null);
        }}
        tenantId={tenantId!}
        selectedDoc={selectedDoc}
        onSuccess={loadData}
      />

      <ReplaceUrlModal
        isOpen={showReplaceUrlModal}
        onClose={() => {
          setShowReplaceUrlModal(false);
          setSelectedDoc(null);
        }}
        tenantId={tenantId!}
        selectedDoc={selectedDoc}
        onSuccess={loadData}
      />

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
