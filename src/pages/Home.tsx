import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, TrendingUp, AlertTriangle, Lightbulb, Briefcase, Network, ArrowRight } from 'lucide-react';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#FFFDF5] text-gray-800 font-sans selection:bg-[#F4C542] selection:text-slate-900 overflow-x-hidden">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-[#FFFDF5]/80 backdrop-blur-md border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-slate-900 text-[#F4C542] rounded-lg">
                <Compass size={24} strokeWidth={2.5} />
              </div>
              <span className="font-bold text-xl text-slate-900 tracking-tight">
                UzCombinator Research Lab
              </span>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#about" className="text-sm font-medium text-gray-600 hover:text-slate-900 transition-colors">About</a>
              <a href="#methodology" className="text-sm font-medium text-gray-600 hover:text-slate-900 transition-colors">Methodology</a>
              <a href="#contact" className="text-sm font-medium text-gray-600 hover:text-slate-900 transition-colors">Contact</a>
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

      {/* Hero Section */}
      <section className="relative pt-24 pb-32 lg:pt-36 lg:pb-40 overflow-hidden">
        {/* Abstract Background Element */}
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-[800px] h-[800px] bg-[#F4C542]/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-gray-200 text-sm font-medium text-slate-900 mb-8 shadow-sm">
              <span className="flex h-2 w-2 rounded-full bg-[#F4C542]"></span>
              Behavioral Economics Study 2026
            </div>
            <h1 className="text-5xl lg:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.1] mb-8">
              Understanding Risk, Loss, and Ambition Across <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-[#F4C542]">Generations</span>
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed mb-10 max-w-2xl">
              This research explores how people in Uzbekistan and post-Soviet Central Asia evaluate gains, losses, uncertainty, startup opportunities, and investment decisions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="inline-flex justify-center items-center gap-2 px-8 py-4 rounded-xl bg-[#F4C542] text-slate-900 font-semibold text-lg hover:bg-[#e3b632] hover:-translate-y-0.5 transition-all shadow-[0_8px_20px_-6px_rgba(244,197,66,0.5)]">
                Take the Survey
                <ArrowRight size={20} />
              </button>
              <button className="inline-flex justify-center items-center gap-2 px-8 py-4 rounded-xl bg-white border-2 border-gray-200 text-slate-900 font-semibold text-lg hover:border-slate-900 hover:bg-slate-50 transition-all">
                Explore the Research
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* About the Research */}
      <section id="about" className="py-24 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-6">About the Research</h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                We are conducting a comprehensive comparative analysis of risk behaviors and loss aversion across multiple generations (Boomers, Gen X, Millennials, and Gen Z) in Central Asia.
              </p>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                By segmenting our findings into distinct roles—including startup founders, venture capitalists, and traditional corporate workers—we aim to understand the unique economic psychology driving innovation and business decisions in the region.
              </p>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="p-6 rounded-2xl bg-[#FFFDF5] border border-gray-100">
                  <div className="text-3xl font-bold text-slate-900 mb-2">4</div>
                  <div className="text-sm font-medium text-gray-600 uppercase tracking-wider">Generations</div>
                </div>
                <div className="p-6 rounded-2xl bg-[#FFFDF5] border border-gray-100">
                  <div className="text-3xl font-bold text-slate-900 mb-2">3+</div>
                  <div className="text-sm font-medium text-gray-600 uppercase tracking-wider">Professional Roles</div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-[#F4C542]/20 to-transparent rounded-3xl transform translate-x-4 translate-y-4 -z-10"></div>
              <img 
                src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=1200" 
                alt="Research collaboration" 
                className="rounded-3xl shadow-xl border border-gray-100 object-cover aspect-[4/3]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* What We Study (Grid) */}
      <section id="methodology" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-6">What We Study</h2>
            <p className="text-lg text-gray-600">
              Our methodology leverages advanced behavioral economics frameworks to evaluate decision-making under uncertainty.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="bg-white p-8 rounded-2xl shadow-[0_4px_24px_-8px_rgba(0,0,0,0.05)] border border-gray-100 hover:-translate-y-1 transition-transform duration-300">
              <div className="w-12 h-12 rounded-xl bg-slate-900 text-[#F4C542] flex items-center justify-center mb-6">
                <TrendingUp size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Generational Loss Aversion</h3>
              <p className="text-gray-600 leading-relaxed">
                How different age groups weigh the psychological impact of losses versus equivalent gains in economic scenarios.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-white p-8 rounded-2xl shadow-[0_4px_24px_-8px_rgba(0,0,0,0.05)] border border-gray-100 hover:-translate-y-1 transition-transform duration-300">
              <div className="w-12 h-12 rounded-xl bg-slate-900 text-[#F4C542] flex items-center justify-center mb-6">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Risk and Uncertainty</h3>
              <p className="text-gray-600 leading-relaxed">
                Measuring tolerances for ambiguity and known risks, particularly in environments with shifting macroeconomic factors.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-white p-8 rounded-2xl shadow-[0_4px_24px_-8px_rgba(0,0,0,0.05)] border border-gray-100 hover:-translate-y-1 transition-transform duration-300">
              <div className="w-12 h-12 rounded-xl bg-slate-900 text-[#F4C542] flex items-center justify-center mb-6">
                <Lightbulb size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Startup Founders</h3>
              <p className="text-gray-600 leading-relaxed">
                Analyzing the specific risk profiles of entrepreneurs and how they navigate high-stakes, uncertain environments.
              </p>
            </div>

            {/* Card 4 */}
            <div className="bg-white p-8 rounded-2xl shadow-[0_4px_24px_-8px_rgba(0,0,0,0.05)] border border-gray-100 hover:-translate-y-1 transition-transform duration-300">
              <div className="w-12 h-12 rounded-xl bg-slate-900 text-[#F4C542] flex items-center justify-center mb-6">
                <Briefcase size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Venture Capital</h3>
              <p className="text-gray-600 leading-relaxed">
                Understanding how investors evaluate early-stage opportunities and the role of loss aversion in funding decisions.
              </p>
            </div>

            {/* Card 5 */}
            <div className="bg-white p-8 rounded-2xl shadow-[0_4px_24px_-8px_rgba(0,0,0,0.05)] border border-gray-100 hover:-translate-y-1 transition-transform duration-300 md:col-span-2 lg:col-span-1">
              <div className="w-12 h-12 rounded-xl bg-slate-900 text-[#F4C542] flex items-center justify-center mb-6">
                <Network size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Startup Ecosystem Decisions</h3>
              <p className="text-gray-600 leading-relaxed">
                The collective impact of individual risk preferences on the broader innovation and tech landscape in the region.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Participate Section */}
      <section className="py-24 bg-slate-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-5xl font-bold mb-8">Contribute to the Research</h2>
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
            Your insights are crucial. Participation is completely voluntary, 100% anonymous, and takes approximately 10 minutes to complete.
          </p>
          <button className="inline-flex justify-center items-center gap-2 px-10 py-5 rounded-xl bg-[#F4C542] text-slate-900 font-bold text-xl hover:bg-[#e3b632] hover:-translate-y-1 transition-all shadow-[0_8px_20px_-6px_rgba(244,197,66,0.3)]">
            Start Survey
            <ArrowRight size={24} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-white py-12 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <Compass size={20} className="text-slate-900" />
              <span className="font-bold text-lg text-slate-900">UzCombinator</span>
            </div>
            
            <div className="text-gray-500 text-sm">
              &copy; 2026 UzCombinator Research Lab. All rights reserved.
            </div>

            <div className="flex gap-6">
              <a href="#" className="text-sm text-gray-500 hover:text-slate-900 transition-colors">Privacy Policy</a>
              <a href="#" className="text-sm text-gray-500 hover:text-slate-900 transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
