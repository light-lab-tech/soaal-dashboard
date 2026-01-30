import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../services/api';
import type { Tenant } from '../types';
import {
  Send,
  Bot,
  CheckCircle2,
  Copy,
  ExternalLink,
} from 'lucide-react';

const Telegram: React.FC = () => {
  const { t } = useTranslation();
  const { tenantId } = useParams<{ tenantId: string }>();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [botToken, setBotToken] = useState('');
  const [botInfo, setBotInfo] = useState<{ bot_username: string; bot_id: number } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!tenantId) return;
    loadTenant();
  }, [tenantId]);

  const loadTenant = async () => {
    if (!tenantId) return;
    try {
      setIsLoading(true);
      const response = await api.getTenant(tenantId);
      setTenant(response.data.tenant);
    } catch (error) {
      console.error('Error loading tenant:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantId || !botToken.trim()) return;

    try {
      setIsSubmitting(true);
      const response = await api.setTelegramBotToken(tenantId, { bot_token: botToken.trim() });
      setBotInfo({
        bot_username: response.data.bot_username,
        bot_id: response.data.bot_id,
      });
      setBotToken('');
    } catch (error) {
      console.error('Error setting bot token:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyWebhookCommand = () => {
    if (!botInfo) return;
    const command = `curl "https://api.telegram.org/bot${tenant?.name}/setWebhook?url=https://your-domain.com/webhooks/telegram?token=${botInfo.bot_username}"`;
    navigator.clipboard.writeText(command);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="glass-card flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-glass-text text-sm">{t('common.loading')}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-white mb-0.5">
          {t('telegram.title')} - {tenant?.name}
        </h1>
        <p className="text-sm text-glass-textSecondary">
          {t('telegram.connectBot')}
        </p>
      </div>

      {/* Set Bot Token */}
      <div className="glass-card p-4">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600">
            <Bot size={18} className="text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-sm font-semibold text-white">
              {botInfo ? t('telegram.botConnected') : t('telegram.setToken')}
            </h2>
            {botInfo && (
              <p className="text-xs text-glass-textSecondary">
                @{botInfo.bot_username}
              </p>
            )}
          </div>
          {botInfo && (
            <CheckCircle2 size={18} className="text-emerald-400" />
          )}
        </div>

        <form onSubmit={handleSetToken} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-glass-text mb-1.5">
              {t('telegram.botToken')}
            </label>
            <input
              type="text"
              value={botToken}
              onChange={(e) => setBotToken(e.target.value)}
              className="glass-input w-full px-3 py-2 rounded-lg font-mono text-sm"
              placeholder="123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
              required
            />
            <p className="text-[10px] text-glass-textSecondary mt-1.5">
              {t('telegram.getBotToken')}
            </p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="glass-button w-full py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1.5"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                {t('common.loading')}
              </>
            ) : (
              <>
                <Send size={14} />
                {botInfo ? t('telegram.updateToken') : t('telegram.setToken')}
              </>
            )}
          </button>
        </form>
      </div>

      {/* Instructions */}
      <div className="glass-card p-4">
        <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-1.5">
          <Send size={14} />
          {t('telegram.instructions')}
        </h3>
        <ol className="space-y-2.5">
          {[1, 2, 3, 4].map((step) => (
            <li key={step} className="flex gap-2.5">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-[11px]">
                {step}
              </div>
              <p className="text-sm text-glass-text pt-0.5">{t(`telegram.step${step}` as any)}</p>
            </li>
          ))}
        </ol>
      </div>

      {/* Webhook Command */}
      {botInfo && (
        <div className="glass-card p-4">
          <h3 className="text-sm font-semibold text-white mb-3">{t('telegram.webhookSetup')}</h3>
          <div className="glass-input p-3 rounded-lg font-mono text-xs break-all mb-3">
            curl "https://api.telegram.org/bot{'{BOT_TOKEN}'}/setWebhook?url=https://your-domain.com/webhooks/telegram?token={'{BOT_TOKEN}'}"
          </div>
          <p className="text-[10px] text-glass-textSecondary mb-3">
            {t('telegram.replaceToken')}
          </p>
          <button
            onClick={copyWebhookCommand}
            className="glass-button-secondary w-full py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1.5"
          >
            <Copy size={14} />
            {t('telegram.copyCommand')}
          </button>
        </div>
      )}

      {/* Bot Info */}
      {botInfo && (
        <div className="glass-card p-4">
          <h3 className="text-sm font-semibold text-white mb-3">{t('telegram.botInfo')}</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-glass-textSecondary">{t('telegram.botUsername')}:</span>
              <div className="flex items-center gap-1.5">
                <span className="text-sm text-white font-medium">@{botInfo.bot_username}</span>
                <a
                  href={`https://t.me/${botInfo.bot_username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300"
                >
                  <ExternalLink size={14} className="rtl-flip" />
                </a>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-glass-textSecondary">{t('telegram.botId')}:</span>
              <span className="text-sm text-white font-medium">{botInfo.bot_id}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Telegram;
