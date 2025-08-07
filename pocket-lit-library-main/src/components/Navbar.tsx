
import React, { useEffect, useState } from 'react';
import { BookOpen, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import WaitlistButton from './WaitlistButton';

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <nav 
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/80 backdrop-blur-md shadow-sm py-3' 
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <a href="#" className="flex items-center space-x-2 group">
          <BookOpen size={28} className="text-chapterRed-500 group-hover:animate-pulse-soft" />
          <span className="text-2xl font-light tracking-tighter">
            <span className="font-light">Chapter</span>
            <span className="font-semibold">One</span>
          </span>
        </a>
        
        <div className="hidden md:flex items-center space-x-8">
          <a 
            href="#about" 
            className="relative overflow-hidden group"
          >
            <span className="text-foreground/80 hover:text-foreground transition-colors font-light tracking-tighter">
              About Us
            </span>
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-chapterRed-500 transition-all duration-300 group-hover:w-full"></span>
          </a>
          
          <a 
            href="#our-story" 
            className="relative overflow-hidden group"
          >
            <span className="text-foreground/80 hover:text-foreground transition-colors font-light tracking-tighter">
              Our Story
            </span>
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-chapterRed-500 transition-all duration-300 group-hover:w-full"></span>
          </a>
          
          <a 
            href="#publishers" 
            className="relative overflow-hidden group"
          >
            <span className="text-foreground/80 hover:text-foreground transition-colors font-light tracking-tighter">
              Publishers
            </span>
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-chapterRed-500 transition-all duration-300 group-hover:w-full"></span>
          </a>
          
          <WaitlistButton className="relative px-5 py-2 overflow-hidden font-light tracking-tighter text-white rounded-full shadow-md">
            Start Reading
          </WaitlistButton>
        </div>
        
        <button 
          className="md:hidden text-foreground"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      
      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="md:hidden absolute top-full left-0 w-full bg-white/95 backdrop-blur-md shadow-md border-t border-border"
          >
            <div className="flex flex-col p-6 space-y-4">
              <a 
                href="#about" 
                className="text-foreground py-2 px-4 hover:bg-secondary rounded-md transition-colors font-light tracking-tighter"
                onClick={() => setIsMenuOpen(false)}
              >
                About Us
              </a>
              <a 
                href="#our-story" 
                className="text-foreground py-2 px-4 hover:bg-secondary rounded-md transition-colors font-light tracking-tighter"
                onClick={() => setIsMenuOpen(false)}
              >
                Our Story
              </a>
              <a 
                href="#publishers" 
                className="text-foreground py-2 px-4 hover:bg-secondary rounded-md transition-colors font-light tracking-tighter"
                onClick={() => setIsMenuOpen(false)}
              >
                Publishers
              </a>
              <div onClick={() => setIsMenuOpen(false)}>
                <WaitlistButton className="text-center w-full bg-chapterRed-500 text-white py-3 px-4 rounded-full transition-all hover:shadow-md hover:bg-chapterRed-600 font-light tracking-tighter">
                  Start Reading
                </WaitlistButton>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
