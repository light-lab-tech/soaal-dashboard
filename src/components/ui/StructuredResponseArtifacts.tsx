import React from 'react';
import type { StructuredArtifacts } from '../../utils/chatResponse';
import { hasStructuredArtifacts } from '../../utils/chatResponse';
import { ExternalLink, Link as LinkIcon, Package, Settings2, Sparkles } from 'lucide-react';

interface StructuredResponseArtifactsProps {
  artifacts: StructuredArtifacts;
}

const linkClassName =
  'inline-flex items-center gap-1 text-xs text-cyan-300 hover:text-cyan-200 underline underline-offset-2 break-all';

export const StructuredResponseArtifacts: React.FC<StructuredResponseArtifactsProps> = ({ artifacts }) => {
  if (!hasStructuredArtifacts(artifacts)) return null;

  return (
    <div className="mt-3 space-y-3">
      {artifacts.confidence !== undefined && (
        <div className="flex items-center gap-2 text-xs text-emerald-300">
          <Sparkles size={12} />
          <span>Confidence: {(artifacts.confidence * 100).toFixed(0)}%</span>
        </div>
      )}

      {artifacts.sources.length > 0 && (
        <div className="rounded-lg bg-slate-800/40 p-3 border border-slate-700/50">
          <p className="text-xs font-semibold text-slate-200 mb-2">Sources</p>
          <div className="space-y-2">
            {artifacts.sources.map((source, index) => (
              <div key={`${source.document_id || source.document_name || 'source'}-${index}`} className="text-xs">
                <div className="text-slate-300">
                  {source.document_name || source.document_id || 'Source'}
                  {source.score !== undefined && (
                    <span className="text-slate-400 ml-2">({source.score.toFixed(2)})</span>
                  )}
                </div>
                {source.snippet && <p className="text-slate-400 mt-1 line-clamp-2">{source.snippet}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {artifacts.actions.length > 0 && (
        <div className="rounded-lg bg-slate-800/40 p-3 border border-slate-700/50">
          <p className="text-xs font-semibold text-slate-200 mb-2 flex items-center gap-1">
            <Settings2 size={12} /> Actions
          </p>
          <ul className="space-y-1.5">
            {artifacts.actions.map((action, index) => (
              <li key={`${action.label}-${index}`} className="text-xs text-slate-300">
                <span className="font-medium">{action.label}</span>
                {action.description && <span className="text-slate-400"> - {action.description}</span>}
                {action.url && (
                  <div className="mt-1">
                    <a href={action.url} target="_blank" rel="noreferrer" className={linkClassName}>
                      <ExternalLink size={11} />
                      {action.url}
                    </a>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {artifacts.products.length > 0 && (
        <div className="rounded-lg bg-slate-800/40 p-3 border border-slate-700/50">
          <p className="text-xs font-semibold text-slate-200 mb-2 flex items-center gap-1">
            <Package size={12} /> Products
          </p>
          <ul className="space-y-1.5">
            {artifacts.products.map((product, index) => (
              <li key={`${product.name}-${index}`} className="text-xs text-slate-300">
                <span className="font-medium">{product.name}</span>
                {product.price && <span className="text-emerald-300 ml-2">{product.price}</span>}
                {product.description && <p className="text-slate-400 mt-1">{product.description}</p>}
                {product.url && (
                  <a href={product.url} target="_blank" rel="noreferrer" className={`${linkClassName} mt-1`}>
                    <ExternalLink size={11} />
                    {product.url}
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {artifacts.services.length > 0 && (
        <div className="rounded-lg bg-slate-800/40 p-3 border border-slate-700/50">
          <p className="text-xs font-semibold text-slate-200 mb-2">Services</p>
          <ul className="space-y-1.5">
            {artifacts.services.map((service, index) => (
              <li key={`${service.name}-${index}`} className="text-xs text-slate-300">
                <span className="font-medium">{service.name}</span>
                {service.description && <p className="text-slate-400 mt-1">{service.description}</p>}
                {service.url && (
                  <a href={service.url} target="_blank" rel="noreferrer" className={`${linkClassName} mt-1`}>
                    <ExternalLink size={11} />
                    {service.url}
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {artifacts.urls.length > 0 && (
        <div className="rounded-lg bg-slate-800/40 p-3 border border-slate-700/50">
          <p className="text-xs font-semibold text-slate-200 mb-2 flex items-center gap-1">
            <LinkIcon size={12} /> URLs
          </p>
          <div className="space-y-1.5">
            {artifacts.urls.map((url, index) => (
              <a key={`${url}-${index}`} href={url} target="_blank" rel="noreferrer" className={linkClassName}>
                <ExternalLink size={11} />
                {url}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

