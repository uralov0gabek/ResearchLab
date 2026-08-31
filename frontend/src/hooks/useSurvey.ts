import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Question, AnswerValue, SessionData } from '../types';
import { apiFetch } from '../services/api/apiClient';

const STORAGE_KEY = 'survey_session_data';

export const useSurvey = () => {
  const navigate = useNavigate();
  const [sessionId, setSessionId] = useState<string>('');
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Fetch Questions
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setIsLoading(true);
        const data = await apiFetch('/questions').catch(() => []);
        
        let allQuestions: Question[] = [];
        if (Array.isArray(data)) {
          allQuestions = data.map((q: any) => ({
            id: String(q.id),
            type: q.type,
            text: q.question_text || '',
            block_name: q.block_name || '',
            options: q.options,
            dependsOn: q.conditional_logic
          }));
        }

        setQuestions(allQuestions);
      } catch (err) {
        console.error('Error fetching questions:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchQuestions();
  }, []);

  // Initialize or Load Session
  useEffect(() => {
    const cached = sessionStorage.getItem(STORAGE_KEY);
    if (cached) {
      try {
        const parsed: SessionData = JSON.parse(cached);
        setSessionId(parsed.sessionId || crypto.randomUUID());
        setCurrentStep(parsed.currentStep || 0);
        setAnswers(parsed.answers || {});
      } catch (e) {
        setSessionId(crypto.randomUUID());
      }
    } else {
      setSessionId(crypto.randomUUID());
    }
  }, []);

  // Sync Session Data
  useEffect(() => {
    if (sessionId) { 
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
        sessionId,
        currentStep,
        answers
      }));
    }
  }, [sessionId, currentStep, answers]);

  // Handle Logic
  const visibleQuestions = useMemo(() => {
    return questions.filter(q => {
      if (!q.dependsOn) return true;
      const dependentAnswer = answers[q.dependsOn.questionId];
      return dependentAnswer === q.dependsOn.expectedValue;
    });
  }, [answers, questions]);

  useEffect(() => {
    if (visibleQuestions.length > 0 && currentStep >= visibleQuestions.length) {
      setCurrentStep(visibleQuestions.length - 1);
    }
  }, [visibleQuestions, currentStep]);

  const handleAnswerChange = (questionId: string, value: AnswerValue) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleNext = () => {
    if (currentStep < visibleQuestions.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleExit = () => {
    sessionStorage.removeItem(STORAGE_KEY);
    navigate('/');
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await apiFetch('/responses', {
        method: 'POST',
        body: JSON.stringify({ userId: sessionId, answers })
      });

      sessionStorage.removeItem(STORAGE_KEY);
      setIsSubmitted(true);
    } catch (err: unknown) {
      console.error('Submit error:', err);
      setSubmitError(err instanceof Error ? err.message : 'Failed to submit survey.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const question = visibleQuestions[currentStep];

  return {
    sessionId,
    currentStep,
    answers,
    questions,
    visibleQuestions,
    isLoading,
    isSubmitting,
    isSubmitted,
    submitError,
    question,
    handleAnswerChange,
    handleNext,
    handleBack,
    handleExit,
    handleSubmit
  };
};
