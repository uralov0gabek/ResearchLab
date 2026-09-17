import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { getLocalizedText } from '../utils/localization';

export interface LotteryRow {
  sureAmount: number;
  gamble: string;
  title?: string;
  id?: string;
}

interface CPTQuestionCardProps {
  questionId: string;
  rows: LotteryRow[];
  selectedValues: Record<number, 'A' | 'B'>;
  onSelect: (rowIndex: number, choice: 'A' | 'B') => void;
}

const CPTQuestionCard: React.FC<CPTQuestionCardProps> = ({ rows, selectedValues, onSelect }) => {
  const { i18n } = useTranslation();

  // Group rows by prefix (e.g., "G1a" -> "G1")
  const groupedRows: Record<string, { row: LotteryRow; originalIndex: number }[]> = {};
  rows.forEach((row, index) => {
    let group = 'Tasks';
    if (row.title) {
      const match = row.title.match(/^[a-zA-Z]+[0-9]+/);
      if (match) {
        group = match[0];
      }
    }
    if (!groupedRows[group]) {
      groupedRows[group] = [];
    }
    groupedRows[group].push({ row, originalIndex: index });
  });

  return (
    <div className="w-full mt-6 space-y-8">
      {Object.entries(groupedRows).map(([groupName, groupItems]) => (
        <div key={groupName} className="space-y-4">
          {Object.keys(groupedRows).length > 1 && groupName !== 'Tasks' && (
            <h3 className="text-xl font-bold text-slate-800 border-b-2 border-slate-100 pb-2 mb-4">
              {groupName} Group
            </h3>
          )}
          
          {/* Desktop Headers */}
          <div className="hidden md:flex bg-slate-50 border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="flex-1 py-4 px-6 font-semibold text-slate-700 text-center border-r border-slate-200">Option A (Sure Amount)</div>
            <div className="flex-1 py-4 px-6 font-semibold text-slate-700 text-center">Option B (Gamble)</div>
          </div>

          {groupItems.map(({ row, originalIndex }) => {
            const selected = selectedValues[originalIndex];
            return (
              <div key={originalIndex} className="flex flex-col md:flex-row bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:border-blue-200 hover:shadow-md transition-all">
                {/* Option A */}
                <div className={`flex-1 p-5 md:p-6 border-b md:border-b-0 md:border-r border-slate-100 flex flex-col justify-center transition-colors ${selected === 'A' ? 'bg-blue-50/30' : ''}`}>
                  <div className="text-center text-sm font-semibold text-slate-500 mb-3 md:hidden uppercase tracking-wider">Option A (Sure Amount)</div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onSelect(originalIndex, 'A')}
                    className={`w-full max-w-sm mx-auto py-4 px-6 rounded-xl font-bold border-2 transition-all ${
                      selected === 'A'
                        ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-sm ring-2 ring-blue-500/20'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-blue-300 hover:bg-blue-50/50'
                    }`}
                  >
                    {typeof row === 'object' && row.sureAmount != null
                      ? (row.sureAmount < 0 
                          ? `Accept a sure loss of $${Math.abs(row.sureAmount).toLocaleString()}` 
                          : `Take $${row.sureAmount.toLocaleString()} for sure`)
                      : 'Invalid Option'}
                  </motion.button>
                </div>
                
                {/* Option B */}
                <div className={`flex-1 p-5 md:p-6 flex flex-col justify-center transition-colors ${selected === 'B' ? 'bg-amber-50/30' : ''}`}>
                  <div className="text-center text-sm font-semibold text-slate-500 mb-3 md:hidden uppercase tracking-wider">Option B (Gamble)</div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onSelect(originalIndex, 'B')}
                    className={`w-full max-w-sm mx-auto py-4 px-6 rounded-xl font-bold border-2 transition-all ${
                      selected === 'B'
                        ? 'bg-amber-50 border-amber-500 text-amber-700 shadow-sm ring-2 ring-amber-500/20'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-amber-300 hover:bg-amber-50/50'
                    }`}
                  >
                    Take the gamble: {typeof row === 'object' && row.gamble != null ? getLocalizedText(row.gamble, i18n.language || 'en') : 'Invalid Option'}
                  </motion.button>
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default CPTQuestionCard;
