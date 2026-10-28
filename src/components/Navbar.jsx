import React, { useState } from 'react';
import { Sun, Moon, Menu, X } from 'lucide-react';

export default function Navbar({ darkMode, setDarkMode, onOpenAbout }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <nav className={`sticky top-0 z-50 backdrop-blur-md border-b transition-colors duration-200 ${
      darkMode ? 'bg-black/90 border-neutral-800' : 'bg-white/90 border-neutral-200'
    }`}>
      <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
        
        {/* Brand Logo */}
        <a href="#" onClick={closeMenu} className="font-extrabold tracking-tight text-xl">
          Johnny<span className="text-sky-500">.dev</span>
        </a>
        
        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8 text-sm font-bold">
          <a href="#" className={`transition-colors ${darkMode ? 'text-neutral-300 hover:text-white' : 'text-neutral-700 hover:text-black'}`}>
            Home
          </a>
          <button 
            onClick={() => { onOpenAbout && onOpenAbout(); closeMenu(); }} 
            className={`font-bold transition-colors ${darkMode ? 'text-neutral-300 hover:text-white' : 'text-neutral-700 hover:text-black'}`}
          >
            About
          </button>
          <a href="#skills" className={`transition-colors ${darkMode ? 'text-neutral-300 hover:text-white' : 'text-neutral-700 hover:text-black'}`}>
            Capabilities
          </a>
          <a href="#projects" className={`transition-colors ${darkMode ? 'text-neutral-300 hover:text-white' : 'text-neutral-700 hover:text-black'}`}>
            Projects
          </a>
          <a href="#contact" className={`transition-colors ${darkMode ? 'text-neutral-300 hover:text-white' : 'text-neutral-700 hover:text-black'}`}>
            Contact
          </a>
        </div>

        {/* Controls (Theme Toggle & Mobile Hamburger) */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2 rounded-xl border transition-all ${
              darkMode ? 'bg-neutral-900 border-neutral-800 text-amber-400 hover:bg-neutral-800' : 'bg-neutral-100 border-neutral-300 text-neutral-800 hover:bg-neutral-200'
            }`}
            title="Toggle theme"
          >
            {darkMode ? <Sun className="w-5 h-5"/> : <Moon className="w-5 h-5"/>}
          </button>

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`md:hidden p-2 rounded-xl border transition-all ${
              darkMode ? 'bg-neutral-900 border-neutral-800 text-neutral-200' : 'bg-neutral-100 border-neutral-300 text-neutral-800'
            }`}
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className={`md:hidden border-b px-6 py-5 space-y-4 transition-all ${
          darkMode ? 'bg-black border-neutral-800 text-white' : 'bg-white border-neutral-200 text-black'
        }`}>
          <a 
            href="#" 
            onClick={closeMenu} 
            className="block text-base font-bold py-1 hover:text-sky-500 transition-colors"
          >
            Home
          </a>
          <button 
            onClick={() => { onOpenAbout && onOpenAbout(); closeMenu(); }} 
            className="block text-base font-bold py-1 hover:text-sky-500 transition-colors text-left w-full"
          >
            About
          </button>
          <a 
            href="#skills" 
            onClick={closeMenu} 
            className="block text-base font-bold py-1 hover:text-sky-500 transition-colors"
          >
            Capabilities
          </a>
          <a 
            href="#projects" 
            onClick={closeMenu} 
            className="block text-base font-bold py-1 hover:text-sky-500 transition-colors"
          >
            Projects
          </a>
          <a 
            href="#contact" 
            onClick={closeMenu} 
            className="block text-base font-bold py-1 hover:text-sky-500 transition-colors"
          >
            Contact
          </a>
        </div>
      )}
    </nav>
  );
}