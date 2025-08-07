
import React from 'react';
import WaitlistButton from '../WaitlistButton';
import AnimatedText from '../AnimatedText';
import { ArrowDown } from 'lucide-react';

const HeroContent: React.FC = () => {
  return (
    <>
      <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold text-center mb-4 max-w-5xl text-black -mt-24 font-archivo">
        <span className="block animate-fade-in" style={{animationDelay: '0.2s'}}>Your Personal Library</span>
        <span className="relative inline-block animate-fade-in" style={{animationDelay: '0.4s'}}>
          in Your Pocket
          <span className="absolute -bottom-3 left-0 w-full h-1 bg-gradient-to-r from-chapterRed-600 to-chapterRed-300 rounded-full"></span>
        </span>
      </h1>
      
      <p className="text-lg md:text-xl text-center text-gray-500 font-medium max-w-3xl mb-6 animate-fade-in font-archivo" style={{animationDelay: '0.6s'}}>
        Access your favorite books, anytime, anywhere - read, listen, and explore with ease
      </p>
      
      <div className="flex flex-col items-center mb-10 animate-fade-in" style={{animationDelay: '0.8s'}}>
        <div className="flex flex-wrap justify-center gap-4">
          <div className="flex items-center bg-black text-white px-4 py-2 rounded-lg transition-transform hover:scale-105">
            <svg className="mr-2" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.0402 12.0701C17.0331 10.1475 18.0616 8.63367 19.1379 7.73272C18.2728 6.47504 16.9243 5.69091 15.5323 5.63069C14.0128 5.47233 12.6411 6.48643 11.8665 6.48643C11.0761 6.48643 9.91956 5.64396 8.656 5.67604C6.9505 5.74264 5.41126 6.69774 4.58728 8.14906C2.87228 11.1138 4.16162 15.4667 5.81148 18.0266C6.63546 19.2769 7.60905 20.6747 8.87158 20.6199C10.0949 20.5616 10.5644 19.7967 12.0542 19.7967C13.5334 19.7967 13.9715 20.6199 14.1728 20.6747C15.4776 20.5616 16.3193 19.3071 17.1214 18.0476C17.7491 17.0709 18.2331 15.9791 18.5535 14.8239C17.2452 14.2628 16.4337 13.2131 16.4337 12.0736L17.0402 12.0701ZM14.397 4.07059C15.1151 3.21417 15.5291 2.092 15.4743 0.959961C14.3568 1.03017 13.3244 1.5254 12.5988 2.32348C11.8886 3.1032 11.457 4.22538 11.5256 5.32589C12.6431 5.37558 13.6754 5.01583 14.3962 4.07059" fill="white"/>
            </svg>
            <div className="flex flex-col">
              <span className="text-xs">Available Soon on</span>
              <span className="text-base font-semibold">App Store</span>
            </div>
          </div>
          
          <div className="flex items-center bg-black text-white px-4 py-2 rounded-lg transition-transform hover:scale-105">
            <svg className="mr-2" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12.7528 11.999L4.15399 3.40031L15.9295 11.999L4.15399 20.5978L12.7528 11.999Z" fill="#EA4335"/>
              <path d="M4.15399 20.5978L13.5806 11.1712L15.9295 11.999L4.15399 20.5978Z" fill="#FBBC04"/>
              <path d="M19.8658 8.06251L15.9295 11.999L13.5806 11.1712L19.8658 4.88607C20.584 5.62889 20.584 7.31969 19.8658 8.06251Z" fill="#4285F4"/>
              <path d="M19.8658 15.9353C20.584 15.1925 20.584 13.5017 19.8658 12.7589L15.9295 11.999L4.15399 3.40031L19.8658 15.9353Z" fill="#34A853"/>
            </svg>
            <div className="flex flex-col">
              <span className="text-xs">Available Soon on</span>
              <span className="text-base font-semibold">Google Play</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 items-center animate-fade-in" style={{animationDelay: '1s'}}>
        <WaitlistButton className="animate-pulse-soft">
          Start Reading
        </WaitlistButton>
        <a href="#about" className="group text-foreground/80 hover:text-foreground transition-all duration-300 flex items-center">
          <span className="relative pr-1">
            Learn more
            <span className="absolute left-0 bottom-0 w-[90%] h-[2px] bg-chapterRed-500 rounded-full transform scale-x-0 transition-transform duration-300 origin-left group-hover:scale-x-100"></span>
          </span>
          <ArrowDown size={16} className="ml-1 transform transition-all duration-300 group-hover:translate-y-1 group-hover:ml-2" />
        </a>
      </div>
    </>
  );
};

export default HeroContent;
