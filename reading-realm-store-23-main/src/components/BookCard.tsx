
import { Link } from "react-router-dom";
import { Star, Heart } from "lucide-react";
import { Book } from "@/types/book";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useWishlist } from "@/hooks/useWishlist";
import { getCoverImageUrl, hasCoverImage } from "@/utils/imageUtils";
import { useToast } from "@/hooks/use-toast";

interface BookCardProps {
  book: Book;
  showAddToLibrary?: boolean;
  showProgress?: boolean;
  progress?: number;
  onAddToWishlist?: (bookId: string) => void;
  onAddToLibrary?: (bookId: string) => void;
  onRemoveFromLibrary?: (bookId: string) => void;
  onAddToCart?: (bookId: string) => void;
  onRemoveFromWishlist?: (bookId: string) => void;
  variant?: 'default' | 'compact' | 'list';
  showActionButtons?: boolean;
  isInWishlist?: boolean;
  isInLibrary?: boolean;
  isInCart?: boolean;
  showHeart?: boolean; // New prop to control heart visibility
}

const BookCard = ({ 
  book, 
  showAddToLibrary = false, 
  showProgress = false, 
  progress = 0,
  onAddToWishlist,
  onAddToLibrary,
  onRemoveFromLibrary,
  onAddToCart,
  onRemoveFromWishlist,
  variant = 'default',
  showActionButtons = false,
  isInWishlist = false,
  isInLibrary = false,
  isInCart = false,
  showHeart = true
}: BookCardProps) => {
  const { toast } = useToast();
  // Guard against missing book or title
  if (!book || !book.title) return null;
  
  // Show heart button based on variant and prop
  const shouldShowHeart = showHeart && variant !== 'list';
  
  console.log('[BookCard] Rendering book:', { 
    bookId: book._id, 
    title: book.title, 
    isInWishlist, 
    isInLibrary, 
    isInCart,
    showHeart,
    shouldShowHeart,
    heartButtonState: isInWishlist ? 'filled' : 'empty',
    heartButtonVisible: shouldShowHeart && !isInLibrary,
    onAddToWishlist: !!onAddToWishlist,
    onRemoveFromWishlist: !!onRemoveFromWishlist
  });
  
  // const { user } = useAuth();
  // Remove useBookState

  const handleHeartAction = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('BookCard: Heart button clicked!', { 
      bookId: book._id, 
      bookTitle: book.title,
      isInWishlist, 
      isInLibrary,
      onAddToWishlist: !!onAddToWishlist, 
      onRemoveFromWishlist: !!onRemoveFromWishlist,
      event: e,
      target: e.target
    });
    
    // Safety check: if book is in library, don't allow wishlist actions
    if (isInLibrary) {
      console.log('BookCard: Book is in library, cannot modify wishlist');
      toast({
        title: "Cannot Modify Wishlist",
        description: "Books in your library cannot be added to or removed from wishlist.",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }
    
    if (isInWishlist) {
      console.log('BookCard: Removing from wishlist...', { bookId: book._id });
      onRemoveFromWishlist?.(book._id);
    } else {
      console.log('BookCard: Adding to wishlist...', { bookId: book._id });
      onAddToWishlist?.(book._id);
    }
  };



  const handlePrimaryAction = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isInLibrary) {
      window.location.href = `/book/${book._id}/read`;
      return;
    }
    if (book.isFree) {
      onAddToLibrary?.(book._id);
    } else {
      onAddToCart?.(book._id);
    }
  };

  // Function to get shadow color based on book category
  const getShadowColor = () => {
    const categoryColorMap: { [key: string]: string } = {
      Fiction: '#a855f7',
      'Sci-Fi': '#3b82f6',
      Adventure: '#10b981',
      Romance: '#f43f5e',
      Thriller: '#f97316',
    };
    return categoryColorMap[book.category || book.genre || 'default'] || '#6b7280';
  };
  const shadowColor = getShadowColor();

  if (variant === 'list') {
    return (
      <div className="block group min-w-0 flex-shrink-0">
        <div className="flex items-center w-full bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow px-2 py-2 md:px-3 md:py-2">
          {/* Book Cover */}
          <div className="w-12 h-16 bg-gradient-to-br from-slate-800 to-slate-900 rounded flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mr-3">
            {hasCoverImage(book) ? (
              <img src={getCoverImageUrl(book)!} alt={book.title} className="w-full h-full object-cover rounded" />
            ) : (
              book.title.charAt(0)
            )}
          </div>
          {/* Book Info */}
          <div className="flex-1 min-w-0 flex flex-col justify-center">
            <h3 className="font-semibold text-gray-900 text-sm truncate">{book.title}</h3>
            <p className="text-xs text-gray-600 truncate">{book.author}</p>
            <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 text-yellow-400" />
                <span>{typeof book.rating === 'number' ? book.rating.toFixed(1) : '0.0'}</span>
              </div>
              <span className={`font-semibold ${book.isFree ? 'text-green-600' : 'text-gray-900'}`}>
                {book.isFree ? 'Free' : `₦${typeof book.price === 'number' ? book.price.toLocaleString() : 0}`}
              </span>
            </div>
          </div>
          {/* Action Button */}
          <button
            onClick={handlePrimaryAction}
            className="ml-2 text-xs bg-[#D01E1E] hover:bg-[#B01818] text-white rounded px-3 py-2 font-semibold transition-colors"
          >
            {isInLibrary ? 'Open' : 'Read'}
          </button>
        </div>
      </div>
    );
  }

  // In grid/compact view, update the main action button label
  const getMainActionLabel = () => {
    if (book.isFree) return 'Add to Library';
    return 'Buy';
  };

  return (
    <div className="block group min-w-0 flex-shrink-0">
      {/* Default/Compact Variant */}
      <div className={`flex flex-col ${
        variant === 'compact' 
          ? 'w-28 sm:w-32 md:w-36 lg:w-40' 
          : 'w-32 sm:w-36 md:w-40 lg:w-44'
      } relative flex-shrink-0`}>
        {/* Book Cover - Click to Open Book */}
        <div className="relative mb-2">
          <div 
            className="aspect-[3/4] bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg flex items-center justify-center text-white relative overflow-hidden shadow-lg cursor-pointer"
            style={{ filter: `drop-shadow(4px 4px 8px ${shadowColor}40)` }}
            onClick={() => {
              if (isInLibrary) {
                window.location.href = `/book/${book._id}/read`;
              } else {
                window.location.href = `/book/${book._id}`;
              }
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            {hasCoverImage(book) ? (
              <img 
                src={getCoverImageUrl(book)!} 
                alt={book.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center z-10 p-3">
                <h3 className="font-bold text-xs leading-tight mb-1">{book?.title ? book.title.split(' ')[0] : ''}</h3>
                <h3 className="font-bold text-xs leading-tight">{book?.title ? book.title.split(' ').slice(1).join(' ') : ''}</h3>
              </div>
            )}
            {/* X Remove from Library (top right) */}
            {isInLibrary && onRemoveFromLibrary && (
              <button
                onClick={e => { e.preventDefault(); e.stopPropagation(); onRemoveFromLibrary(book._id); }}
                className={`absolute top-1 right-1 z-20 bg-red-600 text-white rounded-full flex items-center justify-center shadow hover:bg-red-700 ${
                  variant === 'compact' ? 'w-5 h-5' : 'w-6 h-6'
                }`}
                title="Remove from Library"
              >
                ×
              </button>
            )}
            {/* Wishlist Heart - Shows wishlist state and functions as wishlist button */}
            {/* Only show heart button if book is NOT in library */}
            {shouldShowHeart && !isInLibrary && (
              <button
                onClick={handleHeartAction}
                className={`absolute top-1 left-1 p-1 backdrop-blur-sm rounded-full transition-colors z-30 ${
                  isInWishlist ? 'bg-white/90 border border-white' : 'bg-white/20 hover:bg-white/30'
                }`}
                title={isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
                style={{ 
                  minWidth: variant === 'compact' ? '20px' : '24px', 
                  minHeight: variant === 'compact' ? '20px' : '24px',
                  cursor: 'pointer'
                }}
              >
                <Heart className={`${variant === 'compact' ? 'w-2 h-2' : 'w-3 h-3'} ${isInWishlist ? 'fill-red-500 text-red-500' : 'text-white'}`} />
              </button>
            )}
          </div>
          {/* Reading Progress Bar */}
          {showProgress && progress > 0 && (
            <div className="absolute bottom-0 left-0 right-0 bg-black/50 rounded-b-lg p-1">
              <div className="w-full bg-gray-300 rounded-full h-1">
                <div 
                  className="bg-green-500 h-1 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
        {/* Book Details */}
        <div className={`pb-4 ${
          variant === 'compact' ? 'space-y-1 md:space-y-2' : 'space-y-2'
        }`}>
          {/* Title - Click to Open Book Details */}
          <div className="min-h-[2.5rem] flex flex-col justify-center">
            <h3 
              className={`font-semibold text-gray-900 leading-tight line-clamp-2 cursor-pointer hover:text-[#D01E1E] transition-colors px-1 ${
                variant === 'compact' ? 'text-xs' : 'text-sm'
              }`}
              onClick={() => window.location.href = `/book/${book._id}`}
            >
              {book.title}
            </h3>
          </div>
          {/* Author - Click to Open Book Details */}
          <p 
            className={`text-gray-600 truncate cursor-pointer hover:text-[#D01E1E] transition-colors px-1 ${
              variant === 'compact' ? 'text-xs' : 'text-sm'
            }`}
            onClick={() => window.location.href = `/book/${book._id}`}
          >
            by {book.author}
          </p>
          {/* Rating and Price on same line */}
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-1">
              <Star className={`${variant === 'compact' ? 'w-2 h-2' : 'w-3 h-3'} text-black fill-black`} />
              <span className={`text-gray-700 font-medium ${
                variant === 'compact' ? 'text-xs' : 'text-sm'
              }`}>
                {typeof book.rating === 'number' ? book.rating.toFixed(1) : '0.0'}
              </span>
            </div>
            <div className="text-right">
              <span className={`font-bold ${
                variant === 'compact' ? 'text-xs' : 'text-sm'
              } ${book.isFree ? 'text-green-600' : 'text-[#D01E1E]'}`}>
                {book.isFree ? 'Free' : `₦${typeof book.price === 'number' ? book.price.toLocaleString() : 0}`}
              </span>
            </div>
          </div>
          {/* Action Buttons */}
          {showActionButtons && (
            <div className="space-y-1 mt-2">
              {/* Open/Add to Library button */}
              <Button
                onClick={handlePrimaryAction}
                size="sm"
                className={`w-full text-xs ${
                  isInLibrary 
                    ? 'bg-[#D01E1E] hover:bg-[#B01818]' 
                    : 'bg-[#D01E1E] hover:bg-[#B01818]'
                }`}
              >
                {isInLibrary ? 'Read' : getMainActionLabel()}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookCard;
