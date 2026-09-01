import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Mail, Phone, ArrowLeft } from "lucide-react";

const Contact: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#FFFDF5] text-gray-800 font-sans selection:bg-[#F4C542] selection:text-slate-900 flex flex-col pt-20">
      <Navbar />

      <main className="flex-grow py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-slate-900 mb-8 transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Home
          </Link>

          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
              Get in Touch
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Have questions about our research or want to collaborate? Reach
              out to the founder directly.
            </p>
          </div>

          <div className="max-w-2xl mx-auto space-y-6">
            <div className="bg-white p-8 md:p-10 rounded-3xl shadow-[0_4px_24px_-8px_rgba(0,0,0,0.05)] border border-gray-100 flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left transition-transform hover:-translate-y-1 duration-300">
              <div className="p-4 bg-[#F4C542]/20 text-[#e3b632] rounded-2xl shrink-0">
                <Mail size={32} />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-xl text-slate-900 mb-1">
                  Email Us
                </span>
                <a
                  href="mailto:nurbeksaliyev08@gmail.com"
                  className="text-lg text-gray-600 hover:text-[#e3b632] transition-colors font-medium"
                >
                  nurbeksaliyev08@gmail.com
                </a>
              </div>
            </div>

            <div className="bg-white p-8 md:p-10 rounded-3xl shadow-[0_4px_24px_-8px_rgba(0,0,0,0.05)] border border-gray-100 flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left transition-transform hover:-translate-y-1 duration-300">
              <div className="p-4 bg-[#F4C542]/20 text-[#e3b632] rounded-2xl shrink-0">
                <Phone size={32} />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-xl text-slate-900 mb-1">
                  Call Us
                </span>
                <a
                  href="tel:+998900225927"
                  className="text-lg text-gray-600 hover:text-[#e3b632] transition-colors font-medium"
                >
                  +998 90 022 59 27
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;
