import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-blue-100">
      
      {/* Top Section */}
      <section className="relative bg-white overflow-hidden py-24 border-b border-slate-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight mb-8">
              Risk Preferences, Venture Capital, and Entrepreneurship in Post‑Soviet Uzbekistan
            </h1>
            <p className="text-xl sm:text-2xl text-slate-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              This research explores the intersection of generational loss aversion, entrepreneurial intent, and venture capital dynamics in a transitioning economy. 
            </p>
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-8 text-left inline-block mt-4 shadow-sm">
              <h3 className="text-lg font-bold text-blue-900 mb-3">Impact & Implementation</h3>
              <p className="text-slate-700">
                By quantifying risk tolerance parameters (Alpha, Beta, Lambda) through Cumulative Prospect Theory (CPT), this study aims to provide actionable insights for policymakers, investors, and startup founders to foster a more robust venture ecosystem in Uzbekistan.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Middle Section */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12 text-slate-900">Research Questions</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                <div className="text-blue-600 mb-4 font-bold text-xl">01</div>
                <p className="text-slate-800 text-lg">How do generations raised in the Soviet vs. Post-Soviet era differ in their fundamental risk preferences and loss aversion?</p>
              </div>
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                <div className="text-blue-600 mb-4 font-bold text-xl">02</div>
                <p className="text-slate-800 text-lg">Does a higher degree of loss aversion inversely correlate with the likelihood of starting a business in Uzbekistan?</p>
              </div>
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                <div className="text-blue-600 mb-4 font-bold text-xl">03</div>
                <p className="text-slate-800 text-lg">How do the risk profiles of local venture capital investors compare to those of the founders they back?</p>
              </div>
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                <div className="text-blue-600 mb-4 font-bold text-xl">04</div>
                <p className="text-slate-800 text-lg">What interventions or structural changes can bridge the risk-tolerance gap between capital supply and entrepreneurial demand?</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom Section */}
      <section className="py-24 bg-white border-t border-slate-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-slate-900">Contribute to Our Research</h2>
            <button 
              onClick={() => navigate('/survey')}
              className="group inline-flex items-center justify-center px-10 py-5 text-xl font-bold rounded-full text-white bg-blue-600 transition-all duration-300 ease-in-out shadow-lg hover:bg-blue-700 hover:shadow-blue-600/30 transform hover:-translate-y-1"
            >
              Take the Survey
              <ArrowRight className="ml-3 w-6 h-6 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          </div>

          <div className="max-w-5xl mx-auto">
            <h3 className="text-sm font-bold tracking-widest text-slate-400 uppercase mb-8">Research Team</h3>
            <div className="grid gap-8 md:grid-cols-3">
              <div className="text-center">
                <div className="w-20 h-20 bg-slate-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-2xl text-slate-400 font-bold">NS</span>
                </div>
                <h4 className="text-lg font-bold text-slate-900">Saliyev Nurbek</h4>
                <p className="text-slate-500">Researcher</p>
              </div>
              <div className="text-center">
                <div className="w-20 h-20 bg-blue-50 rounded-full mx-auto mb-4 flex items-center justify-center border border-blue-100">
                  <span className="text-2xl text-blue-400 font-bold">MM</span>
                </div>
                <h4 className="text-lg font-bold text-slate-900">Mikhail Munenzon</h4>
                <p className="text-slate-500">Research Mentor</p>
                <p className="text-xs text-slate-400 mt-1">Double Graduate from Columbia<br/>Professor at HSE</p>
              </div>
              <div className="text-center">
                <div className="w-20 h-20 bg-slate-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-2xl text-slate-400 font-bold">C</span>
                </div>
                <h4 className="text-lg font-bold text-slate-900">Contributor</h4>
                <p className="text-slate-500">Development & Analysis</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-slate-900 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-slate-400">
          <p>&copy; {new Date().getFullYear()} Research Lab. All rights reserved.</p>
          <div className="mt-4">
            <button onClick={() => navigate('/admin/login')} className="hover:text-white transition-colors">
              Admin Portal
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
