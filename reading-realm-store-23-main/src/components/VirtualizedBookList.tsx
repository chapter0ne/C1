import React, { useMemo, useCallback, useRef, useEffect, useState } from 'react';
import BookCard from './BookCard';
import { Book } from '@/types/book';

interface VirtualizedBookListProps {
  books: Book[];
  height: number;
  itemHeight: number;
  onAddToWishlist?: (bookId: string) => void;
  onRemoveFromWishlist?: (bookId: string) => void;
  onAddToLibrary?: (bookId: string) => void;
  onRemoveFromLibrary?: (bookId: string) => void;
  getBookState?: (book: Book) => { isInLibrary: boolean; isInWishlist: boolean; isInCart: boolean };
  variant?: 'default' | 'compact' | 'list';
  showActionButtons?: boolean;
}

const VirtualizedBookList: React.FC<VirtualizedBookListProps> = ({
  books,
  height,
  itemHeight,
  onAddToWishlist,
  onRemoveFromWishlist,
  onAddToLibrary,
  onRemoveFromLibrary,
  getBookState,
  variant = 'default',
  showActionButtons = false
}) => {
  const [useVirtualization, setUseVirtualization] = useState(false);
  const [List, setList] = useState<any>(null);

  // Dynamically import react-window to avoid SSR issues
  useEffect(() => {
    const loadVirtualization = async () => {
      try {
        const reactWindow = await import('react-window');
        setList(() => reactWindow.List);
        setUseVirtualization(true);
      } catch (error) {
        console.warn('Virtualization not available, falling back to regular list:', error);
        setUseVirtualization(false);
      }
    };

    loadVirtualization();
  }, []);

  // Memoize book state calculations to avoid unnecessary re-renders
  const bookStates = useMemo(() => {
    const states = new Map<string, { isInLibrary: boolean; isInWishlist: boolean; isInCart: boolean }>();
    
    if (getBookState) {
      books.forEach(book => {
        states.set(book._id || book.id, getBookState(book));
      });
    }
    
    return states;
  }, [books, getBookState]);

  // Memoize the item renderer to prevent unnecessary re-renders
  const ItemRenderer = useCallback(({ index, style }: { index: number; style: React.CSSProperties }) => {
    const book = books[index];
    if (!book) return null;

    const bookState = bookStates.get(book._id || book.id) || {
      isInLibrary: false,
      isInWishlist: false,
      isInCart: false
    };

    return (
      <div style={style}>
        <BookCard
          book={book}
          variant={variant}
          showActionButtons={showActionButtons}
          isInWishlist={bookState.isInWishlist}
          isInLibrary={bookState.isInLibrary}
          isInCart={bookState.isInCart}
          onAddToWishlist={onAddToWishlist}
          onRemoveFromWishlist={onRemoveFromWishlist}
          onAddToLibrary={onAddToLibrary}
          onRemoveFromLibrary={onRemoveFromLibrary}
        />
      </div>
    );
  }, [books, bookStates, variant, showActionButtons, onAddToWishlist, onRemoveFromWishlist, onAddToLibrary, onRemoveFromLibrary]);

  // Fallback to regular list if virtualization is not available
  if (!useVirtualization || !List) {
    return (
      <div className="space-y-4" style={{ height, overflowY: 'auto' }}>
        {books.map((book, index) => (
          <div key={book._id || book.id || index} style={{ height: itemHeight }}>
            <BookCard
              book={book}
              variant={variant}
              showActionButtons={showActionButtons}
              isInWishlist={getBookState?.(book)?.isInWishlist || false}
              isInLibrary={getBookState?.(book)?.isInLibrary || false}
              isInCart={getBookState?.(book)?.isInCart || false}
              onAddToWishlist={onAddToWishlist}
              onRemoveFromWishlist={onRemoveFromWishlist}
              onAddToLibrary={onAddToLibrary}
              onRemoveFromLibrary={onRemoveFromLibrary}
            />
          </div>
        ))}
      </div>
    );
  }

  if (books.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-gray-500">
        No books found
      </div>
    );
  }

  return (
    <List
      height={height}
      itemCount={books.length}
      itemSize={itemHeight}
      width="100%"
      overscanCount={5} // Render 5 items outside viewport for smooth scrolling
    >
      {ItemRenderer}
    </List>
  );
};

export default VirtualizedBookList;
