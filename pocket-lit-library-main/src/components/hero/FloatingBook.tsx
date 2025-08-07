
import React from 'react';
import { cn } from '@/lib/utils';

interface FloatingBookProps {
  position: string;
  rotation: string;
  size: {
    width: string;
    height: string;
  };
  color: {
    from: string;
    to: string;
  };
  icon: React.ReactNode;
  delay?: string;
  duration?: string;
}

const FloatingBook: React.FC<FloatingBookProps> = ({
  position,
  rotation,
  size,
  color,
  icon,
  delay = '0s',
  duration = '8s'
}) => {
  // Convert color strings to actual Tailwind color values
  const getColorValue = (colorClass: string) => {
    if (colorClass === 'chapterRed-200') return 'rgb(255, 201, 201)'; // #FFC9C9
    if (colorClass === 'chapterRed-300') return 'rgb(255, 155, 155)'; // #FF9B9B
    if (colorClass === 'chapterRed-400') return 'rgb(255, 122, 122)'; // #FF7A7A
    if (colorClass === 'chapterRed-500') return 'rgb(255, 82, 82)';   // #FF5252
    if (colorClass === 'chapterRed-600') return 'rgb(248, 58, 58)';   // #F83A3A
    if (colorClass === 'gray-700') return 'rgb(55, 65, 81)';         // Gray-700
    if (colorClass === 'gray-900') return 'rgb(17, 24, 39)';         // Gray-900
    return '#FF5252'; // Default to chapterRed-500
  };

  const fromColor = getColorValue(color.from);
  const toColor = getColorValue(color.to);

  return (
    <div 
      className={`absolute ${position} opacity-80 animate-float-dramatic`} 
      style={{
        animationDuration: duration,
        animationDelay: delay
      }}
    >
      <div 
        className={`relative ${size.width} ${size.height} rounded-md transform ${rotation} shadow-xl overflow-hidden`}
      >
        {/* Book cover */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(to bottom right, ${fromColor}, ${toColor})`
        }}></div>
        
        {/* Book spine */}
        <div style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: '0.75rem',
          background: `linear-gradient(to bottom, ${fromColor}, ${toColor})`,
          transform: rotation === 'rotate-12' || rotation === 'rotate-3' || rotation === 'rotate-6' ? 'skewY(-12deg)' : 'skewY(6deg)'
        }}></div>
        
        {/* Book pages edge */}
        <div className="absolute right-0 top-1 bottom-1 w-1 bg-white/80 rounded-r-sm"></div>
        
        {/* Book title */}
        <div className="absolute inset-0 flex items-center justify-center p-2">
          {icon}
          <div className="absolute bottom-3 w-full px-2">
            <div className="h-1 bg-white/30 rounded-full mb-1"></div>
            <div className="h-1 bg-white/30 rounded-full w-2/3"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FloatingBook;
