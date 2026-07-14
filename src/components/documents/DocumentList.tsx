import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  FileText,
  Trash2,
  FileJson,
  FileCode,
  FileType2,
  FileSpreadsheet,
  RefreshCw,
  Edit,
  ExternalLink,
  Database,
  RotateCcw,
  Upload
} from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { IconButton } from '../ui/AnimatedButton';
import { Badge } from '../ui/Badge';
import { EmptyState } from '../ui/EmptyState';
import type { Document, DocumentMetadata } from '../../types';

interface DocumentListProps {
  documents: Document[];
  pollingDocs: Set<string>;
  onRefreshDocument: (id: string) => void;
  onReindexDocument: (id: string) => void;
  onRecrawlDocument: (id: string) => void;
  onDeleteDocument: (doc: Document) => void;
  onReplaceFile: (doc: Document) => void;
  onReplaceUrl: (doc: Document) => void;
  onUploadClick: () => void;
  onIngestUrlClick: () => void;
}

export const DocumentList: React.FC<DocumentListProps> = ({
  documents,
  pollingDocs,
  onRefreshDocument,
  onReindexDocument,
  onRecrawlDocument,
  onDeleteDocument,
  onReplaceFile,
  onReplaceUrl,
  onUploadClick,
  onIngestUrlClick
}) => {
  const { t } = useTranslation();

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
    const kindConfig: Record<string, { label: string, color: string }> = {
      upload: { label: 'Upload', color: 'bg-blue-500/20 text-blue-300' },
      url: { label: 'URL', color: 'bg-cyan-500/20 text-cyan-300' },
      crawl: { label: 'Crawl', color: 'bg-purple-500/20 text-purple-300' },
    };
    const config = kindConfig[kind];
    return config ? (
      <span className={`px-2 py-0.5 rounded text-xs font-medium ${config.color}`}>
        {config.label}
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
      const crawlLabel: Record<string, string> = {
        seed: 'Seed',
        sitemap: 'Sitemap',
        link: 'Link',
        hreflang: 'Hreflang',
      };
      items.push(
        <span key="crawl" className="px-2 py-0.5 rounded text-xs font-medium bg-slate-700/50 text-slate-300">
          {crawlLabel[metadata.crawl_source] || metadata.crawl_source}
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
        {items.map((item, i) => (
          <React.Fragment key={i}>{item}</React.Fragment>
        ))}
      </div>
    );
  };

  if (documents.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title={t('documents.noDocumentsYet')}
        description={t('documents.noDocumentsDesc')}
        action={{
          label: t('documents.uploadDocument'),
          onClick: onUploadClick,
          icon: <Upload size={18} />,
        }}
        secondaryAction={{
          label: t('documents.ingestUrl'),
          onClick: onIngestUrlClick,
        }}
        color="purple"
      />
    );
  }

  return (
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
                    onClick={() => onRefreshDocument(doc.id)}
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
                      if (isUrlBasedDoc(doc)) {
                        onReplaceUrl(doc);
                      } else {
                        onReplaceFile(doc);
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
                    onClick={() => onReindexDocument(doc.id)}
                    className="text-emerald-400 hover:text-emerald-300"
                    icon={<Database size={14} />}
                  />
                )}

                {/* Recrawl button - only for URL/crawl documents */}
                {doc.status !== 'processing' && doc.metadata?.source_kind && ['url', 'crawl'].includes(doc.metadata.source_kind) && (
                  <IconButton
                    variant="ghost"
                    size="sm"
                    onClick={() => onRecrawlDocument(doc.id)}
                    className="text-orange-400 hover:text-orange-300"
                    icon={<RotateCcw size={14} />}
                  />
                )}

                {/* Delete button */}
                <IconButton
                  variant="ghost"
                  size="sm"
                  onClick={() => onDeleteDocument(doc)}
                  className="text-red-400 hover:text-red-300"
                  icon={<Trash2 size={14} />}
                />
              </div>
            </div>
          </div>
        </GlassCard>
      ))}
    </div>
  );
};
