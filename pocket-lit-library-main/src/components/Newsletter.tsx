
import React, { useState, useRef, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Mail, Bell } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

const Newsletter: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const { toast } = useToast();
  const sectionRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const elements = entry.target.querySelectorAll('.intersect-trigger');
            elements.forEach((el, index) => {
              setTimeout(() => {
                el.classList.add('intersect-visible');
              }, 100 * index);
            });
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    
    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    
    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    toast({
      title: "Subscribed!",
      description: "Thanks for subscribing to our newsletter.",
    });
    
    setEmail('');
    setIsFocused(false);
  };

  return (
    <section ref={sectionRef} className="content-section bg-chapterRed-500 text-white">
      <div className="max-w-3xl mx-auto text-center">
        {/* Section Label with Emoji Outline Style */}
        <div className="mb-4 intersect-trigger">
          <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-4 py-1.5 rounded-full text-sm font-medium border border-white/20 shadow-sm">
            <span className="relative flex items-center justify-center">
              <Bell size={16} className="relative z-10" />
              <span className="absolute inset-0 bg-white/20 rounded-full blur-[1px] transform scale-110"></span>
            </span>
            Stay Updated!
          </span>
        </div>
        
        {/* Section Title */}
        <h2 className="text-3xl md:text-4xl font-bold mb-4 intersect-trigger">
          Want updates on our launch and exclusive offers?
        </h2>
        
        <p className="text-white/80 mb-8 max-w-2xl mx-auto intersect-trigger">
          Subscribe to our newsletter to receive updates about our launch date, new book releases, and special promotions.
        </p>
        
        {/* Newsletter Form */}
        <form onSubmit={handleSubmit} className="max-w-md mx-auto intersect-trigger">
          {isMobile ? (
            <div className="flex flex-col gap-3">
              <div 
                className={`flex items-center border-2 rounded-xl bg-white/10 backdrop-blur-sm p-2 transition-all duration-300 ${
                  isFocused 
                    ? 'border-white shadow-[0_0_15px_rgba(255,255,255,0.3)]' 
                    : 'border-white/20 hover:border-white/40'
                }`}
              >
                <div className="pl-2">
                  <Mail size={20} className={`transition-colors duration-300 ${isFocused ? 'text-white' : 'text-white/70'}`} />
                </div>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  className="flex-1 bg-transparent border-0 focus:outline-none focus:ring-0 text-white placeholder:text-white/60 p-3 transition-all duration-300 hover:placeholder:text-white/70"
                  required
                />
              </div>
              <button
                type="submit"
                className="bg-white text-chapterRed-500 font-medium rounded-xl w-full py-3 hover:bg-white/90 transition-colors"
              >
                Subscribe
              </button>
            </div>
          ) : (
            <div 
              className={`flex items-center border-2 rounded-full bg-white/10 backdrop-blur-sm p-1 transition-all duration-300 ${
                isFocused 
                  ? 'border-white shadow-[0_0_15px_rgba(255,255,255,0.3)]' 
                  : 'border-white/20 hover:border-white/40'
              }`}
            >
              <div className="pl-4">
                <Mail size={20} className={`transition-colors duration-300 ${isFocused ? 'text-white' : 'text-white/70'}`} />
              </div>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                className="flex-1 bg-transparent border-0 focus:outline-none focus:ring-0 text-white placeholder:text-white/60 p-3 transition-all duration-300 hover:placeholder:text-white/70"
                required
              />
              <button
                type="submit"
                className="bg-white text-chapterRed-500 font-medium rounded-full px-6 py-2.5 hover:bg-white/90 transition-colors"
              >
                Subscribe
              </button>
            </div>
          )}
        </form>
      </div>
    </section>
  );
};

export default Newsletter;
