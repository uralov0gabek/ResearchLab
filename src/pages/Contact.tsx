import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Mail, MapPin, Send, ArrowLeft } from 'lucide-react';

const Contact: React.FC = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    // Dummy submission logic
    setTimeout(() => {
      setIsSubmitted(false);
    }, 5000);
  };

  return (
    <div className="min-h-screen bg-[#FFFDF5] text-gray-800 font-sans selection:bg-[#F4C542] selection:text-slate-900 flex flex-col pt-20">
      <Navbar />
      
      <main className="flex-grow py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-slate-900 mb-8 transition-colors">
            <ArrowLeft size={16} />
            Back to Home
          </Link>
          
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">Get in Touch</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Have questions about our research or want to collaborate? We'd love to hear from you.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white p-6 rounded-2xl shadow-[0_4px_24px_-8px_rgba(0,0,0,0.05)] border border-gray-100 flex items-start gap-4">
                <div className="p-3 bg-[#F4C542]/20 text-[#e3b632] rounded-xl shrink-0">
                  <Mail size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 mb-1">Email</h3>
                  <a href="mailto:research@uzcombinator.com" className="text-gray-600 hover:text-slate-900 transition-colors">
                    research@uzcombinator.com
                  </a>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-2xl shadow-[0_4px_24px_-8px_rgba(0,0,0,0.05)] border border-gray-100 flex items-start gap-4">
                <div className="p-3 bg-[#F4C542]/20 text-[#e3b632] rounded-xl shrink-0">
                  <MapPin size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 mb-1">Location</h3>
                  <p className="text-gray-600">
                    Tashkent, Uzbekistan<br/>
                    Central Asia
                  </p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 bg-white p-8 md:p-10 rounded-3xl shadow-[0_4px_24px_-8px_rgba(0,0,0,0.05)] border border-gray-100">
              {isSubmitted ? (
                <div className="h-full flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 bg-[#F4C542]/20 text-[#e3b632] rounded-full flex items-center justify-center mb-4">
                    <Send size={32} />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">Message Sent!</h3>
                  <p className="text-gray-600">Thank you for reaching out. We will get back to you shortly.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="name" className="block text-sm font-medium text-slate-900">Name</label>
                      <input 
                        type="text" 
                        id="name" 
                        required 
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#F4C542] focus:ring-2 focus:ring-[#F4C542]/20 outline-none transition-all"
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="email" className="block text-sm font-medium text-slate-900">Email</label>
                      <input 
                        type="email" 
                        id="email" 
                        required 
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#F4C542] focus:ring-2 focus:ring-[#F4C542]/20 outline-none transition-all"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="message" className="block text-sm font-medium text-slate-900">Message</label>
                    <textarea 
                      id="message" 
                      rows={5} 
                      required 
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#F4C542] focus:ring-2 focus:ring-[#F4C542]/20 outline-none transition-all resize-none"
                      placeholder="How can we help you?"
                    ></textarea>
                  </div>
                  
                  <button 
                    type="submit" 
                    className="w-full inline-flex justify-center items-center gap-2 px-8 py-4 rounded-xl bg-[#F4C542] text-slate-900 font-semibold text-lg hover:bg-[#e3b632] hover:-translate-y-0.5 transition-all shadow-[0_8px_20px_-6px_rgba(244,197,66,0.5)]"
                  >
                    Send Message
                    <Send size={20} />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;
