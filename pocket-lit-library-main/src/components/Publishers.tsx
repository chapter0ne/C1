
import React, { useEffect, useRef, useState } from 'react';
import WaitlistButton from './WaitlistButton';
import { TrendingUp, DollarSign, Shield, BarChart3, Users, BookOpen } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PublisherDashboard from './publisher/PublisherDashboard';
import { useIsMobile } from '@/hooks/use-mobile';
import ContactPopover from './publisher/ContactPopover';

const Publishers: React.FC = () => {
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

  const features = [
    {
      icon: TrendingUp,
      title: 'Reach More Readers',
      description: 'Our platform is built for mobile-first African readers.',
    },
    {
      icon: DollarSign,
      title: 'Earn Securely',
      description: 'Get paid fairly with prompt payment and fair revenue share.',
    },
    {
      icon: Shield,
      title: 'Protect Your Content',
      description: 'We use advanced DRM technology to prevent piracy.',
    },
  ];

  return (
    <section id="publishers" ref={sectionRef} className="content-section relative overflow-hidden py-24 md:py-36">
      <div className="absolute top-1/2 -left-72 w-96 h-96 bg-chapterRed-50 rounded-full opacity-40 blur-3xl"></div>
      
      <div className="grid md:grid-cols-2 gap-16 items-center">
        <div className="space-y-6 flex flex-col justify-center">
          <div className="mb-4 intersect-trigger">
            <span className="inline-block bg-chapterRed-50 text-chapterRed-600 px-3 py-1 rounded-full text-sm font-medium border border-chapterRed-100">
              For Publishers & Authors
            </span>
          </div>
          
          <h2 className="section-title intersect-trigger">
            Expand Your Reach & <span className="text-gradient">Earn More</span>
          </h2>
          
          <p className="text-lg intersect-trigger">
            Are you a <strong>publisher or author</strong> looking to distribute your books digitally? ChapterOne helps you:
          </p>
          
          <div className="space-y-6 mt-6">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start gap-4 intersect-trigger">
                <div className="w-10 h-10 mt-1 bg-chapterRed-50 rounded-full flex items-center justify-center flex-shrink-0">
                  <feature.icon size={20} className="text-chapterRed-500" />
                </div>
                <div>
                  <h3 className="font-medium text-lg">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="pt-6 intersect-trigger">
            <p className="font-medium mb-4">Join as a Publisher & Start Earning!</p>
            <ContactPopover>
              <WaitlistButton partnerButton={true}>
                Partner With Us
              </WaitlistButton>
            </ContactPopover>
          </div>
        </div>
        
        <div className="relative intersect-trigger h-auto">
          <div className="absolute inset-0 bg-gradient-to-tr from-chapterRed-100 to-chapterRed-50/40 rounded-2xl transform rotate-2 scale-95"></div>
          <div className="relative z-10 py-4 px-2 md:py-8 md:px-4">
            <PublisherDashboard />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Publishers;
