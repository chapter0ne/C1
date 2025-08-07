
import React from 'react';
import { BookOpen } from 'lucide-react';
import BookCard from './BookCard';
import { Book, books, recentlyAddedBook } from '@/data/books';

interface BookListProps {
  onSelectBook: (book: Book) => void;
}

const BookList: React.FC<BookListProps> = ({ onSelectBook }) => {
  return (
    <div className="relative z-20 bg-white rounded-3xl shadow-2xl overflow-hidden border border-chapterRed-100/50 transform -rotate-3 md:max-w-md">
      {/* Device header */}
      <div className="bg-gradient-to-b from-chapterRed-50 to-white pt-6 px-6 pb-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-chapterRed-300"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-chapterRed-200"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-chapterRed-100"></div>
          </div>
          <div className="text-sm font-medium text-chapterRed-600">ChapterOne</div>
        </div>
        
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <BookOpen className="text-chapterRed-500" size={20} />
            <span>My Library</span>
          </h3>
          <span className="text-xs bg-chapterRed-100 text-chapterRed-600 px-2 py-1 rounded-full font-medium">24 books</span>
        </div>
      </div>
      
      {/* Book covers */}
      <div className="px-6 py-4">
        <div className="grid grid-cols-3 gap-3">
          {books.map((book) => (
            <BookCard key={book.id} book={book} onClick={onSelectBook} />
          ))}
        </div>
      </div>
      
      {/* Currently reading section */}
      <div className="px-6 py-5 border-t border-chapterRed-100/20">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-700">Recently Added</span>
          <span className="text-xs bg-chapterRed-50 text-chapterRed-600 px-2 py-1 rounded-full">New</span>
        </div>
        
        <div className="mt-2 space-y-3">
          {/* Book entry */}
          <div className="flex items-center gap-3 bg-chapterRed-50/50 p-2 rounded-lg hover:bg-chapterRed-50 transition-colors cursor-pointer">
            <div className="w-10 h-14 bg-gradient-to-b from-blue-500 to-blue-700 rounded-md flex-shrink-0 flex items-center justify-center">
              <span className="text-white text-xs font-bold">SCI-FI</span>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-medium">{recentlyAddedBook.title}</h4>
              <p className="text-xs text-gray-500">{recentlyAddedBook.author}</p>
              <div className="flex items-center mt-1">
                <span className="text-xs font-medium text-chapterRed-600">Start reading</span>
                <span className="mx-2 text-gray-300">•</span>
                <span className="text-xs text-gray-500">{recentlyAddedBook.pages} pages</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookList;
