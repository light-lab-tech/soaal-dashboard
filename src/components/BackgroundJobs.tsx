import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import type { BackgroundJob, JobStatus } from '../types';
import {
  RefreshCw,
  RotateCcw,
  Ban,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  FileText,
  Globe,
  Database,
} from 'lucide-react';

interface BackgroundJobsProps {
  tenantId: string;
  documentId?: string;
}

const BackgroundJobs: React.FC<BackgroundJobsProps> = ({ tenantId, documentId }) => {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [jobs, setJobs] = useState<BackgroundJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<JobStatus | 'all'>('all');

  const loadJobs = async () => {
    try {
      if (documentId) {
        const response = await api.listDocumentJobs(tenantId, documentId, { status: statusFilter as any, limit: 50 });
        setJobs(response.data.jobs);
      } else {
        const response = await api.listBackgroundJobs(tenantId, { status: statusFilter as any, limit: 50 });
        setJobs(response.data.jobs);
      }
    } catch (error) {
      console.error('Error loading jobs:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, [tenantId, documentId, statusFilter]);

  const handleRetry = async (jobId: string) => {
    try {
      await api.retryBackgroundJob(tenantId, jobId);
      showToast(t('documents.reindexStarted', 'Job retried successfully'), 'success');
      loadJobs();
    } catch (error) {
      console.error('Error retrying job:', error);
      showToast(t('common.error'), 'error');
    }
  };

  const handleCancel = async (jobId: string) => {
    try {
      await api.cancelBackgroundJob(tenantId, jobId);
      showToast(t('documents.reindexStarted', 'Job canceled successfully'), 'success');
      loadJobs();
    } catch (error) {
      console.error('Error canceling job:', error);
      showToast(t('common.error'), 'error');
    }
  };

  const getStatusIcon = (status: JobStatus) => {
    switch (status) {
      case 'queued':
        return <Clock size={16} className="text-slate-400" />;
      case 'retry':
        return <RotateCcw size={16} className="text-orange-400" />;
      case 'running':
        return <Loader2 size={16} className="text-blue-400 animate-spin" />;
      case 'completed':
        return <CheckCircle2 size={16} className="text-green-400" />;
      case 'failed':
        return <XCircle size={16} className="text-red-400" />;
      case 'canceled':
        return <Ban size={16} className="text-slate-500" />;
      default:
        return <AlertCircle size={16} className="text-slate-400" />;
    }
  };

  const getStatusBadge = (status: JobStatus) => {
    const badges = {
      queued: 'bg-slate-500/20 text-slate-300',
      retry: 'bg-orange-500/20 text-orange-300',
      running: 'bg-blue-500/20 text-blue-300',
      completed: 'bg-green-500/20 text-green-300',
      failed: 'bg-red-500/20 text-red-300',
      canceled: 'bg-slate-500/20 text-slate-400',
    };
    return badges[status] || badges.queued;
  };

  const getJobTypeIcon = (type: string) => {
    switch (type) {
      case 'scrape_document_url':
        return <Globe size={16} className="text-cyan-400" />;
      case 'process_document':
        return <FileText size={16} className="text-purple-400" />;
      case 'reindex_document':
        return <Database size={16} className="text-green-400" />;
      case 'recrawl_document':
        return <RotateCcw size={16} className="text-orange-400" />;
      default:
        return <FileText size={16} className="text-slate-400" />;
    }
  };

  const getJobTypeLabel = (type: string) => {
    switch (type) {
      case 'scrape_document_url':
        return 'URL Ingest';
      case 'process_document':
        return 'Process Document';
      case 'reindex_document':
        return 'Reindex';
      case 'recrawl_document':
        return 'Recrawl';
      default:
        return type;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-6 h-6 border-2 border-[#8B00E8] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-glass-text">
          Background Jobs ({jobs.length})
        </h3>
        <button
          onClick={() => {
            setIsRefreshing(true);
            loadJobs();
          }}
          disabled={isRefreshing}
          className="p-2 rounded-lg glass-button-secondary"
        >
          <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Status Filter */}
      <div className="flex flex-wrap gap-2">
        {(['all', 'queued', 'retry', 'running', 'completed', 'failed', 'canceled'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              statusFilter === s
                ? 'bg-[#8B00E8] text-white'
                : 'glass-card-surface text-glass-text hover:bg-slate-700/50'
            }`}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {/* Jobs List */}
      {jobs.length === 0 ? (
        <div className="text-center py-8">
          <FileText size={32} className="mx-auto text-slate-600 mb-2" />
          <p className="text-sm text-glass-textSecondary">No background jobs found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {jobs.map((job) => (
            <div key={job.id} className="glass-card-surface p-3 rounded-lg">
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div className={`p-2 rounded-lg ${getStatusBadge(job.status)}`}>
                  {getStatusIcon(job.status)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-white truncate">
                      {job.document_name}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-xs ${getStatusBadge(job.status)}`}>
                      {job.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-glass-textSecondary">
                    <span className="flex items-center gap-1">
                      {getJobTypeIcon(job.type)}
                      {getJobTypeLabel(job.type)}
                    </span>
                    <span>•</span>
                    <span>
                      Attempt {job.attempts}/{job.max_attempts}
                    </span>
                    {job.last_error && (
                      <>
                        <span>•</span>
                        <span className="text-red-400" title={job.last_error}>
                          Error: {job.last_error.length > 30 ? job.last_error.substring(0, 30) + '...' : job.last_error}
                        </span>
                      </>
                    )}
                  </div>

                  {/* Payload Summary */}
                  {job.payload_summary?.url && (
                    <div className="mt-2 text-xs text-glass-textSecondary truncate">
                      URL: {job.payload_summary.url}
                    </div>
                  )}
                  {job.payload_summary?.metadata?.source_url && (
                    <div className="mt-2 text-xs text-glass-textSecondary truncate">
                      Source: {job.payload_summary.metadata.source_url}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  {job.available_actions.includes('retry') && (
                    <button
                      onClick={() => handleRetry(job.id)}
                      className="p-2 rounded-lg glass-button-secondary text-orange-400 hover:text-orange-300"
                      title="Retry"
                    >
                      <RotateCcw size={14} />
                    </button>
                  )}
                  {job.available_actions.includes('cancel') && (
                    <button
                      onClick={() => handleCancel(job.id)}
                      className="p-2 rounded-lg glass-button-secondary text-red-400 hover:text-red-300"
                      title="Cancel"
                    >
                      <Ban size={14} />
                    </button>
                  )}
                </div>
              </div>

              {/* Timestamps */}
              <div className="flex items-center gap-4 mt-2 pt-2 border-t border-slate-700/50 text-xs text-glass-textSecondary">
                <span>Created: {new Date(job.created_at).toLocaleString()}</span>
                {job.run_at && <span>Run: {new Date(job.run_at).toLocaleString()}</span>}
                {job.finished_at && <span>Finished: {new Date(job.finished_at).toLocaleString()}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BackgroundJobs;
