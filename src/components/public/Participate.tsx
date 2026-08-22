import React from 'react';
import { ArrowRight, ShieldCheck, Lock } from 'lucide-react';

export const Participate: React.FC = () => {
  return (
    <section id="participate" className="py-24 bg-white relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto bg-brand-charcoal rounded-3xl p-8 sm:p-12 lg:p-16 shadow-2xl overflow-hidden relative">
          
          {/* Decorative background element for the card */}
          <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-brand-gold rounded-full opacity-20 blur-3xl"></div>
          
          <div className="relative z-10 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              Ready to Contribute?
            </h2>
            <p className="text-lg text-gray-300 mb-10 max-w-2xl mx-auto">
              Your insights are invaluable. The survey takes approximately 10-15 minutes to complete and consists of a series of decision-making scenarios.
            </p>
            
            <button className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold rounded-full text-brand-charcoal bg-brand-gold hover:bg-brand-gold/90 transition-all shadow-[0_0_20px_rgba(244,197,66,0.3)] hover:shadow-[0_0_30px_rgba(244,197,66,0.5)] transform hover:-translate-y-1">
              Start the Survey Now
              <ArrowRight className="ml-2 w-5 h-5" />
            </button>
            
            <p className="mt-4 text-sm text-gray-400">
              No preparation required. Must be 18 or older to participate.
            </p>
          </div>
        </div>

        {/* Privacy Section */}
        <div className="mt-20 max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h3 className="text-2xl font-bold text-brand-charcoal">Privacy & Ethics</h3>
          </div>
          
          <div className="grid sm:grid-cols-2 gap-8">
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-brand-cream flex items-center justify-center border border-brand-charcoal/10">
                <ShieldCheck className="w-5 h-5 text-brand-charcoal" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-brand-charcoal mb-2">Ethical Approval</h4>
                <p className="text-sm text-brand-charcoal/70 leading-relaxed">
                  This study has been reviewed and approved by the Institutional Review Board (IRB). All procedures adhere to strict ethical guidelines for human subjects research.
                </p>
              </div>
            </div>
            
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-brand-cream flex items-center justify-center border border-brand-charcoal/10">
                <Lock className="w-5 h-5 text-brand-charcoal" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-brand-charcoal mb-2">Data Protection</h4>
                <p className="text-sm text-brand-charcoal/70 leading-relaxed">
                  Your responses are completely anonymized. We do not collect personally identifiable information (PII) without explicit consent, and data is stored securely.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
