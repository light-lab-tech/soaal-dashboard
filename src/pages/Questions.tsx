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
} from 'lucide-react';

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
      // Only pass status filter if it's not 'all'
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
      
      // Remove the question from the list
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'answered':
        return <CheckCircle2 size={14} className="text-emerald-400" />;
      case 'pending':
      default:
        return <Clock size={14} className="text-amber-400" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="glass-card flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
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
            {t('questions.title')} - {tenant?.name}
          </h1>
          <p className="text-sm text-glass-textSecondary">
            {questions.filter(q => q.status === 'pending').length} {t('questions.pendingCount')}
          </p>
        </div>

        {/* Filter */}
        <div className="glass px-3 py-1.5 rounded-full flex items-center gap-1.5">
          {(['all', 'pending', 'answered'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                statusFilter === filter
                  ? 'bg-amber-500 text-white'
                  : 'text-glass-text hover:text-white'
              }`}
            >
              {t(`questions.${filter}`)}
            </button>
          ))}
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="glass-card p-4 border-red-500/30 bg-red-500/10">
          <div className="flex items-center gap-2 text-red-400">
            <X size={16} />
            <span className="text-sm font-medium">{t('questions.error')}: {error}</span>
          </div>
          <button
            onClick={loadData}
            className="mt-3 glass-button-secondary px-3 py-1.5 rounded-lg text-xs"
          >
            {t('questions.tryAgain')}
          </button>
        </div>
      )}

      {/* Questions Grid */}
      {!error && questions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {questions.map((question) => (
            <div
              key={question.id}
              onClick={() => question.status === 'pending' && setSelectedQuestion(question)}
              className={`glass-card group hover:scale-[1.02] transition-all duration-200 p-4 ${
                question.status === 'answered' ? 'opacity-60 cursor-default' : 'cursor-pointer'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-[#8B00E8] to-[#7C3AED]">
                  <MessageSquare size={16} className="text-white" />
                </div>
                <div className="flex items-center gap-1.5">
                  {getStatusIcon(question.status)}
                  <span className={`text-[10px] font-medium ${
                    question.status === 'answered' ? 'text-emerald-400' : 'text-amber-400'
                  }`}>
                    {question.status}
                  </span>
                </div>
              </div>

              <h3 className="text-sm font-medium text-white mb-2 line-clamp-3">
                {question.question}
              </h3>

              <div className="text-[10px] text-glass-textSecondary mb-3">
                {new Date(question.created_at).toLocaleString()}
              </div>

              {question.status === 'pending' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedQuestion(question);
                  }}
                  className="w-full glass-button px-3 py-1.5 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5"
                >
                  <Send size={14} />
                  {t('questions.answerQuestion')}
                </button>
              )}
            </div>
          ))}
        </div>
      ) : !error && (
        <div className="glass-card p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#8B00E8]/20 via-[#A855F7]/20 to-[#7C3AED]/20 flex items-center justify-center">
            <MessageSquare size={28} className="text-[#8B00E8]" />
          </div>
          <h3 className="text-base font-semibold text-white mb-1">
            {statusFilter === 'pending' ? t('questions.noPendingQuestions') : 
             statusFilter === 'answered' ? t('questions.noAnsweredQuestions') : 
             t('questions.noQuestionsYet')}
          </h3>
          <p className="text-sm text-glass-textSecondary mb-4">
            {statusFilter === 'pending'
              ? t('questions.allAnswered')
              : statusFilter === 'answered'
              ? t('questions.noAnsweredYet')
              : t('questions.questionsWillAppear')}
          </p>
          {statusFilter !== 'all' && (
            <button
              onClick={() => setStatusFilter('all')}
              className="glass-button-secondary px-4 py-2 rounded-lg text-xs font-medium"
            >
              {t('questions.viewAllQuestions')}
            </button>
          )}
        </div>
      )}

      {/* Answer Modal */}
      {selectedQuestion && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-strong w-full max-w-lg max-h-[90vh] overflow-y-auto p-5 rounded-xl scrollbar-glass">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">{t('questions.answerQuestion')}</h2>
              <button
                onClick={handleCloseModal}
                className="p-1.5 rounded-lg glass-button-secondary"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmitAnswer} className="space-y-4">
              {/* Question */}
              <div className="glass-card p-3">
                <label className="block text-xs font-medium text-glass-text mb-1.5">
                  {t('questions.question')}
                </label>
                <p className="text-sm text-white">{selectedQuestion.question}</p>
              </div>

              {/* Answer */}
              <div>
                <label className="block text-xs font-medium text-glass-text mb-1.5">
                  {t('questions.answer')}
                </label>
                <textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  className="glass-input w-full px-3 py-2 rounded-lg min-h-[120px] resize-none text-sm"
                  placeholder={t('questions.enterAnswer')}
                  required
                />
              </div>

              {/* FAQ Toggle */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsFaq(!isFaq)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all ${
                    isFaq
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'glass-button-secondary'
                  }`}
                >
                  <Star size={14} className={isFaq ? 'fill-current' : ''} />
                  {t('questions.markAsFaq')}
                </button>
                <p className="text-[10px] text-glass-textSecondary">
                  {t('questions.prioritizeForSimilar')}
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 glass-button-secondary px-4 py-2 rounded-lg text-sm"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !answer.trim()}
                  className="flex-1 glass-button px-4 py-2 rounded-lg text-sm flex items-center justify-center gap-1.5"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      {t('common.loading')}
                    </>
                  ) : (
                    <>
                      <Send size={14} />
                      {t('questions.submitAnswer')}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Questions;
