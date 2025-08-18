
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

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer || books.length === 0) return;

    const handleScroll = () => {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainer;
      const itemWidth = scrollContainer.firstElementChild?.clientWidth || 0;
      const gap = 12; // gap-3 = 12px
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

    scrollContainer.addEventListener('scroll', handleScroll);
    return () => scrollContainer.removeEventListener('scroll', handleScroll);
  }, [books.length]);

  // Create triple array for infinite effect
  const tripleBooks = [...books, ...books, ...books];

  return (
    <>
      {/* Mobile: Infinite horizontal scroll */}
      <div className="md:hidden">
        <div 
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto pb-2 px-4 scrollbar-hide"
          style={{ scrollBehavior: 'auto' }}
        >
          {tripleBooks.map((book, index) => (
            <BookCard
              key={book._id || book.id || index}
              book={book}
              showActionButtons={false}
              onAddToWishlist={onAddToWishlist}
              onAddToLibrary={onAddToLibrary}
              onRemoveFromWishlist={onRemoveFromWishlist}
              onRemoveFromLibrary={onRemoveFromLibrary}
              {...(getBookState ? getBookState(book) : {})}
            />
          ))}
        </div>
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
