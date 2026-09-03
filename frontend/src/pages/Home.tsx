import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, AlertTriangle, Lightbulb, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Home: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-[#FFFDF5] text-gray-800 font-sans selection:bg-[#F4C542] selection:text-slate-900 overflow-x-hidden pt-20">
      {/* Navigation Bar */}
      <Navbar />

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
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.1] mb-8">
              {t('Discovering Generations')}
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed mb-10 max-w-2xl">
              This research explores how people in Uzbekistan and post-Soviet Central Asia evaluate gains, losses, uncertainty, startup opportunities, and investment decisions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                to="/survey" 
                onClick={() => sessionStorage.removeItem('survey_session_data')}
                className="inline-flex justify-center items-center gap-2 px-8 py-4 rounded-xl bg-[#F4C542] text-slate-900 font-semibold text-lg hover:bg-[#e3b632] hover:-translate-y-0.5 transition-all shadow-[0_8px_20px_-6px_rgba(244,197,66,0.5)]">
                Take the Survey
                <ArrowRight size={20} />
              </Link>
              <button 
                onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
                className="inline-flex justify-center items-center gap-2 px-8 py-4 rounded-xl bg-white border-2 border-gray-200 text-slate-900 font-semibold text-lg hover:border-slate-900 hover:bg-slate-50 transition-all"
              >
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
              <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-6">{t('About The Research')}</h2>
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
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-6">Our Core Research Questions</h2>
            <p className="text-lg text-gray-600 mb-4">
              We leverage Cumulative Prospect Theory (CPT) to analyze decision-making. Specifically, we investigate:
            </p>
            <ul className="text-left text-lg text-gray-600 space-y-4 max-w-2xl mx-auto bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#F4C542]/20 text-[#c79a20] flex items-center justify-center shrink-0 mt-0.5">1</div>
                <p>How CPT parameters—<strong>α</strong> (value sensitivity, gains), <strong>β</strong> (value sensitivity, losses), <strong>λ</strong> (loss aversion), <strong>γ</strong> (probability weighting, gains), and <strong>δ</strong> (probability weighting, losses)—differ across <strong>Founders</strong>, <strong>Salaried Workers</strong>, and <strong>VC Investors</strong>.</p>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#F4C542]/20 text-[#c79a20] flex items-center justify-center shrink-0 mt-0.5">2</div>
                <p>How much of that psychological difference can be traced back to the generational shock of the <strong>early-1990s Soviet collapse</strong>.</p>
              </li>
            </ul>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
            {/* Card 1 */}
            <div className="bg-white p-8 rounded-2xl shadow-[0_4px_24px_-8px_rgba(0,0,0,0.05)] border border-gray-100 hover:-translate-y-1 transition-transform duration-300">
              <div className="w-12 h-12 rounded-xl bg-slate-900 text-[#F4C542] flex items-center justify-center mb-6">
                <TrendingUp size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Parameter Evaluation</h3>
              <p className="text-gray-600 leading-relaxed">
                Extracting (α, β, λ, γ, δ) from structured lotteries to establish a quantitative baseline for each group.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-white p-8 rounded-2xl shadow-[0_4px_24px_-8px_rgba(0,0,0,0.05)] border border-gray-100 hover:-translate-y-1 transition-transform duration-300">
              <div className="w-12 h-12 rounded-xl bg-slate-900 text-[#F4C542] flex items-center justify-center mb-6">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Generational Shocks</h3>
              <p className="text-gray-600 leading-relaxed">
                Measuring how the severe economic instability of the 1990s continues to influence risk tolerance today.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-white p-8 rounded-2xl shadow-[0_4px_24px_-8px_rgba(0,0,0,0.05)] border border-gray-100 hover:-translate-y-1 transition-transform duration-300">
              <div className="w-12 h-12 rounded-xl bg-slate-900 text-[#F4C542] flex items-center justify-center mb-6">
                <Lightbulb size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Role Disparities</h3>
              <p className="text-gray-600 leading-relaxed">
                Comparing necessity vs opportunity entrepreneurship, and tracking how investors align with or differ from founders.
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
          <Link 
            to="/survey" 
            onClick={() => sessionStorage.removeItem('survey_session_data')}
            className="inline-flex justify-center items-center gap-2 px-10 py-5 rounded-xl bg-[#F4C542] text-slate-900 font-bold text-xl hover:bg-[#e3b632] hover:-translate-y-1 transition-all shadow-[0_8px_20px_-6px_rgba(244,197,66,0.3)]">
            Start Survey
            <ArrowRight size={24} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Home;
