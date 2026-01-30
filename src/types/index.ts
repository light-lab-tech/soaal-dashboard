// Auth Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin' | 'super_admin' | 'disabled';
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
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
  plan: 'free' | 'pro' | 'enterprise';
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
  plan?: 'free' | 'pro' | 'enterprise';
}

export interface CreateApiKeyData {
  type?: 'public' | 'secret';
  rate_limit?: number;
}

// Document Types
export interface Document {
  id: string;
  name: string;
  file_type: string;
  file_size?: number;
  status: 'processing' | 'completed' | 'failed';
  created_at: string;
}

export interface IngestUrlData {
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

export interface ChatMessage {
  id: string;
  tenant_id: string;
  chat_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  token_usage?: Record<string, number>;
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
export interface Plan {
  id: string;
  name: string;
  slug: string;
  description?: string;
  currency: string;
  price_monthly_cents: number;
  price_yearly_cents?: number;
  is_active?: boolean;
  sort_order?: number;
  features_summary?: string;
  max_projects?: number;
  max_messages_per_month?: number;
  max_documents?: number;
  max_document_size_mb?: number;
  enable_telegram_integration?: boolean;
  enable_feedback?: boolean;
  enable_custom_system_prompt?: boolean;
  enable_rag_enhancements?: boolean;
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
  name: string;
  slug: string;
  description?: string;
  currency: string;
  price_monthly_cents: number;
  price_yearly_cents?: number;
  is_active?: boolean;
  sort_order?: number;
  features_summary?: string;
  max_projects?: number;
  max_messages_per_month?: number;
  max_documents?: number;
  max_document_size_mb?: number;
  enable_telegram_integration?: boolean;
  enable_feedback?: boolean;
  enable_custom_system_prompt?: boolean;
  enable_rag_enhancements?: boolean;
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
