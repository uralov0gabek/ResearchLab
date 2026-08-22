import React from 'react';
import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';

const Navbar: React.FC = () => {
  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-[#FFFDF5] border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link to="/" className="flex items-center gap-2">
            <div className="p-2 bg-slate-900 text-[#F4C542] rounded-lg">
              <Compass size={24} strokeWidth={2.5} />
            </div>
            <span className="font-bold text-xl text-slate-900 tracking-tight">
              UzCombinator Research Lab
            </span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <a href="/#about" className="text-sm font-medium text-gray-600 hover:text-slate-900 transition-colors">About</a>
            <a href="/#methodology" className="text-sm font-medium text-gray-600 hover:text-slate-900 transition-colors">Methodology</a>
            <Link to="/contact" className="text-sm font-medium text-gray-600 hover:text-slate-900 transition-colors">Contact</Link>
            <Link 
              to="/admin" 
              className="text-sm font-medium text-gray-600 hover:text-slate-900 transition-colors"
            >
              Login
            </Link>
          </div>

          {/* Mobile menu button (Simplified for now) */}
          <div className="md:hidden flex items-center">
            <button className="text-gray-600 hover:text-slate-900 focus:outline-none">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
