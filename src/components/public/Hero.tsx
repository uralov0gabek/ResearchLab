import React from 'react';
import { ArrowRight } from 'lucide-react';

export const Hero: React.FC = () => {
  return (
    <section className="relative bg-brand-cream overflow-hidden py-20 lg:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-brand-charcoal tracking-tight mb-6">
            Understanding Decision Making Under Risk
          </h1>
          <p className="text-xl sm:text-2xl text-brand-charcoal/80 mb-10 max-w-2xl mx-auto">
            Join our research study exploring how individuals navigate choices involving potential gains and losses. Your participation helps advance behavioral economics.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a 
              href="#participate" 
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold rounded-full text-brand-charcoal bg-brand-gold hover:bg-brand-gold/90 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 duration-200"
            >
              Start Survey
              <ArrowRight className="ml-2 w-5 h-5" />
            </a>
            <a 
              href="#about" 
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium rounded-full text-brand-charcoal bg-white border-2 border-brand-charcoal/10 hover:border-brand-charcoal/30 hover:bg-gray-50 transition-colors"
            >
              Learn More
            </a>
          </div>
        </div>
      </div>
      {/* Decorative background element */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120%] h-[120%] bg-gradient-to-b from-brand-gold/10 to-transparent -z-10 rounded-full blur-3xl opacity-50" />
    </section>
  );
};
