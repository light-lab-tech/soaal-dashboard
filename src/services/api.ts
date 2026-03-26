/// <reference types="vite/client" />
import axios, { AxiosInstance, AxiosError } from 'axios';
import type {
  ApiResponse,
  ApiError,
  LoginCredentials,
  RegisterData,
  RegisterResponse,
  AuthResponse,
  VerifyEmailData,
  ForgotPasswordData,
  ResetPasswordData,
  Tenant,
  CreateTenantData,
  ApiKey,
  CreateApiKeyData,
  Document,
  IngestUrlData,
  IngestUrlResponse,
  PendingQuestion,
  AnswerData,
  FeedbackStats,
  Feedback,
  Chat,
  ChatMessage,
  TelegramBotData,
  TelegramBotResponse,
  AdminUser,
  UpdateUserRoleData,
  Pagination,
  Plan,
  Subscription,
  CheckoutData,
  CreatePlanData,
  TenantAnalytics,
  TenantSettings,
  UpdateTenantSettingsData,
} from '../types';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add token and language to requests
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      // Add Accept-Language header for localization support
      const language = localStorage.getItem('i18nextLng') || 'en';
      config.headers['Accept-Language'] = language;
      return config;
    });

    // Handle errors
    this.client.interceptors.response.use(
      (response) => {
        // Check if the response has success: false
        if (response.data && typeof response.data === 'object' && 'success' in response.data && !response.data.success) {
          const apiError: ApiError = response.data as ApiError;
          return Promise.reject(new Error(apiError.error || 'An error occurred'));
        }
        return response;
      },
      (error: AxiosError<ApiError>) => {
        if (error.response?.status === 401) {
          const isAuthRequest = 
            error.config?.url === '/login' || 
            error.config?.url === '/verify-email' ||
            error.config?.url === '/resend-verification-email' ||
            error.config?.url === '/forgot-password' ||
            error.config?.url === '/reset-password';
          if (!isAuthRequest) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
          }
        }
        // Extract error message from API response if available
        if (error.response?.data && typeof error.response.data === 'object' && 'error' in error.response.data) {
          const apiError = error.response.data as ApiError;
          return Promise.reject(new Error(apiError.error));
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth Endpoints
  async login(credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> {
    const response = await this.client.post<ApiResponse<AuthResponse>>('/login', credentials);
    return response.data;
  }

  async register(data: RegisterData): Promise<ApiResponse<RegisterResponse>> {
    const response = await this.client.post<ApiResponse<RegisterResponse>>('/register', data);
    return response.data;
  }

  async verifyEmail(data: VerifyEmailData): Promise<ApiResponse<AuthResponse>> {
    const response = await this.client.post<ApiResponse<AuthResponse>>('/verify-email', data);
    return response.data;
  }

  async resendVerificationEmail(email: string): Promise<ApiResponse<void>> {
    const response = await this.client.post<ApiResponse<void>>('/resend-verification-email', { email });
    return response.data;
  }

  async logout(): Promise<ApiResponse<void>> {
    const response = await this.client.post<ApiResponse<void>>('/logout');
    return response.data;
  }

  async forgotPassword(data: ForgotPasswordData): Promise<ApiResponse<void>> {
    const response = await this.client.post<ApiResponse<void>>('/forgot-password', data);
    return response.data;
  }

  async resetPassword(data: ResetPasswordData): Promise<ApiResponse<void>> {
    const response = await this.client.post<ApiResponse<void>>('/reset-password', data);
    return response.data;
  }

  // Tenant Endpoints
  async getTenants(): Promise<ApiResponse<{ tenants: Tenant[]; total: number }>> {
    const response = await this.client.get<ApiResponse<{ tenants: Tenant[]; total: number }>>('/tenants');
    return response.data;
  }

  async getTenant(tenantId: string): Promise<ApiResponse<{ tenant: Tenant; api_keys: ApiKey[] }>> {
    const response = await this.client.get<ApiResponse<{ tenant: Tenant; api_keys: ApiKey[] }>>(`/tenants/${tenantId}`);
    return response.data;
  }

  async createTenant(data: CreateTenantData): Promise<ApiResponse<{ tenant: Tenant; api_keys: { public_key: ApiKey; secret_key: ApiKey } }>> {
    const response = await this.client.post<ApiResponse<{ tenant: Tenant; api_keys: { public_key: ApiKey; secret_key: ApiKey } }>>('/tenants', data);
    return response.data;
  }

  async createApiKey(tenantId: string, data: CreateApiKeyData): Promise<ApiResponse<{ api_key: ApiKey }>> {
    const response = await this.client.post<ApiResponse<{ api_key: ApiKey }>>(`/tenants/${tenantId}/api-keys`, data);
    return response.data;
  }

  async listApiKeys(tenantId: string): Promise<ApiResponse<{ api_keys: ApiKey[]; total: number }>> {
    const response = await this.client.get<ApiResponse<{ api_keys: ApiKey[]; total: number }>>(`/tenants/${tenantId}/api-keys`);
    return response.data;
  }

  async getApiKey(tenantId: string, keyId: string): Promise<ApiResponse<{ api_key: ApiKey }>> {
    const response = await this.client.get<ApiResponse<{ api_key: ApiKey }>>(`/tenants/${tenantId}/api-keys/${keyId}`);
    return response.data;
  }

  // Tenant Chats & Messages (for tenant owners)
  async getTenantChats(tenantId: string, params?: { page?: number; limit?: number }): Promise<ApiResponse<{ chats: Chat[]; total: number; page: number; limit: number }>> {
    const response = await this.client.get<ApiResponse<{ chats: Chat[]; total: number; page: number; limit: number }>>(`/tenants/${tenantId}/chats`, { params });
    return response.data;
  }

  async getTenantChatMessages(tenantId: string, chatId: string, params?: { page?: number; limit?: number }): Promise<ApiResponse<{ messages: ChatMessage[]; total: number; page: number; limit: number }>> {
    const response = await this.client.get<ApiResponse<{ messages: ChatMessage[]; total: number; page: number; limit: number }>>(`/tenants/${tenantId}/chats/${chatId}/messages`, { params });
    return response.data;
  }

  // Tenant Settings Endpoints
  async getTenantSettings(tenantId: string): Promise<ApiResponse<TenantSettings>> {
    const response = await this.client.get<ApiResponse<TenantSettings>>(`/tenants/${tenantId}/settings`);
    return response.data;
  }

  async updateTenantSettings(tenantId: string, data: UpdateTenantSettingsData): Promise<ApiResponse<void>> {
    const response = await this.client.put<ApiResponse<void>>(`/tenants/${tenantId}/settings`, data);
    return response.data;
  }

  // Billing & Subscription Endpoints
  async listPlans(): Promise<ApiResponse<{ plans: Plan[] }>> {
    const response = await this.client.get<ApiResponse<{ plans: Plan[] }>>('/billing/plans');
    return response.data;
  }

  async createCheckout(data: CheckoutData): Promise<ApiResponse<{ checkout_url: string; provider: string; plan_id: string; period: string }>> {
    const response = await this.client.post<ApiResponse<{ checkout_url: string; provider: string; plan_id: string; period: string }>>('/billing/checkout', data);
    return response.data;
  }

  async getSubscription(): Promise<ApiResponse<{ subscription: Subscription | null; plan?: Plan; message?: string }>> {
    const response = await this.client.get<ApiResponse<{ subscription: Subscription | null; plan?: Plan; message?: string }>>('/billing/subscription');
    return response.data;
  }

  async changePlan(planId: string): Promise<ApiResponse<void>> {
    const response = await this.client.post<ApiResponse<void>>('/billing/subscription/change-plan', { plan_id: planId });
    return response.data;
  }

  async changeGateway(provider: 'stripe' | 'cryptocloud'): Promise<ApiResponse<void>> {
    const response = await this.client.post<ApiResponse<void>>('/billing/subscription/change-gateway', { provider });
    return response.data;
  }

  async cancelSubscription(): Promise<ApiResponse<void>> {
    const response = await this.client.post<ApiResponse<void>>('/billing/subscription/cancel');
    return response.data;
  }

  // Document Endpoints
  async getDocuments(tenantId: string): Promise<ApiResponse<{ documents: Document[] }>> {
    const response = await this.client.get<ApiResponse<{ documents: Document[] }>>(`/tenants/${tenantId}/documents`);
    return response.data;
  }

  async uploadDocument(tenantId: string, file: File): Promise<ApiResponse<{ document: Document }>> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await this.client.post<ApiResponse<{ document: Document }>>(
      `/tenants/${tenantId}/documents`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  }

  async ingestUrl(tenantId: string, data: IngestUrlData): Promise<ApiResponse<IngestUrlResponse>> {
    const response = await this.client.post<ApiResponse<IngestUrlResponse>>(`/tenants/${tenantId}/documents/ingest-url`, data);
    return response.data;
  }

  async deleteDocument(tenantId: string, documentId: string): Promise<ApiResponse<void>> {
    const response = await this.client.delete<ApiResponse<void>>(`/tenants/${tenantId}/documents/${documentId}`);
    return response.data;
  }

  async getDocumentStatus(tenantId: string, documentId: string): Promise<ApiResponse<{ document: Document }>> {
    const response = await this.client.get<ApiResponse<{ document: Document }>>(`/tenants/${tenantId}/documents/${documentId}`);
    return response.data;
  }

  async replaceDocument(tenantId: string, documentId: string, file: File): Promise<ApiResponse<void>> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await this.client.put<ApiResponse<void>>(
      `/tenants/${tenantId}/documents/${documentId}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  }

  async replaceDocumentUrl(tenantId: string, documentId: string, url: string): Promise<ApiResponse<void>> {
    const response = await this.client.post<ApiResponse<void>>(`/tenants/${tenantId}/documents/${documentId}/replace-url`, { url });
    return response.data;
  }

  // Pending Questions Endpoints
  async getPendingQuestions(tenantId: string, params?: { status?: string; page?: number; limit?: number }): Promise<ApiResponse<{ questions: PendingQuestion[]; pagination: Pagination }>> {
    const response = await this.client.get<ApiResponse<{ questions: PendingQuestion[]; pagination: Pagination }>>(`/tenants/${tenantId}/pending-questions`, { params });
    return response.data;
  }

  async submitAnswer(tenantId: string, pendingQuestionId: string, data: AnswerData): Promise<ApiResponse<{ id: string; status: string }>> {
    const response = await this.client.post<ApiResponse<{ id: string; status: string }>>(`/tenants/${tenantId}/pending-questions/${pendingQuestionId}/answer`, data);
    return response.data;
  }

  // Feedback Analytics Endpoints
  async getFeedbackStats(tenantId: string, params?: { start_date?: string; end_date?: string }): Promise<ApiResponse<FeedbackStats>> {
    const response = await this.client.get<ApiResponse<FeedbackStats>>(`/tenants/${tenantId}/feedback/stats`, { params });
    return response.data;
  }

  async getFeedback(tenantId: string, params?: { type?: string; page?: number; limit?: number }): Promise<ApiResponse<{ feedback: Feedback[]; pagination: Pagination }>> {
    const response = await this.client.get<ApiResponse<{ feedback: Feedback[]; pagination: Pagination }>>(`/tenants/${tenantId}/feedback`, { params });
    return response.data;
  }

  async submitFeedback(tenantId: string, chatId: string, messageId: string, data: { feedback_type: 'positive' | 'negative'; comment?: string }): Promise<ApiResponse<{ id: string; feedback_type: string; message: string }>> {
    const response = await this.client.post<ApiResponse<{ id: string; feedback_type: string; message: string }>>(`/tenants/${tenantId}/chats/${chatId}/messages/${messageId}/feedback`, data);
    return response.data;
  }

  // Telegram Endpoints
  async setTelegramBotToken(tenantId: string, data: TelegramBotData): Promise<ApiResponse<TelegramBotResponse>> {
    const response = await this.client.post<ApiResponse<TelegramBotResponse>>(`/tenants/${tenantId}/telegram/bot-token`, data);
    return response.data;
  }

  // Admin Endpoints
  async initAdmin(): Promise<ApiResponse<void>> {
    const response = await this.client.post<ApiResponse<void>>('/admin/init');
    return response.data;
  }

  async getAllUsers(): Promise<ApiResponse<{ users: AdminUser[] }>> {
    const response = await this.client.get<ApiResponse<{ users: AdminUser[] }>>('/admin/users');
    return response.data;
  }

  async updateUserRole(userId: string, data: UpdateUserRoleData): Promise<ApiResponse<void>> {
    const response = await this.client.put<ApiResponse<void>>(`/admin/users/${userId}/role`, data);
    return response.data;
  }

  async disableUser(userId: string): Promise<ApiResponse<void>> {
    const response = await this.client.delete<ApiResponse<void>>(`/admin/users/${userId}`);
    return response.data;
  }

  async deleteUser(userId: string): Promise<ApiResponse<void>> {
    const response = await this.client.delete<ApiResponse<void>>(`/admin/users/${userId}/delete`);
    return response.data;
  }

  // Admin: User Subscription & Tenants (admin or super_admin)
  async getAdminUserSubscription(userId: string): Promise<ApiResponse<{ subscription: Subscription | null; plan: Plan | null; message?: string }>> {
    const response = await this.client.get<ApiResponse<{ subscription: Subscription | null; plan: Plan | null; message?: string }>>(`/admin/users/${userId}/subscription`);
    return response.data;
  }

  async getAdminUserSubscriptions(userId: string): Promise<ApiResponse<{ subscriptions: Subscription[]; total: number }>> {
    const response = await this.client.get<ApiResponse<{ subscriptions: Subscription[]; total: number }>>(`/admin/users/${userId}/subscriptions`);
    return response.data;
  }

  async getAdminUserTenants(userId: string): Promise<ApiResponse<{ tenants: Tenant[]; total: number }>> {
    const response = await this.client.get<ApiResponse<{ tenants: Tenant[]; total: number }>>(`/admin/users/${userId}/tenants`);
    return response.data;
  }

  async getAllTenants(): Promise<ApiResponse<{ tenants: Tenant[]; total: number }>> {
    const response = await this.client.get<ApiResponse<{ tenants: Tenant[]; total: number }>>('/admin/tenants');
    return response.data;
  }

  async updateTenantStatus(tenantId: string, data: { status: 'active' | 'suspended' | 'blocked' }): Promise<ApiResponse<void>> {
    const response = await this.client.put<ApiResponse<void>>(`/admin/tenants/${tenantId}/status`, data);
    return response.data;
  }

  async deleteTenant(tenantId: string): Promise<ApiResponse<void>> {
    const response = await this.client.delete<ApiResponse<void>>(`/admin/tenants/${tenantId}`);
    return response.data;
  }

  // Admin: Tenant Chats, Messages & Analytics (super_admin only)
  async getAdminTenantChats(tenantId: string, params?: { page?: number; limit?: number }): Promise<ApiResponse<{ chats: Chat[]; total: number; page: number; limit: number }>> {
    const response = await this.client.get<ApiResponse<{ chats: Chat[]; total: number; page: number; limit: number }>>(`/admin/tenants/${tenantId}/chats`, { params });
    return response.data;
  }

  async getAdminTenantChatMessages(tenantId: string, chatId: string, params?: { page?: number; limit?: number }): Promise<ApiResponse<{ messages: ChatMessage[]; total: number; page: number; limit: number }>> {
    const response = await this.client.get<ApiResponse<{ messages: ChatMessage[]; total: number; page: number; limit: number }>>(`/admin/tenants/${tenantId}/chats/${chatId}/messages`, { params });
    return response.data;
  }

  async getAdminTenantAnalytics(tenantId: string): Promise<ApiResponse<TenantAnalytics>> {
    const response = await this.client.get<ApiResponse<TenantAnalytics>>(`/admin/tenants/${tenantId}/analytics`);
    return response.data;
  }

  // Admin Plan Management (super_admin only)
  async getAdminPlans(): Promise<ApiResponse<{ plans: Plan[] }>> {
    const response = await this.client.get<ApiResponse<{ plans: Plan[] }>>('/admin/plans');
    return response.data;
  }

  async createPlan(data: CreatePlanData): Promise<ApiResponse<{ plan: Plan }>> {
    const response = await this.client.post<ApiResponse<{ plan: Plan }>>('/admin/plans', data);
    return response.data;
  }

  async getPlan(planId: string): Promise<ApiResponse<{ plan: Plan }>> {
    const response = await this.client.get<ApiResponse<{ plan: Plan }>>(`/admin/plans/${planId}`);
    return response.data;
  }

  async updatePlan(planId: string, data: Partial<CreatePlanData>): Promise<ApiResponse<void>> {
    const response = await this.client.put<ApiResponse<void>>(`/admin/plans/${planId}`, data);
    return response.data;
  }

  async deletePlan(planId: string): Promise<ApiResponse<void>> {
    const response = await this.client.delete<ApiResponse<void>>(`/admin/plans/${planId}`);
    return response.data;
  }
}

export const api = new ApiClient();
