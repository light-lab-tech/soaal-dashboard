import React, { useState } from 'react';
import { api } from '../services/api';
import type { RetrievalDebugData, RetrievalDebugOptions } from '../types';
import {
  Search,
  Loader2,
  FileText,
  CheckCircle2,
  XCircle,
  Code,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface RetrievalDebugProps {
  tenantId: string;
  currentSettings?: RetrievalDebugOptions;
}

const RetrievalDebug: React.FC<RetrievalDebugProps> = ({ tenantId, currentSettings }) => {
  const [query, setQuery] = useState('');
  const [useCurrentSettings, setUseCurrentSettings] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<RetrievalDebugData | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleExpanded = (id: string) => {
    setExpandedItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleDebug = async () => {
    if (!query.trim()) return;
    try {
      setIsLoading(true);
      const response = await api.retrievalDebug(tenantId, {
        query,
        options: useCurrentSettings ? currentSettings : undefined,
      });
      setResult(response.data.debug);
    } catch (error) {
      console.error('Retrieval debug error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderScoreBar = (score: number) => {
    const percentage = Math.round(score * 100);
    return (
      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all ${
              percentage >= 80 ? 'bg-green-500' : percentage >= 50 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className="text-xs text-glass-textSecondary w-12 text-right">{percentage}%</span>
      </div>
    );
  };

  const renderCandidate = (candidate: any, index: number) => {
    const isExpanded = expandedItems.has(candidate.id);
    return (
      <div key={candidate.id} className="glass-card-surface p-3 rounded-lg">
        <div
          className="flex items-start justify-between cursor-pointer"
          onClick={() => toggleExpanded(candidate.id)}
        >
          <div className="flex items-start gap-3 flex-1">
            <div className={`p-2 rounded-lg ${candidate.type === 'faq' ? 'bg-purple-500/20 text-purple-300' : 'bg-blue-500/20 text-blue-300'}`}>
              <FileText size={16} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-white">
                  {candidate.type === 'faq' ? 'FAQ' : 'Document'} #{index + 1}
                </span>
                <span className="px-2 py-0.5 rounded text-xs bg-slate-700 text-slate-300">
                  Score: {candidate.score?.toFixed(4) || 'N/A'}
                </span>
                {candidate.faq_eligible && (
                  <span className="px-2 py-0.5 rounded text-xs bg-green-500/20 text-green-300">
                    FAQ Eligible
                  </span>
                )}
              </div>
              {candidate.payload?.document_name && (
                <p className="text-sm text-glass-text">{candidate.payload.document_name}</p>
              )}
              {candidate.payload?.source_url && (
                <a
                  href={candidate.payload.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-cyan-400 hover:underline"
                >
                  {candidate.payload.source_url}
                </a>
              )}
            </div>
          </div>
          {isExpanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
        </div>

        {isExpanded && (
          <div className="mt-3 pt-3 border-t border-slate-700 space-y-2">
            {candidate.vector_score !== undefined && (
              <div>
                <label className="text-xs text-slate-400">Vector Score</label>
                {renderScoreBar(candidate.vector_score)}
              </div>
            )}
            {candidate.lexical_score !== undefined && (
              <div>
                <label className="text-xs text-slate-400">Lexical Score</label>
                {renderScoreBar(candidate.lexical_score)}
              </div>
            )}
            {candidate.phrase_score !== undefined && (
              <div>
                <label className="text-xs text-slate-400">Phrase Score</label>
                {renderScoreBar(candidate.phrase_score)}
              </div>
            )}
            <div className="grid grid-cols-3 gap-2 mt-2">
              {candidate.title_boost !== undefined && (
                <div className="glass-card-surface p-2 rounded text-center">
                  <div className="text-xs text-slate-400">Title</div>
                  <div className="text-sm font-medium text-white">{(candidate.title_boost * 100).toFixed(1)}%</div>
                </div>
              )}
              {candidate.heading_boost !== undefined && (
                <div className="glass-card-surface p-2 rounded text-center">
                  <div className="text-xs text-slate-400">Heading</div>
                  <div className="text-sm font-medium text-white">{(candidate.heading_boost * 100).toFixed(1)}%</div>
                </div>
              )}
              {candidate.url_boost !== undefined && (
                <div className="glass-card-surface p-2 rounded text-center">
                  <div className="text-xs text-slate-400">URL</div>
                  <div className="text-sm font-medium text-white">{(candidate.url_boost * 100).toFixed(1)}%</div>
                </div>
              )}
            </div>
            {candidate.matched_terms && candidate.matched_terms.length > 0 && (
              <div>
                <label className="text-xs text-slate-400">Matched Terms</label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {candidate.matched_terms.map((term: string, i: number) => (
                    <span key={i} className="px-2 py-0.5 rounded text-xs bg-[#8B00E8]/20 text-[#8B00E8]">
                      {term}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {candidate.debug_reason && (
              <div className="p-2 rounded bg-slate-800/50 text-xs text-slate-300 font-mono">
                {candidate.debug_reason}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Query Input */}
      <div className="glass-card p-4">
        <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
          <Search size={18} className="text-[#8B00E8]" />
          Test Retrieval
        </h3>

        <div className="space-y-4">
          {/* Query Input */}
          <div>
            <label className="block text-sm font-medium text-glass-text mb-2">
              Query
            </label>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleDebug()}
              placeholder="Enter a test query..."
              className="glass-input w-full px-4 py-2 rounded-lg text-sm"
            />
          </div>

          {/* Use Current Settings Toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setUseCurrentSettings(!useCurrentSettings)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                useCurrentSettings ? 'bg-[#8B00E8]' : 'bg-slate-600'
              }`}
            >
              <span
                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  useCurrentSettings ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
            <span className="text-sm text-glass-text">Use current tenant settings</span>
          </div>

          {/* Run Debug Button */}
          <button
            onClick={handleDebug}
            disabled={!query.trim() || isLoading}
            className={`glass-button px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 w-full justify-center ${
              !query.trim() || isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Search size={16} />
                Run Retrieval Debug
              </>
            )}
          </button>
        </div>
      </div>

      {/* Results */}
      {result && (
        <div className="glass-card p-4">
          <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
            <Code size={18} className="text-[#8B00E8]" />
            Debug Results
          </h3>

          {/* Query Info */}
          <div className="glass-card-surface p-3 rounded-lg mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-400">Query</span>
              <span className="text-sm text-white font-medium">"{result.query}"</span>
            </div>
            {result.query_variants && result.query_variants.length > 1 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Query Variants</span>
                <div className="flex flex-wrap gap-1 justify-end">
                  {result.query_variants.map((variant, i) => (
                    <span key={i} className="px-2 py-0.5 rounded text-xs bg-slate-700 text-slate-300">
                      {variant}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* FAQ Fast Lane */}
          {result.faq_fast_lane_hit && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/30 mb-4">
              <CheckCircle2 size={18} className="text-green-400" />
              <span className="text-sm text-green-300">FAQ Fast Lane Hit - FAQ returned immediately</span>
            </div>
          )}

          {/* Winning FAQ */}
          {result.winning_faq && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-white mb-2 flex items-center gap-2">
                <CheckCircle2 size={16} className="text-green-400" />
                Winning FAQ
              </h4>
              {renderCandidate(result.winning_faq, 0)}
            </div>
          )}

          {/* FAQ Candidates */}
          {result.faq_candidates && result.faq_candidates.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-white mb-2">FAQ Candidates ({result.faq_candidates.length})</h4>
              <div className="space-y-2">
                {result.faq_candidates.map((candidate, index) => renderCandidate(candidate, index + 1))}
              </div>
            </div>
          )}

          {/* Document Candidates */}
          {result.document_candidates && result.document_candidates.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-white mb-2">Document Candidates ({result.document_candidates.length})</h4>
              <div className="space-y-2">
                {result.document_candidates.map((candidate, index) => renderCandidate(candidate, index + 1))}
              </div>
            </div>
          )}

          {/* No Results */}
          {(!result.winning_faq && !result.faq_candidates?.length && !result.document_candidates?.length) && (
            <div className="flex items-center gap-2 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
              <XCircle size={18} className="text-yellow-400" />
              <span className="text-sm text-yellow-300">No candidates found for this query</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RetrievalDebug;
