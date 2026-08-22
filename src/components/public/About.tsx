import React from 'react';
import { Lightbulb, Target, TrendingUp } from 'lucide-react';

export const About: React.FC = () => {
  return (
    <section id="about" className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-brand-charcoal mb-4">About the Research</h2>
          <p className="text-lg text-brand-charcoal/70">
            Our team is investigating how people value gains compared to equivalent losses. 
            This phenomenon, known as loss aversion, has profound implications for economics, 
            psychology, and everyday decision making.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="p-6 rounded-2xl bg-brand-cream border border-brand-charcoal/5 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-brand-gold rounded-full flex items-center justify-center mb-6">
              <Lightbulb className="w-6 h-6 text-brand-charcoal" />
            </div>
            <h3 className="text-xl font-bold text-brand-charcoal mb-3">The Objective</h3>
            <p className="text-brand-charcoal/70">
              To measure the threshold at which potential gains outweigh the psychological impact of potential losses across diverse demographics.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-brand-cream border border-brand-charcoal/5 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-brand-gold rounded-full flex items-center justify-center mb-6">
              <Target className="w-6 h-6 text-brand-charcoal" />
            </div>
            <h3 className="text-xl font-bold text-brand-charcoal mb-3">The Methodology</h3>
            <p className="text-brand-charcoal/70">
              Participants will be presented with a series of hypothetical coin-toss scenarios, requiring choices between guaranteed outcomes and risky propositions.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-brand-cream border border-brand-charcoal/5 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-brand-gold rounded-full flex items-center justify-center mb-6">
              <TrendingUp className="w-6 h-6 text-brand-charcoal" />
            </div>
            <h3 className="text-xl font-bold text-brand-charcoal mb-3">The Impact</h3>
            <p className="text-brand-charcoal/70">
              Findings will contribute to a broader understanding of consumer behavior, financial planning, and risk management strategies.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
