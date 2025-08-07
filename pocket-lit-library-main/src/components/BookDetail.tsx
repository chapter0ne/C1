
import React from 'react';
import { X, BookOpen, Calendar, User, Bookmark } from 'lucide-react';
import { Card, CardContent } from './ui/card';

export interface Book {
  id: number;
  title: string;
  author: string;
  progress: number;
  color: string;
  description: string;
  published: string;
  genre: string;
  pages: number;
}

interface BookDetailProps {
  book: Book;
  onClose: () => void;
}

const BookDetail: React.FC<BookDetailProps> = ({ book, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0" onClick={onClose}></div>
      
      <Card className="relative max-w-md w-full bg-white rounded-2xl overflow-hidden shadow-2xl animate-scale-in">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 z-10 bg-white/90 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X size={16} />
        </button>
        
        <div className={`h-40 bg-gradient-to-r ${book.color} relative`}>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-36 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 flex items-center justify-center">
              <span className="text-white font-medium text-center text-sm px-2">{book.title}</span>
            </div>
          </div>
        </div>
        
        <CardContent className="p-6 space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">{book.title}</h2>
            <p className="text-muted-foreground text-sm">{book.description}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User size={14} />
                <span>Author</span>
              </div>
              <p className="font-medium">{book.author}</p>
            </div>
            
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar size={14} />
                <span>Published</span>
              </div>
              <p className="font-medium">{book.published}</p>
            </div>
            
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <BookOpen size={14} />
                <span>Pages</span>
              </div>
              <p className="font-medium">{book.pages}</p>
            </div>
            
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Bookmark size={14} />
                <span>Genre</span>
              </div>
              <p className="font-medium">{book.genre}</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Reading Progress</span>
              <span className="text-sm font-medium">{book.progress}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-chapterRed-500 to-chapterRed-400 rounded-full"
                style={{ width: `${book.progress}%` }}
              ></div>
            </div>
          </div>
          
          <div className="pt-2">
            <button className="w-full bg-chapterRed-500 hover:bg-chapterRed-600 text-white py-2.5 rounded-lg transition-colors font-medium">
              Continue Reading
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BookDetail;
