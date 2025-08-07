
import React, { useEffect, useRef, useState } from 'react';
import BooksBackground from './hero/BooksBackground';
import HeroContent from './hero/HeroContent';
import ScrollIndicator from './hero/ScrollIndicator';

const Hero: React.FC = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const [scrollOpacity, setScrollOpacity] = useState(1);
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!heroRef.current) return;
      
      const { clientX, clientY } = e;
      const { width, height, left, top } = heroRef.current.getBoundingClientRect();
      
      const x = (clientX - left) / width;
      const y = (clientY - top) / height;
      
      heroRef.current.style.setProperty('--mouse-x', `${x}`);
      heroRef.current.style.setProperty('--mouse-y', `${y}`);
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const newOpacity = Math.max(1 - scrollY / 500, 0);
      setScrollOpacity(newOpacity);
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div 
      ref={heroRef}
      className="relative min-h-screen flex flex-col justify-center items-center py-20 px-6 overflow-hidden"
      style={{
        background: `radial-gradient(
          circle at calc(var(--mouse-x, 0.5) * 100%) calc(var(--mouse-y, 0.5) * 100%), 
          rgba(255, 82, 82, 0.3), 
          transparent 60%
        )`
      }}
    >
      <BooksBackground />
      <HeroContent />
      <ScrollIndicator opacity={scrollOpacity} />
    </div>
  );
};

export default Hero;
