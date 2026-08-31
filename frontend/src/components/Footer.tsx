import React from 'react';
import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white py-12 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <Link to="/" className="flex items-center gap-2">
            <Compass size={20} className="text-slate-900" />
            <span className="font-bold text-lg text-slate-900">Research Lab</span>
          </Link>
          
          <div className="text-gray-500 text-sm text-center md:text-left">
            <p className="font-medium text-slate-700">Researcher: Saliyev Nurbek</p>
            <p>Research Mentor: Mikhail Munenzon (Columbia double graduate, HSE professor)</p>
            <p>Contributor: [Placeholder]</p>
            <p className="mt-2">&copy; 2026 Research Lab. All rights reserved.</p>
          </div>

          <div className="flex gap-4 sm:space-x-4">
            <Link to="/privacy" className="text-sm text-gray-500 hover:text-slate-900 transition-colors">Privacy Policy</Link>
            <Link to="/contact" className="text-sm text-gray-500 hover:text-slate-900 transition-colors">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
