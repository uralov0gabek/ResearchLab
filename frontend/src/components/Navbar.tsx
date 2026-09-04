"use client";

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Compass, Menu, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Navbar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { t } = useTranslation();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const navLinks = [
    { name: t('About'), href: '/#about', isExternal: true },
    { name: t('Methodology'), href: '/#methodology', isExternal: true },
    { name: t('Contact'), href: '/contact', isExternal: false },
    { name: t('Login'), href: '/admin', isExternal: false },
  ];


  const closeMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-[#FFFDF5] border-b border-gray-200 shadow-sm overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link to="/" className="flex items-center gap-2" onClick={closeMenu}>
            <div className="p-2 bg-slate-900 text-[#F4C542] rounded-lg">
              <Compass size={24} strokeWidth={2.5} />
            </div>
            <span className="font-bold text-xl text-slate-900 tracking-tight">
              Research Lab
            </span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              link.isExternal ? (
                <a 
                  key={link.name}
                  href={link.href} 
                  className="text-sm font-medium text-gray-600 hover:text-slate-900 transition-colors py-2 px-1 mx-1 hover-slide-line"
                >
                  {link.name}
                </a>
              ) : (
                <Link 
                  key={link.name}
                  to={link.href} 
                  className="text-sm font-medium text-gray-600 hover:text-slate-900 transition-colors py-2 px-1 mx-1 hover-slide-line"
                >
                  {link.name}
                </Link>
              )
            ))}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center">
            <button 
              onClick={toggleMobileMenu}
              className="p-3 text-gray-600 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 rounded-md"
              aria-label="Toggle menu"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-[#FFFDF5] flex flex-col h-screen pt-20 px-4">
          {/* Top bar inside the menu overlay to match the header styling */}
          <div className="absolute top-0 left-0 w-full px-4 sm:px-6 h-20 flex justify-between items-center border-b border-gray-200 bg-[#FFFDF5]">
            <Link to="/" className="flex items-center gap-2" onClick={closeMenu}>
              <div className="p-2 bg-slate-900 text-[#F4C542] rounded-lg">
                <Compass size={24} strokeWidth={2.5} />
              </div>
              <span className="font-bold text-xl text-slate-900 tracking-tight">
                Research Lab
              </span>
            </Link>
            <button 
              onClick={toggleMobileMenu}
              className="p-3 text-gray-600 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 rounded-md"
              aria-label="Close menu"
            >
              <X className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          
          {/* Mobile Nav Links */}
          <div className="flex flex-col gap-4 mt-6">
            {navLinks.map((link) => (
              link.isExternal ? (
                <a 
                  key={link.name}
                  href={link.href} 
                  onClick={closeMenu}
                  className="text-lg font-medium text-slate-900 p-3 hover:bg-gray-100 rounded-md transition-colors"
                >
                  {link.name}
                </a>
              ) : (
                <Link 
                  key={link.name}
                  to={link.href} 
                  onClick={closeMenu}
                  className="text-lg font-medium text-slate-900 p-3 hover:bg-gray-100 rounded-md transition-colors"
                >
                  {link.name}
                </Link>
              )
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
