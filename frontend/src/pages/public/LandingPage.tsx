import React from 'react';
import { Hero } from '../../components/public/Hero';
import { About } from '../../components/public/About';
import { StudyAreas } from '../../components/public/StudyAreas';
import { Participate } from '../../components/public/Participate';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-brand-cream font-sans text-brand-charcoal selection:bg-brand-gold/30">
      <main>
        <Hero />
        <About />
        <StudyAreas />
        <Participate />
      </main>
      
      <footer className="bg-white border-t border-brand-charcoal/10 py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-brand-charcoal/50">
          <p>&copy; {new Date().getFullYear()} Research Lab. All rights reserved.</p>
          <div className="mt-4">
            <a href="/admin/login" className="hover:text-brand-charcoal transition-colors">
              Admin Portal
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};
