import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import type { Tenant, Chat, ChatMessage } from '../../types';
import {
  MessageSquare,
  ChevronRight,
  Loader2,
  RefreshCw,
  Building2,
  ArrowLeft,
  User,
  Bot,
} from 'lucide-react';

interface TenantWithChats {
  tenant: Tenant;
  chats: Chat[];
  totalChats: number;
}

const AdminChats: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tenantsWithChats, setTenantsWithChats] = useState<TenantWithChats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedTenants, setExpandedTenants] = useState<Record<string, boolean>>({});
  
  // For viewing messages
  const [selectedChat, setSelectedChat] = useState<{ tenantId: string; chat: Chat } | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  useEffect(() => {
    if (user?.role !== 'super_admin') {
      navigate('/admin', { replace: true });
      return;
    }
    loadData();
  }, [user?.role, navigate]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      // Get all tenants (admin API)
      const tenantsRes = await api.getAllTenants();
      const tenants = tenantsRes.data.tenants || [];
      
      // Fetch chats for each tenant using admin API
      const tenantsWithChatsData = await Promise.all(
        tenants.map(async (tenant) => {
          try {
            const chatsRes = await api.getAdminTenantChats(tenant.id, { page: 1, limit: 5 });
            return {
              tenant,
              chats: chatsRes.data.chats || [],
              totalChats: chatsRes.data.total || 0,
            };
          } catch {
            return { tenant, chats: [], totalChats: 0 };
          }
        })
      );
      
      setTenantsWithChats(tenantsWithChatsData);
    } catch (error) {
      console.error('Error loading chats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTenant = (tenantId: string) => {
    setExpandedTenants((prev) => ({
      ...prev,
      [tenantId]: !prev[tenantId],
    }));
  };

  const loadMessages = async (tenantId: string, chat: Chat) => {
    try {
      setIsLoadingMessages(true);
      setSelectedChat({ tenantId, chat });
      const res = await api.getAdminTenantChatMessages(tenantId, chat.id, { page: 1, limit: 100 });
      setMessages(res.data.messages || []);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const handleBackToChats = () => {
    setSelectedChat(null);
    setMessages([]);
  };

  const totalChatsCount = tenantsWithChats.reduce((acc, t) => acc + t.totalChats, 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="glass-card flex items-center gap-3">
          <Loader2 size={24} className="animate-spin text-cyan-400" />
          <span className="text-glass-text text-sm">{t('common.loading')}</span>
        </div>
      </div>
    );
  }

  // Show messages view
  if (selectedChat) {
    const tenantName = tenantsWithChats.find(t => t.tenant.id === selectedChat.tenantId)?.tenant.name || 'Tenant';
    return (
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleBackToChats}
            className="p-2 rounded-lg bg-slate-700/50 hover:bg-slate-700/70 text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} className="rtl-flip" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white">
              {selectedChat.chat.title || `${t('chats.chatTitle')} #${selectedChat.chat.id.slice(0, 8)}`}
            </h1>
            <p className="text-slate-400 text-sm">
              {tenantName} • {new Date(selectedChat.chat.created_at).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Messages */}
        {isLoadingMessages ? (
          <div className="flex items-center justify-center min-h-[200px]">
            <Loader2 size={24} className="animate-spin text-cyan-400" />
          </div>
        ) : messages.length === 0 ? (
          <div className="glass-card p-8 text-center">
            <MessageSquare size={48} className="mx-auto text-slate-500 mb-3" />
            <p className="text-slate-400">{t('chats.noMessages')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`glass-card p-4 ${
                  message.role === 'user'
                    ? 'border-l-4 border-cyan-500/50'
                    : message.role === 'assistant'
                    ? 'border-l-4 border-purple-500/50'
                    : 'border-l-4 border-slate-500/50'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {message.role === 'user' ? (
                    <User size={16} className="text-cyan-400" />
                  ) : (
                    <Bot size={16} className="text-purple-400" />
                  )}
                  <span className="text-sm font-medium text-slate-300 capitalize">
                    {message.role === 'user' ? t('chats.user') : t('chats.assistant')}
                  </span>
                  <span className="text-xs text-slate-500 ml-auto">
                    {new Date(message.created_at).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-white whitespace-pre-wrap">{message.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">{t('chats.title')}</h1>
          <p className="text-slate-400 text-sm mt-1">
            {t('chats.totalChats')}: {totalChatsCount} • {tenantsWithChats.length} {t('nav.tenants').toLowerCase()}
          </p>
        </div>
        <button
          onClick={loadData}
          className="glass-button-secondary px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
        >
          <RefreshCw size={16} />
          {t('common.update')}
        </button>
      </div>

      {/* Tenants with Chats */}
      {tenantsWithChats.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-700/50 flex items-center justify-center">
            <MessageSquare size={32} className="text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">{t('chats.noChats')}</h3>
          <p className="text-slate-400 text-sm">{t('chats.noChatsDesc')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tenantsWithChats.map(({ tenant, chats, totalChats }) => (
            <div key={tenant.id} className="glass-card overflow-hidden">
              {/* Tenant Header */}
              <button
                onClick={() => toggleTenant(tenant.id)}
                className="w-full p-4 flex items-center justify-between hover:bg-slate-700/20 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500/20 to-teal-500/20">
                    <Building2 size={20} className="text-cyan-400" />
                  </div>
                  <div className="text-start">
                    <h3 className="text-white font-medium">{tenant.name}</h3>
                    <p className="text-slate-400 text-sm">
                      {totalChats} {t('nav.chats').toLowerCase()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    tenant.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' :
                    tenant.status === 'suspended' ? 'bg-amber-500/20 text-amber-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {tenant.status}
                  </span>
                  <ChevronRight
                    size={20}
                    className={`text-slate-400 transition-transform rtl-flip ${expandedTenants[tenant.id] ? 'rotate-90' : ''}`}
                  />
                </div>
              </button>

              {/* Expanded Chats List */}
              {expandedTenants[tenant.id] && (
                <div className="border-t border-slate-700/50 p-4 bg-slate-800/30">
                  {chats.length === 0 ? (
                    <p className="text-slate-400 text-sm text-center py-4">{t('chats.noChats')}</p>
                  ) : (
                    <div className="space-y-2">
                      {chats.map((chat) => (
                        <button
                          key={chat.id}
                          onClick={() => loadMessages(tenant.id, chat)}
                          className="w-full p-3 rounded-lg bg-slate-700/30 hover:bg-slate-700/50 flex items-center justify-between group transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <MessageSquare size={16} className="text-emerald-400" />
                            <div className="text-start">
                              <p className="text-white text-sm">
                                {chat.title || `${t('chats.chatTitle')} #${chat.id.slice(0, 8)}`}
                              </p>
                              <p className="text-slate-400 text-xs">
                                {new Date(chat.created_at).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <ChevronRight size={16} className="text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all rtl-flip" />
                        </button>
                      ))}
                      {totalChats > 5 && (
                        <p className="text-slate-500 text-xs text-center pt-2">
                          +{totalChats - 5} {t('common.more')}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminChats;
