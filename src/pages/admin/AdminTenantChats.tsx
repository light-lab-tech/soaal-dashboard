import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import type { Tenant, Chat, ChatMessage } from '../../types';
import {
  MessageSquare,
  ArrowLeft,
  ChevronRight,
  User,
  Bot,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { StructuredResponseArtifacts } from '../../components/ui/StructuredResponseArtifacts';
import { extractStructuredArtifacts, getDisplayMessageContent } from '../../utils/chatResponse';

const AdminTenantChats: React.FC = () => {
  const { t } = useTranslation();
  const { tenantId } = useParams<{ tenantId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [page, setPage] = useState(1);
  const [totalChats, setTotalChats] = useState(0);
  const limit = 20;

  useEffect(() => {
    if (user?.role !== 'super_admin') {
      navigate('/admin', { replace: true });
      return;
    }
    if (!tenantId) {
      navigate('/admin/tenants', { replace: true });
      return;
    }
    loadData();
  }, [tenantId, page, user?.role, navigate]);

  const loadData = async () => {
    if (!tenantId) return;
    try {
      setIsLoading(true);
      // Get tenant info
      const tenantsRes = await api.getAllTenants();
      const foundTenant = tenantsRes.data.tenants?.find(t => t.id === tenantId);
      if (foundTenant) {
        setTenant(foundTenant);
      }
      
      // Get chats using admin API
      const chatsRes = await api.getAdminTenantChats(tenantId, { page, limit });
      setChats(chatsRes.data.chats || []);
      setTotalChats(chatsRes.data.total || 0);
    } catch (error) {
      console.error('Error loading chats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async (chat: Chat) => {
    if (!tenantId) return;
    try {
      setIsLoadingMessages(true);
      setSelectedChat(chat);
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="glass-card flex items-center gap-3">
          <Loader2 size={24} className="animate-spin text-[#8B00E8]" />
          <span className="text-glass-text text-sm">{t('common.loading')}</span>
        </div>
      </div>
    );
  }

  // Show messages view
  if (selectedChat) {
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
              {selectedChat.title || `${t('chats.chatTitle')} #${selectedChat.id.slice(0, 8)}`}
            </h1>
            <p className="text-slate-400 text-sm">
              {tenant?.name} • {new Date(selectedChat.created_at).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Messages */}
        {isLoadingMessages ? (
          <div className="flex items-center justify-center min-h-[200px]">
            <Loader2 size={24} className="animate-spin text-[#8B00E8]" />
          </div>
        ) : messages.length === 0 ? (
          <div className="glass-card p-8 text-center">
            <MessageSquare size={48} className="mx-auto text-slate-500 mb-3" />
            <p className="text-slate-400">{t('chats.noMessages')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((message) => {
              const artifacts = extractStructuredArtifacts(message);
              const displayContent = getDisplayMessageContent(message);
              return (
                <div
                  key={message.id}
                  className={`glass-card p-4 ${
                    message.role === 'user'
                      ? 'border-l-4 border-[#8B00E8]/50'
                      : message.role === 'assistant'
                      ? 'border-l-4 border-[#7C3AED]/50'
                      : 'border-l-4 border-slate-500/50'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {message.role === 'user' ? (
                      <User size={16} className="text-[#8B00E8]" />
                    ) : (
                      <Bot size={16} className="text-[#7C3AED]" />
                    )}
                    <span className="text-sm font-medium text-slate-300 capitalize">
                      {message.role === 'user' ? t('chats.user') : t('chats.assistant')}
                    </span>
                    <span className="text-xs text-slate-500 ml-auto">
                      {new Date(message.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-white whitespace-pre-wrap">{displayContent}</p>
                  {message.role === 'assistant' && <StructuredResponseArtifacts artifacts={artifacts} />}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Show chats list
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(`/admin/tenants/${tenantId}`)}
            className="p-2 rounded-lg bg-slate-700/50 hover:bg-slate-700/70 text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} className="rtl-flip" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white">{t('chats.title')}</h1>
            <p className="text-slate-400 text-sm">
              {tenant?.name} • {t('chats.totalChats')}: {totalChats}
            </p>
          </div>
        </div>
        <button
          onClick={loadData}
          className="glass-button-secondary px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
        >
          <RefreshCw size={16} />
          {t('common.update')}
        </button>
      </div>

      {/* Chats List */}
      {chats.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-700/50 flex items-center justify-center">
            <MessageSquare size={32} className="text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">{t('chats.noChats')}</h3>
          <p className="text-slate-400 text-sm">{t('chats.noChatsDesc')}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {chats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => loadMessages(chat)}
              className="glass-card p-4 cursor-pointer hover:scale-[1.01] transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-[#8B00E8]/20 to-[#A855F7]/20">
                    <MessageSquare size={20} className="text-[#8B00E8]" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium">
                      {chat.title || `${t('chats.chatTitle')} #${chat.id.slice(0, 8)}`}
                    </h3>
                    <p className="text-slate-400 text-sm">
                      {new Date(chat.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                <ChevronRight
                  size={20}
                  className="text-slate-500 group-hover:text-[#8B00E8] group-hover:translate-x-1 transition-all rtl-flip"
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalChats > limit && (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 rounded-lg bg-slate-700/50 text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700/70 transition-colors"
          >
            {t('common.previous')}
          </button>
          <span className="px-4 py-2 text-slate-400">
            {page} / {Math.ceil(totalChats / limit)}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= Math.ceil(totalChats / limit)}
            className="px-4 py-2 rounded-lg bg-slate-700/50 text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700/70 transition-colors"
          >
            {t('common.next')}
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminTenantChats;
