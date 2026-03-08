import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../services/api';
import type { PendingQuestion, Tenant } from '../types';
import {
  MessageSquare,
  Send,
  CheckCircle2,
  Clock,
  Star,
  X,
  Filter,
} from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { AnimatedButton } from '../components/ui/AnimatedButton';
import { EmptyState } from '../components/ui/EmptyState';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';

const Questions: React.FC = () => {
  const { t } = useTranslation();
  const { tenantId } = useParams<{ tenantId: string }>();
  const [questions, setQuestions] = useState<PendingQuestion[]>([]);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<PendingQuestion | null>(null);
  const [answer, setAnswer] = useState('');
  const [isFaq, setIsFaq] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'answered'>('all');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!tenantId) return;
    loadData();
  }, [tenantId, statusFilter]);

  const loadData = async () => {
    if (!tenantId) return;
    try {
      setIsLoading(true);
      setError(null);
      const params = statusFilter !== 'all' ? { status: statusFilter } : undefined;
      const [questionsResponse, tenantResponse] = await Promise.all([
        api.getPendingQuestions(tenantId, params),
        api.getTenant(tenantId),
      ]);
      setQuestions(questionsResponse.data?.questions || []);
      setTenant(tenantResponse.data?.tenant || null);
    } catch (error: any) {
      console.error('Error loading questions:', error);
      setError(error?.response?.data?.message || error?.message || 'Failed to load questions');
      setQuestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantId || !selectedQuestion || !answer.trim()) return;

    try {
      setIsSubmitting(true);
      await api.submitAnswer(tenantId, selectedQuestion.id, {
        answer: answer.trim(),
        is_faq: isFaq,
      });
      
      setQuestions(questions.filter(q => q.id !== selectedQuestion.id));
      setSelectedQuestion(null);
      setAnswer('');
      setIsFaq(false);
    } catch (error) {
      console.error('Error submitting answer:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setSelectedQuestion(null);
    setAnswer('');
    setIsFaq(false);
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'answered':
        return { icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10', badge: 'success' as const };
      case 'pending':
      default:
        return { icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10', badge: 'warning' as const };
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-page-enter">
        <div className="h-8 w-64 bg-slate-800/50 rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 bg-slate-800/50 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const pendingCount = questions.filter(q => q.status === 'pending').length;

  return (
    <div className="space-y-6 animate-page-enter">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">
            {t('questions.title')}
          </h1>
          <p className="text-slate-400">
            {tenant?.name} • {pendingCount} pending
          </p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2 bg-slate-800/50 rounded-full p-1">
          <Filter size={14} className="ml-3 text-slate-500" />
          {(['all', 'pending', 'answered'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`
                px-4 py-2 rounded-full text-sm font-medium transition-all duration-300
                ${statusFilter === filter
                  ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/25'
                  : 'text-slate-400 hover:text-white'}
              `}
            >
              {t(`questions.${filter}`)}
              {filter === 'pending' && pendingCount > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 text-xs bg-amber-500 text-white rounded-full">
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Error State */}
      {error && (
        <GlassCard variant="outlined" className="p-4 border-red-500/30">
          <div className="flex items-center gap-2 text-red-400">
            <X size={18} />
            <span className="font-medium">{t('questions.error')}: {error}</span>
          </div>
          <AnimatedButton
            variant="secondary"
            size="sm"
            onClick={loadData}
            className="mt-3"
          >
            {t('questions.tryAgain')}
          </AnimatedButton>
        </GlassCard>
      )}

      {/* Questions Grid */}
      {!error && questions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
          {questions.map((question, index) => {
            const config = getStatusConfig(question.status);

            
            return (
              <GlassCard
                key={question.id}
                variant={question.status === 'pending' ? 'interactive' : 'default'}
                hover={question.status === 'pending' ? 'lift' : 'none'}
                onClick={() => question.status === 'pending' && setSelectedQuestion(question)}
                className={`group ${question.status === 'answered' ? 'opacity-60' : 'cursor-pointer'}`}
                animate
              >
                <div className="p-5" style={{ animationDelay: `${index * 50}ms` }}>
                  <div className="flex items-start justify-between mb-4">
                    <div className={`
                      p-3 rounded-xl 
                      ${question.status === 'pending' 
                        ? 'bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg shadow-purple-500/20' 
                        : 'bg-slate-700/50'}
                    `}>
                      <MessageSquare size={20} className="text-white" />
                    </div>
                    <Badge 
                      variant={config.badge}
                      size="sm"
                      dot={question.status === 'pending'}
                      pulse={question.status === 'pending'}
                    >
                      {question.status}
                    </Badge>
                  </div>

                  <h3 className="font-medium text-white mb-3 line-clamp-3 leading-relaxed">
                    {question.question}
                  </h3>

                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Clock size={12} />
                    {new Date(question.created_at).toLocaleString()}
                  </div>

                  {question.status === 'pending' && (
                    <div className="mt-4 pt-4 border-t border-slate-700/50">
                      <button
                        onClick={() => setSelectedQuestion(question)}
                        className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 
                                 text-white text-sm font-medium flex items-center justify-center gap-2
                                 hover:from-purple-500 hover:to-purple-600 transition-all
                                 shadow-lg shadow-purple-500/25"
                      >
                        <Send size={14} />
                        {t('questions.answerQuestion')}
                      </button>
                    </div>
                  )}
                </div>
              </GlassCard>
            );
          })}
        </div>
      ) : !error && (
        <EmptyState
          icon={MessageSquare}
          title={
            statusFilter === 'pending' ? t('questions.noPendingQuestions') : 
            statusFilter === 'answered' ? t('questions.noAnsweredQuestions') : 
            t('questions.noQuestionsYet')
          }
          description={
            statusFilter === 'pending'
              ? t('questions.allAnswered')
              : statusFilter === 'answered'
              ? t('questions.noAnsweredYet')
              : t('questions.questionsWillAppear')
          }
          color="purple"
        />
      )}

      {/* Answer Modal */}
      <Modal
        isOpen={!!selectedQuestion}
        onClose={handleCloseModal}
        title={t('questions.answerQuestion')}
        size="lg"
        footer={(close) => (
          <>
            <AnimatedButton
              variant="ghost"
              onClick={() => {
                close();
                handleCloseModal();
              }}
              fullWidth
            >
              {t('common.cancel')}
            </AnimatedButton>
            <AnimatedButton
              type="submit"
              variant="gradient"
              isLoading={isSubmitting}
              isDisabled={!answer.trim()}
              fullWidth
              icon={<Send size={16} />}
            >
              {t('questions.submitAnswer')}
            </AnimatedButton>
          </>
        )}
      >
        <form onSubmit={handleSubmitAnswer} className="space-y-4">
          {/* Question */}
          <GlassCard variant="outlined" className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare size={16} className="text-purple-400" />
              <span className="text-sm font-medium text-slate-300">
                {t('questions.question')}
              </span>
            </div>
            <p className="text-white leading-relaxed">{selectedQuestion?.question}</p>
          </GlassCard>

          {/* Answer */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              {t('questions.answer')}
            </label>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700/50 
                       text-white placeholder-slate-500 min-h-[140px] resize-none
                       focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 
                       outline-none transition-all duration-300"
              placeholder={t('questions.enterAnswer')}
              required
            />
          </div>

          {/* FAQ Toggle */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsFaq(!isFaq)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all
                ${isFaq
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:text-white'}
              `}
            >
              <Star size={16} className={isFaq ? 'fill-current' : ''} />
              {t('questions.markAsFaq')}
            </button>
            <p className="text-xs text-slate-500">
              {t('questions.prioritizeForSimilar')}
            </p>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Questions;
