
import React, { useEffect } from 'react';
import Hero from '@/components/Hero';
import About from '@/components/About';
import WriteYourChapterOne from '@/components/WriteYourChapterOne';
import Benefits from '@/components/Benefits';
import Publishers from '@/components/Publishers';
import Newsletter from '@/components/Newsletter';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import OurStory from '@/components/OurStory';

const Index = () => {
  useEffect(() => {
    // Handle submissions redirect
    const handleSubmissionsRedirect = () => {
      const currentPath = window.location.pathname;
      if (currentPath === '/submissions') {
        // Update URL to remove /submissions
        window.history.replaceState({}, '', '/');
        
        // Wait for the component to render, then scroll to competition section
        setTimeout(() => {
          const competitionSection = document.getElementById('writeyourchapterone');
          if (competitionSection) {
            competitionSection.scrollIntoView({ 
              behavior: 'smooth',
              block: 'start'
            });
          } else {
            // If section not found, try again after a longer delay
            setTimeout(() => {
              const retrySection = document.getElementById('writeyourchapterone');
              if (retrySection) {
                retrySection.scrollIntoView({ 
                  behavior: 'smooth',
                  block: 'start'
                });
              }
            }, 1000);
          }
        }, 500);
      }
    };

    // Check for submissions redirect on component mount
    handleSubmissionsRedirect();

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
      <WriteYourChapterOne />
      <OurStory />
      <Benefits />
      <Publishers />
      <Newsletter />
      <Footer />
    </div>
  );
};

export default Index;
