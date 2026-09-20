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
const QUESTIONS_CACHE_KEY = 'survey_questions_cache_v6';


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
          data.forEach((q: any) => {
            if (q.type === 'lottery' && Array.isArray(q.options) && q.options.length > 0) {
              const groups: Record<string, any[]> = {};
              const validOptions = q.options.filter((opt: any) => typeof opt === 'object' && opt.sureAmount != null);
              
              if (validOptions.length > 0) {
                validOptions.forEach((opt: any) => {
                  let groupName = 'Tasks';
                  if (opt.title) {
                    const match = opt.title.match(/^[a-zA-Z]+[0-9]+/);
                    if (match) groupName = match[0];
                  }
                  if (!groups[groupName]) groups[groupName] = [];
                  groups[groupName].push(opt);
                });
              }
              
              const groupNames = Object.keys(groups);
              if (groupNames.length <= 1) {
                if (validOptions.length > 0) {
                  allQuestions.push({
                    id: String(q.id),
                    type: q.type,
                    text: toStableString(q.question_text),
                    block_name: toStableString(q.block_name),
                    options: validOptions, // Use validOptions here
                    required: Boolean(q.required),
                    dependsOn: q.conditional_logic
                  });
                }
              } else {
                groupNames.forEach(groupName => {
                  allQuestions.push({
                    id: `${q.id}__${groupName}`,
                    originalId: String(q.id),
                    type: q.type,
                    text: toStableString(q.question_text),
                    block_name: `${toStableString(q.block_name)} - ${groupName}`,
                    options: groups[groupName],
                    required: Boolean(q.required),
                    dependsOn: q.conditional_logic
                  });
                });
              }
            } else {
              allQuestions.push({
                id: String(q.id),
                type: q.type,
                text: toStableString(q.question_text),
                block_name: toStableString(q.block_name),
                options: q.options,
                required: Boolean(q.required),
                dependsOn: q.conditional_logic
              });
            }
          });
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
      const finalAnswers = { ...answers };
      questions.forEach(q => {
        if (q.type === 'slider' && finalAnswers[q.id] === undefined) {
          const min = (q.options as any)?.min || 0;
          const max = (q.options as any)?.max || 100;
          finalAnswers[q.id] = (min + max) / 2;
        }
      });

      // Merge split lottery questions back into their original IDs in correct order
      const mergedAnswers: Record<string, any> = {};
      
      // First, copy non-split answers
      Object.keys(finalAnswers).forEach(key => {
        const question = questions.find(q => q.id === key);
        if (!question || !question.originalId) {
          mergedAnswers[key] = finalAnswers[key];
        }
      });

      // Then, merge split lottery answers in the exact order of the 'questions' array
      questions.forEach(question => {
        if (question.originalId) {
          const originalId = question.originalId;
          const key = question.id;
          
          if (!mergedAnswers[originalId]) {
            mergedAnswers[originalId] = {
              type: 'lottery_response',
              choices: [],
              selectedValues: {},
              rows: []
            };
          }
          const lotAns = finalAnswers[key] as any;
          if (lotAns && lotAns.rows) {
            const startIndex = mergedAnswers[originalId].rows.length;
            mergedAnswers[originalId].rows.push(...lotAns.rows);
            if (lotAns.choices) {
              mergedAnswers[originalId].choices.push(...lotAns.choices);
            }
            if (lotAns.selectedValues) {
              Object.keys(lotAns.selectedValues).forEach(k => {
                mergedAnswers[originalId].selectedValues[startIndex + parseInt(k)] = lotAns.selectedValues[k];
              });
            }
          }
        }
      });

      await apiFetch('/responses', {
        method: 'POST',
        body: JSON.stringify({ userId: sessionId, answers: mergedAnswers })
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
