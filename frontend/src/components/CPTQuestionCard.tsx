import React from 'react';
import { motion } from 'framer-motion';

export interface LotteryRow {
  sureAmount: number;
  gamble: string;
}

interface CPTQuestionCardProps {
  questionId: string;
  rows: LotteryRow[];
  selectedValues: Record<number, 'A' | 'B'>;
  onSelect: (rowIndex: number, choice: 'A' | 'B') => void;
}

const CPTQuestionCard: React.FC<CPTQuestionCardProps> = ({ rows, selectedValues, onSelect }) => {
  return (
    <div className="w-full mt-6 space-y-4">
      {/* Desktop Headers */}
      <div className="hidden md:flex bg-slate-50 border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="flex-1 py-4 px-6 font-semibold text-slate-700 text-center border-r border-slate-200">Option A (Sure Amount)</div>
        <div className="flex-1 py-4 px-6 font-semibold text-slate-700 text-center">Option B (Gamble)</div>
      </div>

      {rows.map((row, index) => {
        const selected = selectedValues[index];
        return (
          <div key={index} className="flex flex-col md:flex-row bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:border-blue-200 hover:shadow-md transition-all">
            {/* Option A */}
            <div className={`flex-1 p-5 md:p-6 border-b md:border-b-0 md:border-r border-slate-100 flex flex-col justify-center transition-colors ${selected === 'A' ? 'bg-blue-50/30' : ''}`}>
              <div className="text-center text-sm font-semibold text-slate-500 mb-3 md:hidden uppercase tracking-wider">Option A (Sure Amount)</div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSelect(index, 'A')}
                className={`w-full max-w-sm mx-auto py-4 px-6 rounded-xl font-bold border-2 transition-all ${
                  selected === 'A'
                    ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-sm ring-2 ring-blue-500/20'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-blue-300 hover:bg-blue-50/50'
                }`}
              >
                {row.sureAmount < 0 
                  ? `Accept a sure loss of ${Math.abs(row.sureAmount).toLocaleString()} UZS` 
                  : `Take ${row.sureAmount.toLocaleString()} UZS for sure`}
              </motion.button>
            </div>
            
            {/* Option B */}
            <div className={`flex-1 p-5 md:p-6 flex flex-col justify-center transition-colors ${selected === 'B' ? 'bg-amber-50/30' : ''}`}>
              <div className="text-center text-sm font-semibold text-slate-500 mb-3 md:hidden uppercase tracking-wider">Option B (Gamble)</div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSelect(index, 'B')}
                className={`w-full max-w-sm mx-auto py-4 px-6 rounded-xl font-bold border-2 transition-all ${
                  selected === 'B'
                    ? 'bg-amber-50 border-amber-500 text-amber-700 shadow-sm ring-2 ring-amber-500/20'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-amber-300 hover:bg-amber-50/50'
                }`}
              >
                Take the gamble: {row.gamble}
              </motion.button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CPTQuestionCard;
