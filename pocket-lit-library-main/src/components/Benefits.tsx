
import React from 'react';
import WaitlistButton from './WaitlistButton';
import { useIsMobile } from '@/hooks/use-mobile';

const Benefits: React.FC = () => {
  const isMobile = useIsMobile();
  
  // Define the app screenshots to display
  const appScreens = [
    {
      src: "https://res.cloudinary.com/dvab101hh/image/upload/v1760720103/pocket-library/mobile-screens/library-screen.jpg",
      alt: "Library screen showing book collection with search and filters",
    },
    {
      src: "https://res.cloudinary.com/dvab101hh/image/upload/v1760720105/pocket-library/mobile-screens/book-detail-screen.jpg",
      alt: "Book detail screen for Tess of the Road with description and action buttons",
    },
    {
      src: "https://res.cloudinary.com/dvab101hh/image/upload/v1760720107/pocket-library/mobile-screens/home-screen.jpg",
      alt: "Home screen with featured books and personalized recommendations",
    }
  ];

  return (
    <section 
      id="benefits" 
      className="content-section relative overflow-hidden bg-gradient-to-b from-white to-chapterRed-50/20 py-20"
    >
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Section Label */}
        <div className="mb-4 intersect-trigger">
          <span className="inline-block bg-chapterRed-50 text-chapterRed-600 px-3 py-1 rounded-full text-sm font-medium border border-chapterRed-100 shadow-sm transform hover:translate-z-2 transition-transform">
            Why Join the Waitlist?
          </span>
        </div>
        
        {/* Section Title */}
        <h2 className="section-title intersect-trigger">
          Be part of the <span className="text-gradient">first wave</span> of readers
        </h2>
        
        <p className="section-subtitle intersect-trigger">
          Early adopters get exclusive benefits and help shape the future of our platform.
        </p>
        
        {/* Content Layout - No gap between content and phones */}
        <div className="flex flex-col md:flex-row items-center md:items-start md:space-x-0 mb-16">
          <div className="w-full md:w-2/5 lg:w-1/3 intersect-trigger md:pr-6">
            <p className="text-lg text-muted-foreground mb-6">
              Help shape the future of digital literature by joining our pioneering community of readers and become part of something revolutionary.
            </p>
            <ul className="space-y-4 mb-8">
              <li className="flex items-start">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-chapterRed-100 text-chapterRed-600 mr-3 shadow-sm text-sm font-medium">1</span>
                <span>Help shape the future of reading through direct feedback</span>
              </li>
              <li className="flex items-start">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-chapterRed-100 text-chapterRed-600 mr-3 shadow-sm text-sm font-medium">2</span>
                <span>Exclusive first access to innovative reading features</span>
              </li>
              <li className="flex items-start">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-chapterRed-100 text-chapterRed-600 mr-3 shadow-sm text-sm font-medium">3</span>
                <span>Join a community of literary pioneers and influencers</span>
              </li>
            </ul>
          </div>
          
          {/* iPhone Mockups with adjusted styling for mobile */}
          <div className="w-full md:w-3/5 lg:w-2/3 intersect-trigger -mt-4 md:mt-0">
            <div className="flex justify-center items-center">
              {appScreens.map((screen, index) => (
                <div 
                  key={index} 
                  className={`${isMobile ? 'w-[30%]' : index === 0 ? 'w-[25%]' : index === 1 ? 'w-[30%] z-10' : 'w-[25%]'} 
                             ${!isMobile && (index === 0 ? '-mr-4 -rotate-6' : index === 2 ? '-ml-4 rotate-6' : '')}`}
                >
                  <IPhoneMockup 
                    image={screen.src} 
                    alt={screen.alt} 
                    isPrimary={index === 1}
                    isMobile={isMobile}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* CTA Section */}
        <div className="text-center intersect-trigger transform hover:translate-y-[-5px] transition-transform duration-300">
          <div className="max-w-xl mx-auto glass-card p-8 rounded-2xl">
            <h3 className="text-xl font-semibold mb-4">Ready to transform your reading experience?</h3>
            <p className="text-muted-foreground mb-6">Join our community of book lovers and be the first to experience our revolutionary reading platform.</p>
            <WaitlistButton>
              Start Reading
            </WaitlistButton>
          </div>
        </div>
      </div>
    </section>
  );
};

// iPhone style mockup component with adjusted corners for mobile
const IPhoneMockup = ({ 
  image, 
  alt, 
  isPrimary = false,
  isMobile = false 
}: { 
  image: string, 
  alt: string, 
  isPrimary?: boolean,
  isMobile?: boolean 
}) => {
  // Adjust border radius based on device size
  const frameRadius = isMobile ? 'rounded-[12px]' : 'rounded-[38px]';
  const contentRadius = isMobile ? 'rounded-[10px]' : 'rounded-[34px]';
  
  return (
    <div className={`relative ${isPrimary && !isMobile ? 'scale-110' : ''} transition-all duration-300`}>
      {/* iPhone frame with adjusted proportions for mobile */}
      <div className={`relative pb-[210%] bg-[#1A1A1C] ${frameRadius} shadow-xl border-[3px] border-[#343438] overflow-hidden`}>
        {/* Notch - smaller or hidden on mobile */}
        {!isMobile && (
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[40%] h-5 bg-[#1A1A1C] rounded-b-2xl z-20 flex justify-center items-center">
            <div className="w-[30%] h-[3px] bg-[#333] rounded-full mt-1"></div>
          </div>
        )}
        
        {/* Screen content with adjusted corners */}
        <div className={`absolute inset-0 overflow-hidden m-[4px] ${contentRadius}`}>
          <div className={`absolute inset-0 ${contentRadius} overflow-hidden`}>
            <img 
              src={image} 
              alt={alt} 
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
        </div>
        
        {/* iPhone details - simplified for mobile */}
        {!isMobile && (
          <>
            {/* Side buttons */}
            <div className="absolute top-[20%] left-[-2px] w-[3px] h-9 bg-[#343438] rounded-l-lg"></div>
            <div className="absolute top-[30%] left-[-2px] w-[3px] h-6 bg-[#343438] rounded-l-lg"></div>
            <div className="absolute top-[40%] left-[-2px] w-[3px] h-6 bg-[#343438] rounded-l-lg"></div>
            <div className="absolute top-[25%] right-[-2px] w-[3px] h-12 bg-[#343438] rounded-r-lg"></div>
          </>
        )}
        
        {/* Home indicator - smaller on mobile */}
        <div className={`absolute bottom-1 left-1/2 transform -translate-x-1/2 ${isMobile ? 'w-[20%]' : 'w-[30%]'} h-1 bg-white/30 rounded-full`}></div>

        {/* Screen reflection overlay */}
        <div className={`absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 ${frameRadius} pointer-events-none`}></div>
      </div>
      
      {/* Bottom glow effect for primary phone - reduced on mobile */}
      {isPrimary && !isMobile && (
        <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-[60%] h-4 bg-chapterRed-500/30 blur-xl rounded-full"></div>
      )}
    </div>
  );
};

export default Benefits;
