import React, { useRef, useEffect, useState } from 'react';
import PageFlip from 'page-flip';

interface AppleBooksFlipProps {
  children: React.ReactNode;
  onPageChange?: (page: number) => void;
  theme: 'morning' | 'evening' | 'midnight';
  enabled: boolean;
}

const AppleBooksFlip: React.FC<AppleBooksFlipProps> = ({
  children,
  onPageChange,
  theme,
  enabled
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const pageFlipRef = useRef<PageFlip | null>(null);
  const [isReady, setIsReady] = useState(false);

  const getThemeColors = () => {
    switch (theme) {
      case 'morning':
        return { bg: '#FFFFFF', shadow: 'rgba(0,0,0,0.3)' };
      case 'evening':
        return { bg: '#F5E6D3', shadow: 'rgba(139,69,19,0.3)' };
      case 'midnight':
        return { bg: '#1A1A1A', shadow: 'rgba(255,255,255,0.1)' };
    }
  };

  const colors = getThemeColors();

  useEffect(() => {
    if (!containerRef.current || !enabled) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    // Initialize PageFlip with realistic settings
    const pageFlip = new PageFlip(containerRef.current, {
      width: width,
      height: height,
      
      // Rendering settings for realism
      size: 'stretch',
      minWidth: width * 0.9,
      maxWidth: width,
      minHeight: height * 0.9,
      maxHeight: height,
      
      // Page turning settings
      startPage: 0,
      drawShadow: true, // Enable dynamic shadows
      flippingTime: 600, // Smooth 600ms flip
      usePortrait: true,
      startZIndex: 0,
      autoSize: true,
      maxShadowOpacity: 0.4, // Realistic shadow intensity
      showCover: false,
      mobileScrollSupport: false, // We handle touch
      
      // Interaction settings
      clickEventForward: true,
      useMouseEvents: true,
      swipeDistance: 50,
      showPageCorners: true, // Show corner hints
      disableFlipByClick: false,
    });

    pageFlipRef.current = pageFlip;

    // Listen to page flip events
    pageFlip.on('flip', (e: any) => {
      if (onPageChange) {
        onPageChange(e.data);
      }
    });

    pageFlip.on('changeState', (e: any) => {
      console.log('Page flip state:', e.data);
    });

    // Load pages
    pageFlip.loadFromHTML(document.querySelectorAll('.page-content'));

    setIsReady(true);

    // Cleanup
    return () => {
      if (pageFlipRef.current) {
        pageFlipRef.current.destroy();
      }
    };
  }, [enabled, theme]);

  if (!enabled) {
    return <div className="w-full h-full">{children}</div>;
  }

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* PageFlip container */}
      <div
        ref={containerRef}
        className="w-full h-full"
        style={{
          backgroundColor: colors.bg,
          touchAction: 'none'
        }}
      />

      {/* Hidden content for PageFlip to load */}
      <div style={{ display: 'none' }}>
        <div className="page-content" style={{ backgroundColor: colors.bg }}>
          {children}
        </div>
      </div>

      {/* Loading indicator */}
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90">
          <div className="text-gray-600">Loading page flip...</div>
        </div>
      )}
    </div>
  );
};

export default AppleBooksFlip;


