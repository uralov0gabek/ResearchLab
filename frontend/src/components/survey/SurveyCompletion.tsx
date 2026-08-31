import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import Navbar from '../Navbar';
import Footer from '../Footer';

export const SurveyCompletion: React.FC = () => {
  const navigate = useNavigate();

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
};
