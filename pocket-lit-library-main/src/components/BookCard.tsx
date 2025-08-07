
import React from 'react';
import { Book } from '@/data/books';
import { HoverCard, HoverCardContent, HoverCardTrigger } from './ui/hover-card';

interface BookCardProps {
  book: Book;
  onClick: (book: Book) => void;
}

const BookCard: React.FC<BookCardProps> = ({ book, onClick }) => {
  // Determine the index of the book to adjust alignment for edge books
  const bookIndex = book.id % 3; // 0, 1, or 2 based on position in grid
  
  // Adjust alignment based on position - refined for better visual balance
  const getAlignment = () => {
    if (bookIndex === 0) return "center"; // First column shows popup centered rather than end-aligned
    if (bookIndex === 2) return "start"; // Last column shows popup aligned to start
    return "center"; // Middle column remains centered
  };
  
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <div 
          className="rounded-lg overflow-hidden shadow-md aspect-[2/3] relative group cursor-pointer hover:-translate-y-1 transition-all duration-300"
          onClick={() => onClick(book)}
        >
          <div className={`absolute inset-0 bg-gradient-to-b ${book.color}`}></div>
          <div className="absolute inset-0 flex items-center justify-center p-2">
            <span className="text-white text-xs font-medium text-center leading-tight line-clamp-3">{book.title}</span>
          </div>
          <div className="absolute bottom-2 left-2 right-2 h-1 bg-white/20 rounded-full">
            <div className="h-full bg-white rounded-full" style={{width: `${book.progress}%`}}></div>
          </div>
          <div className="absolute bottom-4 left-2 right-2">
            <span className="text-white/80 text-[10px] truncate block">{book.author}</span>
          </div>
          
          {/* Simple hover effect without the view details text */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>
      </HoverCardTrigger>
      <HoverCardContent 
        className="w-56 p-3 shadow-md text-sm max-h-[200px] overflow-y-auto" 
        align={getAlignment()}
        side="top"
        sideOffset={5}
      >
        <div className="space-y-1.5">
          <h4 className="font-semibold text-xs">{book.title}</h4>
          <p className="text-xs text-muted-foreground line-clamp-3">{book.description}</p>
          <div className="text-[10px] text-muted-foreground">
            <div className="flex justify-between py-1">
              <span>Author:</span>
              <span className="font-medium">{book.author}</span>
            </div>
            <div className="flex justify-between py-1">
              <span>Published:</span>
              <span className="font-medium">{book.published}</span>
            </div>
            <div className="flex justify-between py-1">
              <span>Pages:</span>
              <span className="font-medium">{book.pages}</span>
            </div>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};

export default BookCard;
