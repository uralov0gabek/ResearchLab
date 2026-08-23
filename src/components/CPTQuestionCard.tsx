import React from 'react';
import { motion } from 'framer-motion';

interface CPTQuestionCardProps {
  cptData: {
    sureAmount: number;
    gambleAmount1: number;
    prob1: number;
    gambleAmount2: number;
    prob2: number;
  };
  selectedValue?: 'A' | 'B';
  onSelect: (choice: 'A' | 'B') => void;
}

const CPTQuestionCard: React.FC<CPTQuestionCardProps> = ({ cptData, selectedValue, onSelect }) => {
  return (
    <div className="flex flex-col sm:flex-row gap-6 w-full mt-6">
      {/* Option A - Safe */}
      <motion.div 
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onSelect('A')}
        className={`flex-1 p-8 rounded-3xl cursor-pointer border-2 transition-all duration-300 flex flex-col items-center justify-center text-center min-h-[240px] relative overflow-hidden ${
          selectedValue === 'A' 
            ? 'border-[#4285F4] bg-[#4285F4]/5 ring-4 ring-[#4285F4]/10 shadow-lg shadow-[#4285F4]/10' 
            : 'border-gray-100 bg-white hover:border-[#4285F4]/30 shadow-sm hover:shadow-md'
        }`}
      >
        {selectedValue === 'A' && (
          <div className="absolute top-4 right-4 w-6 h-6 bg-[#4285F4] rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
        )}
        <div className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Option A</div>
        <div className="text-4xl font-black text-slate-800 mb-3 tracking-tight">
          ${cptData.sureAmount.toLocaleString()}
        </div>
        <div className="px-4 py-1.5 bg-gray-100 text-gray-600 font-semibold rounded-full text-sm">
          100% Guaranteed
        </div>
      </motion.div>

      {/* Option B - Risk */}
      <motion.div 
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onSelect('B')}
        className={`flex-1 p-8 rounded-3xl cursor-pointer border-2 transition-all duration-300 flex flex-col items-center justify-center text-center min-h-[240px] relative overflow-hidden ${
          selectedValue === 'B' 
            ? 'border-[#F4C542] bg-[#F4C542]/10 ring-4 ring-[#F4C542]/20 shadow-lg shadow-[#F4C542]/20' 
            : 'border-gray-100 bg-white hover:border-[#F4C542]/50 shadow-sm hover:shadow-md'
        }`}
      >
        {selectedValue === 'B' && (
          <div className="absolute top-4 right-4 w-6 h-6 bg-[#F4C542] rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
        )}
        <div className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Option B</div>
        <div className="flex flex-col gap-4 w-full px-4">
          <div className="flex items-center justify-between gap-4">
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm font-bold w-16">{cptData.prob1}%</span>
            <span className="text-2xl font-black text-slate-800 tracking-tight">${cptData.gambleAmount1.toLocaleString()}</span>
          </div>
          <div className="h-px w-full bg-gray-100"></div>
          <div className="flex items-center justify-between gap-4">
            <span className="px-3 py-1 bg-red-50 text-red-600 rounded-lg text-sm font-bold w-16">{cptData.prob2}%</span>
            <span className="text-xl font-bold text-slate-500 tracking-tight">${cptData.gambleAmount2.toLocaleString()}</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CPTQuestionCard;
