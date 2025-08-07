
import React from 'react';
import { BookOpen, Twitter, Linkedin, Instagram, Mail } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-border py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-10">
          <div className="flex items-center space-x-2 mb-6 md:mb-0">
            <BookOpen size={28} className="text-chapterRed-500" />
            <span className="font-bold text-xl">ChapterOne</span>
          </div>
          
          <div className="flex gap-4">
            <a 
              href="#" 
              className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-chapterRed-50 transition-colors"
              aria-label="Twitter"
            >
              <Twitter size={18} />
            </a>
            <a 
              href="#" 
              className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-chapterRed-50 transition-colors"
              aria-label="LinkedIn"
            >
              <Linkedin size={18} />
            </a>
            <a 
              href="#" 
              className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-chapterRed-50 transition-colors"
              aria-label="Instagram"
            >
              <Instagram size={18} />
            </a>
          </div>
        </div>
        
        <div className="grid md:grid-cols-4 gap-10 mb-12">
          <div className="md:col-span-2">
            <h3 className="font-semibold mb-4">ChapterOne – Unlocking African Literature</h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              Our mission is to make African literature accessible to readers everywhere while supporting authors and publishers.
            </p>
            <div className="flex items-center gap-2">
              <Mail size={16} className="text-chapterRed-500" />
              <a href="mailto:hello@chapterone.dev" className="animated-link text-muted-foreground hover:text-foreground">
                hello@chapterone.dev
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="#" className="animated-link text-muted-foreground hover:text-foreground">Home</a></li>
              <li><a href="#about" className="animated-link text-muted-foreground hover:text-foreground">About</a></li>
              <li><a href="#benefits" className="animated-link text-muted-foreground hover:text-foreground">Benefits</a></li>
              <li><a href="#publishers" className="animated-link text-muted-foreground hover:text-foreground">Publishers</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><a href="#" className="animated-link text-muted-foreground hover:text-foreground">Privacy Policy</a></li>
              <li><a href="#" className="animated-link text-muted-foreground hover:text-foreground">Terms of Service</a></li>
              <li><a href="#" className="animated-link text-muted-foreground hover:text-foreground">Copyright</a></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} ChapterOne. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
