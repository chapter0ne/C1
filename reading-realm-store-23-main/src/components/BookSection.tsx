
import BookCard from './BookCard';
import { Book } from '@/types/book';

interface BookSectionProps {
  title: string;
  books: Book[];
  showAddToLibrary?: boolean;
  onAddToWishlist?: (bookId: string) => void;
  onAddToLibrary?: (bookId: string) => void;
  getBookState?: (book: Book) => { isInLibrary: boolean; isInWishlist: boolean; isInCart: boolean };
}

const BookSection = ({ 
  title, 
  books, 
  showAddToLibrary = false,
  onAddToWishlist,
  onAddToLibrary,
  getBookState
}: BookSectionProps) => {
  if (books.length === 0) return null;

  // Touch event handlers to prevent interference with vertical scrolling
  const handleTouchStart = (e: React.TouchEvent) => {
    // Allow touch events to pass through for vertical scrolling
    // No interference with page scrolling
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    // Allow all touch events to pass through naturally
    // This ensures vertical page scrolling always works
    // No preventDefault() calls that could interfere
  };

  const handleTouchEnd = () => {
    // Touch ended, no special handling needed
    // Allow natural touch behavior
  };

  return (
    <div className="mb-8">
      <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 px-4 md:px-0">{title}</h2>
      {/* Mobile/Tablet: Horizontal scroll, Desktop: Grid */}
      <div className="md:hidden">
        <div 
          className="flex gap-3 overflow-x-auto pb-1 px-2 scrollbar-hide scroll-smooth snap-x snap-mandatory"
          style={{
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
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {books.map((book, index) => (
            <div key={book._id || book.id || index} className="flex-shrink-0 snap-start w-28">
              <BookCard
                book={book}
                variant="compact"
                showAddToLibrary={showAddToLibrary}
                onAddToWishlist={onAddToWishlist}
                onAddToLibrary={onAddToLibrary}
                {...(getBookState ? getBookState(book) : {})}
              />
            </div>
          ))}
        </div>
      </div>
      {/* Desktop: Grid layout */}
      <div className="hidden md:grid grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
        {books.map((book, index) => (
          <BookCard
            key={book._id || book.id || index}
            book={book}
            variant="compact"
            showAddToLibrary={showAddToLibrary}
            onAddToWishlist={onAddToWishlist}
            onAddToLibrary={onAddToLibrary}
            {...(getBookState ? getBookState(book) : {})}
          />
        ))}
      </div>
    </div>
  );
};

export default BookSection;
