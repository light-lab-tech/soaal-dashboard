import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import type { Tenant } from '../types';
import {
  Building2,
  FileText,
  MessageSquare,
  TrendingUp,
  Plus,
  ArrowRight,
  Activity,
  Users,
  BarChart3,
  RefreshCw,
  Sparkles,
  Zap,
} from 'lucide-react';
import { GlassCard, FeaturedCard } from '../components/ui/GlassCard';
import { StatCard } from '../components/ui/StatCard';
import { AnimatedButton } from '../components/ui/AnimatedButton';
import { EmptyState } from '../components/ui/EmptyState';
import { SkeletonGrid } from '../components/ui/LoadingScreen';
import { Badge } from '../components/ui/Badge';

const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [stats, setStats] = useState({
    totalTenants: 0,
    totalDocuments: 0,
    pendingQuestions: 0,
    satisfactionRate: 0,
    totalUsers: 0,
    totalPlans: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const tenantsResponse = await api.getTenants();
      setTenants(tenantsResponse.data.tenants);

      let totalDocs = 0;
      let pendingQs = 0;
      let totalFeedback = 0;
      let positiveFeedback = 0;

      for (const tenant of tenantsResponse.data.tenants) {
        try {
          const docsResponse = await api.getDocuments(tenant.id);
          totalDocs += docsResponse.data.documents.length;
          const questionsResponse = await api.getPendingQuestions(tenant.id);
          pendingQs += questionsResponse.data.questions.filter(q => q.status === 'pending').length;
          const feedbackResponse = await api.getFeedbackStats(tenant.id);
          totalFeedback += feedbackResponse.data.total_feedback;
          positiveFeedback += feedbackResponse.data.positive_count;
        } catch (error) {
          console.error(`Error loading data for tenant ${tenant.id}:`, error);
        }
      }

      setStats({
        totalTenants: tenantsResponse.data.tenants.length,
        totalDocuments: totalDocs,
        pendingQuestions: pendingQs,
        satisfactionRate: totalFeedback > 0 ? Math.round((positiveFeedback / totalFeedback) * 100) : 0,
        totalUsers: 0,
        totalPlans: 0,
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadDashboardData();
  };

  // Quick actions with enhanced colors
  const quickActions = [
    { 
      icon: Building2, 
      label: t('dashboard.createTenant'), 
      onClick: () => navigate('/tenants'), 
      color: 'purple' as const,
      description: 'Set up a new tenant workspace',
    },
    { 
      icon: FileText, 
      label: t('dashboard.uploadDocument'), 
      onClick: () => tenants.length > 0 && navigate(`/tenants/${tenants[0].id}/documents`), 
      color: 'cyan' as const,
      description: 'Add documents to knowledge base',
      disabled: tenants.length === 0,
    },
    { 
      icon: BarChart3, 
      label: t('dashboard.viewAnalytics'), 
      onClick: () => tenants.length > 0 && navigate(`/tenants/${tenants[0].id}/analytics`), 
      color: 'emerald' as const,
      description: 'View performance insights',
      disabled: tenants.length === 0,
    },
  ];

  // Stats for stat cards
  const statCards = [
    { 
      icon: Building2, 
      label: t('dashboard.totalTenants'), 
      value: stats.totalTenants, 
      color: 'purple' as const,
      trend: { value: '+12%', isPositive: true },
    },
    { 
      icon: FileText, 
      label: t('dashboard.totalDocuments'), 
      value: stats.totalDocuments, 
      color: 'cyan' as const,
      trend: { value: '+24%', isPositive: true },
    },
    { 
      icon: MessageSquare, 
      label: t('dashboard.pendingQuestions'), 
      value: stats.pendingQuestions, 
      color: 'amber' as const,
      trend: { value: '+8%', isPositive: false },
    },
    { 
      icon: TrendingUp, 
      label: t('dashboard.satisfactionRate'), 
      value: `${stats.satisfactionRate}%`, 
      color: 'pink' as const,
      trend: { value: '+5%', isPositive: true },
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6 animate-page-enter">
        <SkeletonGrid count={4} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-32 bg-slate-800/50 rounded-xl animate-pulse" />
          <div className="h-32 bg-slate-800/50 rounded-xl animate-pulse" />
          <div className="h-32 bg-slate-800/50 rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-page-enter">
      {/* Welcome Section */}
      <FeaturedCard className="group">
        <div className="relative overflow-hidden rounded-2xl p-6">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-pink-600/5 to-transparent" />
          
          {/* Animated orbs */}
          <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-purple-500/20 blur-3xl animate-pulse" />
          <div className="absolute -left-10 -bottom-10 w-32 h-32 rounded-full bg-pink-500/20 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          
          <div className="relative flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" />
                <Badge variant="primary" size="sm" animate>
                  {t('dashboard.overview')}
                </Badge>
              </div>
              <h1 className="text-2xl font-bold mb-2">
                <span className="bg-gradient-to-r from-white via-purple-200 to-purple-400 bg-clip-text text-transparent">
                  {t('dashboard.welcome')}, {user?.name}!
                </span>
              </h1>
              <p className="text-slate-400 max-w-md">
                t('dashboard.manageDescription')
              </p>
            </div>
            
            {/* Refresh button */}
            <AnimatedButton
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              isLoading={isRefreshing}
              icon={<RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />}
            >
              Refresh
            </AnimatedButton>
          </div>
        </div>
      </FeaturedCard>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        {statCards.map((stat, index) => (
          <StatCard
            key={stat.label}
            title={stat.label}
            value={stat.value}
            icon={stat.icon}
            color={stat.color}
            trend={stat.trend}
            delay={index * 100}
          />
        ))}
      </div>

      {/* Quick Actions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-semibold text-white">
              {t('dashboard.quickActions')}
            </h2>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 stagger-children">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <GlassCard
                key={action.label}
                variant="interactive"
                hover="lift"
                onClick={action.disabled ? undefined : action.onClick}
                className={`group ${action.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                animate
              >
                <div className="p-5" style={{ animationDelay: `${index * 100}ms` }}>
                  <div className="flex items-start justify-between mb-4">
                    <div className={`
                      p-3 rounded-xl bg-gradient-to-br 
                      ${action.color === 'purple' ? 'from-purple-500 to-purple-600 shadow-purple-500/30' : ''}
                      ${action.color === 'cyan' ? 'from-cyan-500 to-cyan-600 shadow-cyan-500/30' : ''}
                      ${action.color === 'emerald' ? 'from-emerald-500 to-emerald-600 shadow-emerald-500/30' : ''}
                      shadow-lg transition-transform duration-300 group-hover:scale-110
                    `}>
                      <Icon size={20} className="text-white" />
                    </div>
                    <ArrowRight 
                      size={18} 
                      className="text-slate-500 transition-all duration-300 group-hover:text-white group-hover:translate-x-1 rtl-flip" 
                    />
                  </div>
                  
                  <h3 className="text-base font-semibold text-white mb-1 group-hover:text-purple-300 transition-colors">
                    {action.label}
                  </h3>
                  <p className="text-sm text-slate-400">
                    {action.description}
                  </p>
                </div>
                
                {/* Hover gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </GlassCard>
            );
          })}
        </div>
      </div>

      {/* Recent Tenants */}
      {tenants.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-purple-400" />
              <h2 className="text-lg font-semibold text-white">
                {t('nav.tenants')}
              </h2>
              <Badge variant="default" size="sm">
                {tenants.length}
              </Badge>
            </div>
            <AnimatedButton
              variant="ghost"
              size="sm"
              onClick={() => navigate('/tenants')}
              icon={<ArrowRight size={16} className="rtl-flip" />}
              iconPosition="right"
            >
              {t('dashboard.viewAll')}
            </AnimatedButton>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
            {tenants.slice(0, 3).map((tenant, index) => (
              <GlassCard
                key={tenant.id}
                variant="interactive"
                hover="lift"
                onClick={() => navigate(`/tenants/${tenant.id}`)}
                className="group cursor-pointer"
                animate
              >
                <div className="p-5" style={{ animationDelay: `${index * 100}ms` }}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg shadow-purple-500/20">
                      <Building2 size={20} className="text-white" />
                    </div>
                    <Badge 
                      variant={tenant.status === 'active' ? 'success' : tenant.status === 'suspended' ? 'warning' : 'danger'}
                      size="sm"
                    >
                      {tenant.status}
                    </Badge>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-purple-300 transition-colors">
                    {tenant.name}
                  </h3>
                  
                  <div className="space-y-2 mt-3">
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <Users size={14} />
                      <span className="capitalize">{tenant.plan} {t('tenants.plan')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <Activity size={14} />
                      <span>{t('dashboard.created')} {new Date(tenant.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-slate-700/50">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">
                        {t('dashboard.viewDetails')}
                      </span>
                      <ArrowRight 
                        size={16} 
                        className="text-slate-500 transition-all duration-300 group-hover:text-purple-400 group-hover:translate-x-1" 
                      />
                    </div>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {tenants.length === 0 && (
        <EmptyState
          icon={Building2}
          title={t('dashboard.noTenantsYet')}
          description={t('dashboard.getStartedTenant')}
          action={{
            label: t('dashboard.createTenant'),
            onClick: () => navigate('/tenants'),
            icon: <Plus size={18} />,
          }}
          color="purple"
        />
      )}
    </div>
  );
};

export default Dashboard;
