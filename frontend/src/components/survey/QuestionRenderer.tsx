import React from 'react';
import { CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Question, AnswerValue, LotteryRow } from '../../types';
import CPTQuestionCard from '../CPTQuestionCard';
import { getLocalizedText } from '../../utils/localization';

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
  const { i18n } = useTranslation();
  const lang = i18n.language || 'en';

  if (question.type === 'short_text') {
    return (
      <div className="space-y-2">
        <input
          type="text"
          value={(answer as string) || ''}
          onChange={(e) => onAnswerChange(question.id, e.target.value)}
          className="w-full text-lg md:text-xl p-3 md:p-4 border-b-2 border-gray-200 focus:border-blue-500 outline-none bg-transparent transition-colors"
          placeholder="Type your answer here..."
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
          className="w-full text-lg md:text-xl p-3 md:p-4 border-b-2 border-gray-200 focus:border-blue-500 outline-none bg-transparent transition-colors"
          placeholder="Type your number here..."
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
        {question.options.map((option: any, idx: number) => {
          const optText = getLocalizedText(option, lang);
          const optValue = typeof option === 'string' ? option : JSON.stringify(option);
          const isSelected = typeof answer === 'string' && answer.startsWith('{') 
            ? answer === optValue 
            : answer === option || answer === optText;

          return (
            <label 
              key={idx} 
              className={`block p-3 md:p-4 rounded-xl border-2 cursor-pointer transition-all ${
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
                <span className={`text-base md:text-lg ${isSelected ? 'text-slate-900 font-medium' : 'text-slate-700'}`}>
                  {optText}
                </span>
              </div>
              <input 
                type="radio" 
                name={question.id} 
                value={optValue}
                className="hidden"
                checked={isSelected}
                onChange={() => onAnswerChange(question.id, typeof option === 'string' ? option : optValue)}
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
        {question.options.map((option: any, idx: number) => {
          const optText = getLocalizedText(option, lang);
          const optValue = typeof option === 'string' ? option : JSON.stringify(option);
          const currentAnswers = (answer as string[]) || [];
          const isChecked = currentAnswers.some(a => 
            a === option || a === optText || a === optValue || 
            (typeof a === 'string' && a.startsWith('{') && a === optValue)
          );

          return (
            <label 
              key={idx} 
              className={`block p-3 md:p-4 rounded-xl border-2 cursor-pointer transition-all ${
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
                <span className={`text-base md:text-lg ${isChecked ? 'text-slate-900 font-medium' : 'text-slate-700'}`}>
                  {optText}
                </span>
              </div>
              <input 
                type="checkbox" 
                className="hidden"
                checked={isChecked}
                onChange={(e) => {
                  const valToSave = typeof option === 'string' ? option : optValue;
                  if (e.target.checked) {
                    onAnswerChange(question.id, [...currentAnswers, valToSave]);
                  } else {
                    onAnswerChange(question.id, currentAnswers.filter((a: string) => a !== valToSave && a !== option && a !== optText));
                  }
                }}
              />
            </label>
          );
        })}
      </div>
    );
  }

  if (question.type === 'slider' && question.options) {
    const min = question.options.min || 0;
    const max = question.options.max || 100;
    const step = question.options.step || 1;
    const val = typeof answer === 'number' ? answer : (min + max) / 2;

    return (
      <div className="space-y-6 pt-4">
        <input 
          type="range"
          min={min}
          max={max}
          step={step}
          value={val}
          onChange={(e) => onAnswerChange(question.id, Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#F4C542]"
        />
        <div className="flex justify-between text-sm font-medium text-slate-500">
          <span>{min}</span>
          <span className="text-xl font-bold text-slate-800">{val}</span>
          <span>{max}</span>
        </div>
      </div>
    );
  }

  if (question.type === 'matrix' && question.options?.rows && question.options?.columns) {
    const rows = question.options.rows as any[];
    const cols = question.options.columns as any[];
    const currentAnswers = (answer as Record<string, string>) || {};

    return (
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr>
              <th className="p-3 border-b-2 border-gray-100 bg-slate-50/50"></th>
              {cols.map((c, i) => (
                <th key={i} className="p-3 border-b-2 border-gray-100 text-center font-semibold text-slate-700 bg-slate-50/50 w-32">
                  {getLocalizedText(c, lang)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, rIdx) => {
              const rText = getLocalizedText(r, lang);
              const rValue = typeof r === 'string' ? r : JSON.stringify(r);
              
              return (
                <tr key={rIdx} className="hover:bg-slate-50/30 transition-colors border-b border-gray-100 last:border-b-0">
                  <td className="p-4 font-medium text-slate-800">{rText}</td>
                  {cols.map((c, cIdx) => {
                    const cValue = typeof c === 'string' ? c : JSON.stringify(c);
                    return (
                      <td key={cIdx} className="p-4 text-center">
                        <input
                          type="radio"
                          name={`${question.id}_${rIdx}`}
                          value={cValue}
                          checked={currentAnswers[rValue] === cValue || currentAnswers[rText] === cValue}
                          onChange={() => {
                            onAnswerChange(question.id, {
                              ...currentAnswers,
                              [rValue]: cValue
                            });
                          }}
                          className="w-4 h-4 text-blue-500 focus:ring-blue-500 border-gray-300 cursor-pointer"
                        />
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  return null;
};
