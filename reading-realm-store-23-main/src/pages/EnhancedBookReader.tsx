import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";

import { 
  BookOpen, 
  ArrowLeft, 
  Menu, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  Minus,
  Plus,
  Search,
  ChevronDown,
  Star,
  Eye,
  Sun,
  Moon,
  Sunset,
  Home,
  Shield,
  Lock,
  X,
  List,
  Bookmark,
  Share2,
  RotateCcw,
  RotateCw
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useBookDetails, useBookChapters } from '@/hooks/useBooks';
import { useBookState } from '@/hooks/useBookState';
import { useToast } from "@/hooks/use-toast";
import { useContentProtection } from "@/hooks/useContentProtection";
import UniversalHeader from "@/components/UniversalHeader";
import MobileBottomNav from "@/components/MobileBottomNav";
import { formatText } from "@/utils/textFormatter";
// Theme configurations
const themes = {
  'Morning Delight': {
    background: '#fefefe',
    text: '#2c2c2c',
    accent: '#f0f0f0',
    border: '#e0e0e0'
  },
  'Evening Serenity': {
    background: '#f0ede5',
    text: '#2a2a2a',
    accent: '#e8e4d8',
    border: '#d8d4c8'
  },
  'Midnight Whisper': {
    background: '#1a1a1a',
    text: '#e0e0e0',
    accent: '#2a2a2a',
    border: '#404040'
  }
};

// Font options
const fonts = [
  { name: 'Classic Serif', value: 'Georgia, serif' },
  { name: 'Modern Sans', value: 'Arial, sans-serif' },
  { name: 'Elegant Times', value: 'Times New Roman, serif' },
  { name: 'Book Antiqua', value: 'Book Antiqua, serif' },
  { name: 'Century Gothic', value: 'Century Gothic, sans-serif' }
];

const EnhancedBookReader = () => {
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const contentRef = useRef<HTMLDivElement>(null);
  // Add a ref for the scrollable reading area
  const readingAreaRef = useRef<HTMLDivElement>(null);
  // Add a ref for the settings panel
  const settingsPanelRef = useRef<HTMLDivElement>(null);

  // Enable comprehensive content protection
  const { protectElement, obfuscateText, deobfuscateText } = useContentProtection({
    enableGlobalProtection: true,
    protectedElements: ['.reading-content', '.book-content', '.chapter-content'],
    showWatermark: true
  });

  const { data: book, isLoading: bookLoading, error: bookError } = useBookDetails(id || '');
  const { data: chapters, isLoading: chaptersLoading, error: chaptersError } = useBookChapters(id || '');
  const { bookState, loading: stateLoading } = useBookState(id || '');

  // Reading state
  const [currentChapter, setCurrentChapter] = useState(0);
  const [fontSize, setFontSize] = useState(() => {
    const saved = localStorage.getItem('reading-font-size');
    return saved ? parseInt(saved) : 18;
  });
  const [selectedFont, setSelectedFont] = useState(() => {
    const saved = localStorage.getItem('reading-font-family');
    return saved || 'Georgia, serif';
  });
  const [selectedTheme, setSelectedTheme] = useState(() => {
    const saved = localStorage.getItem('reading-theme');
    return saved || 'Morning Delight';
  });
  // Force scroll mode for all devices - remove flip mode
  const [scrollType] = useState<'scroll'>('scroll');
  const [currentPage, setCurrentPage] = useState(0);
  const [pagesPerChapter, setPagesPerChapter] = useState(1);

  const [hasAccess, setHasAccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Remove flip animation state - not needed for scroll mode
  
  // UI state
  const [showChapters, setShowChapters] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  // Add state for multi-page flow
  const [readerPage, setReaderPage] = useState(0); // 0: cover, 1: info, 2+: chapters

  // Touch event handlers for swipe detection
  const [touchStart, setTouchStart] = useState<number>(0);
  const [touchStartTime, setTouchStartTime] = useState<number>(0);
  const [touchEnd, setTouchEnd] = useState<number>(0);

  // Remove page cache - not needed for scroll mode

  // Reading position persistence
  // Note: Reading position (chapter/page) is saved per book
  // Reading preferences (font, theme, scroll type) are saved globally
  const getReadingPositionKey = (bookId: string) => `reading-position-${bookId}`;
  
  const saveReadingPosition = (bookId: string, chapter: number, page: number, scrollPosition?: number) => {
    try {
      const position = {
        chapter,
        page,
        scrollPosition: scrollPosition || 0,
        timestamp: Date.now(),
        bookId
      };
      localStorage.setItem(getReadingPositionKey(bookId), JSON.stringify(position));
    } catch (error) {
      console.warn('Failed to save reading position:', error);
    }
  };
  
  const loadReadingPosition = (bookId: string) => {
    try {
      const saved = localStorage.getItem(getReadingPositionKey(bookId));
      if (saved) {
        const position = JSON.parse(saved);
        // Only restore if the saved position is for the same book
        if (position.bookId === bookId) {
          return position;
        }
      }
      return null;
    } catch (error) {
      console.warn('Failed to load reading position:', error);
      return null;
    }
  };

  const clearReadingPosition = (bookId: string) => {
    try {
      localStorage.removeItem(getReadingPositionKey(bookId));
    } catch (error) {
      console.warn('Failed to clear reading position:', error);
    }
  };

  const hasReadingProgress = (bookId: string) => {
    return localStorage.getItem(getReadingPositionKey(bookId)) !== null;
  };

  const getReadingStats = (bookId: string) => {
    const position = loadReadingPosition(bookId);
    if (!position || !chapters) return null;
    
    const totalChapters = chapters.length;
    const progressPercentage = ((position.chapter + 1) / totalChapters) * 100;
    
    return {
      currentChapter: position.chapter + 1,
      totalChapters,
      progressPercentage,
      lastRead: new Date(position.timestamp).toLocaleDateString()
    };
  };



  // Check mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (!user || !book) {
      setHasAccess(false);
      return;
    }
    // Access logic: free book or in library (purchased)
    if (book.isFree || bookState.isInLibrary) {
      setHasAccess(true);
      setError(null);
    } else {
      setHasAccess(false);
      setError('You need to purchase this book to read it');
    }
  }, [user, book, bookState]);

  useEffect(() => {
    if (chapters && chapters.length > 0 && currentChapter === 0) {
      setCurrentChapter(0);
    }
  }, [chapters]);

  // Load saved reading position when component mounts
  useEffect(() => {
    if (id && chapters && chapters.length > 0 && hasAccess) {
      const savedPosition = loadReadingPosition(id);
      if (savedPosition) {
        // Restore chapter and page
        if (savedPosition.chapter < chapters.length) {
          setCurrentChapter(savedPosition.chapter);
          
          // Only show chapters pane automatically if it's chapter 1 (index 0)
          if (savedPosition.chapter === 0) {
            setShowChapters(true);
          } else {
            setShowChapters(false);
          }
          
          // For scroll mode, restore exact scroll position within the chapter
          setTimeout(() => {
            if (readingAreaRef.current && document.readyState === 'complete') {
              const chapterElement = readingAreaRef.current.querySelector(`[data-chapter="${savedPosition.chapter}"]`);
              if (chapterElement) {
                // First scroll to the chapter
                chapterElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                
                // Then restore the exact scroll position within the chapter
                if (savedPosition.scrollPosition && savedPosition.scrollPosition > 0) {
                  setTimeout(() => {
                    if (readingAreaRef.current) {
                      readingAreaRef.current.scrollTop = savedPosition.scrollPosition;
                    }
                  }, 100); // Small delay to ensure scroll into view is complete
                }
              }
            }
          }, 300); // Increased timeout to ensure DOM is ready
          
          // Only show toast notification if NOT chapter 1 (to avoid both effects happening together)
          if (savedPosition.chapter > 0) {
            toast({
              title: "Reading position restored",
              description: `Resumed from Chapter ${savedPosition.chapter + 1}`,
              duration: 3000,
            });
          }
        }
      }
    }
  }, [id, chapters, hasAccess, toast]); // Removed scrollType dependency

  // Remove page calculation function - not needed for scroll mode

  // Remove flip mode page calculation - not needed for scroll mode

  // Save reading position when chapter changes
  useEffect(() => {
    if (id && hasAccess && chapters && chapters.length > 0) {
      saveReadingPosition(id, currentChapter, currentPage);
    }
  }, [id, currentChapter, hasAccess, chapters]);

  // Save scroll position as user reads (debounced to avoid excessive saves)
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const handleScroll = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        if (id && hasAccess && chapters && chapters.length > 0 && readingAreaRef.current) {
          const scrollPosition = readingAreaRef.current.scrollTop;
          saveReadingPosition(id, currentChapter, currentPage, scrollPosition);
        }
      }, 500); // Debounce scroll saves by 500ms
    };

    const readingArea = readingAreaRef.current;
    if (readingArea) {
      readingArea.addEventListener('scroll', handleScroll, { passive: true });
      
      return () => {
        clearTimeout(timeoutId);
        readingArea.removeEventListener('scroll', handleScroll);
      };
    }
  }, [id, currentChapter, currentPage, hasAccess, chapters]);

  // Remove flip mode page change saving - not needed for scroll mode

  // Remove page cache management - not needed for scroll mode

  // Save reading position when component unmounts or user navigates away
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (id && hasAccess && chapters && chapters.length > 0) {
        const scrollPosition = readingAreaRef.current?.scrollTop || 0;
        saveReadingPosition(id, currentChapter, currentPage, scrollPosition);
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden && id && hasAccess && chapters && chapters.length > 0) {
        const scrollPosition = readingAreaRef.current?.scrollTop || 0;
        saveReadingPosition(id, currentChapter, currentPage, scrollPosition);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      // Also save when component unmounts
      if (id && hasAccess && chapters && chapters.length > 0) {
        const scrollPosition = readingAreaRef.current?.scrollTop || 0;
        saveReadingPosition(id, currentChapter, currentPage, scrollPosition);
      }
    };
  }, [id, currentChapter, currentPage, scrollType, hasAccess, chapters]);







  // Calculate current page position across all chapters for progress bar
  const calculateCurrentPagePosition = () => {
    try {
      if (!chapters || chapters.length === 0) return 0;
      let currentPosition = 0;
      for (let i = 0; i < currentChapter; i++) {
        if (chapters[i] && chapters[i].content) {
          currentPosition += 1; // Each chapter counts as 1 page in scroll mode
        }
      }
      currentPosition += currentPage;
      return currentPosition;
    } catch (error) {
      console.warn('Error calculating current page position:', error);
      return 0;
    }
  };

  // Calculate total pages across all chapters for progress bar
  const calculateTotalPages = () => {
    try {
      if (!chapters || chapters.length === 0) return 0;
      let totalPages = 0;
      chapters.forEach(chapter => {
        if (chapter && chapter.content) {
          totalPages += 1; // Each chapter counts as 1 page in scroll mode
        }
      });
      return totalPages;
    } catch (error) {
      console.warn('Error calculating total pages:', error);
      return 0;
    }
  };

  // Get current page position for display (scroll mode only)
  const getCurrentPagePosition = () => currentChapter + 1;

  // Get total count for display (scroll mode only)
  const getTotalPages = () => chapters?.length || 0;

  // Calculate reading progress (scroll mode only)
  const readingProgress = chapters && chapters.length > 0 ? ((currentChapter + 1) / chapters.length) * 100 : 0;

  // Get current chapter data
  const currentChapterData = chapters && chapters[currentChapter] ? chapters[currentChapter] : null;

  // Apply theme styles
  const currentTheme = themes[selectedTheme as keyof typeof themes];
  const isMidnight = selectedTheme === 'Midnight Whisper';

  // Handle click outside settings panel
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showSettings && settingsPanelRef.current && !settingsPanelRef.current.contains(event.target as Node)) {
        // Check if the click is on a Select dropdown or other UI component that should not close the panel
        const target = event.target as Element;
        const isSelectDropdown = target.closest('[data-radix-select-content]') || 
                                target.closest('[data-radix-select-trigger]') ||
                                target.closest('[role="option"]') ||
                                target.closest('[data-radix-select-item]') ||
                                target.closest('[data-radix-portal]') ||
                                target.closest('[data-radix-popper-content-wrapper]');
        
        // Don't close if clicking on Select dropdowns or any Radix UI components
        if (isSelectDropdown) {
          return;
        }
        
        // Additional check for any Radix UI portal content
        const isRadixPortal = target.closest('[data-radix-portal]') || 
                             target.closest('[data-radix-popper-content-wrapper]') ||
                             target.closest('[role="listbox"]') ||
                             target.closest('[role="combobox"]');
        
        if (isRadixPortal) {
          return;
        }
        
        setShowSettings(false);
      }
    };

    if (showSettings) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSettings]);

  // Remove scroll type change handler - not needed for scroll mode

  // Remove page content function - not needed for scroll mode

  // Remove flip mode functions - not needed for scroll mode



  // Remove page flip function - not needed for scroll mode

  // Remove touch handlers - not needed for scroll mode
  // Remove vertical scroll handler - not needed for scroll mode

  // Navigation functions for scroll mode
  const handlePreviousChapter = () => {
    if (chapters && chapters.length > 0 && currentChapter > 0) {
      setCurrentChapter(currentChapter - 1);
      setCurrentPage(0);
    }
  };

  const handleNextChapter = () => {
    if (chapters && chapters.length > 0 && currentChapter < chapters.length - 1) {
      setCurrentChapter(currentChapter + 1);
      setCurrentPage(0);
    }
  };

  if (authLoading || bookLoading || chaptersLoading || stateLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D01E1E] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading book...</p>
        </div>
      </div>
    );
  }

  if (bookError || chaptersError) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Error loading book: {bookError?.message || chaptersError?.message}</p>
          <Link to="/library" className="text-[#D01E1E] hover:underline mt-2 inline-block">
            Return to Library
          </Link>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Book not found</p>
          <Link to="/library" className="text-[#D01E1E] hover:underline mt-2 inline-block">
            Return to Library
          </Link>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Lock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">{error}</p>
          <Link to={`/book/${id}`} className="text-[#D01E1E] hover:underline">
            View Book Details
          </Link>
        </div>
      </div>
    );
  }

  const handleChapterChange = (chapterIndex: number) => {
    if (!chapters || chapters.length === 0 || chapterIndex < 0 || chapterIndex >= chapters.length) {
      return;
    }
    
    // Save current scroll position before changing chapters
    if (id && hasAccess && readingAreaRef.current) {
      const currentScrollPosition = readingAreaRef.current.scrollTop;
      saveReadingPosition(id, currentChapter, currentPage, currentScrollPosition);
    }
    
    setCurrentChapter(chapterIndex);
    // Auto-hide chapters panel on mobile after selection
    if (isMobile) {
      setShowChapters(false);
    }
    // Scroll to top of the page when changing chapters
    setTimeout(() => {
      // Scroll the window to top for immediate effect
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      // Also scroll the content area to ensure it's at the top
      if (contentRef.current) {
        contentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
      
      // Scroll the main reading area as well
      if (readingAreaRef.current) {
        readingAreaRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 100); // Small delay to ensure state update is complete
  };

  const handleFontSizeChange = (increment: boolean) => {
    setFontSize(prev => {
      const newSize = increment ? prev + 1 : prev - 1;
      const finalSize = Math.max(12, Math.min(32, newSize));
      localStorage.setItem('reading-font-size', finalSize.toString());
      
      // Reset to first page when font size changes to recalculate pagination
      // Not needed for scroll mode
      
      return finalSize;
    });
  };

  const handleThemeChange = (theme: string) => {
    setSelectedTheme(theme);
    localStorage.setItem('reading-theme', theme);
  };

  const handleFontChange = (font: string) => {
    setSelectedFont(font);
    localStorage.setItem('reading-font-family', font);
  };

  // Get the content for the current page using efficient character-based pagination
  const getCurrentPageContent = () => {
    if (!currentChapterData || !currentChapterData.content || !chapters || chapters.length === 0) {
      return '';
    }
    
    const content = currentChapterData.content;
    const containerHeight = window.innerHeight - 350;
    const containerWidth = 800 - 40; // maxWidth - padding
    
    // Estimate characters per line and lines per page
    const charsPerLine = Math.floor(containerWidth / (fontSize * 0.6));
    const linesPerPage = Math.floor(containerHeight / (fontSize * 1.7));
    const charsPerPage = charsPerLine * linesPerPage;
    
    // Calculate page boundaries
    const startChar = currentPage * charsPerPage;
    const endChar = Math.min(startChar + charsPerPage, content.length);
    
    // Extract content for current page
    let pageContent = content.substring(startChar, endChar);
    
    // Try to break at word boundaries for better readability
    if (endChar < content.length) {
      const lastSpaceIndex = pageContent.lastIndexOf(' ');
      if (lastSpaceIndex > charsPerPage * 0.8) { // If we can break at a word within 80% of the page
        pageContent = pageContent.substring(0, lastSpaceIndex);
      }
    }
    
    return formatText(pageContent);
  };

  // Get the total number of pages in the current chapter
  const getPagesInCurrentChapter = () => {
    if (!currentChapterData || !currentChapterData.content || !chapters || chapters.length === 0) {
      return 1;
    }
    
    return 1; // Each chapter counts as 1 page in scroll mode
  };



  return (
    <div 
      className="min-h-screen flex flex-col"
      style={{ 
        backgroundColor: isMidnight ? '#181818' : currentTheme.background,
        color: isMidnight ? '#fff' : currentTheme.text
      }}
    >
      <style>
        {`
          .page-content {
            overflow: hidden !important;
            scrollbar-width: none !important;
            -ms-overflow-style: none !important;
          }
          .page-content::-webkit-scrollbar {
            display: none !important;
          }
          .page-content * {
            overflow: hidden !important;
            max-width: 100% !important;
          }
        `}
      </style>
      {/* Mobile: Fixed Top Nav + Progress Bar with Glass Blur */}
      {isMobile && (
        <div className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md" style={{ background: isMidnight ? 'rgba(24,24,24,0.2)' : 'rgba(255,255,255,0.2)', borderBottom: isMidnight ? '1px solid rgba(51,51,51,0.2)' : '1px solid rgba(238,238,238,0.2)' }}>
          <div className="flex items-center justify-between h-14 px-4">
            <Link to="/library" className="text-[#D01E1E] hover:text-[#B01818]">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex-1 flex flex-col items-center">
              <span className="font-semibold text-base truncate max-w-xs" style={{ color: isMidnight ? '#fff' : '#222' }}>{book.title}</span>
              <span className="text-xs opacity-70 truncate max-w-xs" style={{ color: isMidnight ? '#eee' : '#555' }}>by {book.author}</span>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowSettings(!showSettings)} 
                className="rounded-full transition-all duration-200 hover:scale-105"
                style={{ 
                  color: isMidnight ? '#fff' : undefined,
                  backgroundColor: 'transparent'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = isMidnight ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <Settings className="w-4 h-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {}} // Review functionality disabled
                className="rounded-full transition-all duration-200 hover:scale-105 opacity-50 cursor-not-allowed"
                style={{ 
                  color: isMidnight ? '#fff' : undefined,
                  backgroundColor: 'transparent'
                }}
                title="Review functionality disabled"
              >
                <Star className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="px-4 pb-2">
            <div className="flex justify-between text-xs mb-1">
              <span style={{ color: isMidnight ? '#e0e0e0' : '#555' }}>Progress</span>
              <span style={{ color: isMidnight ? '#e0e0e0' : '#555' }}>{Math.round(readingProgress)}%</span>
            </div>
            <Progress 
              value={readingProgress} 
              className="h-2"
              style={{ 
                backgroundColor: isMidnight ? '#0f3460' : currentTheme.accent,
                '--progress-background': isMidnight ? '#4fc3f7' : '#D01E1E',
                border: isMidnight ? '1px solid #0f3460' : undefined
              } as React.CSSProperties}
            />
            <div className="text-xs opacity-70 mt-1" style={{ color: isMidnight ? '#e0e0e0' : '#555' }}>
              Chapter {currentChapter + 1} of {chapters?.length || 0}
            </div>
          </div>
        </div>
      )}
      {/* Desktop: Keep existing header */}
      {!isMobile && (
        <div 
          className="border-b sticky top-0 z-40 backdrop-blur-md"
          style={{ 
            borderColor: currentTheme.border,
            background: isMidnight ? 'rgba(24,24,24,0.2)' : 'rgba(255,255,255,0.2)'
          }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-20">
              {/* Left side */}
              <div className="flex items-center gap-4">
                <Link to="/library" className="text-[#D01E1E] hover:text-[#B01818]">
                  <ArrowLeft className="w-5 h-5" />
                </Link>
                <div className="hidden sm:block">
                  <h1 className="font-semibold text-lg truncate max-w-xs" style={{ color: isMidnight ? '#fff' : '#222' }}>{book.title}</h1>
                  <p className="text-sm opacity-70 truncate max-w-xs" style={{ color: isMidnight ? '#eee' : '#555' }}>by {book.author}</p>
                </div>
              </div>

              {/* Center - Progress */}
              <div className="hidden md:flex items-center gap-4 flex-1 max-w-md mx-8">
                <div className="flex-1">
                  <div className="flex justify-between text-xs mb-1">
                    <span style={{ color: isMidnight ? '#e0e0e0' : '#555' }}>Progress</span>
                    <span style={{ color: isMidnight ? '#e0e0e0' : '#555' }}>{Math.round(readingProgress)}%</span>
                  </div>
                  <Progress 
                    value={readingProgress} 
                    className="h-2"
                    style={{ 
                      backgroundColor: isMidnight ? '#0f3460' : currentTheme.accent,
                      '--progress-background': isMidnight ? '#4fc3f7' : '#D01E1E',
                      border: isMidnight ? '1px solid #0f3460' : undefined
                    } as React.CSSProperties}
                  />
                  <div className="text-xs opacity-70 mt-1" style={{ color: isMidnight ? '#e0e0e0' : '#555' }}>
                    Chapter {currentChapter + 1} of {chapters?.length || 0}
                  </div>
                </div>
              </div>

              {/* Right side */}
              <div className="flex items-center gap-2">
                {/* Mobile: Chapters button */}
                {isMobile && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowChapters(!showChapters)}
                    className="md:hidden"
                  >
                    <List className="w-4 h-4" />
                  </Button>
                )}

                {/* Settings */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSettings(!showSettings)}
                  className="rounded-full transition-all duration-200 hover:scale-105"
                  style={{ 
                    color: isMidnight ? '#fff' : undefined,
                    backgroundColor: 'transparent'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = isMidnight ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <Settings className="w-4 h-4" />
                </Button>

                {/* Rating */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {}} // Review functionality disabled
                  className="rounded-full transition-all duration-200 hover:scale-105 opacity-50 cursor-not-allowed"
                  style={{ 
                    color: isMidnight ? '#fff' : undefined,
                    backgroundColor: 'transparent'
                  }}
                  title="Review functionality disabled"
                >
                  <Star className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex pt-0" style={{ paddingTop: isMobile ? 80 : 0 }}>
        {/* Chapters Sidebar - Desktop with Animation */}
        {!isMobile && chapters && chapters.length > 0 && (
          <aside 
            className={`w-80 border-r fixed left-0 top-20 h-screen overflow-y-auto z-30 transition-all duration-300 ease-in-out ${
              showChapters ? 'translate-x-0' : '-translate-x-full'
            }`}
            style={{ 
              borderColor: currentTheme.border, 
              backgroundColor: currentTheme.background,
              backdropFilter: 'blur(8px)',
              boxShadow: '2px 0 8px rgba(0, 0, 0, 0.1)'
            }}
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold" style={{ color: currentTheme.text }}>Chapters</h3>
              <Button
                variant="ghost"
                size="sm"
                  onClick={() => setShowChapters(false)}
                  style={{ color: currentTheme.text }}
              >
                  <X className="w-4 h-4" />
              </Button>
              </div>
              
              {/* Reading Progress Summary - Removed for desktop mode */}
              
              <div className="space-y-1">
                {chapters.map((chapter: any, idx: number) => (
                  <button
                    key={chapter._id || chapter.id}
                    onClick={() => handleChapterChange(idx)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      idx === currentChapter 
                        ? 'bg-[#D01E1E] text-white' 
                        : 'hover:bg-opacity-10 hover:bg-[#D01E1E]'
                    }`}
                    style={{
                      backgroundColor: idx === currentChapter ? '#D01E1E' : 'transparent',
                      color: idx === currentChapter ? 'white' : currentTheme.text
                    }}
                  >
                    <div className="font-medium text-sm">{chapter.title}</div>
                    <div className="flex items-center justify-between mt-1">
                      {idx === currentChapter && (
                        <div className="text-xs opacity-80">Current</div>
                      )}
                      {idx < currentChapter && (
                        <div className="text-xs opacity-60 flex items-center gap-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          Read
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </aside>
        )}

        {/* Mobile Chapters Sheet */}
        {isMobile && (
          <Sheet open={showChapters} onOpenChange={setShowChapters}>
            <SheetContent side="left" className="w-80 p-0 overflow-y-auto max-h-screen">
              <SheetTitle className="sr-only">Chapter Navigation</SheetTitle>
              <SheetDescription className="sr-only">
                Navigate through the book chapters to jump to different sections
              </SheetDescription>
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Chapters</h3>
                </div>
                
                <div className="space-y-1">
                  {chapters?.map((chapter: any, idx: number) => (
                    <button
                      key={chapter._id || chapter.id}
                      onClick={() => handleChapterChange(idx)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        idx === currentChapter 
                          ? 'bg-[#D01E1E] text-white' 
                          : 'hover:bg-opacity-10 hover:bg-[#D01E1E]'
                      }`}
                    >
                      <div className="font-medium text-sm">{chapter.title}</div>
                      <div className="flex items-center justify-between mt-1">
                        {idx === currentChapter && (
                          <div className="text-xs opacity-80">Current</div>
                        )}
                        {idx < currentChapter && (
                          <div className="text-xs opacity-60 flex items-center gap-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            Read
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        )}

        {/* Reading Area - Adjust margin when sidebar is open with animation */}
        <main 
          className="flex-1 flex flex-col transition-all duration-300 ease-in-out" 
          ref={readingAreaRef} 
          style={{ 
            minHeight: 0, 
            position: 'relative',
            marginLeft: (!isMobile && showChapters && chapters && chapters.length > 0) ? '320px' : '0',
            overflow: 'auto'
          }}
        >
          {/* Settings Panel - Fixed to top with animations */}
          <div 
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out ${
              showSettings 
                ? 'translate-y-0 opacity-100' 
                : '-translate-y-full opacity-0 pointer-events-none'
            }`}
            ref={settingsPanelRef}
            style={{ 
              borderColor: currentTheme.border, 
              backgroundColor: currentTheme.accent,
              borderBottom: `1px solid ${currentTheme.border}`,
              backdropFilter: 'blur(8px)',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
            }}
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg" style={{ color: currentTheme.text }}>Reading Settings</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSettings(false)}
                  style={{ color: currentTheme.text }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
                        
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Font Size */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: currentTheme.text }}>Font Size</label>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleFontSizeChange(false)}
                      disabled={fontSize <= 12}
                      style={{ 
                        color: isMidnight ? '#000' : currentTheme.text,
                        backgroundColor: isMidnight ? '#fff' : currentTheme.background,
                        borderColor: currentTheme.border
                      }}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="w-12 text-center text-sm" style={{ color: currentTheme.text }}>{fontSize}px</span>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleFontSizeChange(true)}
                      disabled={fontSize >= 32}
                      style={{ 
                        color: isMidnight ? '#000' : currentTheme.text,
                        backgroundColor: isMidnight ? '#fff' : currentTheme.background,
                        borderColor: currentTheme.border
                      }}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Font Family */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: currentTheme.text }}>Font</label>
                  <Select value={selectedFont} onValueChange={handleFontChange}>
                    <SelectTrigger className="w-full" style={{ 
                      color: isMidnight ? '#000' : currentTheme.text,
                      backgroundColor: isMidnight ? '#fff' : currentTheme.background,
                      borderColor: currentTheme.border
                    }}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {fonts.map((font) => (
                        <SelectItem key={font.value} value={font.value}>
                          {font.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Theme */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: currentTheme.text }}>Theme</label>
                  <Select value={selectedTheme} onValueChange={handleThemeChange}>
                    <SelectTrigger className="w-full" style={{ 
                      color: isMidnight ? '#000' : currentTheme.text,
                      backgroundColor: isMidnight ? '#fff' : currentTheme.background,
                      borderColor: currentTheme.border
                    }}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Morning Delight">
                        <div className="flex items-center gap-2">
                          <Sun className="w-4 h-4" />
                          Morning Delight
                        </div>
                      </SelectItem>
                      <SelectItem value="Evening Serenity">
                        <div className="flex items-center gap-2">
                          <Sunset className="w-4 h-4" />
                          Evening Serenity
                        </div>
                      </SelectItem>
                      <SelectItem value="Midnight Whisper">
                        <div className="flex items-center gap-2">
                          <Moon className="w-4 h-4" />
                          Midnight Whisper
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Reading Mode - Scroll Only */}
                {/* HIDE: Flip/Scroll dropdown and flip feature for now, only show scroll mode as static text */}
                {/* <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: currentTheme.text }}>Reading Mode</label>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium" style={{ color: currentTheme.text }}>Scroll</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Scroll through chapters vertically
                  </p>
                  <p className="text-xs text-blue-500 mt-1">
                    Flip mode coming soon
                  </p>
                </div> */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: currentTheme.text }}>Reading Mode</label>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium" style={{ color: currentTheme.text }}>Scroll</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Scroll through chapters vertically
                  </p>
                  {/* <p className="text-xs text-blue-500 mt-1">
                    Flip mode coming soon
                  </p> */}
                </div>

                {/* Reading Progress Management */}
                {id && hasReadingProgress(id) && (
                  <div className="md:col-span-3">
                    <label className="block text-sm font-medium mb-2" style={{ color: currentTheme.text }}>Reading Progress</label>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (id) {
                            clearReadingPosition(id);
                            setCurrentChapter(0);
                            setCurrentPage(0);
                            toast({
                              title: "Reading progress reset",
                              description: "Your reading position has been reset to the beginning.",
                              duration: 3000,
                            });
                          }
                        }}
                        style={{ 
                          color: isMidnight ? '#000' : currentTheme.text,
                          backgroundColor: isMidnight ? '#fff' : currentTheme.background,
                          borderColor: currentTheme.border
                        }}
                      >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Reset Progress
                      </Button>
                      <span className="text-xs opacity-70" style={{ color: currentTheme.text }}>
                        Chapter {currentChapter + 1} of {chapters?.length || 0}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Chapter Content - Add top padding when settings are open */}
          <div 
            className="w-full mx-auto px-2 sm:px-4 lg:px-6 py-4 transition-all duration-300 ease-in-out"
            style={{ 
              paddingTop: showSettings ? '280px' : '2rem',
              paddingBottom: isMobile && chapters && chapters.length > 1 ? '80px' : '2rem',
              overflow: 'auto'
            }}
          >
            {/* Scroll Mode - Original vertical scrolling layout */}
            <div 
              className="reading-content prose prose-lg max-w-3xl lg:max-w-4xl xl:max-w-5xl mx-auto"
              ref={contentRef}
              style={{
                fontSize: `${fontSize}px`,
                fontFamily: selectedFont,
                lineHeight: '1.7',
                color: isMidnight ? '#fff' : currentTheme.text,
                background: isMidnight ? '#181818' : undefined
              }}
            >
              <h1 className="text-3xl font-bold mb-6 text-center" style={{ color: currentTheme.text }}>
                {currentChapterData.title}
              </h1>
              <div 
                className="chapter-content"
                data-chapter={currentChapter}
                dangerouslySetInnerHTML={{ 
                  __html: (() => {
                    try {
                      return formatText(currentChapterData.content);
                    } catch (error) {
                      console.warn('Error formatting chapter content:', error);
                      return 'Content loading...';
                    }
                  })()
                }} 
                style={{ 
                  color: currentTheme.text,
                  fontSize: `${fontSize}px !important`,
                  fontFamily: `${selectedFont} !important`,
                  lineHeight: '1.7 !important',
                  padding: '0 20px' // Add horizontal padding for better readability
                }}
              />
            </div>
          </div>

          {/* Mobile Bottom Nav - Always show in scroll mode */}
          {isMobile && (
            <div
              className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 backdrop-blur-md"
              style={{ 
                background: isMidnight ? 'rgba(24,24,24,0.2)' : 'rgba(255,255,255,0.2)',
                borderTop: isMidnight ? '1px solid rgba(51,51,51,0.2)' : '1px solid rgba(238,238,238,0.2)',
                boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.03)'
              }}
            >
              <Button
                variant="outline"
                onClick={() => handleChapterChange(Math.max(0, currentChapter - 1))}
                disabled={currentChapter <= 0}
                className="flex items-center gap-2"
                style={{ 
                  color: isMidnight ? '#fff' : undefined, 
                  borderColor: isMidnight ? 'rgba(68,68,68,0.2)' : 'rgba(209,213,219,0.2)', 
                  background: isMidnight ? 'rgba(34,34,34,0.2)' : 'rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(8px)'
                }}
              >
                <ChevronLeft className="w-4 h-4" /> Prev
              </Button>
              <div className="text-xs opacity-70" style={{ color: isMidnight ? '#eee' : '#555' }}>
                {`Page ${getCurrentPagePosition() + 1} of ${getTotalPages()}`}
              </div>
              <Button
                variant="outline"
                onClick={() => handleChapterChange(Math.min(chapters.length - 1, currentChapter + 1))}
                disabled={currentChapter >= chapters.length - 1}
                className="flex items-center gap-2"
                style={{ 
                  color: isMidnight ? '#fff' : undefined, 
                  borderColor: isMidnight ? 'rgba(68,68,68,0.2)' : 'rgba(209,213,219,0.2)', 
                  background: isMidnight ? 'rgba(34,34,34,0.2)' : 'rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(8px)'
                }}
              >
                Next <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </main>
      </div>

      {/* Add floating/fixed button to reopen chapter panel (desktop) */}
      {!isMobile && !showChapters && (
        <button
          className="fixed left-0 z-50 text-white rounded-r-lg px-3 py-2 shadow-lg backdrop-blur-md"
          onClick={() => setShowChapters(true)}
          style={{ 
            top: 'calc(33.33% - 10px)',
            minWidth: 40,
            background: 'rgba(208,30,30,0.85)',
            border: '1px solid rgba(208,30,30,0.3)',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 8px 32px rgba(208,30,30,0.3)'
          }}
          aria-label="Show Chapters"
        >
          <List className="w-5 h-5" />
        </button>
      )}

      {/* Add floating/fixed button to reopen chapter panel (mobile) */}
      {isMobile && chapters && chapters.length > 0 && !showChapters && (
        <button
          className="fixed right-4 z-50 text-white rounded-full w-12 h-12 shadow-lg flex items-center justify-center backdrop-blur-md"
          onClick={() => setShowChapters(true)}
          style={{
            bottom: 'calc(3rem + 20px)',
            background: 'rgba(208,30,30,0.85)',
            border: '1px solid rgba(208,30,30,0.3)',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 8px 32px rgba(208,30,30,0.3)'
          }}
          aria-label="Show Chapters"
        >
          <List className="w-5 h-5" />
        </button>
      )}

      {/* Removed extra white floating chapter button */}

      {/* Mobile Bottom Nav */}
      {/* Hide MobileBottomNav in reader page */}


    </div>
  );
};

export default EnhancedBookReader;

