
import React from 'react';
import FloatingBook from './FloatingBook';
import { BookOpen, BookText, BookCopy, BookUser, BookOpenCheck, BookMarked } from 'lucide-react';

const BooksBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Book 1 */}
      <FloatingBook
        position="top-[10%] left-[5%]"
        rotation="rotate-12"
        size={{ width: "w-24", height: "h-32" }}
        color={{ from: "chapterRed-300", to: "chapterRed-400" }}
        icon={<BookText className="text-white/90" size={36} />}
      />
      
      {/* Book 2 */}
      <FloatingBook
        position="top-[15%] right-[12%]"
        rotation="-rotate-6"
        size={{ width: "w-20", height: "h-28" }}
        color={{ from: "chapterRed-400", to: "chapterRed-500" }}
        icon={<BookOpen className="text-white/90" size={32} />}
        delay="1s"
        duration="9s"
      />
      
      {/* Book 3 */}
      <FloatingBook
        position="top-[40%] left-[10%]"
        rotation="rotate-3"
        size={{ width: "w-28", height: "h-36" }}
        color={{ from: "chapterRed-200", to: "chapterRed-300" }}
        icon={<BookCopy className="text-white/90" size={38} />}
        delay="2s"
        duration="10s"
      />
      
      {/* Book 4 */}
      <FloatingBook
        position="top-[50%] right-[8%]"
        rotation="-rotate-12"
        size={{ width: "w-24", height: "h-32" }}
        color={{ from: "chapterRed-500", to: "chapterRed-600" }}
        icon={<BookUser className="text-white/90" size={36} />}
        delay="1.5s"
        duration="8.5s"
      />
      
      {/* Book 5 */}
      <FloatingBook
        position="bottom-[15%] left-[15%]"
        rotation="rotate-[-8deg]"
        size={{ width: "w-32", height: "h-40" }}
        color={{ from: "chapterRed-300", to: "chapterRed-400" }}
        icon={<BookOpenCheck className="text-white/90" size={44} />}
        delay="3s"
        duration="9.5s"
      />
      
      {/* Book 6 */}
      <FloatingBook
        position="bottom-[25%] right-[15%]"
        rotation="rotate-6"
        size={{ width: "w-28", height: "h-36" }}
        color={{ from: "chapterRed-200", to: "chapterRed-300" }}
        icon={<BookMarked className="text-white/90" size={40} />}
        delay="2.5s"
        duration="11s"
      />
      
      {/* Background blurs */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-chapterRed-200 rounded-full opacity-40 blur-3xl animate-float-dramatic"></div>
      <div className="absolute bottom-1/3 -right-20 w-96 h-96 bg-chapterRed-200 rounded-full opacity-30 blur-3xl animate-float-dramatic" style={{animationDelay: '2s'}}></div>
    </div>
  );
};

export default BooksBackground;
