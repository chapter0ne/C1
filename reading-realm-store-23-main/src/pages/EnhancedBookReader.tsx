import { useState, useEffect, useRef } from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import RatingModal from "@/components/RatingModal";
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
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // UI state
  const [showChapters, setShowChapters] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  // Add state for multi-page flow
  const [readerPage, setReaderPage] = useState(0); // 0: cover, 1: info, 2+: chapters

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

  // Calculate reading progress
  const readingProgress = chapters ? ((currentChapter + 1) / chapters.length) * 100 : 0;

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

  const currentChapterData = chapters && chapters[currentChapter] ? chapters[currentChapter] : null;

  const handleChapterChange = (chapterIndex: number) => {
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

    return (
    <div 
      className="min-h-screen flex flex-col"
      style={{ 
        backgroundColor: isMidnight ? '#181818' : currentTheme.background,
        color: isMidnight ? '#fff' : currentTheme.text
      }}
    >
      {/* Mobile: Fixed Top Nav + Progress Bar with Glass Blur */}
      {isMobile && (
        <div className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md" style={{ background: isMidnight ? 'rgba(24,24,24,0.7)' : 'rgba(255,255,255,0.5)', borderBottom: isMidnight ? '1px solid #333' : '1px solid #eee' }}>
          <div className="flex items-center justify-between h-14 px-4">
            <Link to="/library" className="text-[#D01E1E] hover:text-[#B01818]">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex-1 flex flex-col items-center">
              <span className="font-semibold text-base truncate max-w-xs" style={{ color: isMidnight ? '#fff' : '#222' }}>{book.title}</span>
              <span className="text-xs opacity-70" style={{ color: isMidnight ? '#eee' : '#555' }}>by {book.author}</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setShowSettings(!showSettings)} style={{ color: isMidnight ? '#fff' : undefined }}>
                <Settings className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setShowRatingModal(true)} style={{ color: isMidnight ? '#fff' : undefined }}>
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
            background: isMidnight ? 'rgba(24,24,24,0.7)' : 'rgba(255,255,255,0.5)'
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
                  <p className="text-sm opacity-70" style={{ color: isMidnight ? '#eee' : '#555' }}>by {book.author}</p>
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
                  style={{ color: isMidnight ? '#fff' : undefined }}
                >
                  <Settings className="w-4 h-4" />
                </Button>

                {/* Rating */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowRatingModal(true)}
                  style={{ color: isMidnight ? '#fff' : undefined }}
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
                    {idx === currentChapter && (
                      <div className="text-xs opacity-80 mt-1">Current</div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </aside>
        )}

        {/* Mobile Chapters Sheet */}
        {isMobile && (
          <Sheet open={showChapters} onOpenChange={setShowChapters}>
            <SheetContent side="left" className="w-80 p-0">
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
                      {idx === currentChapter && (
                        <div className="text-xs opacity-80 mt-1">Current</div>
                      )}
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
            marginLeft: (!isMobile && showChapters && chapters && chapters.length > 0) ? '320px' : '0'
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
              </div>
            </div>
          </div>

          {/* Chapter Content - Add top padding when settings are open */}
          <div 
            className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-all duration-300 ease-in-out"
            style={{ 
              paddingTop: showSettings ? '280px' : '2rem' // Adjust padding based on settings panel height
            }}
          >
            <div 
              className="reading-content prose prose-lg max-w-none"
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
                dangerouslySetInnerHTML={{ 
                  __html: formatText(currentChapterData.content) 
                }} 
                style={{ 
                  color: currentTheme.text,
                  fontSize: `${fontSize}px !important`,
                  fontFamily: `${selectedFont} !important`,
                  lineHeight: '1.7 !important'
                }}
              />
            </div>
          </div>

          {/* Navigation Footer - Fixed at bottom on mobile */}
          {isMobile && chapters && chapters.length > 1 && (
            <div className="fixed bottom-0 left-0 right-0 z-50 border-t flex items-center justify-between px-4 py-2" style={{ background: isMidnight ? '#181818' : '#fff', borderColor: isMidnight ? '#333' : '#eee' }}>
              <Button
                variant="outline"
                onClick={() => handleChapterChange(Math.max(0, currentChapter - 1))}
                disabled={currentChapter <= 0}
                className="flex items-center gap-2"
                style={{ color: isMidnight ? '#fff' : undefined, borderColor: isMidnight ? '#444' : undefined, background: isMidnight ? '#222' : undefined }}
              >
                <ChevronLeft className="w-4 h-4" /> Prev
              </Button>
              <div className="text-xs opacity-70" style={{ color: isMidnight ? '#eee' : '#555' }}>
                {currentChapter + 1} of {chapters.length}
              </div>
              <Button
                variant="outline"
                onClick={() => handleChapterChange(Math.min(chapters.length - 1, currentChapter + 1))}
                disabled={currentChapter >= chapters.length - 1}
                className="flex items-center gap-2"
                style={{ color: isMidnight ? '#fff' : undefined, borderColor: isMidnight ? '#444' : undefined, background: isMidnight ? '#222' : undefined }}
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
          className="fixed left-0 top-1/3 z-50 bg-[#D01E1E] text-white rounded-r-lg px-3 py-2 shadow-lg hover:bg-[#B01818]"
          onClick={() => setShowChapters(true)}
          style={{ minWidth: 40 }}
          aria-label="Show Chapters"
        >
          <List className="w-5 h-5" />
        </button>
      )}

      {/* Add floating/fixed button to reopen chapter panel (mobile) */}
      {isMobile && chapters && chapters.length > 0 && !showChapters && (
        <button
          className="fixed right-4 bottom-20 z-50 bg-[#D01E1E] text-white rounded-full w-12 h-12 shadow-lg hover:bg-[#B01818] flex items-center justify-center"
          onClick={() => setShowChapters(true)}
          aria-label="Show Chapters"
        >
          <List className="w-5 h-5" />
        </button>
      )}

      {/* Mobile Bottom Nav */}
      {/* Hide MobileBottomNav in reader page */}

      {/* Rating Modal */}
      {showRatingModal && (
      <RatingModal
        isOpen={showRatingModal}
        onClose={() => setShowRatingModal(false)}
        book={book}
          canReview={!!bookState.isInLibrary}
      />
      )}
    </div>
  );
};

export default EnhancedBookReader;
