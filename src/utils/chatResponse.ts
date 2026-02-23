import type { ChatMessage } from '../types';

export interface SourceCitation {
  document_id?: string;
  document_name?: string;
  chunk_index?: number;
  score?: number;
  snippet?: string;
}

export interface SuggestedAction {
  label: string;
  description?: string;
  url?: string;
  type?: string;
}

export interface CatalogItem {
  name: string;
  description?: string;
  url?: string;
  price?: string;
}

export interface StructuredArtifacts {
  confidence?: number;
  sources: SourceCitation[];
  actions: SuggestedAction[];
  urls: string[];
  products: CatalogItem[];
  services: CatalogItem[];
}

const defaultArtifacts: StructuredArtifacts = {
  sources: [],
  actions: [],
  urls: [],
  products: [],
  services: [],
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function asString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() !== '' ? value.trim() : undefined;
}

function asNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return undefined;
}

function normalizeSource(value: unknown): SourceCitation | null {
  if (!isRecord(value)) return null;
  const source: SourceCitation = {
    document_id: asString(value.document_id),
    document_name: asString(value.document_name),
    chunk_index: asNumber(value.chunk_index),
    score: asNumber(value.score),
    snippet: asString(value.snippet),
  };

  if (!source.document_id && !source.document_name && !source.snippet) return null;
  return source;
}

function normalizeAction(value: unknown): SuggestedAction | null {
  if (typeof value === 'string') {
    const label = asString(value);
    return label ? { label } : null;
  }
  if (!isRecord(value)) return null;

  const label =
    asString(value.label) ||
    asString(value.title) ||
    asString(value.action) ||
    asString(value.name);
  if (!label) return null;

  return {
    label,
    description: asString(value.description),
    url: asString(value.url),
    type: asString(value.type),
  };
}

function normalizeCatalogItem(value: unknown): CatalogItem | null {
  if (typeof value === 'string') {
    const name = asString(value);
    return name ? { name } : null;
  }
  if (!isRecord(value)) return null;

  const name = asString(value.name) || asString(value.title) || asString(value.label);
  if (!name) return null;

  return {
    name,
    description: asString(value.description),
    url: asString(value.url),
    price: asString(value.price),
  };
}

function normalizeUrls(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry) => {
      if (typeof entry === 'string') return asString(entry);
      if (isRecord(entry)) return asString(entry.url) || asString(entry.href);
      return undefined;
    })
    .filter((url): url is string => Boolean(url));
}

function parseJSONIfObject(input: string): Record<string, unknown> | null {
  const trimmed = input.trim();
  if (!trimmed.startsWith('{') || !trimmed.endsWith('}')) return null;
  try {
    const parsed: unknown = JSON.parse(trimmed);
    return isRecord(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function getStructuredRecord(message: ChatMessage): Record<string, unknown> | null {
  const fromTokenUsage = isRecord(message.token_usage) ? message.token_usage : null;
  const fromContent = parseJSONIfObject(message.content);

  if (fromTokenUsage && fromContent) return { ...fromContent, ...fromTokenUsage };
  if (fromTokenUsage) return fromTokenUsage;
  if (fromContent) return fromContent;
  return null;
}

export function getDisplayMessageContent(message: ChatMessage): string {
  const parsed = parseJSONIfObject(message.content);
  if (!parsed) return message.content;

  const candidate =
    asString(parsed.response_text) ||
    asString(parsed.response) ||
    asString(parsed.answer) ||
    asString(parsed.message);
  return candidate || message.content;
}

export function extractStructuredArtifacts(message: ChatMessage): StructuredArtifacts {
  const data = getStructuredRecord(message);
  if (!data) return defaultArtifacts;

  const sources = Array.isArray(data.sources)
    ? data.sources.map(normalizeSource).filter((value): value is SourceCitation => value !== null)
    : [];

  const actions = Array.isArray(data.actions)
    ? data.actions.map(normalizeAction).filter((value): value is SuggestedAction => value !== null)
    : [];

  const products = Array.isArray(data.products)
    ? data.products
        .map(normalizeCatalogItem)
        .filter((value): value is CatalogItem => value !== null)
    : [];

  const services = Array.isArray(data.services)
    ? data.services
        .map(normalizeCatalogItem)
        .filter((value): value is CatalogItem => value !== null)
    : [];

  const urls = normalizeUrls(data.urls);
  const confidence = asNumber(data.confidence);

  // Merge URL candidates from actions/products/services.
  const urlSet = new Set<string>(urls);
  for (const action of actions) if (action.url) urlSet.add(action.url);
  for (const product of products) if (product.url) urlSet.add(product.url);
  for (const service of services) if (service.url) urlSet.add(service.url);

  return {
    confidence,
    sources,
    actions,
    urls: Array.from(urlSet),
    products,
    services,
  };
}

export function hasStructuredArtifacts(artifacts: StructuredArtifacts): boolean {
  return Boolean(
    artifacts.confidence !== undefined ||
      artifacts.sources.length ||
      artifacts.actions.length ||
      artifacts.urls.length ||
      artifacts.products.length ||
      artifacts.services.length
  );
}
