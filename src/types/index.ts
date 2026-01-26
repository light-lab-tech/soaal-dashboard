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

// Telegram Types
export interface TelegramBotData {
  bot_token: string;
}

export interface TelegramBotResponse {
  bot_username: string;
  bot_id: number;
  message: string;
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
