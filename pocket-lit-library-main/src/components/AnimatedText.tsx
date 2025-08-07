
import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface AnimatedTextProps {
  text: string;
  className?: string;
  delay?: number;
  animation?: 'fade' | 'slide-up' | 'slide-down' | 'slide-left' | 'slide-right' | 'scale';
  once?: boolean;
  threshold?: number;
}

const AnimatedText: React.FC<AnimatedTextProps> = ({ 
  text, 
  className, 
  delay = 0,
  animation = 'fade',
  once = true,
  threshold = 0.1
}) => {
  const textRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              entry.target.classList.add('intersect-visible');
            }, delay);
            
            if (once) {
              observer.unobserve(entry.target);
            }
          } else if (!once) {
            entry.target.classList.remove('intersect-visible');
          }
        });
      },
      { threshold }
    );
    
    if (textRef.current) {
      observer.observe(textRef.current);
    }
    
    return () => {
      if (textRef.current) {
        observer.unobserve(textRef.current);
      }
    };
  }, [delay, once, threshold]);
  
  const getAnimationClass = () => {
    switch (animation) {
      case 'slide-up':
        return 'translate-y-10';
      case 'slide-down':
        return '-translate-y-10';
      case 'slide-left':
        return 'translate-x-10';
      case 'slide-right':
        return '-translate-x-10';
      case 'scale':
        return 'scale-95';
      case 'fade':
      default:
        return 'translate-y-5';
    }
  };
  
  return (
    <div 
      ref={textRef} 
      className={cn(
        "intersect-trigger transform opacity-0", 
        getAnimationClass(),
        className
      )}
      style={{
        transitionDelay: `${delay}ms`,
        transitionDuration: '800ms'
      }}
    >
      {text}
    </div>
  );
};

export default AnimatedText;
