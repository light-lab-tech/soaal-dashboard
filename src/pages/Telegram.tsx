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
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="glass-card flex items-center gap-4">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-glass-text">{t('common.loading')}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">
          {t('telegram.title')} - {tenant?.name}
        </h1>
        <p className="text-glass-textSecondary">
          Connect a Telegram bot to your tenant
        </p>
      </div>

      {/* Set Bot Token */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600">
            <Bot size={24} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">
              {botInfo ? 'Bot Connected' : t('telegram.setToken')}
            </h2>
            {botInfo && (
              <p className="text-sm text-glass-textSecondary">
                @{botInfo.bot_username}
              </p>
            )}
          </div>
          {botInfo && (
            <CheckCircle2 size={24} className="text-emerald-400 ml-auto" />
          )}
        </div>

        <form onSubmit={handleSetToken} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-glass-text mb-2">
              {t('telegram.botToken')}
            </label>
            <input
              type="text"
              value={botToken}
              onChange={(e) => setBotToken(e.target.value)}
              className="glass-input w-full px-4 py-3 rounded-xl font-mono"
              placeholder="123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
              required
            />
            <p className="text-xs text-glass-textSecondary mt-2">
              Get your bot token from @BotFather on Telegram
            </p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="glass-button w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                {t('common.loading')}
              </>
            ) : (
              <>
                <Send size={20} />
                {botInfo ? 'Update Token' : t('telegram.setToken')}
              </>
            )}
          </button>
        </form>
      </div>

      {/* Instructions */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Send size={20} />
          {t('telegram.instructions')}
        </h3>
        <ol className="space-y-4">
          {[1, 2, 3, 4].map((step) => (
            <li key={step} className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-bold text-sm">
                {step}
              </div>
              <p className="text-glass-text pt-1">{t(`telegram.step${step}` as any)}</p>
            </li>
          ))}
        </ol>
      </div>

      {/* Webhook Command */}
      {botInfo && (
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Webhook Setup Command</h3>
          <div className="glass-input p-4 rounded-xl font-mono text-sm break-all mb-4">
            curl "https://api.telegram.org/bot{BOT_TOKEN}/setWebhook?url=https://your-domain.com/webhooks/telegram?token={BOT_TOKEN}"
          </div>
          <p className="text-xs text-glass-textSecondary mb-4">
            Replace <span className="text-primary-400">{'{BOT_TOKEN}'}</span> with your actual bot token
          </p>
          <button
            onClick={copyWebhookCommand}
            className="glass-button-secondary w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
          >
            <Copy size={20} />
            Copy Command
          </button>
        </div>
      )}

      {/* Bot Info */}
      {botInfo && (
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Bot Information</h3>
          <div className="space-y-4">
            <div>
              <span className="text-sm text-glass-textSecondary">{t('telegram.botUsername')}:</span>
              <div className="flex items-center gap-2">
                <span className="text-white font-semibold">@{botInfo.bot_username}</span>
                <a
                  href={`https://t.me/${botInfo.bot_username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-400 hover:text-primary-300"
                >
                  <ExternalLink size={16} />
                </a>
              </div>
            </div>
            <div>
              <span className="text-sm text-glass-textSecondary">{t('telegram.botId')}:</span>
              <span className="text-white font-semibold">{botInfo.bot_id}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Telegram;
