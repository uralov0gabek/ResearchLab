import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { ArrowLeft } from 'lucide-react';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#FFFDF5] text-gray-800 font-sans selection:bg-[#F4C542] selection:text-slate-900 flex flex-col pt-20">
      <Navbar />
      
      <main className="flex-grow py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto prose prose-slate max-w-none">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-slate-900 mb-8 transition-colors no-underline">
            <ArrowLeft size={16} />
            Back to Home
          </Link>
          
          <div className="bg-white p-8 md:p-12 rounded-3xl shadow-[0_4px_24px_-8px_rgba(0,0,0,0.05)] border border-gray-100">
            <h1 className="text-4xl font-extrabold text-slate-900 mb-8">Privacy Policy</h1>
            
            <p className="text-lg text-gray-600 mb-6 leading-relaxed">
              At UzCombinator Research Lab, we are committed to protecting your privacy and ensuring the confidentiality of the information you provide during our research studies. This Privacy Policy outlines how we collect, use, and protect your data.
            </p>

            <h2 className="text-2xl font-bold text-slate-900 mt-10 mb-4">1. Anonymous Data Collection</h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              All data collected through our surveys and research tasks is <strong>completely anonymous</strong>. We do not collect personally identifiable information (PII) such as your name, address, or phone number unless explicitly stated and consented to for follow-up studies.
            </p>

            <h2 className="text-2xl font-bold text-slate-900 mt-10 mb-4">2. Voluntary Participation</h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Your participation in this study is entirely <strong>voluntary</strong>. You have the right to withdraw from the research at any time without penalty or consequence. Simply closing the survey or task will immediately stop the data collection process.
            </p>

            <h2 className="text-2xl font-bold text-slate-900 mt-10 mb-4">3. Data Usage and Reporting</h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              The information we gather is used solely for academic and research purposes to understand risk, loss, and ambition across generations. <strong>No individual responses will be publicly reported</strong>. All findings, reports, and publications will present data analyzed strictly in aggregate form to ensure complete anonymity.
            </p>

            <h2 className="text-2xl font-bold text-slate-900 mt-10 mb-4">4. Data Security</h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              We implement industry-standard security measures to protect the integrity and confidentiality of the data we collect. Access to raw data is restricted to authorized research personnel only.
            </p>

            <h2 className="text-2xl font-bold text-slate-900 mt-10 mb-4">5. Contact Us</h2>
            <p className="text-gray-600 leading-relaxed">
              If you have any questions or concerns regarding this Privacy Policy or our data practices, please reach out to us via our <Link to="/contact" className="text-[#F4C542] hover:underline font-medium">Contact</Link> page.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
