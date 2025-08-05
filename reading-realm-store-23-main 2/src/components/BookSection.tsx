
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

  return (
    <div className="mb-8">
      <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 px-4 md:px-0">{title}</h2>
      {/* Mobile/Tablet: Horizontal scroll, Desktop: Grid */}
      <div className="md:hidden">
        <div className="flex gap-3 overflow-x-auto pb-2 px-4 scrollbar-hide">
          {books.map((book, index) => (
            <BookCard
              key={book._id || book.id || index}
              book={book}
              showAddToLibrary={showAddToLibrary}
              onAddToWishlist={onAddToWishlist}
              onAddToLibrary={onAddToLibrary}
              {...(getBookState ? getBookState(book) : {})}
            />
          ))}
        </div>
      </div>
      {/* Desktop: Grid layout */}
      <div className="hidden md:grid grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
        {books.map((book, index) => (
          <BookCard
            key={book._id || book.id || index}
            book={book}
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
