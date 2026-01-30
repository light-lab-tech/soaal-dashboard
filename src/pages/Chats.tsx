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
          <Loader2 size={24} className="animate-spin text-cyan-400" />
          <span className="text-glass-text text-sm">{t('common.loading')}</span>
        </div>
      </div>
    );
  }

  // Show messages view
  if (selectedChat) {
    return (
      <div className="space-y-5 animate-fade-in">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleBackToChats}
            className="p-2.5 rounded-xl bg-slate-700/50 hover:bg-slate-700/70 text-slate-300 hover:text-white transition-all duration-200 hover:scale-105"
          >
            <ArrowLeft size={20} className="rtl-flip" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-white">
              {selectedChat.title || `${t('chats.chatTitle')} #${selectedChat.id.slice(0, 8)}`}
            </h1>
            <p className="text-slate-400 text-sm flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              {new Date(selectedChat.created_at).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Messages */}
        {isLoadingMessages ? (
          <div className="flex items-center justify-center min-h-[200px]">
            <div className="flex flex-col items-center gap-3">
              <Loader2 size={32} className="animate-spin text-cyan-400" />
              <span className="text-slate-400 text-sm">{t('common.loading')}</span>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-slate-700/50 flex items-center justify-center empty-state-icon">
              <MessageSquare size={36} className="text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">{t('chats.noMessages')}</h3>
            <p className="text-slate-400 text-sm">Messages will appear here when the conversation starts</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={message.id}
                className={`glass-card p-5 animate-slide-up ${
                  message.role === 'user'
                    ? 'border-l-4 border-cyan-500/70 bg-cyan-500/5'
                    : message.role === 'assistant'
                    ? 'border-l-4 border-purple-500/70 bg-purple-500/5'
                    : 'border-l-4 border-slate-500/50'
                }`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-2 rounded-lg ${
                    message.role === 'user' ? 'bg-cyan-500/20' : 'bg-purple-500/20'
                  }`}>
                    {message.role === 'user' ? (
                      <User size={16} className="text-cyan-400" />
                    ) : (
                      <Bot size={16} className="text-purple-400" />
                    )}
                  </div>
                  <span className={`text-sm font-semibold ${
                    message.role === 'user' ? 'text-cyan-400' : 'text-purple-400'
                  }`}>
                    {message.role === 'user' ? t('chats.user') : t('chats.assistant')}
                  </span>
                  <span className="text-xs text-slate-500 ml-auto">
                    {new Date(message.created_at).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-white whitespace-pre-wrap leading-relaxed">{message.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Show chats list
  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(`/tenants/${tenantId}`)}
            className="p-2.5 rounded-xl bg-slate-700/50 hover:bg-slate-700/70 text-slate-300 hover:text-white transition-all duration-200 hover:scale-105"
          >
            <ArrowLeft size={20} className="rtl-flip" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <span className="p-2 rounded-xl bg-gradient-to-br from-emerald-500/20 to-green-500/20">
                <MessageSquare size={20} className="text-emerald-400" />
              </span>
              {t('chats.title')}
            </h1>
            <p className="text-slate-400 text-sm mt-1 flex items-center gap-2">
              {tenant?.name}
              <span className="w-1 h-1 rounded-full bg-slate-500"></span>
              <span className="text-emerald-400 font-medium">{totalChats}</span> {t('chats.totalChats').toLowerCase()}
            </p>
          </div>
        </div>
        <button
          onClick={loadData}
          className="glass-button-secondary px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 hover:scale-105 transition-transform"
        >
          <RefreshCw size={16} />
          {t('common.update')}
        </button>
      </div>

      {/* Chats List */}
      {chats.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-slate-700/50 flex items-center justify-center empty-state-icon">
            <MessageSquare size={40} className="text-slate-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">{t('chats.noChats')}</h3>
          <p className="text-slate-400 text-sm max-w-md mx-auto">{t('chats.noChatsDesc')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {chats.map((chat, index) => (
            <div
              key={chat.id}
              onClick={() => loadMessages(chat)}
              className="glass-card p-5 cursor-pointer hover:scale-[1.01] transition-all group card-hover-lift animate-slide-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500/20 to-green-500/20 group-hover:from-emerald-500/30 group-hover:to-green-500/30 transition-colors">
                    <MessageSquare size={22} className="text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold group-hover:text-emerald-300 transition-colors">
                      {chat.title || `${t('chats.chatTitle')} #${chat.id.slice(0, 8)}`}
                    </h3>
                    <p className="text-slate-400 text-sm flex items-center gap-2 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      {new Date(chat.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                <ChevronRight
                  size={22}
                  className="text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-2 transition-all duration-300 rtl-flip"
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

export default Chats;
