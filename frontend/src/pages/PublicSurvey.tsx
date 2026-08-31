import React from 'react';
import { ArrowRight, ArrowLeft, CheckCircle, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useSurvey } from '../hooks/useSurvey';
import { SurveyLoader } from '../components/survey/SurveyLoader';
import { SurveyCompletion } from '../components/survey/SurveyCompletion';
import { QuestionRenderer } from '../components/survey/QuestionRenderer';
import type { LotteryRow, LotteryResponse } from '../types';

const PublicSurvey: React.FC = () => {
  const {
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
  } = useSurvey();

  if (isSubmitted) {
    return <SurveyCompletion />;
  }

  if (isLoading) {
    return <SurveyLoader />;
  }

  if (questions.length === 0) {
    return <SurveyLoader isEmpty />;
  }

  let isCurrentAnswerValid = false;
  let validationError = '';
  const answer = answers[question?.id];
  
  if (question?.type === 'short_text' || question?.type === 'number_input') {
    isCurrentAnswerValid = typeof answer === 'string' && answer.trim().length > 0;
  } else if (question?.type === 'single_choice') {
    isCurrentAnswerValid = !!answer;
  } else if (question?.type === 'multiple_choice') {
    isCurrentAnswerValid = Array.isArray(answer) && answer.length > 0;
  } else if (question?.type === 'lottery') {
    if (answer && typeof answer === 'object' && !Array.isArray(answer) && (answer as LotteryResponse).type === 'lottery_response' && (answer as LotteryResponse).choices) {
      const rows = question.options as LotteryRow[];
      const lotteryAnswer = answer as LotteryResponse;
      isCurrentAnswerValid = rows.length > 0 && lotteryAnswer.choices.length === rows.length && lotteryAnswer.choices.every((c: any) => c === 'A' || c === 'B');
    }
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
                  <QuestionRenderer 
                    question={question}
                    answer={answer}
                    validationError={validationError}
                    onAnswerChange={handleAnswerChange}
                  />
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
                    <p className="text-red-500 text-sm mt-2 absolute top-full right-0">{submitError}</p>
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
