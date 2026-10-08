import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Question, AnswerValue, SessionData } from '../types';
import { apiFetch } from '../services/api/apiClient';
import { normalizeQuestions, getSurveySections, reconcileLotteryAnswers, mergeSurveyAnswers } from '../utils/surveyQuestions';

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

  useEffect(() => {
    let mounted = true;
    sessionStorage.removeItem('survey_questions_cache_v7');
    const fetchQuestions = async () => {
      try {
        const data = await apiFetch('/questions', { cache: 'no-store' });
        if (mounted) setQuestions(normalizeQuestions(Array.isArray(data) ? data : []));
      } catch (error) {
        console.error('Error fetching questions:', error);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    fetchQuestions();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (questions.length) setAnswers(previous => reconcileLotteryAnswers(questions, previous));
  }, [questions]);

  // Initialize or Load Session
  useEffect(() => {
    const cached = sessionStorage.getItem(STORAGE_KEY);
    if (cached) {
      try {
        const parsed: SessionData = JSON.parse(cached);
        setSessionId(parsed.sessionId || crypto.randomUUID());
        setCurrentStep(parsed.currentStep || 0);
        setAnswers(parsed.answers || {});
      } catch {
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

      // Backward compatibility: old single rule format
      if ('questionId' in (q.dependsOn as any)) {
        const dependentAnswer = answers[(q.dependsOn as any).questionId];
        return dependentAnswer === (q.dependsOn as any).expectedValue;
      }

      // New LogicGroup format
      if ('operator' in (q.dependsOn as any) && Array.isArray((q.dependsOn as any).rules)) {
        const group = q.dependsOn as any;
        if (group.rules.length === 0) return true;
        
        const results = group.rules.map((rule: any) => {
          const dependentAnswer = answers[rule.questionId];
          return dependentAnswer === rule.expectedValue;
        });

        if (group.operator === 'OR') {
          return results.some((r: boolean) => r);
        } else {
          return results.every((r: boolean) => r); // Default to AND
        }
      }

      return true;
    });
  }, [answers, questions]);

  const sections = useMemo(() => getSurveySections(visibleQuestions), [visibleQuestions]);
  const activeBlocks = useMemo(() => sections.map(section => section.name), [sections]);

  useEffect(() => {
    if (activeBlocks.length > 0 && currentStep >= activeBlocks.length) {
      setCurrentStep(activeBlocks.length - 1);
    }
  }, [activeBlocks, currentStep]);

  const handleAnswerChange = (questionId: string, value: AnswerValue) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleNext = () => {
    if (currentStep < activeBlocks.length - 1) {
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
      const mergedAnswers = mergeSurveyAnswers(visibleQuestions, answers);
      await apiFetch('/responses', {
        method: 'POST',
        body: JSON.stringify({ userId: sessionId, answers: mergedAnswers }),
      });
      sessionStorage.removeItem(STORAGE_KEY);
      setIsSubmitted(true);
    } catch (error: unknown) {
      console.error('Submit error:', error);
      setSubmitError(error instanceof Error ? error.message : 'Failed to submit survey.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentBlockName = sections[currentStep]?.name || '';
  const currentBlockQuestions = sections[currentStep]?.questions || [];

  return {
    sessionId, currentStep, answers, questions, visibleQuestions,
    activeBlocks, currentBlockName, currentBlockQuestions,
    isLoading, isSubmitting, isSubmitted, submitError,
    handleAnswerChange, handleNext, handleBack, handleExit, handleSubmit,
  };
};
