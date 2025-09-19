import React, { useMemo, useCallback, useRef, useEffect, useState } from 'react';
import { formatText } from '@/utils/textFormatter';

interface Chapter {
  _id?: string;
  id?: string;
  title: string;
  content: string;
  order: number;
}

interface VirtualizedChapterReaderProps {
  chapters: Chapter[];
  currentChapter: number;
  fontSize: number;
  selectedFont: string;
  currentTheme: any;
  onChapterChange: (chapterIndex: number) => void;
  onScrollPositionChange: (chapterIndex: number, scrollPosition: number) => void;
  height: number;
}

const VirtualizedChapterReader: React.FC<VirtualizedChapterReaderProps> = ({
  chapters,
  currentChapter,
  fontSize,
  selectedFont,
  currentTheme,
  onChapterChange,
  onScrollPositionChange,
  height
}) => {
  const [useVirtualization, setUseVirtualization] = useState(false);
  const [List, setList] = useState<any>(null);
  const listRef = useRef<any>(null);
  const [scrollPositions, setScrollPositions] = useState<Map<number, number>>(new Map());

  // Dynamically import react-window to avoid SSR issues
  useEffect(() => {
    const loadVirtualization = async () => {
      try {
        const reactWindow = await import('react-window');
        setList(() => reactWindow.List);
        setUseVirtualization(true);
      } catch (error) {
        console.warn('Virtualization not available, falling back to regular reader:', error);
        setUseVirtualization(false);
      }
    };

    loadVirtualization();
  }, []);

  // Calculate chapter heights based on content length and font size
  const chapterHeights = useMemo(() => {
    return chapters.map(chapter => {
      const contentLength = chapter.content?.length || 0;
      const charsPerLine = Math.floor(800 / (fontSize * 0.6));
      const linesPerChapter = Math.ceil(contentLength / charsPerLine);
      const chapterHeight = Math.max(linesPerChapter * fontSize * 1.7, 400); // Minimum height
      return Math.ceil(chapterHeight);
    });
  }, [chapters, fontSize]);

  // Memoize chapter renderer to prevent unnecessary re-renders
  const ChapterRenderer = useCallback(({ index, style }: { index: number; style: React.CSSProperties }) => {
    const chapter = chapters[index];
    if (!chapter) return null;

    const isCurrentChapter = index === currentChapter;

    return (
      <div 
        style={style}
        className="chapter-container"
        data-chapter={index}
      >
        <div 
          className="chapter-content prose prose-lg max-w-3xl lg:max-w-4xl xl:max-w-5xl mx-auto px-4"
          style={{
            fontSize: `${fontSize}px`,
            fontFamily: selectedFont,
            lineHeight: '1.7',
            color: currentTheme.text,
            minHeight: '100%',
            padding: '20px'
          }}
        >
          <h1 className="text-3xl font-bold mb-6 text-center" style={{ color: currentTheme.text }}>
            {chapter.title}
          </h1>
          <div 
            className="chapter-text"
            dangerouslySetInnerHTML={{ 
              __html: formatText(chapter.content || '') 
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
    );
  }, [chapters, currentChapter, fontSize, selectedFont, currentTheme]);

  // Scroll to current chapter when it changes
  useEffect(() => {
    if (listRef.current && currentChapter >= 0 && currentChapter < chapters.length) {
      // Calculate offset to current chapter
      let offset = 0;
      for (let i = 0; i < currentChapter; i++) {
        offset += chapterHeights[i] || 400;
      }
      
      listRef.current.scrollTo(offset);
    }
  }, [currentChapter, chapters.length, chapterHeights]);

  // Handle scroll events to track position
  const handleScroll = useCallback(({ scrollOffset }: { scrollOffset: number }) => {
    // Find which chapter is currently visible
    let currentOffset = 0;
    let visibleChapter = 0;
    
    for (let i = 0; i < chapters.length; i++) {
      const chapterHeight = chapterHeights[i] || 400;
      if (scrollOffset >= currentOffset && scrollOffset < currentOffset + chapterHeight) {
        visibleChapter = i;
        break;
      }
      currentOffset += chapterHeight;
    }

    // Update scroll position for current chapter
    const chapterScrollOffset = scrollOffset - currentOffset;
    setScrollPositions(prev => new Map(prev.set(visibleChapter, chapterScrollOffset)));
    
    // Notify parent of scroll position change
    onScrollPositionChange(visibleChapter, chapterScrollOffset);
  }, [chapters.length, chapterHeights, onScrollPositionChange]);

  // Get current scroll position for a specific chapter
  const getChapterScrollPosition = useCallback((chapterIndex: number) => {
    return scrollPositions.get(chapterIndex) || 0;
  }, [scrollPositions]);

  // Fallback to regular reader if virtualization is not available
  if (!useVirtualization || !List) {
    return (
      <div className="regular-chapter-reader" style={{ height, overflowY: 'auto' }}>
        {chapters.map((chapter, index) => (
          <div key={chapter._id || chapter.id || index} className="chapter-container">
            <div 
              className="chapter-content prose prose-lg max-w-3xl lg:max-w-4xl xl:max-w-5xl mx-auto px-4"
              style={{
                fontSize: `${fontSize}px`,
                fontFamily: selectedFont,
                lineHeight: '1.7',
                color: currentTheme.text,
                minHeight: '100%',
                padding: '20px'
              }}
            >
              <h1 className="text-3xl font-bold mb-6 text-center" style={{ color: currentTheme.text }}>
                {chapter.title}
              </h1>
              <div 
                className="chapter-text"
                dangerouslySetInnerHTML={{ 
                  __html: formatText(chapter.content || '') 
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
        ))}
      </div>
    );
  }

  if (chapters.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-gray-500">
        No chapters available
      </div>
    );
  }

  return (
    <div className="virtualized-chapter-reader">
      <List
        ref={listRef}
        height={height}
        itemCount={chapters.length}
        itemSize={(index: number) => chapterHeights[index] || 400}
        width="100%"
        overscanCount={2} // Render 2 chapters outside viewport
        onScroll={handleScroll}
        itemData={chapters}
      >
        {ChapterRenderer}
      </List>
    </div>
  );
};

export default VirtualizedChapterReader;
