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
    <div className="w-full mt-6 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="py-4 px-6 font-semibold text-slate-700 w-1/2 text-center">Option A (Sure Amount)</th>
              <th className="py-4 px-6 font-semibold text-slate-700 w-1/2 text-center">Option B (Gamble)</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => {
              const selected = selectedValues[index];
              return (
                <tr key={index} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-6 text-center">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => onSelect(index, 'A')}
                      className={`w-full max-w-sm mx-auto py-3 px-6 rounded-lg font-bold border-2 transition-all ${
                        selected === 'A'
                          ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-sm'
                          : 'bg-white border-slate-200 text-slate-700 hover:border-blue-300'
                      }`}
                    >
                      {row.sureAmount < 0 
                        ? `Accept a sure loss of ${Math.abs(row.sureAmount).toLocaleString()} UZS` 
                        : `Take ${row.sureAmount.toLocaleString()} UZS for sure`}
                    </motion.button>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => onSelect(index, 'B')}
                      className={`w-full max-w-sm mx-auto py-3 px-6 rounded-lg font-bold border-2 transition-all ${
                        selected === 'B'
                          ? 'bg-amber-50 border-amber-500 text-amber-700 shadow-sm'
                          : 'bg-white border-slate-200 text-slate-700 hover:border-amber-300'
                      }`}
                    >
                      Take the gamble: {row.gamble}
                    </motion.button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CPTQuestionCard;
