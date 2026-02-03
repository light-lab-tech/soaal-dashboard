import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { format, subDays } from 'date-fns';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { api } from '../services/api';
import type { FeedbackStats, Feedback, Tenant } from '../types';
import {
  BarChart3,
  ThumbsUp,
  ThumbsDown,
  TrendingUp,
  Calendar,
} from 'lucide-react';

const COLORS = {
  positive: '#10b981',
  negative: '#ef4444',
};

const Analytics: React.FC = () => {
  const { t } = useTranslation();
  const { tenantId } = useParams<{ tenantId: string }>();
  const [stats, setStats] = useState<FeedbackStats | null>(null);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'today' | '7days' | '30days'>('30days');
  const [showDetailed, setShowDetailed] = useState(false);

  useEffect(() => {
    if (!tenantId) return;
    loadData();
  }, [tenantId, dateRange]);

  const loadData = async () => {
    if (!tenantId) return;

    const getDates = () => {
      const now = new Date();
      switch (dateRange) {
        case 'today':
          return {
            start_date: format(now, 'yyyy-MM-dd'),
            end_date: format(now, 'yyyy-MM-dd'),
          };
        case '7days':
          return {
            start_date: format(subDays(now, 7), 'yyyy-MM-dd'),
            end_date: format(now, 'yyyy-MM-dd'),
          };
        case '30days':
        default:
          return {
            start_date: format(subDays(now, 30), 'yyyy-MM-dd'),
            end_date: format(now, 'yyyy-MM-dd'),
          };
      }
    };

    try {
      setIsLoading(true);
      const [statsResponse, feedbackResponse, tenantResponse] = await Promise.all([
        api.getFeedbackStats(tenantId, getDates()),
        api.getFeedback(tenantId, { limit: 100 }),
        api.getTenant(tenantId),
      ]);
      setStats(statsResponse.data);
      setFeedback(feedbackResponse.data.feedback);
      setTenant(tenantResponse.data.tenant);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const pieData = stats
    ? [
        { name: 'Positive', value: stats.positive_count, color: COLORS.positive },
        { name: 'Negative', value: stats.negative_count, color: COLORS.negative },
      ]
    : [];

  const barData = stats
    ? [
        { name: 'Positive', value: stats.positive_count, color: COLORS.positive },
        { name: 'Negative', value: stats.negative_count, color: COLORS.negative },
      ]
    : [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="glass-card flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-[#8B00E8] border-t-transparent rounded-full animate-spin"></div>
          <span className="text-glass-text text-sm">{t('common.loading')}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-white mb-0.5">
            {t('analytics.title')} - {tenant?.name}
          </h1>
          <p className="text-sm text-glass-textSecondary">
            {t('analytics.monitorSatisfaction')}
          </p>
        </div>

        {/* Date Range Selector */}
        <div className="glass px-3 py-1.5 rounded-full flex items-center gap-1.5">
          <Calendar size={14} className="text-glass-textSecondary" />
          {(['today', '7days', '30days'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                dateRange === range
                  ? 'bg-[#8B00E8] text-white'
                  : 'text-glass-text hover:text-white'
              }`}
            >
              {range === 'today' ? t('analytics.today') :
               range === '7days' ? t('analytics.last7Days') :
               t('analytics.last30Days')}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="glass-card p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-[#8B00E8] to-[#7C3AED]">
                <BarChart3 size={16} className="text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-0.5">{stats.total_feedback}</h3>
            <p className="text-xs text-glass-textSecondary">{t('analytics.totalFeedback')}</p>
          </div>

          <div className="glass-card p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600">
                <ThumbsUp size={16} className="text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-0.5">{stats.positive_count}</h3>
            <p className="text-xs text-glass-textSecondary">{t('analytics.positive')}</p>
          </div>

          <div className="glass-card p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-red-500 to-red-600">
                <ThumbsDown size={16} className="text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-0.5">{stats.negative_count}</h3>
            <p className="text-xs text-glass-textSecondary">{t('analytics.negative')}</p>
          </div>

          <div className="glass-card p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-[#8B00E8] to-[#7C3AED]">
                <TrendingUp size={16} className="text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-0.5">{stats.positive_percent}%</h3>
            <p className="text-xs text-glass-textSecondary">{t('analytics.satisfaction')}</p>
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Pie Chart */}
        <div className="glass-card p-4">
          <h3 className="text-sm font-medium text-white mb-4">{t('analytics.feedbackDistribution')}</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.name}: ${entry.value}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart */}
        <div className="glass-card p-4">
          <h3 className="text-sm font-medium text-white mb-4">{t('analytics.feedbackOverview')}</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" />
              <YAxis stroke="rgba(255,255,255,0.5)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(30, 41, 59, 0.9)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Bar dataKey="value" fill="#22d3ee" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Feedback */}
      <div>
        <button
          onClick={() => setShowDetailed(!showDetailed)}
          className="glass-button px-4 py-2 rounded-lg text-sm font-medium"
        >
          {showDetailed ? t('analytics.hide') : t('analytics.show')} {t('analytics.detailedFeedback')}
        </button>
      </div>

      {showDetailed && (
        <div className="space-y-3">
          {feedback.map((item) => (
            <div key={item.id} className="glass-card p-3">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  {item.feedback_type === 'positive' ? (
                    <ThumbsUp size={14} className="text-emerald-400" />
                  ) : (
                    <ThumbsDown size={14} className="text-red-400" />
                  )}
                  <span className="text-sm font-medium text-white capitalize">{item.feedback_type}</span>
                </div>
                <span className="text-[10px] text-glass-textSecondary">
                  {new Date(item.created_at).toLocaleString()}
                </span>
              </div>

              {item.user_question && (
                <div className="mb-1.5">
                  <span className="text-xs text-glass-textSecondary">{t('analytics.userQuestion')}:</span>
                  <p className="text-sm text-white">{item.user_question}</p>
                </div>
              )}

              {item.message_content && (
                <div className="mb-1.5">
                  <span className="text-xs text-glass-textSecondary">{t('analytics.botResponse')}:</span>
                  <p className="text-sm text-white">{item.message_content}</p>
                </div>
              )}

              {item.comment && (
                <div>
                  <span className="text-xs text-glass-textSecondary">{t('analytics.comment')}:</span>
                  <p className="text-sm text-white">{item.comment}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Analytics;
