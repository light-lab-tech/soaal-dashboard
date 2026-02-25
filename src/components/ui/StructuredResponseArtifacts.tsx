import React from 'react';
import type { StructuredArtifacts } from '../../utils/chatResponse';
import { hasStructuredArtifacts } from '../../utils/chatResponse';
import {
  ExternalLink,
  Link as LinkIcon,
  Package,
  Settings2,
  Sparkles,
  Mail,
  Phone,
  DollarSign,
  MapPin,
} from 'lucide-react';

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
          <ul className="space-y-2">
            {artifacts.products.map((product, index) => (
              <li key={`${product.name}-${index}`} className="flex gap-2 text-xs text-slate-300">
                {product.image_url && (
                  <div className="shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-slate-700/50 border border-slate-600/50">
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <span className="font-medium">{product.name}</span>
                  {product.price && <span className="text-emerald-300 ml-2">{product.price}</span>}
                  {product.description && <p className="text-slate-400 mt-1">{product.description}</p>}
                  {product.url && (
                    <a href={product.url} target="_blank" rel="noreferrer" className={`${linkClassName} mt-1`}>
                      <ExternalLink size={11} />
                      {product.url}
                    </a>
                  )}
                </div>
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
            {artifacts.urls.map((url, index) => {
              const displayUrl = url.title ? `${url.title} (${url.url})` : url.url;
              return (
                <a key={`${url.url}-${index}`} href={url.url} target="_blank" rel="noreferrer" className={linkClassName}>
                  <ExternalLink size={11} />
                  {displayUrl}
                </a>
              );
            })}
          </div>
        </div>
      )}

      {artifacts.contacts.length > 0 && (
        <div className="rounded-lg bg-slate-800/40 p-3 border border-slate-700/50">
          <p className="text-xs font-semibold text-slate-200 mb-2 flex items-center gap-1">
            <Mail size={12} /> Contact Info
          </p>
          <div className="space-y-1.5">
            {artifacts.contacts.map((contact, index) => (
              <div key={`${contact.value}-${index}`} className="text-xs">
                <span className="inline-flex items-center gap-1">
                  {contact.type === 'email' ? <Mail size={10} className="text-blue-400" /> : <Phone size={10} className="text-green-400" />}
                  <span className="font-medium text-slate-300">{contact.value}</span>
                  {contact.label && <span className="text-slate-400 ml-2">({contact.label})</span>}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {artifacts.pricing.length > 0 && (
        <div className="rounded-lg bg-slate-800/40 p-3 border border-slate-700/50">
          <p className="text-xs font-semibold text-slate-200 mb-2 flex items-center gap-1">
            <DollarSign size={12} /> Pricing
          </p>
          <ul className="space-y-1.5">
            {artifacts.pricing.map((item, index) => (
              <li key={`${item.product}-${index}`} className="text-xs text-slate-300">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium">{item.product}</span>
                  <span className="text-emerald-300">{item.price}</span>
                  {item.period && <span className="text-slate-400">/{item.period}</span>}
                  {item.url && (
                    <a href={item.url} target="_blank" rel="noreferrer" className={linkClassName}>
                      <ExternalLink size={11} />
                      View
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {artifacts.locations.length > 0 && (
        <div className="rounded-lg bg-slate-800/40 p-3 border border-slate-700/50">
          <p className="text-xs font-semibold text-slate-200 mb-2 flex items-center gap-1">
            <MapPin size={12} /> Locations
          </p>
          <div className="space-y-1.5">
            {artifacts.locations.map((location, index) => (
              <div key={`${location.name}-${index}`} className="text-xs text-slate-300">
                <span className="font-medium">{location.name}</span>
                {location.address && <p className="text-slate-400 mt-0.5">{location.address}</p>}
                {(location.city || location.country) && (
                  <span className="text-slate-400">
                    {location.city && location.city + ', '}
                    {location.country}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

