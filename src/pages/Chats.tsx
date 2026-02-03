import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../services/api';
import type { Chat, ChatMessage, Tenant } from '../types';
import {
  MessageSquare,
  ArrowLeft,
  ChevronRight,
  User,
  Bot,
  Loader2,
  RefreshCw,
} from 'lucide-react';

const Chats: React.FC = () => {
  const { t } = useTranslation();
  const { tenantId } = useParams<{ tenantId: string }>();
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
    if (!tenantId) {
      navigate('/tenants');
      return;
    }
    loadData();
  }, [tenantId, page]);

  const loadData = async () => {
    if (!tenantId) return;
    try {
      setIsLoading(true);
      const [tenantRes, chatsRes] = await Promise.all([
        api.getTenant(tenantId),
        api.getTenantChats(tenantId, { page, limit }),
      ]);
      setTenant(tenantRes.data.tenant);
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
      const res = await api.getTenantChatMessages(tenantId, chat.id, { page: 1, limit: 100 });
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
      <div className="space-y-4 animate-fade-in">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleBackToChats}
            className="p-2 rounded-lg glass-button-secondary shrink-0"
          >
            <ArrowLeft size={18} className="rtl-flip" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-semibold text-white truncate">
              {selectedChat.title || `${t('chats.chatTitle')} #${selectedChat.id.slice(0, 8)}`}
            </h1>
            <p className="text-xs text-glass-textSecondary flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse"></span>
              {new Date(selectedChat.created_at).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Messages */}
        {isLoadingMessages ? (
          <div className="flex items-center justify-center min-h-[200px]">
            <div className="flex flex-col items-center gap-3">
              <Loader2 size={28} className="animate-spin text-[#8B00E8]" />
              <span className="text-glass-textSecondary text-sm">{t('common.loading')}</span>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="glass-card p-8 text-center">
            <MessageSquare size={32} className="mx-auto mb-3 text-glass-textSecondary" />
            <h3 className="text-base font-semibold text-white mb-1">{t('chats.noMessages')}</h3>
            <p className="text-sm text-glass-textSecondary">Messages will appear here when the conversation starts</p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`glass-card p-4 ${
                  message.role === 'user'
                    ? 'border-l-4 border-[#8B00E8]/70 bg-[#A855F7]/5'
                    : message.role === 'assistant'
                    ? 'border-l-4 border-[#7C3AED]/70 bg-[#7C3AED]/5'
                    : 'border-l-4 border-glass-textSecondary/30'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className={`p-1.5 rounded-lg shrink-0 ${
                    message.role === 'user' ? 'bg-[#A855F7]/20' : 'bg-[#7C3AED]/20'
                  }`}>
                    {message.role === 'user' ? (
                      <User size={14} className="text-[#8B00E8]" />
                    ) : (
                      <Bot size={14} className="text-[#7C3AED]" />
                    )}
                  </div>
                  <span className={`text-xs font-semibold ${
                    message.role === 'user' ? 'text-[#8B00E8]' : 'text-[#7C3AED]'
                  }`}>
                    {message.role === 'user' ? t('chats.user') : t('chats.assistant')}
                  </span>
                  <span className="text-[10px] text-glass-textSecondary ml-auto">
                    {new Date(message.created_at).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-sm text-white whitespace-pre-wrap leading-relaxed">{message.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Show chats list
  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/tenants/${tenantId}`)}
            className="p-2 rounded-lg glass-button-secondary shrink-0"
          >
            <ArrowLeft size={18} className="rtl-flip" />
          </button>
          <div>
            <h1 className="text-xl font-semibold text-white flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-gradient-to-br from-emerald-500/20 to-green-500/20">
                <MessageSquare size={16} className="text-emerald-400" />
              </span>
              {t('chats.title')}
            </h1>
            <p className="text-xs text-glass-textSecondary flex items-center gap-2 mt-0.5">
              {tenant?.name}
              <span className="w-1 h-1 rounded-full bg-glass-textSecondary"></span>
              <span className="text-emerald-400">{totalChats}</span> {t('chats.totalChats').toLowerCase()}
            </p>
          </div>
        </div>
        <button
          onClick={loadData}
          className="glass-button-secondary px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 self-start sm:self-auto"
        >
          <RefreshCw size={14} />
          {t('common.update')}
        </button>
      </div>

      {/* Chats List */}
      {chats.length === 0 ? (
        <div className="glass-card p-8 text-center">
          <MessageSquare size={36} className="mx-auto mb-3 text-glass-textSecondary" />
          <h3 className="text-base font-semibold text-white mb-1">{t('chats.noChats')}</h3>
          <p className="text-sm text-glass-textSecondary max-w-md mx-auto">{t('chats.noChatsDesc')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {chats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => loadMessages(chat)}
              className="glass-card p-4 cursor-pointer hover:scale-[1.01] transition-all group"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500/20 to-green-500/20 group-hover:from-emerald-500/30 group-hover:to-green-500/30 transition-colors shrink-0">
                    <MessageSquare size={18} className="text-emerald-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-semibold text-white truncate group-hover:text-emerald-300 transition-colors">
                      {chat.title || `${t('chats.chatTitle')} #${chat.id.slice(0, 8)}`}
                    </h3>
                    <p className="text-xs text-glass-textSecondary flex items-center gap-1.5 mt-0.5">
                      <span className="w-1 h-1 rounded-full bg-emerald-400"></span>
                      {new Date(chat.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                <ChevronRight
                  size={18}
                  className="text-glass-textSecondary group-hover:text-emerald-400 group-hover:translate-x-1 transition-all duration-300 rtl-flip shrink-0"
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
            className="glass-button-secondary px-4 py-2 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('common.previous')}
          </button>
          <span className="px-4 py-2 text-glass-textSecondary text-sm">
            {page} / {Math.ceil(totalChats / limit)}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= Math.ceil(totalChats / limit)}
            className="glass-button-secondary px-4 py-2 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('common.next')}
          </button>
        </div>
      )}
    </div>
  );
};

export default Chats;
