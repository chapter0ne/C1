
import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import WaitlistDialog from './waitlist/WaitlistDialog';

interface WaitlistButtonProps {
  className?: string;
  secondary?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  partnerButton?: boolean;
}

const WaitlistButton: React.FC<WaitlistButtonProps> = ({ 
  className, 
  secondary = false,
  children,
  onClick,
  partnerButton = false
}) => {
  const [isHovering, setIsHovering] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleClick = () => {
    if (onClick) {
      onClick();
      return;
    }
    
    // If it's a partner button, keep the existing behavior
    if (partnerButton) {
      setIsDialogOpen(true);
      return;
    }
    
    // For non-partner buttons, redirect to the reader application
    window.open('https://chapterone-reader-app.netlify.app', '_blank');
  };

  return (
    <>
      <button
        onClick={handleClick}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        className={cn(
          secondary ? 'secondary-button' : 'cta-button',
          'relative overflow-hidden',
          'animate-scale',
          className
        )}
      >
        <span className="relative z-10">{children}</span>
        
        {/* Button hover effect */}
        <span 
          className={cn(
            "absolute inset-0 transform transition-transform duration-300",
            secondary ? 'bg-secondary/80' : 'bg-chapterRed-600',
            isHovering ? 'scale-100' : 'scale-0'
          )}
          style={{
            borderRadius: 'inherit',
            transformOrigin: 'bottom',
          }}
        />
        
        {/* Button click effect - ripple */}
        <span 
          className={cn(
            "absolute w-full h-full top-0 left-0 rounded-full",
            "animate-[ripple_0.6s_linear_forwards]",
            "bg-white/20 scale-0 opacity-100",
            "pointer-events-none"
          )}
          style={{
            transform: isHovering ? 'scale(2)' : 'scale(0)',
            opacity: isHovering ? 0 : 1,
            transition: 'transform 0.6s, opacity 0.6s',
          }}
        />
        
        {/* Enhanced glow effect */}
        <span 
          className={cn(
            "absolute -inset-px rounded-full opacity-0 transition-opacity duration-300",
            isHovering ? "opacity-70" : "opacity-0",
            secondary ? "bg-white" : "bg-chapterRed-300"
          )}
          style={{
            filter: 'blur(6px)',
            zIndex: -1
          }}
        />
      </button>

      {/* Waitlist Dialog - only for partner buttons */}
      {partnerButton && (
        <WaitlistDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
        />
      )}
    </>
  );
};

export default WaitlistButton;
