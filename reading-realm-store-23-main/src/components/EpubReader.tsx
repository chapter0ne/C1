import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ChevronLeft, ChevronRight, Loader2, ZoomIn, ZoomOut, Menu, X, Settings, Sun, Sunset, Moon, Hand, Fingerprint, ChevronDown, Type } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ePub, { Book, Rendition } from "epubjs";

interface EpubReaderProps {
  epubUrl: string;
  bookTitle: string;
  bookId: string;
  onClose: () => void;
}

const EpubReader = ({ epubUrl, bookTitle, bookId, onClose }: EpubReaderProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentLocation, setCurrentLocation] = useState<string>("");
  const [totalPages, setTotalPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalBookLocations, setTotalBookLocations] = useState<number>(0);
  const [currentLocationIndex, setCurrentLocationIndex] = useState<number>(0);
  const [showToc, setShowToc] = useState(false);
  const [toc, setToc] = useState<any[]>([]);
  const [fontSize, setFontSize] = useState(() => {
    const saved = localStorage.getItem('epub-reader-fontSize');
    return saved ? parseInt(saved) : 100;
  });
  const [currentChapterHref, setCurrentChapterHref] = useState<string>("");
  const [currentChapterTitle, setCurrentChapterTitle] = useState<string>("");
  const [isTocButtonFaded, setIsTocButtonFaded] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [theme, setTheme] = useState<'morning' | 'evening' | 'midnight'>(() => {
    const saved = localStorage.getItem('epub-reader-theme');
    return (saved as 'morning' | 'evening' | 'midnight') || 'morning';
  });
  const [readMode, setReadMode] = useState<'tap' | 'flip'>(() => {
    const saved = localStorage.getItem('epub-reader-readMode');
    return (saved as 'tap' | 'flip') || 'tap';
  });
  const [selectedFont, setSelectedFont] = useState<string>(() => {
    const saved = localStorage.getItem('epub-reader-font');
    return saved || 'Original';
  });
  const [showFontSelector, setShowFontSelector] = useState(false);
  const [showTapIndicators, setShowTapIndicators] = useState(false);
  const [tapShadowSide, setTapShadowSide] = useState<'left' | 'right' | null>(null);
  
  const viewerRef = useRef<HTMLDivElement>(null);
  const bookRef = useRef<Book | null>(null);
  const renditionRef = useRef<Rendition | null>(null);
  const fadeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const tapIndicatorTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);
  const isNavigating = useRef<boolean>(false);
  const { toast } = useToast();

  // Apple Books-inspired font system with precise typography
  const fonts = [
    { 
      name: 'Original', 
      family: 'inherit', 
      description: 'Publisher\'s original font',
      type: 'original',
      weight: 'inherit'
    },
    { 
      name: 'Kite', 
      family: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', 
      description: 'Modern humanist sans-serif',
      type: 'sans-serif',
      weight: '400'
    },
    { 
      name: 'Harbor', 
      family: 'Georgia, "Times New Roman", Times, serif', 
      description: 'Balanced text serif',
      type: 'serif',
      weight: '400'
    },
    { 
      name: 'Isola', 
      family: '"Palatino Linotype", Palatino, "Book Antiqua", serif', 
      description: 'Warm classical serif',
      type: 'serif',
      weight: '400'
    },
    { 
      name: 'Cedar', 
      family: '"Times New Roman", Times, "Liberation Serif", serif', 
      description: 'Editorial precision',
      type: 'serif',
      weight: '400'
    }
  ];

  const handleFontChange = (fontName: string, fontFamily: string, fontType: string) => {
    setSelectedFont(fontName);
    if (renditionRef.current) {
      // Apply precise typography specifications
      const fontSpec = fonts.find(f => f.name === fontName);
      if (fontSpec) {
        // Set font family
        renditionRef.current.themes.font(fontFamily);
        
        // Apply precise typography rules
        let cssRules = {
          'font-family': fontFamily,
          'line-height': '1.55',
          'font-feature-settings': '"kern" 1, "liga" 1, "rlig" 1',
          'text-rendering': 'optimizeLegibility',
          'font-variant-ligatures': 'common-ligatures',
          'letter-spacing': fontType === 'sans-serif' ? '-0.01em' : 
                           fontType === 'serif' ? '0' : '-0.02em'
        };

        // Add serif-specific features
        if (fontType === 'serif') {
          cssRules['font-feature-settings'] = '"kern" 1, "liga" 1, "rlig" 1, "onum" 1';
        }

        // Apply to EPUB content
        renditionRef.current.themes.default({
          body: cssRules,
          p: cssRules,
          div: cssRules,
          span: cssRules,
          h1: cssRules,
          h2: cssRules,
          h3: cssRules,
          h4: cssRules,
          h5: cssRules,
          h6: cssRules,
          a: cssRules,
          em: cssRules,
          strong: cssRules,
          i: cssRules,
          b: cssRules,
          '*': cssRules
        });
      }
    }
  };

  // Apply initial font when rendition is ready
  useEffect(() => {
    if (renditionRef.current) {
      const currentFont = fonts.find(f => f.name === selectedFont);
      if (currentFont) {
        handleFontChange(currentFont.name, currentFont.family, currentFont.type);
      }
    }
  }, [selectedFont]);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('epub-reader-fontSize', fontSize.toString());
  }, [fontSize]);

  useEffect(() => {
    localStorage.setItem('epub-reader-theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('epub-reader-readMode', readMode);
    // Show tap indicators when switching to tap mode
    if (readMode === 'tap') {
      showTapIndicatorsTemporarily();
    }
  }, [readMode]);

  useEffect(() => {
    localStorage.setItem('epub-reader-font', selectedFont);
  }, [selectedFont]);

  // Show tap indicators when book first loads (only in tap mode)
  useEffect(() => {
    if (!isLoading && readMode === 'tap') {
      showTapIndicatorsTemporarily();
    }
  }, [isLoading]);

  // Show tap indicators when TOC or Settings close
  useEffect(() => {
    // Only trigger when closing (going from true to false)
    if (!showToc && !showSettings && readMode === 'tap' && !isLoading) {
      // Small delay to ensure smooth transition
      setTimeout(() => {
        showTapIndicatorsTemporarily();
      }, 300);
    }
  }, [showToc, showSettings]);

  useEffect(() => {
    if (!viewerRef.current) return;

    const initEpub = async () => {
      try {
        setIsLoading(true);
        
      // Create book instance
      const book = ePub(epubUrl);
      bookRef.current = book;

      // Get actual dimensions in pixels for proper pagination
      const width = viewerRef.current.clientWidth;
      const height = viewerRef.current.clientHeight;

      // Create rendition
      const rendition = book.renderTo(viewerRef.current, {
        width: width,
        height: height,
        spread: "none",
        flow: "paginated",
      });
      renditionRef.current = rendition;

        // Add content protection styles to the rendered EPUB
        rendition.themes.default({
          "::selection": {
            background: "transparent !important",
          },
          "*": {
            "-webkit-user-select": "none !important",
            "-moz-user-select": "none !important",
            "-ms-user-select": "none !important",
            "user-select": "none !important",
            "-webkit-touch-callout": "none !important",
          },
        });

        // Display the book
        await rendition.display();

        // Load table of contents
        const navigation = await book.loaded.navigation;
        setToc(navigation.toc);

        // Get total book locations for accurate progress tracking
        try {
          const locations = await book.locations.generate(1024);
          if (locations && locations.total) {
            setTotalBookLocations(locations.total);
          } else {
            console.warn('Failed to generate book locations, using fallback');
            setTotalBookLocations(0);
          }
        } catch (error) {
          console.error('Error generating book locations:', error);
          setTotalBookLocations(0);
        }

        // Track location changes
        rendition.on("relocated", async (location: any) => {
          setCurrentLocation(location.start.cfi);
          
          // Track current chapter
          if (location.start.href) {
            setCurrentChapterHref(location.start.href);
            
            // Find chapter title from TOC
            const chapterItem = toc.find(item => 
              item.href.includes(location.start.href) || 
              location.start.href.includes(item.href.split('#')[0])
            );
            if (chapterItem) {
              setCurrentChapterTitle(chapterItem.label);
            }
          }
          
          // Calculate book-wide progress using locations
          try {
            const currentLocation = await book.locations.locationFromCfi(location.start.cfi);
            if (currentLocation && currentLocation.index !== undefined) {
              setCurrentLocationIndex(currentLocation.index);
              // Convert location index to page-like numbers for display
              setCurrentPage(currentLocation.index + 1);
              setTotalPages(totalBookLocations);
            } else {
              // Fallback to chapter-based counting if location tracking fails
              const currentPageNum = location.start.displayed.page;
              const totalPageNum = location.start.displayed.total;
              setCurrentPage(currentPageNum);
              setTotalPages(totalPageNum);
              setCurrentLocationIndex(currentPageNum - 1);
            }
          } catch (error) {
            console.error('Error getting location:', error);
            // Fallback to chapter-based counting
            const currentPageNum = location.start.displayed.page;
            const totalPageNum = location.start.displayed.total;
            setCurrentPage(currentPageNum);
            setTotalPages(totalPageNum);
            setCurrentLocationIndex(currentPageNum - 1);
          }
          
          // Save the current location
          if (location.start.cfi) {
            localStorage.setItem(`epub-position-${bookId}`, location.start.cfi);
          }
        });

        // Load saved reading position
        const savedPosition = localStorage.getItem(`epub-position-${bookId}`);
        if (savedPosition) {
          await rendition.display(savedPosition);
        }

        setIsLoading(false);
      } catch (err) {
        console.error("Error loading EPUB:", err);
        setError("Failed to load EPUB file. Please try again.");
        setIsLoading(false);
      }
    };

    initEpub();

    // Cleanup
    return () => {
      if (renditionRef.current) {
        renditionRef.current.destroy();
      }
    };
  }, [epubUrl, bookId]);

  // Apply theme to EPUB content
  useEffect(() => {
    if (!renditionRef.current) return;

    const rendition = renditionRef.current;
    
    // Define theme styles
    const themeStyles = {
      morning: {
        backgroundColor: '#FFFFFF',
        color: '#000000',
        body: `
          body { 
            background-color: #FFFFFF !important; 
            color: #000000 !important; 
          }
          p, div, span, h1, h2, h3, h4, h5, h6 { 
            color: #000000 !important; 
          }
        `
      },
      evening: {
        backgroundColor: '#F5E6D3',
        color: '#8B4513',
        body: `
          body { 
            background-color: #F5E6D3 !important; 
            color: #8B4513 !important; 
          }
          p, div, span, h1, h2, h3, h4, h5, h6 { 
            color: #8B4513 !important; 
          }
        `
      },
      midnight: {
        backgroundColor: '#1A1A1A',
        color: '#E2E8F0',
        body: `
          body { 
            background-color: #1A1A1A !important; 
            color: #E2E8F0 !important; 
          }
          p, div, span, h1, h2, h3, h4, h5, h6 { 
            color: #E2E8F0 !important; 
          }
        `
      }
    };

    const currentTheme = themeStyles[theme];
    
    // Apply theme to rendition with protection styles
    rendition.themes.register('custom-theme', {
      body: currentTheme.body
    });
    
    rendition.themes.select('custom-theme');
    
    // Update rendition with both theme colors AND protection styles
    rendition.themes.default({
      "::selection": {
        background: "transparent !important",
      },
      "*": {
        "-webkit-user-select": "none !important",
        "-moz-user-select": "none !important",
        "-ms-user-select": "none !important",
        "user-select": "none !important",
        "-webkit-touch-callout": "none !important",
      },
      body: {
        'background-color': currentTheme.backgroundColor + ' !important',
        'color': currentTheme.color + ' !important'
      }
    });

  }, [theme]);

  // Save reading position when location changes
  useEffect(() => {
    if (currentLocation) {
      localStorage.setItem(`epub-position-${bookId}`, currentLocation);
    }
  }, [currentLocation, bookId]);

  const handlePrevPage = () => {
    if (renditionRef.current && !isNavigating.current) {
      isNavigating.current = true;
      
      // Show shadow on left side for tap mode
      if (readMode === 'tap') {
        setTapShadowSide('left');
        setTimeout(() => setTapShadowSide(null), 400);
      }
      
      // Apply soft blink effect for tap mode
      if (readMode === 'tap') {
        const iframe = renditionRef.current.getContents()[0];
        if (iframe && iframe.document && iframe.document.body) {
          // Soft fade out
          iframe.document.body.style.transition = 'opacity 0.2s ease-out';
          iframe.document.body.style.opacity = '0';
          
          setTimeout(() => {
            renditionRef.current?.prev();
            
            // Soft fade in
            setTimeout(() => {
              if (iframe.document && iframe.document.body) {
                iframe.document.body.style.opacity = '1';
              }
            }, 100);
          }, 150);
        } else {
          renditionRef.current.prev();
        }
      } else {
        renditionRef.current.prev();
      }
      
      // Reset after 400ms to prevent multiple rapid page turns
      setTimeout(() => {
        isNavigating.current = false;
      }, 400);
    }
  };

  const handleNextPage = () => {
    if (renditionRef.current && !isNavigating.current) {
      isNavigating.current = true;
      
      // Show shadow on right side for tap mode
      if (readMode === 'tap') {
        setTapShadowSide('right');
        setTimeout(() => setTapShadowSide(null), 400);
      }
      
      // Apply soft blink effect for tap mode
      if (readMode === 'tap') {
        const iframe = renditionRef.current.getContents()[0];
        if (iframe && iframe.document && iframe.document.body) {
          // Soft fade out
          iframe.document.body.style.transition = 'opacity 0.2s ease-out';
          iframe.document.body.style.opacity = '0';
          
          setTimeout(() => {
            renditionRef.current?.next();
            
            // Soft fade in
            setTimeout(() => {
              if (iframe.document && iframe.document.body) {
                iframe.document.body.style.opacity = '1';
              }
            }, 100);
          }, 150);
        } else {
          renditionRef.current.next();
        }
      } else {
        renditionRef.current.next();
      }
      
      // Reset after 400ms to prevent multiple rapid page turns
      setTimeout(() => {
        isNavigating.current = false;
      }, 400);
    }
  };

  // Touch event handlers for swipe gestures
  // Show tap indicators
  const showTapIndicatorsTemporarily = () => {
    // Don't show if TOC or Settings are open
    if (showToc || showSettings) return;
    
    setShowTapIndicators(true);
    
    // Clear any existing timeout
    if (tapIndicatorTimeoutRef.current) {
      clearTimeout(tapIndicatorTimeoutRef.current);
    }
    
    // Fade out after 3 seconds
    tapIndicatorTimeoutRef.current = setTimeout(() => {
      setShowTapIndicators(false);
    }, 3000);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    // Don't interfere if TOC or Settings are open
    if (showToc || showSettings) return;
    
    const touch = e.touches[0];
    touchStartX.current = touch.clientX;
    touchStartY.current = touch.clientY;
    console.log('👆 Touch Start:', { x: touch.clientX, y: touch.clientY, mode: readMode });
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    // Don't interfere if TOC or Settings are open
    if (showToc || showSettings) return;
    
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartX.current;
    const deltaY = touch.clientY - touchStartY.current;
    
    const viewerWidth = viewerRef.current?.clientWidth || window.innerWidth;
    const tapX = touch.clientX;
    
    console.log('👆 Touch End:', { 
      x: tapX, 
      deltaX, 
      deltaY,
      viewerWidth,
      mode: readMode 
    });
    
    if (readMode === 'flip') {
      // Flip mode: swipe gestures
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
        console.log('✅ SWIPE:', deltaX > 0 ? 'RIGHT (prev)' : 'LEFT (next)');
        if (deltaX > 0) {
          handlePrevPage();
        } else {
          handleNextPage();
        }
      }
    } else {
      // Tap mode: left/right tap zones
      if (Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10) {
        const leftBoundary = viewerWidth / 3;
        const rightBoundary = (viewerWidth * 2) / 3;
        
        console.log('✅ TAP:', { 
          tapX, 
          leftBoundary,
          rightBoundary,
          zone: tapX < leftBoundary ? 'LEFT' : tapX > rightBoundary ? 'RIGHT' : 'MIDDLE' 
        });
        
        if (tapX < leftBoundary) {
          console.log('⬅️ TAP LEFT → PREV');
          handlePrevPage();
        } else if (tapX > rightBoundary) {
          console.log('➡️ TAP RIGHT → NEXT');
          handleNextPage();
        }
      }
    }
  };

  // Mouse click handler
  const handleMouseClick = (e: React.MouseEvent) => {
    // Don't interfere if TOC or Settings are open
    if (showToc || showSettings) return;
    
    if (readMode !== 'tap') return;
    
    const viewerWidth = viewerRef.current?.clientWidth || window.innerWidth;
    const clickX = e.clientX;
    const leftBoundary = viewerWidth / 3;
    const rightBoundary = (viewerWidth * 2) / 3;
    
    console.log('🖱️ CLICK:', { clickX, leftBoundary, rightBoundary });
    
    if (clickX < leftBoundary) {
      console.log('⬅️ CLICK LEFT → PREV');
      handlePrevPage();
    } else if (clickX > rightBoundary) {
      console.log('➡️ CLICK RIGHT → NEXT');
      handleNextPage();
    }
  };

  const handleZoomIn = () => {
    if (renditionRef.current && fontSize < 200) {
      const newSize = fontSize + 10;
      setFontSize(newSize);
      renditionRef.current.themes.fontSize(`${newSize}%`);
    }
  };

  const handleZoomOut = () => {
    if (renditionRef.current && fontSize > 60) {
      const newSize = fontSize - 10;
      setFontSize(newSize);
      renditionRef.current.themes.fontSize(`${newSize}%`);
    }
  };

  const handleTocClick = async (href: string) => {
    if (renditionRef.current) {
      await renditionRef.current.display(href);
      setShowToc(false);
    }
  };

  // Content protection - prevent copying, right-click, etc.
  useEffect(() => {
    const preventContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      toast({
        title: "Content Protected",
        description: "This content is protected and cannot be copied.",
        variant: "destructive",
        duration: 2000,
      });
    };
    
    const preventCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      toast({
        title: "Copy Disabled",
        description: "This content is protected and cannot be copied.",
        variant: "destructive",
        duration: 2000,
      });
    };
    
    const preventCut = (e: ClipboardEvent) => e.preventDefault();
    const preventDrag = (e: DragEvent) => e.preventDefault();
    const preventSelect = (e: Event) => e.preventDefault();

    // Add protection to viewer element
    const viewer = viewerRef.current;
    if (viewer) {
      viewer.addEventListener("contextmenu", preventContextMenu);
      viewer.addEventListener("copy", preventCopy);
      viewer.addEventListener("cut", preventCut);
      viewer.addEventListener("dragstart", preventDrag);
      viewer.addEventListener("selectstart", preventSelect);
    }

    return () => {
      if (viewer) {
        viewer.removeEventListener("contextmenu", preventContextMenu);
        viewer.removeEventListener("copy", preventCopy);
        viewer.removeEventListener("cut", preventCut);
        viewer.removeEventListener("dragstart", preventDrag);
        viewer.removeEventListener("selectstart", preventSelect);
      }
    };
  }, []);

  // Keyboard navigation and protection
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Prevent copy, cut, paste, select all, print shortcuts
      if ((e.ctrlKey || e.metaKey) && ["c", "x", "a", "p", "s"].includes(e.key.toLowerCase())) {
        e.preventDefault();
        toast({
          title: "Action Disabled",
          description: "This content is protected.",
          variant: "destructive",
          duration: 2000,
        });
        return;
      }
      
      // Prevent F12 (DevTools) and other dev shortcuts
      if (
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && ["i", "j", "c"].includes(e.key.toLowerCase())) ||
        (e.metaKey && e.altKey && ["i", "j", "c"].includes(e.key.toLowerCase()))
      ) {
        e.preventDefault();
        return;
      }
      
      // Navigation
      if (e.key === "ArrowLeft") {
        handlePrevPage();
      } else if (e.key === "ArrowRight") {
        handleNextPage();
      }
    };

    // Prevent printing via window
    const preventPrint = (e: Event) => {
      e.preventDefault();
      toast({
        title: "Print Disabled",
        description: "This content cannot be printed.",
        variant: "destructive",
        duration: 2000,
      });
    };

    window.addEventListener("keydown", handleKeyPress);
    window.addEventListener("beforeprint", preventPrint);
    
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
      window.removeEventListener("beforeprint", preventPrint);
    };
  }, [toast]);

  // Auto-fade TOC button after 5 seconds of inactivity
  useEffect(() => {
    const resetFadeTimer = () => {
      // Clear existing timeout
      if (fadeTimeoutRef.current) {
        clearTimeout(fadeTimeoutRef.current);
      }
      
      // Unfade the button immediately
      setIsTocButtonFaded(false);
      
      // Set new timeout to fade after 5 seconds
      fadeTimeoutRef.current = setTimeout(() => {
        setIsTocButtonFaded(true);
      }, 5000);
    };

    // Reset timer on any interaction
    const handleInteraction = () => {
      resetFadeTimer();
    };

    // Listen for user interactions
    window.addEventListener('touchstart', handleInteraction);
    window.addEventListener('touchmove', handleInteraction);
    window.addEventListener('mousemove', handleInteraction);
    window.addEventListener('click', handleInteraction);
    
    // Start the initial timer
    resetFadeTimer();

    return () => {
      if (fadeTimeoutRef.current) {
        clearTimeout(fadeTimeoutRef.current);
      }
      window.removeEventListener('touchstart', handleInteraction);
      window.removeEventListener('touchmove', handleInteraction);
      window.removeEventListener('mousemove', handleInteraction);
      window.removeEventListener('click', handleInteraction);
    };
  }, []);

  // Unfade button when navigating
  useEffect(() => {
    if (fadeTimeoutRef.current) {
      clearTimeout(fadeTimeoutRef.current);
    }
    setIsTocButtonFaded(false);
    fadeTimeoutRef.current = setTimeout(() => {
      setIsTocButtonFaded(true);
    }, 5000);
  }, [currentPage]);

  if (error) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
        <div className="text-center max-w-md">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={onClose} className="bg-[#D01E1E] hover:bg-[#B01818]">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="bg-white flex flex-col" 
      style={{ 
        overflowX: 'hidden',
        minHeight: '100vh',
        minHeight: '-webkit-fill-available',
      }}
    >
      {/* Print protection */}
      <style>{`
        @keyframes fadeInOut {
          0% {
            opacity: 0;
          }
          30% {
            opacity: 1;
          }
          70% {
            opacity: 1;
          }
          100% {
            opacity: 0;
          }
        }
        
        @media print {
          body * {
            visibility: hidden !important;
          }
          body::after {
            content: "This content is protected and cannot be printed.";
            visibility: visible;
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 24px;
            font-weight: bold;
          }
        }
      `}</style>
      
      {/* Header */}
      <div className={`border-b sticky top-0 z-50 shadow-sm transition-colors duration-300 ${
        theme === 'morning' ? 'bg-white border-gray-200' :
        theme === 'evening' ? 'bg-[#F5E6D3] border-[#8B4513]' :
        'bg-[#1A1A1A] border-gray-700'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-[#D01E1E] hover:text-[#B01818]"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className={`font-semibold text-lg truncate max-w-xs transition-colors duration-300 ${
                  theme === 'morning' ? 'text-gray-900' :
                  theme === 'evening' ? 'text-amber-900' :
                  'text-gray-100'
                }`}>{bookTitle}</h1>
                <div className="flex flex-col items-center gap-2">
                  <p className={`text-sm transition-colors duration-300 ${
                    theme === 'morning' ? 'text-gray-500' :
                    theme === 'evening' ? 'text-amber-700' :
                    'text-gray-400'
                  }`}>
                    {totalBookLocations > 0 ? 
                      `Location ${currentLocationIndex + 1} of ${totalBookLocations}` : 
                      `Page ${currentPage} of ${totalPages || "..."}`
                    }
                  </p>
                  
                  {/* Progress Bar */}
                  {totalPages > 1 && (
                    <div className="w-full max-w-xs">
                      <div className={`w-full h-1.5 rounded-full transition-colors duration-300 ${
                        theme === 'morning' ? 'bg-gray-200' :
                        theme === 'evening' ? 'bg-amber-200' :
                        'bg-gray-600'
                      }`}>
                        <div 
                          className={`h-full rounded-full transition-all duration-300 ${
                            theme === 'morning' ? 'bg-[#D01E1E]' :
                            theme === 'evening' ? 'bg-amber-600' :
                            'bg-gray-300'
                          }`}
                          style={{
                            width: totalBookLocations > 0 ? 
                              `${(currentLocationIndex / (totalBookLocations - 1)) * 100}%` : 
                              `${((currentPage - 1) / (totalPages - 1)) * 100}%`
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2" style={{ position: 'relative', zIndex: 1002 }}>
              <button 
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 hover:bg-gray-100/50 rounded-lg transition-all duration-200 active:scale-95"
              >
                <Settings className={`w-6 h-6 transition-colors duration-300 ${
                  theme === 'morning' ? 'text-gray-900' :
                  theme === 'evening' ? 'text-amber-900' :
                  'text-gray-100'
                }`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex relative">
        {/* EPUB Viewer */}
        <div className="flex-1 flex flex-col">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 z-10">
              <div className="text-center">
                <Loader2 className="w-12 h-12 animate-spin text-[#D01E1E] mx-auto mb-4" />
                <p className="text-gray-600">Loading EPUB...</p>
              </div>
            </div>
          )}

          <div
            ref={viewerRef}
            className={`flex-1 transition-colors duration-300 relative ${
              theme === 'morning' ? 'bg-white' :
              theme === 'evening' ? 'bg-[#F5E6D3]' :
              'bg-[#1A1A1A]'
            }`}
            style={{ 
              height: "calc(100vh - 64px - 60px)",
              height: "calc(-webkit-fill-available - 64px - 60px)",
              userSelect: "none",
              WebkitUserSelect: "none",
              MozUserSelect: "none",
              msUserSelect: "none",
              WebkitTouchCallout: "none",
            }}
          >
            {/* Invisible touch overlay - only active when TOC/Settings are closed */}
            {!showToc && !showSettings && (
              <div
                style={{
                  position: 'absolute',
                  top: 8, // leave a small gap below the header area to avoid accidental triggers near the top bar
                  left: 0,
                  right: 0,
                  bottom: 0,
                  zIndex: 999,
                  background: 'transparent',
                  cursor: readMode === 'tap' ? 'pointer' : 'default',
                }}
                onClick={handleMouseClick}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
              />
            )}

            {/* Tap Shadow Effects - Left Side */}
            {readMode === 'tap' && tapShadowSide === 'left' && (
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  bottom: 0,
                  width: '150px',
                  background: 'linear-gradient(to right, rgba(0, 0, 0, 0.15), transparent)',
                  pointerEvents: 'none',
                  zIndex: 998,
                  animation: 'fadeInOut 0.4s ease-in-out',
                }}
              />
            )}

            {/* Tap Shadow Effects - Right Side */}
            {readMode === 'tap' && tapShadowSide === 'right' && (
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  bottom: 0,
                  width: '150px',
                  background: 'linear-gradient(to left, rgba(0, 0, 0, 0.15), transparent)',
                  pointerEvents: 'none',
                  zIndex: 998,
                  animation: 'fadeInOut 0.4s ease-in-out',
                }}
              />
            )}
            {/* Tap Indicators - Only show in tap mode and when TOC/Settings are closed */}
            {readMode === 'tap' && !showToc && !showSettings && (
              <>
                {/* Left Arrow Indicator */}
                <div 
                  className={`absolute left-8 top-1/2 -translate-y-1/2 pointer-events-none transition-all duration-1000 ${
                    showTapIndicators ? 'opacity-100' : 'opacity-0'
                  }`}
                  style={{
                    filter: 'drop-shadow(0 4px 20px rgba(255, 255, 255, 0.5))',
                    zIndex: 1000,
                  }}
                >
                  <div 
                    className="relative"
                    style={{
                      backdropFilter: 'blur(12px) saturate(180%)',
                      WebkitBackdropFilter: 'blur(12px) saturate(180%)',
                      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.6) 100%)',
                      borderRadius: '50%',
                      padding: '16px',
                      boxShadow: '0 4px 16px rgba(255, 255, 255, 0.3), inset 0 1px 0 rgba(255, 255, 255, 1)',
                      border: '1px solid rgba(255, 255, 255, 0.5)',
                    }}
                  >
                    <ChevronLeft className="w-8 h-8 text-gray-800" strokeWidth={2.5} />
                  </div>
                </div>

                {/* Right Arrow Indicator */}
                <div 
                  className={`absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none transition-all duration-1000 ${
                    showTapIndicators ? 'opacity-100' : 'opacity-0'
                  }`}
                  style={{
                    filter: 'drop-shadow(0 4px 20px rgba(255, 255, 255, 0.5))',
                    zIndex: 1000,
                  }}
                >
                  <div 
                    className="relative"
                    style={{
                      backdropFilter: 'blur(12px) saturate(180%)',
                      WebkitBackdropFilter: 'blur(12px) saturate(180%)',
                      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.6) 100%)',
                      borderRadius: '50%',
                      padding: '16px',
                      boxShadow: '0 4px 16px rgba(255, 255, 255, 0.3), inset 0 1px 0 rgba(255, 255, 255, 1)',
                      border: '1px solid rgba(255, 255, 255, 0.5)',
                    }}
                  >
                    <ChevronRight className="w-8 h-8 text-gray-800" strokeWidth={2.5} />
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Navigation Controls */}
          <div className={`border-t p-4 transition-colors duration-300 ${
            theme === 'morning' ? 'bg-white border-gray-200' :
            theme === 'evening' ? 'bg-[#F5E6D3] border-[#8B4513]' :
            'bg-[#1A1A1A] border-gray-700'
          }`}>
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              {readMode === 'tap' && (
                <Button
                  variant="outline"
                  onClick={handlePrevPage}
                  className={`flex items-center gap-2 transition-colors duration-300 ${
                    theme === 'morning' ? 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50' :
                    theme === 'evening' ? 'bg-[#F5E6D3] border-[#8B4513] text-amber-800 hover:bg-amber-100' :
                    'bg-[#1A1A1A] border-gray-600 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>
              )}
              
              {readMode === 'flip' && <div className="w-24" />}

              <div className="flex flex-col items-center text-center w-full">
                <div className={`text-sm font-medium transition-colors duration-300 ${
                  theme === 'morning' ? 'text-gray-900' :
                  theme === 'evening' ? 'text-amber-900' :
                  'text-gray-100'
                }`}>
                  {totalBookLocations > 0 ? 
                    `Location ${currentLocationIndex + 1} of ${totalBookLocations}` : 
                    `Page ${currentPage} of ${totalPages || "..."}`
                  }
                </div>
                {currentChapterTitle && (
                  <div className={`text-xs truncate max-w-xs mt-0.5 transition-colors duration-300 ${
                    theme === 'morning' ? 'text-gray-500' :
                    theme === 'evening' ? 'text-amber-700' :
                    'text-gray-400'
                  }`}>
                    Chapter: {currentChapterTitle}
                  </div>
                )}
              </div>

              {readMode === 'tap' && (
                <Button
                  variant="outline"
                  onClick={handleNextPage}
                  className={`flex items-center gap-2 transition-colors duration-300 ${
                    theme === 'morning' ? 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50' :
                    theme === 'evening' ? 'bg-[#F5E6D3] border-[#8B4513] text-amber-800 hover:bg-amber-100' :
                    'bg-[#1A1A1A] border-gray-600 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              )}
              
              {readMode === 'flip' && <div className="w-24" />}
            </div>
          </div>
        </div>
      </div>

      {/* Floating TOC Button - Bottom Right with Auto-Fade */}
      <button
        onClick={() => setShowToc(!showToc)}
        className={`fixed bottom-24 right-6 p-4 rounded-full shadow-2xl transition-all duration-700 ${
          showToc || showSettings ? 'scale-0 opacity-0 pointer-events-none' : 'scale-100'
        }`}
        style={{
          zIndex: 1001,
          backdropFilter: 'blur(16px) saturate(180%)',
          WebkitBackdropFilter: 'blur(16px) saturate(180%)',
          backgroundColor: isTocButtonFaded 
            ? 'rgba(208, 30, 30, 0.5)' 
            : 'rgba(208, 30, 30, 0.85)',
          opacity: isTocButtonFaded ? 0.7 : 1,
          boxShadow: isTocButtonFaded
            ? '0 4px 16px rgba(208, 30, 30, 0.4), 0 0 16px rgba(208, 30, 30, 0.3), 0 0 32px rgba(208, 30, 30, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
            : '0 8px 24px rgba(208, 30, 30, 0.5), 0 0 20px rgba(208, 30, 30, 0.4), 0 0 40px rgba(208, 30, 30, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
          border: '1px solid rgba(255, 255, 255, 0.25)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.08)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
        }}
        aria-label="Open Table of Contents"
      >
        <Menu className="w-5 h-5 text-white drop-shadow-lg" />
      </button>

      {/* Table of Contents Overlay */}
      <>
        {/* Backdrop with fade animation */}
        <div 
          className={`fixed inset-0 bg-black bg-opacity-40 z-40 transition-all duration-500 ease-in-out ${
            showToc ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          onClick={() => setShowToc(false)}
          style={{ top: "64px" }}
        />
        
        {/* TOC Panel with slide animation from LEFT and glassmorphism */}
        <style>{`
          .smooth-scroll-toc {
            scroll-behavior: smooth;
            -webkit-overflow-scrolling: touch;
            overscroll-behavior: contain;
          }
          
          .smooth-scroll-toc::-webkit-scrollbar {
            width: 8px;
          }
          
          .smooth-scroll-toc::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 10px;
          }
          
          .smooth-scroll-toc::-webkit-scrollbar-thumb {
            background: rgba(208, 30, 30, 0.3);
            border-radius: 10px;
            transition: background 0.3s ease;
          }
          
          .smooth-scroll-toc::-webkit-scrollbar-thumb:hover {
            background: rgba(208, 30, 30, 0.5);
          }
        `}</style>
        <div 
          className={`smooth-scroll-toc fixed top-16 left-0 bottom-0 w-80 md:w-96 shadow-2xl z-50 overflow-y-auto transition-all duration-500 ease-in-out border-r border-white/20 ${
            showToc ? 'translate-x-0' : '-translate-x-full'
          }`}
          onClick={(e) => e.stopPropagation()}
          style={{
            backdropFilter: 'blur(24px) saturate(180%)',
            WebkitBackdropFilter: 'blur(24px) saturate(180%)',
            backgroundColor: 'rgba(255, 255, 255, 0.65)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.5)',
          }}
        >
          {/* Glassmorphism Header */}
          <div 
            className="sticky top-0 border-b border-white/30 p-4 flex items-center justify-between z-10"
            style={{
              backdropFilter: 'blur(32px) saturate(180%)',
              WebkitBackdropFilter: 'blur(32px) saturate(180%)',
              backgroundColor: 'rgba(255, 255, 255, 0.5)',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.05)',
            }}
          >
            <h3 className="font-semibold text-lg text-gray-900 drop-shadow-sm">Table of Contents</h3>
            <button
              onClick={() => setShowToc(false)}
              className="p-2 hover:bg-white/50 rounded-full transition-all duration-300 backdrop-blur-sm"
              aria-label="Close menu"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
              }}
            >
              <X className="w-5 h-5 drop-shadow-sm" />
            </button>
          </div>
          <div className="p-4 space-y-2">
            {toc.length === 0 ? (
              <p className="text-gray-500 text-sm">No chapters available</p>
            ) : (
              toc.map((item, index) => {
                const isCurrentChapter = currentChapterHref.includes(item.href) || item.href.includes(currentChapterHref.split('#')[0]);
                
                return (
                  <button
                    key={index}
                    onClick={() => handleTocClick(item.href)}
                    className={`w-full text-left text-sm p-3 rounded transition-all duration-200 break-words hover:shadow-md ${
                      isCurrentChapter ? 'font-semibold' : ''
                    }`}
                    style={{
                      backgroundColor: isCurrentChapter 
                        ? '#D01E1E' 
                        : 'rgba(255, 255, 255, 0.4)',
                      backdropFilter: 'blur(8px)',
                      WebkitBackdropFilter: 'blur(8px)',
                      color: isCurrentChapter ? '#FFFFFF' : 'inherit',
                    }}
                    onMouseEnter={(e) => {
                      if (!isCurrentChapter) {
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.7)';
                        e.currentTarget.style.backdropFilter = 'blur(12px)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isCurrentChapter) {
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.4)';
                        e.currentTarget.style.backdropFilter = 'blur(8px)';
                      }
                    }}
                  >
                    {item.label}
                  </button>
                );
              })
            )}
          </div>
        </div>
      </>

      {/* Settings Overlay - Same style as TOC but from RIGHT */}
      <>
        {/* Settings Backdrop */}
        <div 
          className={`fixed inset-0 bg-black bg-opacity-40 z-40 transition-all duration-500 ease-in-out ${
            showSettings ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          onClick={() => setShowSettings(false)}
          style={{ top: "64px" }}
        />
        
        {/* Settings Panel */}
        <div 
          className={`fixed top-16 right-0 bottom-0 w-80 md:w-96 shadow-2xl z-50 overflow-y-auto transition-all duration-500 ease-in-out border-l border-white/20 ${
            showSettings ? 'translate-x-0' : 'translate-x-full'
          }`}
          onClick={(e) => e.stopPropagation()}
          style={{
            backdropFilter: 'blur(24px) saturate(180%)',
            WebkitBackdropFilter: 'blur(24px) saturate(180%)',
            backgroundColor: 'rgba(255, 255, 255, 0.65)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.5)',
          }}
        >
          {/* Glassmorphism Header */}
          <div 
            className="sticky top-0 border-b border-white/30 p-4 flex items-center justify-between z-10"
            style={{
              backdropFilter: 'blur(32px) saturate(180%)',
              WebkitBackdropFilter: 'blur(32px) saturate(180%)',
              backgroundColor: 'rgba(255, 255, 255, 0.5)',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.05)',
            }}
          >
            <h3 className="font-semibold text-lg text-gray-900 drop-shadow-sm">Settings</h3>
            <button
              onClick={() => setShowSettings(false)}
              className="p-2 hover:bg-white/50 rounded-full transition-all duration-300 backdrop-blur-sm"
              aria-label="Close settings"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
              }}
            >
              <X className="w-5 h-5 drop-shadow-sm" />
            </button>
          </div>

          {/* Settings Content */}
          <div className="p-6 space-y-6">
            {/* Font Size Control */}
            <div>
              <label className="text-sm font-semibold text-gray-900 mb-3 block">Text Size</label>
              
              {/* Font Size Slider */}
              <div className="mb-4">
                <input
                  type="range"
                  min="60"
                  max="200"
                  step="5"
                  value={fontSize}
                  onChange={(e) => {
                    const newSize = parseInt(e.target.value);
                    setFontSize(newSize);
                    if (renditionRef.current) {
                      renditionRef.current.themes.fontSize(`${newSize}%`);
                    }
                  }}
                  className="w-full h-2.5 bg-gray-200 rounded-full appearance-none cursor-pointer transition-all"
                  style={{
                    background: `linear-gradient(to right, #D01E1E 0%, #D01E1E ${((fontSize - 60) / 140) * 100}%, #E5E7EB ${((fontSize - 60) / 140) * 100}%, #E5E7EB 100%)`,
                    WebkitAppearance: 'none',
                    MozAppearance: 'none',
                    appearance: 'none',
                  }}
                />
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>Small</span>
                  <span className="font-semibold text-base text-gray-900">{fontSize}%</span>
                  <span>Large</span>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={handleZoomOut} 
                  disabled={fontSize <= 60}
                  className="flex-1 py-2.5 px-4 rounded-full bg-white/60 hover:bg-white/80 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md backdrop-blur-sm border border-gray-200/50"
                >
                  <div className="flex items-center justify-center gap-2">
                    <ZoomOut className="w-4 h-4" />
                    <span className="text-sm font-medium">A-</span>
                  </div>
                </button>
                <button
                  onClick={handleZoomIn} 
                  disabled={fontSize >= 200}
                  className="flex-1 py-2.5 px-4 rounded-full bg-white/60 hover:bg-white/80 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md backdrop-blur-sm border border-gray-200/50"
                >
                  <div className="flex items-center justify-center gap-2">
                    <ZoomIn className="w-4 h-4" />
                    <span className="text-sm font-medium">A+</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Font Selector */}
            <div>
              <label className="text-sm font-semibold text-gray-900 mb-3 block">Font Style</label>
              <div className="relative">
                <button
                  onClick={() => setShowFontSelector(!showFontSelector)}
                  className="w-full py-2.5 px-4 rounded-full bg-white/60 hover:bg-white/80 active:scale-95 transition-all duration-200 shadow-sm hover:shadow-md backdrop-blur-sm border border-gray-200/50 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Type className="w-4 h-4" />
                    <span className="text-sm font-medium">{selectedFont}</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showFontSelector ? 'rotate-180' : ''}`} />
                </button>
                
                {/* Expandable Font List */}
                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  showFontSelector ? 'max-h-[500px] opacity-100 mt-2' : 'max-h-0 opacity-0'
                }`}>
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/50 shadow-lg overflow-hidden">
                    {fonts.map((font, index) => (
                      <button
                        key={font.name}
                        onClick={() => {
                          handleFontChange(font.name, font.family, font.type);
                          setShowFontSelector(false);
                        }}
                        className={`w-full px-4 py-3 text-left hover:bg-gray-50/80 transition-all duration-200 ${
                          index === 0 ? 'rounded-t-xl' : ''
                        } ${
                          index === fonts.length - 1 ? 'rounded-b-xl' : 'border-b border-gray-100/50'
                        } ${
                          selectedFont === font.name ? 'bg-[#D01E1E]/10' : ''
                        }`}
                        style={{ 
                          fontFamily: font.family,
                          animationDelay: `${index * 50}ms`
                        }}
                      >
                        <div className="flex flex-col">
                          <span className="font-semibold text-sm text-gray-900">{font.name}</span>
                          <span className="text-xs text-gray-500 mt-0.5">{font.description}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>


            {/* Read Mode Toggle */}
            <div>
              <label className="text-sm font-semibold text-gray-900 mb-3 block">Read Mode</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setReadMode('tap')}
                  className={`flex-1 py-2.5 px-4 rounded-full transition-all duration-200 shadow-sm hover:shadow-md active:scale-95 ${
                    readMode === 'tap' 
                      ? 'bg-[#D01E1E] text-white shadow-md' 
                      : 'bg-white/60 hover:bg-white/80 border border-gray-200/50'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Fingerprint className="w-4 h-4" />
                    <span className="text-sm font-medium">Tap</span>
                  </div>
                </button>
                <button
                  onClick={() => setReadMode('flip')}
                  className={`flex-1 py-2.5 px-4 rounded-full transition-all duration-200 shadow-sm hover:shadow-md active:scale-95 ${
                    readMode === 'flip' 
                      ? 'bg-[#D01E1E] text-white shadow-md' 
                      : 'bg-white/60 hover:bg-white/80 border border-gray-200/50'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Hand className="w-4 h-4" />
                    <span className="text-sm font-medium">Flip</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Reading Theme Selector */}
            <div>
              <label className="text-sm font-semibold text-gray-900 mb-3 block">Reading Theme</label>
              <div className="grid grid-cols-3 gap-3">
                {/* Morning Delight */}
                <button
                  onClick={() => setTheme('morning')}
                  className={`relative p-4 rounded-xl transition-all duration-200 shadow-md active:scale-95 ${
                    theme === 'morning' 
                      ? 'ring-2 ring-black shadow-lg' 
                      : 'shadow-md'
                  }`}
                  style={{
                    backgroundColor: '#FFFFFF',
                  }}
                >
                  <div className="flex flex-col items-center gap-2">
                    <Sun className="w-5 h-5 text-black" />
                    <div className="text-center">
                      <div className="text-xs text-gray-700">Morning Delight</div>
                    </div>
                  </div>
                </button>

                {/* Evening Calm */}
                <button
                  onClick={() => setTheme('evening')}
                  className={`relative p-4 rounded-xl transition-all duration-200 shadow-md active:scale-95 ${
                    theme === 'evening' 
                      ? 'ring-2 ring-black shadow-lg' 
                      : 'shadow-md'
                  }`}
                  style={{
                    backgroundColor: '#F5E6D3',
                  }}
                >
                  <div className="flex flex-col items-center gap-2">
                    <Sunset className="w-5 h-5 text-amber-800" />
                    <div className="text-center">
                      <div className="text-xs text-amber-800">Evening Calm</div>
                    </div>
                  </div>
                </button>

                {/* Midnight Whisper */}
                <button
                  onClick={() => setTheme('midnight')}
                  className={`relative p-4 rounded-xl transition-all duration-200 shadow-md active:scale-95 ${
                    theme === 'midnight' 
                      ? 'ring-2 ring-black shadow-lg' 
                      : 'shadow-md'
                  }`}
                  style={{
                    backgroundColor: '#1A1A1A',
                  }}
                >
                  <div className="flex flex-col items-center gap-2">
                    <Moon className="w-5 h-5 text-gray-300" />
                    <div className="text-center">
                      <div className="text-xs text-gray-400">Midnight Whisper</div>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    </div>
  );
};

export default EpubReader;