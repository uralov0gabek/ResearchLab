import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft, CheckCircle, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiFetch } from '../services/api/apiClient';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CPTQuestionCard, { type LotteryRow } from '../components/CPTQuestionCard';

type QuestionType = 'short_text' | 'single_choice' | 'multiple_choice' | 'number_input' | 'lottery';

interface Question {
  id: string;
  type: QuestionType;
  text: string;
  block_name: string;
  options?: any;
  dependsOn?: {
    questionId: string;
    expectedValue: string;
  };
}

const STORAGE_KEY = 'survey_session_data';

const PublicSurvey: React.FC = () => {
  const [sessionId, setSessionId] = useState<string>('');
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setIsLoading(true);
        const data = await apiFetch('/questions').catch(() => []);
        
        let allQuestions: Question[] = [];
        if (Array.isArray(data)) {
          allQuestions = data.map((q: any) => ({
            id: String(q.id),
            type: q.type as QuestionType,
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

  useEffect(() => {
    if (sessionId) { 
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

  const handleAnswerChange = (questionId: string, value: any) => {
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
        body: JSON.stringify({ userId: sessionId, answers })
      });

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

  let isCurrentAnswerValid = false;
  let validationError = '';
  const answer = answers[question?.id];
  
  if (question?.type === 'short_text') {
    isCurrentAnswerValid = typeof answer === 'string' && answer.trim().length > 0;
  } else if (question?.type === 'number_input') {
    isCurrentAnswerValid = typeof answer === 'string' && answer.trim().length > 0;
  } else if (question?.type === 'single_choice') {
    isCurrentAnswerValid = !!answer;
  } else if (question?.type === 'multiple_choice') {
    isCurrentAnswerValid = Array.isArray(answer) && answer.length > 0;
  } else if (question?.type === 'lottery') {
    // For lottery, must select A or B for all rows
    if (answer && answer.choices) {
      const rows = question.options as LotteryRow[];
      isCurrentAnswerValid = rows.length > 0 && answer.choices.length === rows.length && answer.choices.every((c: any) => c === 'A' || c === 'B');
    }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 text-gray-800 font-sans">
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
              className="inline-flex justify-center items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
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
      <div className="min-h-screen flex flex-col bg-slate-50 text-gray-800 font-sans">
        <Navbar />
        <main className="flex-grow flex items-center justify-center p-4">
          <div className="flex flex-col items-center">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
            <p className="text-gray-500 font-medium">Loading survey...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 text-gray-800 font-sans">
        <Navbar />
        <main className="flex-grow flex items-center justify-center p-4">
          <div className="text-center bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-md">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">No Survey Available</h2>
            <p className="text-gray-600 mb-6">There are currently no published questions. Please check back later.</p>
            <button onClick={() => navigate('/')} className="px-6 py-2 bg-blue-600 text-white rounded-lg">Return Home</button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-gray-800 font-sans">
      <Navbar />
      
      <main className="flex-grow flex flex-col pt-24 pb-12 px-2 sm:px-6 lg:px-8">
        <div className="w-11/12 md:w-full max-w-4xl mx-auto flex-grow flex flex-col mt-8">
          
          <div className="mb-10">
            <div className="flex justify-between items-center mb-2">
              <div className="flex justify-between w-full text-sm font-medium text-gray-500 mr-4">
                <span>{question.block_name}</span>
                <span>Question {currentStep + 1} of {visibleQuestions.length} ({Math.round(((currentStep + 1) / visibleQuestions.length) * 100)}% completed)</span>
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
                className="h-full bg-blue-500 transition-all duration-300 ease-out rounded-full"
                style={{ width: `${((currentStep + 1) / visibleQuestions.length) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-white p-8 sm:p-12 rounded-3xl shadow-sm border border-slate-200 flex-grow flex flex-col relative overflow-hidden">
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
                        className="w-full text-xl p-4 border-b-2 border-gray-200 focus:border-blue-500 outline-none bg-transparent transition-colors"
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
                        className="w-full text-xl p-4 border-b-2 border-gray-200 focus:border-blue-500 outline-none bg-transparent transition-colors"
                        placeholder="Type your number here..."
                        autoFocus
                      />
                      {validationError && (
                        <p className="text-red-500 text-sm mt-2">{validationError}</p>
                      )}
                    </div>
                  )}

                  {question.type === 'lottery' && question.options && (
                    <CPTQuestionCard
                      questionId={question.id}
                      rows={question.options as LotteryRow[]}
                      selectedValues={answer?.selectedValues || {}}
                      onSelect={(rowIndex, choice) => {
                        const currentChoices = answer?.choices ? [...answer.choices] : new Array(question.options.length).fill(null);
                        const currentSelectedValues = answer?.selectedValues ? { ...answer.selectedValues } : {};
                        
                        currentChoices[rowIndex] = choice;
                        currentSelectedValues[rowIndex] = choice;

                        handleAnswerChange(question.id, {
                          type: 'lottery_response',
                          choices: currentChoices,
                          selectedValues: currentSelectedValues,
                          rows: question.options
                        });
                      }}
                    />
                  )}

                  {question.type === 'single_choice' && question.options && (
                    <div className="space-y-3">
                      {question.options.map((option: string, idx: number) => {
                        const isSelected = answers[question.id] === option;
                        return (
                          <label 
                            key={idx} 
                            className={`block p-4 rounded-xl border-2 cursor-pointer transition-all ${
                              isSelected 
                                ? 'border-blue-500 bg-blue-50/50 ring-1 ring-blue-500' 
                                : 'border-gray-100 hover:border-blue-200'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                isSelected ? 'border-blue-500' : 'border-gray-300'
                              }`}>
                                {isSelected && <div className="w-2.5 h-2.5 bg-blue-500 rounded-full"></div>}
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
                      {question.options.map((option: string, idx: number) => {
                        const currentAnswers = (answers[question.id] as string[]) || [];
                        const isChecked = currentAnswers.includes(option);
                        return (
                          <label 
                            key={idx} 
                            className={`block p-4 rounded-xl border-2 cursor-pointer transition-all ${
                              isChecked 
                                ? 'border-blue-500 bg-blue-50/50 ring-1 ring-blue-500' 
                                : 'border-gray-100 hover:border-blue-200'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                                isChecked ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
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

            <div className="mt-12 pt-6 border-t border-slate-100 flex items-center justify-between relative z-10">
              <button
                onClick={handleBack}
                disabled={currentStep === 0}
                className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors ${
                  currentStep === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-slate-600 hover:bg-slate-100'
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
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-slate-200 text-slate-400 opacity-50 cursor-not-allowed'
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
                        ? 'bg-slate-200 text-slate-400 opacity-50 cursor-not-allowed'
                        : 'bg-green-600 text-white hover:bg-green-700'
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
