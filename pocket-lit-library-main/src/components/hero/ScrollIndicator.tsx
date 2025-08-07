
import React from 'react';

interface ScrollIndicatorProps {
  opacity: number;
}

const ScrollIndicator: React.FC<ScrollIndicatorProps> = ({ opacity }) => {
  return (
    <div 
      className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-pulse-soft transition-opacity duration-500"
      style={{ opacity }}
    >
      <div className="flex flex-col items-center">
        <span className="text-sm text-muted-foreground mb-2">Scroll down</span>
        <div className="w-6 h-10 border-2 border-chapterRed-300 rounded-full flex justify-center">
          <div className="w-1 h-2 bg-chapterRed-500 rounded-full mt-2 animate-bounce"></div>
        </div>
      </div>
    </div>
  );
};

export default ScrollIndicator;
