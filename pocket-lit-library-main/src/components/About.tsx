
import React, { useEffect, useRef, useState } from 'react';
import WaitlistButton from './WaitlistButton';
import BookList from './BookList';
import Features from './Features';
import { Book, books } from '@/data/books';
import BookDetail from './BookDetail';

const About: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  
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

  return (
    <section id="about" ref={sectionRef} className="content-section relative overflow-hidden bg-gradient-to-br from-white via-white to-chapterRed-50/20">
      {/* Modern blob background */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-gradient-to-br from-chapterRed-100/40 to-chapterRed-200/20 rounded-full blur-3xl opacity-60"></div>
      <div className="absolute -bottom-48 -left-24 w-[30rem] h-[30rem] bg-gradient-to-tr from-chapterRed-100/30 to-chapterRed-200/10 rounded-full blur-3xl opacity-60"></div>
      
      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-12 gap-12 items-center">
          {/* Left Column - Visual - slightly reduced size */}
          <div className="md:col-span-4 intersect-trigger order-2 md:order-1">
            <div className="relative">
              {/* Main device mockup */}
              <BookList onSelectBook={setSelectedBook} />
              
              {/* Background elements */}
              <div className="absolute top-12 -left-6 z-10 w-3/4 h-[calc(100%-4rem)] bg-gradient-to-tr from-chapterRed-200 to-chapterRed-100 rounded-3xl transform rotate-6 opacity-40 blur-sm"></div>
              <div className="absolute -bottom-5 -right-5 z-0 w-32 h-32 bg-gradient-to-br from-chapterRed-300/50 to-chapterRed-100/30 rounded-full"></div>
            </div>
          </div>
          
          {/* Right Column - Content - increased width */}
          <div className="md:col-span-8 space-y-8 order-1 md:order-2">
            {/* Section Label */}
            <div className="mb-2 intersect-trigger">
              <span className="inline-block text-chapterRed-600 px-3 py-1 rounded-full text-sm font-medium bg-chapterRed-50 border border-chapterRed-100/50 shadow-sm">
                What is ChapterOne?
              </span>
            </div>
            
            {/* Section Title */}
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight intersect-trigger">
              Your <span className="relative text-gradient">Pocket Library</span> <br className="hidden md:block" />for Every Moment
            </h2>
            
            <p className="text-lg text-muted-foreground intersect-trigger leading-relaxed">
              ChapterOne is a revolutionary digital reading platform that puts an entire library in your pocket. Discover, read, and enjoy thousands of books from fiction to non-fiction, bestsellers to classics, all in one elegant, personalized mobile experience.
            </p>
            
            {/* Features */}
            <Features />
            
            <div className="pt-6 intersect-trigger">
              <WaitlistButton className="shadow-xl">
                Start Reading
              </WaitlistButton>
            </div>
          </div>
        </div>
      </div>

      {/* Book detail modal */}
      {selectedBook && (
        <BookDetail book={selectedBook} onClose={() => setSelectedBook(null)} />
      )}
    </section>
  );
};

export default About;
