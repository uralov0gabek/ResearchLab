import React from 'react';
import { CheckCircle } from 'lucide-react';
import type { Question, AnswerValue, LotteryRow } from '../../types';
import CPTQuestionCard from '../CPTQuestionCard';

interface QuestionRendererProps {
  question: Question;
  answer: any;
  validationError: string;
  onAnswerChange: (questionId: string, value: AnswerValue) => void;
}

export const QuestionRenderer: React.FC<QuestionRendererProps> = ({ 
  question, 
  answer, 
  validationError, 
  onAnswerChange 
}) => {
  if (question.type === 'short_text') {
    return (
      <div className="space-y-2">
        <input
          type="text"
          value={(answer as string) || ''}
          onChange={(e) => onAnswerChange(question.id, e.target.value)}
          className="w-full text-xl p-4 border-b-2 border-gray-200 focus:border-blue-500 outline-none bg-transparent transition-colors"
          placeholder="Type your answer here..."
          autoFocus
        />
        {validationError && <p className="text-red-500 text-sm mt-2">{validationError}</p>}
      </div>
    );
  }

  if (question.type === 'number_input') {
    return (
      <div className="space-y-2">
        <input
          type="number"
          value={(answer as string) || ''}
          onChange={(e) => onAnswerChange(question.id, e.target.value)}
          className="w-full text-xl p-4 border-b-2 border-gray-200 focus:border-blue-500 outline-none bg-transparent transition-colors"
          placeholder="Type your number here..."
          autoFocus
        />
        {validationError && <p className="text-red-500 text-sm mt-2">{validationError}</p>}
      </div>
    );
  }

  if (question.type === 'lottery' && question.options) {
    return (
      <CPTQuestionCard
        questionId={question.id}
        rows={question.options as LotteryRow[]}
        selectedValues={answer?.selectedValues || {}}
        onSelect={(rowIndex, choice) => {
          const currentChoices = answer?.choices ? [...answer.choices] : new Array(question.options.length).fill(null);
          const currentSelectedValues = answer?.selectedValues ? { ...answer.selectedValues } : {};
          
          currentChoices[rowIndex] = choice;
          currentSelectedValues[rowIndex] = choice;

          onAnswerChange(question.id, {
            type: 'lottery_response',
            choices: currentChoices,
            selectedValues: currentSelectedValues,
            rows: question.options
          });
        }}
      />
    );
  }

  if (question.type === 'single_choice' && question.options) {
    return (
      <div className="space-y-3">
        {question.options.map((option: string, idx: number) => {
          const isSelected = answer === option;
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
                onChange={() => onAnswerChange(question.id, option)}
              />
            </label>
          );
        })}
      </div>
    );
  }

  if (question.type === 'multiple_choice' && question.options) {
    return (
      <div className="space-y-3">
        {question.options.map((option: string, idx: number) => {
          const currentAnswers = (answer as string[]) || [];
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
                  if (e.target.checked) {
                    onAnswerChange(question.id, [...currentAnswers, option]);
                  } else {
                    onAnswerChange(question.id, currentAnswers.filter((a: string) => a !== option));
                  }
                }}
              />
            </label>
          );
        })}
      </div>
    );
  }

  return null;
};
