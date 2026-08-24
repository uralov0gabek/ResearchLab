import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft, CheckCircle, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiFetch } from '../services/api/apiClient';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CPTQuestionCard from '../components/CPTQuestionCard';

// Mock Data
type QuestionType = 'short_text' | 'single_choice' | 'multiple_choice' | 'number_input' | 'cpt_task';

interface Question {
  id: string;
  type: QuestionType;
  text: string;
  options?: string[];
  dependsOn?: {
    questionId: string;
    expectedValue: string;
  };
  cptData?: {
    sureAmount: number;
    gambleAmount1: number;
    prob1: number;
    gambleAmount2: number;
    prob2: number;
  };
}

// MOCK_QUESTIONS removed, using Supabase

const STORAGE_KEY = 'survey_session_data';

const PublicSurvey: React.FC = () => {
  const [sessionId, setSessionId] = useState<string>('');
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | number | string[]>>({});
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Fetch questions from Supabase
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setIsLoading(true);
        const [questionsData, cptTasksData] = await Promise.all([
          apiFetch('/questions').catch(() => []),
          apiFetch('/cpt-tasks').catch(() => [])
        ]);
        
        let allQuestions: Question[] = [];

        if (Array.isArray(questionsData)) {
          const mappedData = questionsData.map((q: Record<string, unknown>) => ({
            ...(q as any),
            text: String(q.title || q.text || '')
          })) as Question[];
          allQuestions = [...allQuestions, ...mappedData];
        }

        if (Array.isArray(cptTasksData)) {
          const mappedCpt = cptTasksData.map((task: Record<string, unknown>) => ({
            id: `cpt_${task.id}`,
            type: 'cpt_task' as QuestionType,
            text: String(task.title),
            cptData: {
              sureAmount: Number(task.sure_amount),
              gambleAmount1: Number(task.gamble_a_amount),
              prob1: Number(task.gamble_a_prob),
              gambleAmount2: Number(task.gamble_b_amount),
              prob2: Number(task.gamble_b_prob),
            }
          }));
          allQuestions = [...allQuestions, ...mappedCpt];
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

  // Load state from sessionStorage
  useEffect(() => {
    const cached = sessionStorage.getItem(STORAGE_KEY);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
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

  // Save state to sessionStorage
  useEffect(() => {
    if (sessionId) { // Only save once sessionId is initialized
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
        sessionId,
        currentStep,
        answers
      }));
    }
  }, [sessionId, currentStep, answers]);

  const handleExit = () => {
    sessionStorage.removeItem(STORAGE_KEY);
    navigate('/');
  };

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

  const handleAnswerChange = (questionId: string, value: string | number | string[]) => {
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

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await apiFetch('/responses', {
        method: 'POST',
        body: JSON.stringify({ sessionId, answers })
      });

      // Success
      sessionStorage.removeItem(STORAGE_KEY);
      setIsSubmitted(true);
    } catch (err: unknown) {
      console.error('Submit error:', err);
      setSubmitError(err instanceof Error ? err.message : 'Failed to submit survey. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const question = visibleQuestions[currentStep];

  // Validation
  let isCurrentAnswerValid = false;
  let validationError = '';
  const answer = answers[question?.id];
  
  if (question?.type === 'short_text') {
    isCurrentAnswerValid = typeof answer === 'string' && answer.trim().length > 0;
  } else if (question?.type === 'number_input') {
    isCurrentAnswerValid = typeof answer === 'string' && answer.trim().length > 0;
    if (isCurrentAnswerValid) {
      const age = parseInt(String(answer), 10);
      if (isNaN(age) || age < 18 || age > 120) {
        isCurrentAnswerValid = false;
        validationError = 'Please enter a valid age between 18 and 120.';
      }
    }
  } else if (question?.type === 'single_choice' || question?.type === 'cpt_task') {
    isCurrentAnswerValid = !!answer;
  } else if (question?.type === 'multiple_choice') {
    isCurrentAnswerValid = Array.isArray(answer) && answer.length > 0;
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FFFDF5] text-gray-800 font-sans">
        <Navbar />
        <main className="flex-grow flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center mt-20"
          >
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Thank You!</h2>
            <p className="text-gray-600 mb-8">
              Your responses have been recorded anonymously. We appreciate your contribution to this research.
            </p>
            <button
              onClick={() => navigate('/')}
              className="inline-flex justify-center items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 text-white font-medium hover:bg-slate-800 transition-colors"
            >
              Return Home
            </button>
          </motion.div>
        </main>
        <Footer />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FFFDF5] text-gray-800 font-sans">
        <Navbar />
        <main className="flex-grow flex items-center justify-center p-4">
          <div className="flex flex-col items-center">
            <Loader2 className="w-12 h-12 text-[#F4C542] animate-spin mb-4" />
            <p className="text-gray-500 font-medium">Loading survey...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FFFDF5] text-gray-800 font-sans">
        <Navbar />
        <main className="flex-grow flex items-center justify-center p-4">
          <div className="text-center bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-md">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">No Survey Available</h2>
            <p className="text-gray-600 mb-6">There are currently no published questions. Please check back later.</p>
            <button onClick={() => navigate('/')} className="px-6 py-2 bg-slate-900 text-white rounded-lg">Return Home</button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFDF5] text-gray-800 font-sans">
      <Navbar />
      
      <main className="flex-grow flex flex-col pt-24 pb-12 px-2 sm:px-6 lg:px-8">
        <div className="w-11/12 md:w-full max-w-3xl mx-auto flex-grow flex flex-col mt-8">
          
          {/* Progress Bar and Header */}
          <div className="mb-10">
            <div className="flex justify-between items-center mb-2">
              <div className="flex justify-between w-full text-sm font-medium text-gray-500 mr-4">
                <span>Question {currentStep + 1} of {visibleQuestions.length}</span>
                <span>{Math.round(((currentStep + 1) / visibleQuestions.length) * 100)}% completed</span>
              </div>
              <button 
                onClick={handleExit}
                className="text-gray-400 hover:text-red-500 transition-colors p-2 -mr-2 rounded-lg hover:bg-red-50 min-h-[44px] min-w-[44px] flex items-center justify-center"
                title="Exit Survey"
              >
                <X size={20} />
              </button>
            </div>
            <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#F4C542] transition-all duration-300 ease-out rounded-full"
                style={{ width: `${((currentStep + 1) / visibleQuestions.length) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Question Card */}
          <div className="bg-white p-8 sm:p-12 rounded-3xl shadow-sm border border-gray-100 flex-grow flex flex-col relative overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="flex-grow flex flex-col w-full h-full"
              >
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-8 leading-snug">
                  {question.text}
                </h2>

                <div className="flex-grow">
                  {question.type === 'short_text' && (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={answers[question.id] || ''}
                        onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                        className="w-full text-xl p-4 border-b-2 border-gray-200 focus:border-[#F4C542] outline-none bg-transparent transition-colors"
                        placeholder="Type your answer here..."
                        autoFocus
                      />
                      {validationError && (
                        <p className="text-red-500 text-sm mt-2">{validationError}</p>
                      )}
                    </div>
                  )}

                  {question.type === 'number_input' && (
                    <div className="space-y-2">
                      <input
                        type="number"
                        value={answers[question.id] || ''}
                        onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                        className="w-full text-xl p-4 border-b-2 border-gray-200 focus:border-[#F4C542] outline-none bg-transparent transition-colors"
                        placeholder="Type your number here..."
                        autoFocus
                      />
                      {validationError && (
                        <p className="text-red-500 text-sm mt-2">{validationError}</p>
                      )}
                    </div>
                  )}

                  {question.type === 'cpt_task' && question.cptData && (
                    <CPTQuestionCard
                      cptData={question.cptData}
                      selectedValue={answers[question.id] as 'A' | 'B' | undefined}
                      onSelect={(choice) => handleAnswerChange(question.id, choice)}
                    />
                  )}

                  {question.type === 'single_choice' && question.options && (
                    <div className="space-y-3">
                      {question.options.map((option, idx) => {
                        const isSelected = answers[question.id] === option;
                        return (
                          <label 
                            key={idx} 
                            className={`block p-4 rounded-xl border-2 cursor-pointer transition-all ${
                              isSelected 
                                ? 'border-[#F4C542] bg-[#F4C542]/10 ring-1 ring-[#F4C542]' 
                                : 'border-gray-100 hover:border-gray-200'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                isSelected ? 'border-[#F4C542]' : 'border-gray-300'
                              }`}>
                                {isSelected && <div className="w-2.5 h-2.5 bg-[#F4C542] rounded-full"></div>}
                              </div>
                              <span className={`text-lg ${isSelected ? 'text-slate-900 font-medium' : 'text-slate-700'}`}>
                                {option}
                              </span>
                            </div>
                            <input 
                              type="radio" 
                              name={question.id} 
                              value={option}
                              className="hidden"
                              checked={isSelected}
                              onChange={() => handleAnswerChange(question.id, option)}
                            />
                          </label>
                        );
                      })}
                    </div>
                  )}

                  {question.type === 'multiple_choice' && question.options && (
                    <div className="space-y-3">
                      {question.options.map((option, idx) => {
                        const currentAnswers = (answers[question.id] as string[]) || [];
                        const isChecked = currentAnswers.includes(option);
                        return (
                          <label 
                            key={idx} 
                            className={`block p-4 rounded-xl border-2 cursor-pointer transition-all ${
                              isChecked 
                                ? 'border-[#F4C542] bg-[#F4C542]/10 ring-1 ring-[#F4C542]' 
                                : 'border-gray-100 hover:border-gray-200'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                                isChecked ? 'border-[#F4C542] bg-[#F4C542]' : 'border-gray-300'
                              }`}>
                                {isChecked && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                              </div>
                              <span className={`text-lg ${isChecked ? 'text-slate-900 font-medium' : 'text-slate-700'}`}>
                                {option}
                              </span>
                            </div>
                            <input 
                              type="checkbox" 
                              className="hidden"
                              checked={isChecked}
                              onChange={(e) => {
                                const currentAnswers = (answers[question.id] as string[]) || [];
                                if (e.target.checked) {
                                  handleAnswerChange(question.id, [...currentAnswers, option]);
                                } else {
                                  handleAnswerChange(question.id, currentAnswers.filter((a: string) => a !== option));
                                }
                              }}
                            />
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="mt-12 pt-6 border-t border-gray-100 flex items-center justify-between relative z-10">
              <button
                onClick={handleBack}
                disabled={currentStep === 0}
                className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors ${
                  currentStep === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-slate-600 hover:bg-gray-100'
                }`}
              >
                <ArrowLeft size={20} />
                Back
              </button>

              {currentStep < visibleQuestions.length - 1 ? (
                <button
                  onClick={handleNext}
                  disabled={!isCurrentAnswerValid}
                  className={`inline-flex items-center gap-2 px-8 py-3 rounded-xl font-bold transition-all shadow-sm ${
                    isCurrentAnswerValid
                      ? 'bg-[#F4C542] text-slate-900 hover:bg-[#e3b632]'
                      : 'bg-gray-200 text-gray-400 opacity-50 cursor-not-allowed'
                  }`}
                >
                  Next
                  <ArrowRight size={20} />
                </button>
              ) : (
                <div className="flex flex-col items-end">
                  <button
                    onClick={handleSubmit}
                    disabled={!isCurrentAnswerValid || isSubmitting}
                    className={`inline-flex items-center gap-2 px-8 py-3 rounded-xl font-bold transition-all shadow-md ${
                      !isCurrentAnswerValid || isSubmitting
                        ? 'bg-gray-200 text-gray-400 opacity-50 cursor-not-allowed'
                        : 'bg-slate-900 text-white hover:bg-slate-800'
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        Submitting...
                        <Loader2 size={20} className="animate-spin" />
                      </>
                    ) : (
                      <>
                        Submit Survey
                        <CheckCircle size={20} />
                      </>
                    )}
                  </button>
                  {submitError && (
                    <p className="text-red-500 text-sm mt-2 absolute top-full mt-2 right-0">{submitError}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default PublicSurvey;
