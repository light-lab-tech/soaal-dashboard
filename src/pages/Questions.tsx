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
      const [questionsResponse, tenantResponse] = await Promise.all([
        api.getPendingQuestions(tenantId, { status: statusFilter }),
        api.getTenant(tenantId),
      ]);
      setQuestions(questionsResponse.data.questions);
      setTenant(tenantResponse.data.tenant);
    } catch (error) {
      console.error('Error loading questions:', error);
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
        return <CheckCircle2 size={18} className="text-emerald-400" />;
      case 'pending':
      default:
        return <Clock size={18} className="text-amber-400" />;
    }
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            {t('questions.title')} - {tenant?.name}
          </h1>
          <p className="text-glass-textSecondary">
            {questions.filter(q => q.status === 'pending').length} pending questions
          </p>
        </div>

        {/* Filter */}
        <div className="glass px-4 py-2 rounded-full flex items-center gap-2">
          {(['all', 'pending', 'answered'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-4 py-1 rounded-full text-sm font-medium transition-all ${
                statusFilter === filter
                  ? 'bg-primary-500 text-white'
                  : 'text-glass-text hover:text-white'
              }`}
            >
              {t(`questions.${filter}`)}
            </button>
          ))}
        </div>
      </div>

      {/* Questions Grid */}
      {questions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {questions.map((question) => (
            <div
              key={question.id}
              onClick={() => question.status === 'pending' && setSelectedQuestion(question)}
              className={`glass-card group hover:scale-105 transition-all duration-300 ${
                question.status === 'answered' ? 'opacity-60 cursor-default' : 'cursor-pointer'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600">
                  <MessageSquare size={24} className="text-white" />
                </div>
                {getStatusIcon(question.status)}
              </div>

              <h3 className="text-lg font-semibold text-white mb-2 line-clamp-3">
                {question.question}
              </h3>

              <div className="text-xs text-glass-textSecondary mb-4">
                {new Date(question.created_at).toLocaleString()}
              </div>

              {question.status === 'pending' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedQuestion(question);
                  }}
                  className="w-full glass-button px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2"
                >
                  <Send size={16} />
                  {t('questions.answerQuestion')}
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card p-12 text-center">
          <MessageSquare size={64} className="mx-auto mb-4 text-glass-textSecondary" />
          <h3 className="text-xl font-semibold text-white mb-2">No questions</h3>
          <p className="text-glass-textSecondary">
            {statusFilter === 'pending'
              ? 'No pending questions to answer'
              : 'No questions found'}
          </p>
        </div>
      )}

      {/* Answer Modal */}
      {selectedQuestion && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-strong w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 rounded-2xl scrollbar-glass">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">{t('questions.answerQuestion')}</h2>
              <button
                onClick={handleCloseModal}
                className="p-2 rounded-lg glass-button-secondary"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitAnswer} className="space-y-6">
              {/* Question */}
              <div className="glass-card p-4">
                <label className="block text-sm font-medium text-glass-text mb-2">
                  {t('questions.question')}
                </label>
                <p className="text-white">{selectedQuestion.question}</p>
              </div>

              {/* Answer */}
              <div>
                <label className="block text-sm font-medium text-glass-text mb-2">
                  {t('questions.answer')}
                </label>
                <textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  className="glass-input w-full px-4 py-3 rounded-xl min-h-[150px] resize-none"
                  placeholder="Enter your answer..."
                  required
                />
              </div>

              {/* FAQ Toggle */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsFaq(!isFaq)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    isFaq
                      ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                      : 'glass-button-secondary'
                  }`}
                >
                  <Star size={18} className={isFaq ? 'fill-current' : ''} />
                  {t('questions.markAsFaq')}
                </button>
                <p className="text-xs text-glass-textSecondary">
                  Mark as FAQ to prioritize this answer for similar questions
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 glass-button-secondary px-6 py-3 rounded-xl"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !answer.trim()}
                  className="flex-1 glass-button px-6 py-3 rounded-xl flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      {t('common.loading')}
                    </>
                  ) : (
                    <>
                      <Send size={20} />
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
