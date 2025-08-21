
import { useRef, useEffect } from 'react';
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
  // This prevents weird repetition when categories have very few books
  const shouldEnableInfiniteScroll = books.length >= 4;

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer || books.length === 0 || !shouldEnableInfiniteScroll) return;

    let startX = 0;
    let startY = 0;
    let isHorizontalScroll = false;

    const handleScroll = () => {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainer;
      const itemWidth = scrollContainer.firstElementChild?.clientWidth || 0;
      const gap = 12; // gap-3 = 12px (increased from 8px)
      const totalItemWidth = itemWidth + gap;
      
      // When we've scrolled past the original items, jump back to the beginning
      if (scrollLeft >= totalItemWidth * books.length) {
        scrollContainer.scrollLeft = scrollLeft - totalItemWidth * books.length;
      }
      // When scrolling backwards past the beginning, jump to the end
      else if (scrollLeft <= 0) {
        scrollContainer.scrollLeft = scrollLeft + totalItemWidth * books.length;
      }
    };

    // Non-interfering touch handling that allows vertical page scrolling
    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      isHorizontalScroll = false;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!startX || !startY) return;
      
      const currentX = e.touches[0].clientX;
      const currentY = e.touches[0].clientY;
      const deltaX = Math.abs(currentX - startX);
      const deltaY = Math.abs(currentY - startY);
      
      // Determine scroll direction with a higher threshold to avoid interference
      if (!isHorizontalScroll && deltaX > deltaY && deltaX > 25) {
        // Clear horizontal scrolling - mark as horizontal
        isHorizontalScroll = true;
      } else if (!isHorizontalScroll && deltaY > deltaX && deltaY > 25) {
        // Clear vertical scrolling - mark as vertical
        isHorizontalScroll = true;
      }
      
      // Never prevent default - let the browser handle scrolling naturally
      // This ensures vertical page scrolling always works
    };

    const handleTouchEnd = () => {
      startX = 0;
      startY = 0;
      isHorizontalScroll = false;
    };

    scrollContainer.addEventListener('scroll', handleScroll);
    // Use passive: true to ensure we never interfere with scrolling
    scrollContainer.addEventListener('touchstart', handleTouchStart, { passive: true });
    scrollContainer.addEventListener('touchmove', handleTouchMove, { passive: true });
    scrollContainer.addEventListener('touchend', handleTouchEnd, { passive: true });
    
    return () => {
      scrollContainer.removeEventListener('scroll', handleScroll);
      scrollContainer.removeEventListener('touchstart', handleTouchStart);
      scrollContainer.removeEventListener('touchmove', handleTouchMove);
      scrollContainer.removeEventListener('touchend', handleTouchEnd);
    };
  }, [books.length, shouldEnableInfiniteScroll]);

  // Create triple array for infinite effect only when needed
  const tripleBooks = shouldEnableInfiniteScroll ? [...books, ...books, ...books] : books;

  return (
    <>
      {/* Mobile: Conditional infinite horizontal scroll or regular grid */}
      <div className="md:hidden">
        {shouldEnableInfiniteScroll ? (
          // Infinite scroll for categories with 4+ books
          <div 
            ref={scrollRef}
            className="flex gap-3 overflow-x-auto pb-1 px-2 scrollbar-hide"
            style={{ 
              scrollBehavior: 'auto',
              // Allow natural touch behavior without interfering with page scrolling
              touchAction: 'auto',
              overscrollBehavior: 'auto',
              // Ensure the carousel doesn't capture all touch events
              pointerEvents: 'auto',
              // Ensure smooth scrolling
              WebkitOverflowScrolling: 'touch',
              // Remove properties that might interfere with page scrolling
              isolation: 'auto'
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
          // Regular grid for categories with fewer than 4 books (prevents repetition)
          <div className="grid grid-cols-3 gap-3 px-2">
            {books.map((book, index) => (
              <div key={`${book._id || book.id}-${index}`}>
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
      <div className="hidden md:flex md:flex-wrap gap-4 lg:gap-6">
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
