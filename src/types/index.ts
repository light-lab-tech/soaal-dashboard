// Auth Types
export interface User {
  id: string;
  email: string;
  name?: string;
  role: 'user' | 'admin' | 'super_admin' | 'disabled';
  tenant_id?: string;
  email_verified?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

/** Register returns user only; no token until email is verified */
export interface RegisterResponse {
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name?: string;
}

export interface VerifyEmailData {
  token: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  email: string;
  token: string;
  password: string;
}

// Tenant Types
export interface Tenant {
  id: string;
  name: string;
  status: 'active' | 'suspended' | 'blocked';
  created_at: string;
  updated_at: string;
}

export interface ApiKey {
  key?: string;
  prefix: string;
  type: 'public' | 'secret';
  rate_limit: number;
  use?: string;
  id?: string;
  created_at?: string;
  last_used_at?: string;
}

export interface CreateTenantData {
  name: string;
}

export interface CreateApiKeyData {
  type?: 'public' | 'secret';
  rate_limit?: number;
}

// Tenant Settings Types
export interface AnswerQualitySettings {
  quality_profile?: 'balanced' | 'precise' | 'exploratory';
  enable_hybrid_search?: boolean;
  enable_query_rewrite?: boolean;
  enable_phrase_match?: boolean;
  faq_threshold?: number; // 0.1 - 1.0
  min_chunk_score?: number; // 0.1 - 1.0
}

export interface TenantSettings {
  answer_style?: 'short' | 'formal' | 'friendly' | 'detailed' | null;
  message_limit_per_chat?: number | null;
  settings: Record<string, any>;
  answer_quality?: AnswerQualitySettings;
}

export interface UpdateTenantSettingsData {
  answer_style?: string;
  message_limit_per_chat?: number | null;
  settings?: Record<string, any>;
  answer_quality?: AnswerQualitySettings;
}

// Retrieval Debug Types
export interface RetrievalDebugOptions {
  quality_profile?: 'balanced' | 'precise' | 'exploratory';
  enable_hybrid_search?: boolean;
  enable_query_rewrite?: boolean;
  enable_phrase_match?: boolean;
  faq_threshold?: number;
  min_chunk_score?: number;
}

export interface RetrievalDebugRequest {
  query: string;
  options?: RetrievalDebugOptions;
}

export interface RetrievalScoreBreakdown {
  vector_score: number;
  lexical_score: number;
  phrase_score: number;
  title_boost: number;
  heading_boost: number;
  url_boost: number;
}

export interface RetrievalCandidate {
  id: string;
  type: 'faq' | 'document';
  score: number;
  matched_terms: string[];
  debug_reason?: string;
  faq_eligible?: boolean;
  payload?: {
    document_name?: string;
    source_url?: string;
  };
}

export interface RetrievalDebugData {
  query: string;
  query_variants: string[];
  options: RetrievalDebugOptions;
  faq_fast_lane_hit: boolean;
  winning_faq?: RetrievalCandidate;
  faq_candidates: RetrievalCandidate[];
  document_candidates: RetrievalCandidate[];
}

export interface RetrievalDebugResponse {
  debug: RetrievalDebugData;
}

// Background Job Types
export type JobStatus = 'queued' | 'retry' | 'running' | 'completed' | 'failed' | 'canceled';
export type JobType = 'scrape_document_url' | 'process_document' | 'reindex_document' | 'recrawl_document';

export interface JobPayloadSummary {
  url?: string;
  document_id?: string;
  file_name?: string;
  metadata?: Record<string, any>;
}

export interface BackgroundJob {
  id: string;
  tenant_id: string;
  document_id: string;
  document_name: string;
  type: JobType;
  status: JobStatus;
  attempts: number;
  max_attempts: number;
  last_error?: string;
  run_at: string;
  started_at?: string;
  finished_at?: string;
  created_at: string;
  updated_at: string;
  payload_summary?: JobPayloadSummary;
  available_actions: string[];
}

export interface ListJobsParams {
  status?: JobStatus | 'all';
  limit?: number;
}

export interface ListJobsResponse {
  jobs: BackgroundJob[];
  total: number;
}

// Document Types
export interface DocumentMetadata {
  source_kind?: 'upload' | 'url' | 'crawl';
  source_url?: string;
  page_title?: string;
  page_description?: string;
  crawl_source?: 'seed' | 'sitemap' | 'link' | 'hreflang';
  source_host?: string;
  processed_chunks?: number;
  chunk_count?: number;
  processing_error?: string;
  last_failed_at?: string;
}

export interface Document {
  id: string;
  name: string;
  file_type: string;
  file_size?: number;
  status: 'processing' | 'completed' | 'failed';
  metadata?: DocumentMetadata;
  created_at: string;
}

export interface CrawlOptions {
  max_pages?: number;
  max_depth?: number;
  include_sitemap?: boolean;
  include_hreflang?: boolean;
  same_domain_only?: boolean;
  excluded_paths?: string[];
  allowed_paths?: string[];
}

export interface IngestUrlData {
  url: string;
  crawl?: boolean;
  options?: CrawlOptions;
}

export interface IngestUrlResponse {
  document_ids: string[];
  pages_found?: number;
  pages_crawled?: number;
  status: string;
  url: string;
}

// Pending Questions Types
export interface PendingQuestion {
  id: string;
  question: string;
  status: 'pending' | 'answered';
  chat_id?: string;
  created_at: string;
}

export interface AnswerData {
  answer: string;
  is_faq?: boolean;
}

// Feedback Types
export interface FeedbackStats {
  total_feedback: number;
  positive_count: number;
  negative_count: number;
  positive_percent: number;
  negative_percent: number;
}

export interface Feedback {
  id: string;
  feedback_type: 'positive' | 'negative';
  comment?: string;
  user_question?: string;
  message_content?: string;
  chat_title?: string;
  created_at: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

// Chat Types
export interface Chat {
  id: string;
  tenant_id: string;
  title?: string | null;
  created_at: string;
  updated_at: string;
}

// Structured Entity Types for Chat Messages
export interface MessageProduct {
  name: string;
  price?: string;
  description?: string;
  url?: string;
  image_url?: string;
}

export interface MessageService {
  name: string;
  description?: string;
  features?: string[];
}

export interface MessageUrl {
  url: string;
  title?: string;
  anchor_text?: string;
}

export interface MessageContact {
  type: 'email' | 'phone';
  value: string;
  label?: string;
}

export interface MessagePricing {
  product: string;
  price: string;
  currency?: string;
  period?: string;
  url?: string;
}

export interface MessageLocation {
  name: string;
  address?: string;
  city?: string;
  country?: string;
}

export interface MessageEntities {
  products?: MessageProduct[];
  services?: MessageService[];
  urls?: MessageUrl[];
  contacts?: MessageContact[];
  pricing?: MessagePricing[];
  locations?: MessageLocation[];
}

export interface TokenUsageSources {
  document_id: string;
  document_name: string;
  chunk_index: number;
  score: number;
  snippet: string;
}

export interface TokenUsage {
  sources?: TokenUsageSources[];
  confidence?: number;
}

export interface ChatMessage {
  id: string;
  tenant_id: string;
  chat_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  token_usage?: TokenUsage;
  entities?: MessageEntities;
  created_at: string;
}

// Telegram Types
export interface TelegramBotData {
  bot_token: string;
}

export interface TelegramBotResponse {
  bot_username: string;
  bot_id: number;
  message: string;
}

// Tenant Analytics Types (Admin)
export interface TenantAnalytics {
  tenant_id: string;
  documents_count: number;
  chats_count: number;
  messages_count: number;
  usage_30d: {
    tokens_in: number;
    tokens_out: number;
    searches: number;
    requests: number;
  };
  feedback: {
    total: number;
    positive: number;
    negative: number;
    positive_percent: number;
    negative_percent: number;
  };
}

// Admin Types
export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin' | 'super_admin' | 'disabled';
  created_at: string;
}

export interface UpdateUserRoleData {
  role: 'user' | 'admin' | 'super_admin' | 'disabled';
}

// Billing & Plans Types
export interface PlanLocalization {
  language_code: string;
  name: string;
  description?: string;
  features_summary?: string;
}

export interface Plan {
  id: string;
  name: string;
  slug: string;
  description?: string;
  currency: string;
  price_monthly_cents: number;
  price_yearly_cents?: number;
  discount_monthly_cents?: number;
  discount_yearly_cents?: number;
  is_active?: boolean;
  sort_order?: number;
  features_summary?: string;
  // Localizations for multi-language support
  localizations?: PlanLocalization[];
  // Plan limits (applied at user level, across all tenants)
  max_projects?: number;
  max_messages_per_month?: number;
  max_documents?: number;
  max_document_size_mb?: number;
  max_urls_ingest_per_month?: number;
  max_pending_questions_per_month?: number;
  max_telegram_bots?: number;
  max_api_keys_per_tenant?: number;
  max_feedback_events_per_month?: number;
  // Feature flags
  enable_telegram_integration?: boolean;
  enable_feedback?: boolean;
  enable_hil?: boolean;
  enable_custom_system_prompt?: boolean;
  enable_rag_enhancements?: boolean;
  enable_analytics_dashboard?: boolean;
  enable_priority_support?: boolean;
  enable_custom_domain?: boolean;
  enable_webhook_integrations?: boolean;
  // Stripe price IDs
  gateway_one_price_id?: string;
  gateway_one_yearly_price_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  provider: 'stripe' | 'cryptocloud';
  provider_subscription_id?: string;
  provider_customer_id?: string;
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  scheduled_plan_id?: string | null;
  scheduled_provider?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CheckoutData {
  plan_id: string;
  provider: 'stripe' | 'cryptocloud';
  period: 'monthly' | 'yearly';
}

export interface CreatePlanData {
  slug: string;
  currency: string;
  price_monthly_cents: number;
  price_yearly_cents?: number;
  discount_monthly_cents?: number;
  discount_yearly_cents?: number;
  is_active?: boolean;
  sort_order?: number;
  localizations: PlanLocalization[];
  // Plan limits (applied at user level, across all tenants)
  max_projects?: number;
  max_messages_per_month?: number;
  max_documents?: number;
  max_document_size_mb?: number;
  max_urls_ingest_per_month?: number;
  max_pending_questions_per_month?: number;
  max_telegram_bots?: number;
  max_api_keys_per_tenant?: number;
  max_feedback_events_per_month?: number;
  // Feature flags
  enable_telegram_integration?: boolean;
  enable_feedback?: boolean;
  enable_hil?: boolean;
  enable_custom_system_prompt?: boolean;
  enable_rag_enhancements?: boolean;
  enable_analytics_dashboard?: boolean;
  enable_priority_support?: boolean;
  enable_custom_domain?: boolean;
  enable_webhook_integrations?: boolean;
}

// Generic API Response
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  error: string;
}
