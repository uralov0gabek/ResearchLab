import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import Navbar from '../Navbar';
import Footer from '../Footer';

interface SurveyLoaderProps {
  isEmpty?: boolean;
}

export const SurveyLoader: React.FC<SurveyLoaderProps> = ({ isEmpty = false }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-gray-800 font-sans">
      <Navbar />
      <main className="flex-grow flex items-center justify-center p-4">
        {isEmpty ? (
          <div className="text-center bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-md">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">No Survey Available</h2>
            <p className="text-gray-600 mb-6">There are currently no published questions. Please check back later.</p>
            <button onClick={() => navigate('/')} className="px-6 py-2 bg-blue-600 text-white rounded-lg">Return Home</button>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
            <p className="text-gray-500 font-medium">Loading survey...</p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};
