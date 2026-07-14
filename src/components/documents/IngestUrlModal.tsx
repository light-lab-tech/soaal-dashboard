import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link as LinkIcon, Globe, Settings, ChevronUp, ChevronDown } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { AnimatedButton } from '../ui/AnimatedButton';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import type { CrawlOptions } from '../../types';

interface IngestUrlModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenantId: string;
  onSuccess: () => void;
}

export const IngestUrlModal: React.FC<IngestUrlModalProps> = ({
  isOpen,
  onClose,
  tenantId,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const { showToast } = useToast();

  const [urlInput, setUrlInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [crawlEnabled, setCrawlEnabled] = useState(false);
  const [showCrawlOptions, setShowCrawlOptions] = useState(false);

  const [crawlOptions, setCrawlOptions] = useState<CrawlOptions>({
    max_pages: 10,
    max_depth: 1,
    include_sitemap: true,
    include_hreflang: true,
    same_domain_only: true,
    excluded_paths: ['/api/', '/admin/', '/login', '/signup', '/logout', '/cart', '/checkout', '/account'],
    allowed_paths: [],
  });

  const resetState = () => {
    setUrlInput('');
    setCrawlEnabled(false);
    setShowCrawlOptions(false);
  };

  const handleClose = () => {
    resetState();
    onClose();
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
      
      handleClose();

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

      onSuccess();
    } catch (error: any) {
      console.error('Error ingesting URL:', error);
      const errorMessage = error?.response?.data?.error || error?.message || t('documents.ingestError', 'Failed to ingest URL');
      showToast(errorMessage, 'error');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
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
  );
};
