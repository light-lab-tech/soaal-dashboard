import axios, { AxiosInstance, AxiosError } from 'axios';
import type {
  ApiResponse,
  ApiError,
  LoginCredentials,
  RegisterData,
  AuthResponse,
  ForgotPasswordData,
  ResetPasswordData,
  Tenant,
  CreateTenantData,
  ApiKey,
  CreateApiKeyData,
  Document,
  IngestUrlData,
  PendingQuestion,
  AnswerData,
  FeedbackStats,
  Feedback,
  TelegramBotData,
  TelegramBotResponse,
  AdminUser,
  UpdateUserRoleData,
  Pagination,
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

    // Add token to requests
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Handle errors
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError<ApiError>) => {
        if (error.response?.status === 401) {
          // Clear token and redirect to login
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
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

  async register(data: RegisterData): Promise<ApiResponse<AuthResponse>> {
    const response = await this.client.post<ApiResponse<AuthResponse>>('/register', data);
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

  async ingestUrl(tenantId: string, data: IngestUrlData): Promise<ApiResponse<{ document_id: string; url: string; status: string }>> {
    const response = await this.client.post<ApiResponse<{ document_id: string; url: string; status: string }>>(`/tenants/${tenantId}/documents/ingest-url`, data);
    return response.data;
  }

  async deleteDocument(tenantId: string, documentId: string): Promise<ApiResponse<void>> {
    const response = await this.client.delete<ApiResponse<void>>(`/tenants/${tenantId}/documents/${documentId}`);
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
}

export const api = new ApiClient();
