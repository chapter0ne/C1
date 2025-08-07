
import React, { useEffect } from 'react';
import Hero from '@/components/Hero';
import About from '@/components/About';
import Benefits from '@/components/Benefits';
import Publishers from '@/components/Publishers';
import Newsletter from '@/components/Newsletter';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import OurStory from '@/components/OurStory';

const Index = () => {
  useEffect(() => {
    // Initialize intersection observer for animations
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('intersect-visible');
          }
        });
      },
      { threshold: 0.1 }
    );
    
    // Select all elements with the trigger class
    const triggerElements = document.querySelectorAll('.intersect-trigger');
    triggerElements.forEach((el) => observer.observe(el));
    
    return () => {
      triggerElements.forEach((el) => observer.unobserve(el));
    };
  }, []);
  
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <About />
      <OurStory />
      <Benefits />
      <Publishers />
      <Newsletter />
      <Footer />
    </div>
  );
};

export default Index;
