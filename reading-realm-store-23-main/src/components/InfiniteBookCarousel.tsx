
import React, { useRef, useEffect } from 'react';
import BookCard from './BookCard';
import { Book } from '@/types/book';

interface InfiniteBookCarouselProps {
  books: Book[];
  onAddToWishlist?: (bookId: string) => void;
  onRemoveFromWishlist?: (bookId: string) => void;
  onAddToLibrary?: (bookId: string) => void;
  onRemoveFromLibrary?: (bookId: string) => void;
  getBookState?: (book: Book) => { isInLibrary: boolean; isInWishlist: boolean; isInCart: boolean };
}

const InfiniteBookCarousel = ({ 
  books, 
  onAddToWishlist, 
  onRemoveFromWishlist,
  onAddToLibrary,
  onRemoveFromLibrary,
  getBookState
}: InfiniteBookCarouselProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Only enable infinite scroll if we have at least 4 books
  const shouldEnableInfiniteScroll = books.length >= 4;
  
  // Create triple array for infinite effect
  const tripleBooks = shouldEnableInfiniteScroll ? [...books, ...books, ...books] : books;

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer || books.length === 0 || !shouldEnableInfiniteScroll) return;

    let isResetting = false;
    let lastScrollLeft = 0;
    let touchStartX = 0;
    let touchStartY = 0;
    let isHorizontalScroll = false;

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
      isHorizontalScroll = false;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      
      const touch = e.touches[0];
      const deltaX = Math.abs(touch.clientX - touchStartX);
      const deltaY = Math.abs(touch.clientY - touchStartY);
      
      // Only determine scroll direction after a minimum movement
      if (deltaX < 5 && deltaY < 5) return;
      
      // Determine if this is a horizontal scroll gesture
      if (deltaX > deltaY && deltaX > 15) {
        isHorizontalScroll = true;
      } else if (deltaY > deltaX && deltaY > 15) {
        isHorizontalScroll = false;
      }
      
      // Only prevent default for clear horizontal scrolling
      if (isHorizontalScroll && deltaX > 20) {
        e.preventDefault();
      }
    };

    const handleScroll = () => {
      if (isResetting) return;
      
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainer;
      const itemWidth = scrollContainer.firstElementChild?.clientWidth || 0;
      const gap = 12; // gap-3 = 12px
      const totalItemWidth = itemWidth + gap;
      const singleSetWidth = totalItemWidth * books.length;
      
      // Only reset when we're completely past the visible content
      // This prevents the "pulling" effect by only resetting when user has scrolled far beyond what's visible
      if (scrollLeft >= scrollWidth - clientWidth - 50) {
        isResetting = true;
        // Jump back to the middle set without animation
        scrollContainer.style.scrollBehavior = 'auto';
        scrollContainer.scrollLeft = scrollLeft - singleSetWidth;
        // Restore smooth scrolling after a brief delay
        setTimeout(() => {
          scrollContainer.style.scrollBehavior = 'smooth';
          isResetting = false;
        }, 150);
      } else if (scrollLeft <= 50) {
        isResetting = true;
        // Jump to the middle set without animation
        scrollContainer.style.scrollBehavior = 'auto';
        scrollContainer.scrollLeft = scrollLeft + singleSetWidth;
        // Restore smooth scrolling after a brief delay
        setTimeout(() => {
          scrollContainer.style.scrollBehavior = 'smooth';
          isResetting = false;
        }, 150);
      }
      
      lastScrollLeft = scrollLeft;
    };

    // Add scroll listener with throttling
    let scrollTimeout: NodeJS.Timeout;
    const throttledHandleScroll = () => {
      if (scrollTimeout) return;
      scrollTimeout = setTimeout(() => {
        handleScroll();
        scrollTimeout = null as any;
      }, 16); // ~60fps
    };

    scrollContainer.addEventListener('scroll', throttledHandleScroll, { passive: true });
    scrollContainer.addEventListener('touchstart', handleTouchStart, { passive: true });
    scrollContainer.addEventListener('touchmove', handleTouchMove, { passive: false });
    
    // Initialize position to the middle set
    const itemWidth = scrollContainer.firstElementChild?.clientWidth || 0;
    const gap = 12;
    const totalItemWidth = itemWidth + gap;
    scrollContainer.scrollLeft = totalItemWidth * books.length;
    
    return () => {
      scrollContainer.removeEventListener('scroll', throttledHandleScroll);
      scrollContainer.removeEventListener('touchstart', handleTouchStart);
      scrollContainer.removeEventListener('touchmove', handleTouchMove);
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
    };
  }, [books.length, shouldEnableInfiniteScroll]);

  return (
    <>
      {/* Mobile: Infinite scroll or regular scroll */}
      <div className="md:hidden">
        {shouldEnableInfiniteScroll ? (
          // Infinite scroll for categories with 4+ books
          <div 
            ref={scrollRef}
            className="flex gap-3 overflow-x-auto pb-1 px-2 scrollbar-hide"
            style={{ 
              scrollBehavior: 'smooth',
              touchAction: 'pan-x pan-y',
              overscrollBehavior: 'contain',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            {tripleBooks.map((book, index) => (
              <div key={`${book._id || book.id}-${index}`} className="w-28 flex-shrink-0">
                <BookCard
                  book={book}
                  showActionButtons={false}
                  variant="compact"
                  onAddToWishlist={onAddToWishlist}
                  onAddToLibrary={onAddToLibrary}
                  onRemoveFromWishlist={onRemoveFromWishlist}
                  onRemoveFromLibrary={onRemoveFromLibrary}
                  {...(getBookState ? getBookState(book) : {})}
                />
              </div>
            ))}
          </div>
        ) : (
          // Regular horizontal scroll for categories with fewer books
          <div 
            className="flex gap-3 overflow-x-auto pb-1 px-2 scrollbar-hide scroll-smooth"
            style={{ 
              scrollBehavior: 'smooth',
              touchAction: 'pan-x pan-y',
              overscrollBehavior: 'contain',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            {books.map((book, index) => (
              <div key={`${book._id || book.id}-${index}`} className="flex-shrink-0">
                <BookCard
                  book={book}
                  showActionButtons={false}
                  variant="compact"
                  onAddToWishlist={onAddToWishlist}
                  onAddToLibrary={onAddToLibrary}
                  onRemoveFromWishlist={onRemoveFromWishlist}
                  onRemoveFromLibrary={onRemoveFromLibrary}
                  {...(getBookState ? getBookState(book) : {})}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Desktop: Flexbox layout that wraps naturally */}
      <div className="hidden md:flex md:flex-wrap gap-4 lg:gap-6 transition-all duration-300 ease-in-out">
        {books.map((book, index) => (
          <div key={`${book._id || book.id}-${index}`}>
            <BookCard
              book={book}
              showActionButtons={false}
              onAddToWishlist={onAddToWishlist}
              onAddToLibrary={onAddToLibrary}
              onRemoveFromWishlist={onRemoveFromWishlist}
              onRemoveFromLibrary={onRemoveFromLibrary}
              {...(getBookState ? getBookState(book) : {})}
            />
          </div>
        ))}
      </div>
    </>
  );
};

export default InfiniteBookCarousel;
