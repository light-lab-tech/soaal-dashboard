import type {
  ChatMessage,
  MessageEntities,
  MessageUrl,
  MessageContact,
  MessagePricing,
  MessageLocation,
} from '../types';

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
  image_url?: string;
}

export interface StructuredArtifacts {
  confidence?: number;
  sources: SourceCitation[];
  actions: SuggestedAction[];
  urls: MessageUrl[];
  products: CatalogItem[];
  services: CatalogItem[];
  contacts: MessageContact[];
  pricing: MessagePricing[];
  locations: MessageLocation[];
  entities?: MessageEntities;
}

const defaultArtifacts: StructuredArtifacts = {
  sources: [],
  actions: [],
  urls: [],
  products: [],
  services: [],
  contacts: [],
  pricing: [],
  locations: [],
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

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
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
    image_url: asString(value.image_url),
  };
}

function normalizeUrl(value: unknown): MessageUrl | null {
  if (typeof value === 'string') {
    const url = asString(value);
    return url ? { url } : null;
  }
  if (!isRecord(value)) return null;

  const url = asString(value.url) || asString(value.href);
  if (!url) return null;

  return {
    url,
    title: asString(value.title),
    anchor_text: asString(value.anchor_text),
  };
}

function normalizeContact(value: unknown): MessageContact | null {
  if (!isRecord(value)) return null;

  const type = asString(value.type) as 'email' | 'phone' | undefined;
  const val = asString(value.value) || asString(value.email) || asString(value.phone);
  if (!val) return null;

  return {
    type: type || (val.includes('@') ? 'email' : 'phone'),
    value: val,
    label: asString(value.label),
  };
}

function normalizePricing(value: unknown): MessagePricing | null {
  if (!isRecord(value)) return null;

  const product = asString(value.product) || asString(value.name);
  const price = asString(value.price) || asString(value.cost);
  if (!product || !price) return null;

  return {
    product,
    price,
    currency: asString(value.currency),
    period: asString(value.period),
    url: asString(value.url),
  };
}

function normalizeLocation(value: unknown): MessageLocation | null {
  if (!isRecord(value)) return null;

  const name = asString(value.name) || asString(value.title);
  if (!name) return null;

  return {
    name,
    address: asString(value.address),
    city: asString(value.city),
    country: asString(value.country),
  };
}

function normalizeUrls(value: unknown): MessageUrl[] {
  if (!Array.isArray(value)) return [];
  return value
    .map(normalizeUrl)
    .filter((item): item is MessageUrl => item !== null);
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
  // Check for entities field first (new API format)
  if (isRecord(message.entities)) {
    return { ...message.entities, ...(message.token_usage || {}) };
  }

  // Fall back to token_usage for legacy format
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

  const sources = asArray(data.sources).map(normalizeSource).filter((v): v is SourceCitation => v !== null);

  const actions = asArray(data.actions).map(normalizeAction).filter((v): v is SuggestedAction => v !== null);

  const products = asArray(data.products).map(normalizeCatalogItem).filter((v): v is CatalogItem => v !== null);

  const services = asArray(data.services).map(normalizeCatalogItem).filter((v): v is CatalogItem => v !== null);

  const urls = normalizeUrls(data.urls);

  // Parse entities from the new API format
  const entities: MessageEntities = {};

  // Products from entities field
  if (data.entities && isRecord(data.entities)) {
    const ent = data.entities;

    if (Array.isArray(ent.products)) {
      const productsArray: (CatalogItem | null)[] = ent.products.map((p: unknown) => {
        const normalized = normalizeCatalogItem(p);
        if (!normalized) return null;
        if (p && isRecord(p)) {
          const imageUrl = asString((p as any).image_url);
          return imageUrl ? { ...normalized, image_url: imageUrl } : normalized;
        }
        return normalized;
      });
      entities.products = productsArray.filter((v): v is CatalogItem => v !== null);
    }

    if (Array.isArray(ent.services)) {
      const servicesArray: (CatalogItem | null)[] = ent.services.map((s: unknown) => {
        const normalized = normalizeCatalogItem(s);
        if (!normalized) return null;
        if (s && isRecord(s) && Array.isArray((s as any).features)) {
          const features = (s as any).features.map((f: unknown) => asString(f)).filter(Boolean);
          return { ...normalized, features } as CatalogItem & { features: string[] };
        }
        return normalized;
      });
      entities.services = servicesArray.filter((v): v is CatalogItem => v !== null);
    }

    if (Array.isArray(ent.urls)) {
      entities.urls = ent.urls.map(normalizeUrl).filter((v): v is MessageUrl => v !== null);
    }

    if (Array.isArray(ent.contacts)) {
      entities.contacts = ent.contacts.map(normalizeContact).filter((v): v is MessageContact => v !== null);
    }

    if (Array.isArray(ent.pricing)) {
      entities.pricing = ent.pricing.map(normalizePricing).filter((v): v is MessagePricing => v !== null);
    }

    if (Array.isArray(ent.locations)) {
      entities.locations = ent.locations.map(normalizeLocation).filter((v): v is MessageLocation => v !== null);
    }
  }

  const confidence = asNumber(data.confidence);

  // Merge URLs from entities and other sources
  const urlSet = new Set<string>();
  urls.forEach(u => urlSet.add(u.url));
  if (entities.urls) {
    entities.urls.forEach(u => urlSet.add(u.url));
  }
  for (const action of actions) if (action.url) urlSet.add(action.url);
  for (const product of products) if (product.url) urlSet.add(product.url);

  return {
    confidence,
    sources,
    actions,
    urls: Array.from(urlSet).map(url => urls.find(u => u.url === url) || { url }),
    products,
    services,
    contacts: entities.contacts || [],
    pricing: entities.pricing || [],
    locations: entities.locations || [],
    entities: Object.keys(entities).length > 0 ? entities : undefined,
  };
}

export function hasStructuredArtifacts(artifacts: StructuredArtifacts): boolean {
  return Boolean(
    artifacts.confidence !== undefined ||
      artifacts.sources.length ||
      artifacts.actions.length ||
      artifacts.urls.length ||
      artifacts.products.length ||
      artifacts.services.length ||
      artifacts.contacts.length ||
      artifacts.pricing.length ||
      artifacts.locations.length
  );
}
