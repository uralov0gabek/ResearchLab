import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Question, AnswerValue, SessionData } from '../types';
import { apiFetch } from '../services/api/apiClient';

/**
 * Converts any value (string or {en,ru,uz} object) into a stable string.
 * If it's an object with localized keys, we store the raw JSON so comparisons work.
 * Rendering code uses getLocalizedText to display the correct language.
 */
const toStableString = (val: any): string => {
  if (!val) return '';
  if (typeof val === 'string') return val;
  if (typeof val === 'object') return JSON.stringify(val);
  return String(val);
};

const STORAGE_KEY = 'survey_session_data';
// Versioned cache key — bump version to invalidate old cached question formats
const QUESTIONS_CACHE_KEY = 'survey_questions_cache_v2';


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

        const cachedQuestions = sessionStorage.getItem(QUESTIONS_CACHE_KEY);
        if (cachedQuestions) {
          const parsedCache = JSON.parse(cachedQuestions);
          setQuestions(parsedCache);
          setIsLoading(false);
          return;
        }

        const data = await apiFetch('/questions').catch(() => []);
        
        let allQuestions: Question[] = [];
        if (Array.isArray(data)) {
          allQuestions = data.map((q: any) => ({
            id: String(q.id),
            type: q.type,
            // Always store as stable string — prevents React Error #31 (object rendered as child)
            text: toStableString(q.question_text),
            block_name: toStableString(q.block_name),
            options: q.options,
            required: Boolean(q.required),
            dependsOn: q.conditional_logic
          }));
        }

        sessionStorage.setItem(QUESTIONS_CACHE_KEY, JSON.stringify(allQuestions));
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

  const activeBlocks = useMemo(() => {
    // Only blocks that have AT LEAST ONE visible question
    const blockNames = visibleQuestions.map(q => q.block_name);
    return Array.from(new Set(blockNames));
  }, [visibleQuestions]);

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

  const currentBlockName = activeBlocks[currentStep];
  const currentBlockQuestions = visibleQuestions.filter(q => q.block_name === currentBlockName);

  return {
    sessionId,
    currentStep,
    answers,
    questions,
    visibleQuestions,
    activeBlocks,
    currentBlockName,
    currentBlockQuestions,
    isLoading,
    isSubmitting,
    isSubmitted,
    submitError,
    handleAnswerChange,
    handleNext,
    handleBack,
    handleExit,
    handleSubmit
  };
};
