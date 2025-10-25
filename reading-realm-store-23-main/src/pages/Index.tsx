import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, BookOpen, Heart, Star, User, ShoppingCart } from "lucide-react";
import InfiniteBookCarousel from "@/components/InfiniteBookCarousel";
import BookCard from "@/components/BookCard";
import { useToast } from "@/hooks/use-toast";
import MobileBottomNav from "@/components/MobileBottomNav";
import { useAuth } from "@/contexts/AuthContext";
import { useBooks } from '@/hooks/useBooks';
import { useBestsellers, useEditorPicks } from '@/hooks/useFeaturedBooks';
import { useUserData } from '@/contexts/OptimizedUserDataContext';
import { getCoverImageUrl, hasCoverImage } from '@/utils/imageUtils';

// Skeleton loader for book carousels
const BookCarouselSkeleton = () => (
  <>
    {/* Mobile: Horizontal scroll skeleton */}
    <div 
      className="flex gap-4 overflow-x-auto pb-2 md:hidden"
      style={{
        touchAction: 'pan-x pan-y',
        overscrollBehavior: 'contain',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="w-32 h-48 bg-gray-200 animate-pulse rounded-lg flex-shrink-0" />
      ))}
    </div>
    
    {/* Desktop: Flexbox layout that wraps naturally */}
    <div className="hidden md:flex md:flex-wrap gap-4 lg:gap-6">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="w-32 h-48 bg-gray-200 animate-pulse rounded-lg" />
      ))}
    </div>
  </>
);

// Netflix-style Hero Component
const NetflixStyleHero = ({ books }: { books: any[] }) => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [zoomDirection, setZoomDirection] = useState<'in' | 'out'>('in');
  const [animationKey, setAnimationKey] = useState(0);
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchEndX, setTouchEndX] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);

  // Function to change book with animation
  const changeBook = (direction: 'next' | 'prev') => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    setAutoPlay(false); // Pause auto-play when user interacts
    
    setTimeout(() => {
      if (direction === 'next') {
        setCurrentIndex((prev) => (prev + 1) % books.length);
      } else {
        setCurrentIndex((prev) => (prev - 1 + books.length) % books.length);
      }
      // Randomly choose zoom direction for next book
      setZoomDirection(Math.random() > 0.5 ? 'in' : 'out');
      // Force animation restart with key change
      setAnimationKey((prev) => prev + 1);
      setIsTransitioning(false);
    }, 1000); // 1 second for smoother transition
  };

  // Touch handlers for swipe gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStartX || !touchEndX) return;
    
    const distance = touchStartX - touchEndX;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      changeBook('next');
    } else if (isRightSwipe) {
      changeBook('prev');
    }

    // Resume auto-play after 15 seconds of no interaction
    setTimeout(() => {
      setAutoPlay(true);
    }, 15000);
  };

  useEffect(() => {
    if (!books || books.length === 0 || !autoPlay) return;

    const interval = setInterval(() => {
      changeBook('next');
    }, 10000); // 10 seconds per book

    return () => clearInterval(interval);
  }, [books, autoPlay]);

  if (!books || books.length === 0) return null;

  const currentBook = books[currentIndex];
  const bookCoverUrl = hasCoverImage(currentBook) ? getCoverImageUrl(currentBook) : null;
  const summary = currentBook.description || currentBook.summary || '';
  const truncatedSummary = summary.length > 200 ? summary.substring(0, 200) + '...' : summary;

  return (
    <section 
      className="relative w-full lg:hidden overflow-hidden cursor-pointer bg-black"
      style={{ height: '50vh' }}
      onClick={() => navigate(`/book/${currentBook._id}`)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background Image with Ken Burns Effect */}
      <div 
        key={animationKey}
        className={`absolute inset-0 bg-cover bg-top transition-opacity duration-1000 ease-in-out ${
          isTransitioning ? 'opacity-0' : 'opacity-100'
        }`}
        style={{
          backgroundImage: bookCoverUrl ? `url(${bookCoverUrl})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          animation: zoomDirection === 'out' ? 'kenBurnsReverse 10s ease-out forwards' : 'kenBurns 10s ease-out forwards',
        }}
      />

      {/* Dark Overlay */}
 <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />

      {/* Content Overlay - Bottom Left */}
      <div 
         className={`absolute bottom-0 left-0 right-0 p-4 pb-6 pr-20 transition-opacity duration-1000 ease-in-out ${
          isTransitioning ? 'opacity-0' : 'opacity-100'
        }`}
      >
        <h2 className="text-xl font-bold text-white mb-1 drop-shadow-lg">
          {currentBook.title}
        </h2>
        <p className="text-xs text-gray-200 mb-2 drop-shadow-md">
          by {currentBook.author}
        </p>
        <p className="text-xs text-gray-300 line-clamp-3 drop-shadow-md">
          {truncatedSummary}
        </p>
      </div>

      {/* Swipe Indicators - Top Center */}
      <div className="absolute top-6 left-1/2 transform -translate-x-1/2 flex items-center gap-3 text-white/80">
        <div className="flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          <span className="text-xs font-medium">Swipe</span>
        </div>
        <div className="w-1 h-1 bg-white/60 rounded-full"></div>
        <div className="flex items-center gap-1">
          <span className="text-xs font-medium">Swipe</span>
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </div>
      </div>

      {/* Dot Indicators - Bottom Right */}
      <div className="absolute bottom-6 right-6 flex gap-2 items-center">
        {books.map((_, index) => (
          <div
            key={index}
            className={`transition-all duration-300 ${
              index === currentIndex
                ? 'w-6 h-1 bg-[#D01E1E] rounded-full'
                : 'w-1 h-1 bg-white/60 rounded-full'
            }`}
          />
        ))}
      </div>

      {/* CSS for Ken Burns Effect */}
      <style>{`
        @keyframes kenBurns {
          0% {
            transform: scale(1.05);
          }
          100% {
            transform: scale(1.15);
          }
        }
        @keyframes kenBurnsReverse {
          0% {
            transform: scale(1.15);
          }
          100% {
            transform: scale(1.05);
          }
        }
      `}</style>
    </section>
  );
};

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, logout } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: books = [], isLoading: booksLoading, error: booksError } = useBooks();
  const { data: bestsellers = [], isLoading: bestsellersLoading } = useBestsellers();
  const { data: editorPicks = [], isLoading: editorPicksLoading } = useEditorPicks();
  
  // Use books data for featured sections until backend is deployed
  const featuredBestsellers = bestsellers.length > 0 ? bestsellers : books.slice(0, 6);
  const featuredEditorPicks = editorPicks.length > 0 ? editorPicks : books.slice(6, 12);
  const { userLibrary, wishlist, cart, addToWishlist, removeFromWishlist } = useUserData();

  // Function to get random books from the entire website
  const getRandomBooks = () => {
    if (!books || books.length === 0) return [];
    
    // Shuffle the books array and take 8 random books
    const shuffled = [...books].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 8);
  };

  // Debug logging
  console.log('Index page state:', { 
    userLibraryLength: userLibrary.length, 
    wishlistLength: wishlist.length, 
    cartItemsLength: cart.items.length,
    addToWishlist: !!addToWishlist,
    removeFromWishlist: !!removeFromWishlist,
    wishlistSample: wishlist.slice(0, 2), // Show first 2 wishlist items
    userLibrarySample: userLibrary.slice(0, 2) // Show first 2 library items
  });

  // Remove blocking loading/error states
  // if (booksLoading) {
  //   return <div>Loading homepage...</div>;
  // }
  // if (booksError) {
  //   return <div>Error loading homepage data.</div>;
  // }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      if (!user) {
        navigate('/auth');
        return;
      }
      navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
    }
  };

  const handleCategoryClick = (category: string) => {
    if (!user) {
      navigate('/auth');
      return;
    }
    navigate(`/explore?category=${encodeURIComponent(category)}`);
  };

  const handleAddToWishlist = async (bookId: string) => {
    console.log('Index: handleAddToWishlist called with bookId:', bookId);
    if (!user) {
      console.log('Index: No user, navigating to auth');
      navigate('/auth');
      return;
    }
    try {
      console.log('Index: Calling addToWishlist.mutateAsync...');
      await addToWishlist.mutateAsync({ bookId });
      console.log('Index: addToWishlist.mutateAsync completed successfully');
      
      // Show success toast
    toast({
      title: "Added to Wishlist",
      description: "Book has been added to your wishlist.",
        duration: 2000, // 2 seconds
      });
    } catch (error) {
      console.error('Index: Failed to add to wishlist:', error);
      
      // Show error toast
      toast({
        title: "Error",
        description: "Failed to add book to wishlist.",
        variant: "destructive",
        duration: 3000, // 3 seconds for errors
      });
    }
  };

  const handleRemoveFromWishlist = async (bookId: string) => {
    console.log('Index: handleRemoveFromWishlist called with bookId:', bookId);
    if (!user) {
      console.log('Index: No user, navigating to auth');
      navigate('/auth');
      return;
    }
    try {
      console.log('Index: Calling removeFromWishlist.mutateAsync...');
      await removeFromWishlist.mutateAsync(bookId);
      console.log('Index: removeFromWishlist.mutateAsync completed successfully');
      
      // Show success toast
      toast({
        title: "Removed from Wishlist",
        description: "Book has been removed from your wishlist.",
        duration: 2000, // 2 seconds
      });
    } catch (error) {
      console.error('Index: Failed to remove from wishlist:', error);
      
      // Show error toast
      toast({
        title: "Error",
        description: "Failed to remove book from wishlist.",
        variant: "destructive",
        duration: 3000, // 3 seconds for errors
      });
    }
  };

  const handleExploreClick = () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    navigate('/explore');
  };

  const handleSubscribe = () => {
    toast({
      title: "Thanks for your effort!",
      description: "This feature is coming soon.",
    });
  };

  // Helper functions for instant state
  const isBookInLibrary = (bookId: string) => userLibrary.some((entry: any) => (entry.book?._id || entry.book?.id || entry._id || entry.id) === bookId);
  const isBookInWishlist = (bookId: string) => {
    const result = wishlist.some((item: any) => (item.book?._id || item.book?.id || item._id || item.id) === bookId);
    console.log('isBookInWishlist check:', { bookId, result, wishlistItems: wishlist.map(item => ({ 
      itemId: item._id || item.id, 
      bookId: item.book?._id || item.book?.id 
    })) });
    return result;
  };
  const isBookInCart = (bookId: string) => cart.items.some((item: any) => (item.book?._id || item.book?.id) === bookId);

  const categories = ["All", "Fiction", "Romance", "Sci-Fi", "Thriller", "Adventure"];

  const isBookFree = (book: any) => book.isFree === true || book.is_free === true || book.price === 0 || book.price === '0';

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center h-14">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-[#D01E1E] to-[#FF6B6B] rounded-xl flex items-center justify-center shadow-sm">
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900">ChapterOne</span>
            </div>
            
            <nav className="hidden md:flex space-x-8">
              <button onClick={handleExploreClick} className="text-gray-700 hover:text-[#D01E1E] transition-colors">Explore Books</button>
              {user && (
                <Link to="/library" className="text-gray-700 hover:text-[#D01E1E] transition-colors">Library</Link>
              )}
            </nav>
            
            <div className="flex items-center space-x-2">
              {user ? (
                <>
                  {/* Cart button for both mobile and desktop */}
                  <Link to="/cart" className="relative">
                    <Button variant="ghost" size="sm" className="rounded-full p-2 border-2 border-[#D01E1E] hover:bg-red-50">
                      <ShoppingCart className="w-5 h-5 text-[#D01E1E]" />
                      {cart.items && cart.items.length > 0 && (
                        <span className="absolute -top-1 -right-1 bg-[#D01E1E] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                          {cart.items.length}
                        </span>
                      )}
                    </Button>
                  </Link>
                  <Link to="/search" className="hidden md:block">
                    <Search className="w-5 h-5 text-[#D01E1E] hover:text-[#B01818]" />
                  </Link>
                  <Button onClick={logout} variant="outline" size="sm" className="rounded-lg hidden md:block">
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/auth" className="hidden md:block">
                    <Button variant="outline" size="sm" className="rounded-lg">Log In</Button>
                  </Link>
                  <Link to="/auth" className="hidden md:block">
                    <Button size="sm" className="bg-[#D01E1E] hover:bg-[#B01818] rounded-lg">Sign Up</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Netflix-style Hero Section - Mobile & Tablet */}
      <NetflixStyleHero books={getRandomBooks()} />

      {/* Desktop Hero - Keep original */}
      <section className="relative bg-gradient-to-br from-gray-50 to-gray-100 py-6 md:py-20 px-2 md:px-6 lg:px-8 hidden lg:block">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="flex justify-center mb-2 md:mb-8">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-[#D01E1E] flex items-center justify-center rounded-2xl">
                <BookOpen className="w-6 h-6 md:w-8 md:h-8 text-white" />
              </div>
            </div>
            <h1 className="text-2xl md:text-6xl font-bold text-gray-900 mb-2 md:mb-6">
              Discover Your Next
              <span className="text-[#D01E1E] block">Great Read</span>
            </h1>
            <p className="text-sm md:text-xl text-gray-600 mb-3 md:mb-8 max-w-3xl mx-auto">
              Join thousands of readers exploring curated book collections, building reading lists, and discovering stories that matter.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 md:gap-4 justify-center">
              {user ? (
                <>
                  <Button onClick={handleExploreClick} size="lg" className="bg-[#D01E1E] hover:bg-[#B01818] text-base md:text-lg py-3 md:py-6 px-4 md:px-8 rounded-xl">
                    Explore Books
                  </Button>
                  <Link to="/library" className="hidden md:block">
                    <Button variant="outline" size="lg" className="text-base md:text-lg py-3 md:py-6 px-4 md:px-8 rounded-xl">
                      My Library
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/auth">
                    <Button size="lg" className="bg-[#D01E1E] hover:bg-[#B01818] text-base md:text-lg py-3 md:py-6 px-4 md:px-8 rounded-xl">
                      Get Started Free
                    </Button>
                  </Link>
                  <Button onClick={handleExploreClick} variant="outline" size="lg" className="text-base md:text-lg py-3 md:py-6 px-4 md:px-8 rounded-xl">
                    Explore Books
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white px-1 md:px-4 pb-2 md:pb-6 pt-4 md:pt-6">
        <div className="max-w-7xl mx-auto">
          {/* Mobile: Horizontal scroll */}
          <div 
            className="flex gap-1 md:gap-2 overflow-x-auto pb-1 md:pb-2 scrollbar-hide md:hidden"
            style={{
              touchAction: 'pan-x pan-y',
              overscrollBehavior: 'contain',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            {categories.map((category, index) => (
              <div key={category} className="flex-shrink-0">
                <Button
                  variant={index === 0 ? "default" : "outline"}
                  size="sm"
                  onClick={() => index > 0 && handleCategoryClick(category)}
                  className={`whitespace-nowrap rounded-full px-3 md:px-4 py-1.5 md:py-2 text-xs font-medium transition-all duration-300 ease-in-out transform hover:scale-105 ${
                    index === 0 
                      ? "bg-[#D01E1E] text-white hover:bg-[#B01818] shadow-lg" 
                      : "border-gray-200 text-gray-600 hover:border-[#D01E1E] hover:text-white hover:bg-[#D01E1E] hover:shadow-md"
                  }`}
                >
                  {category}
                </Button>
              </div>
            ))}
          </div>
          
          {/* Desktop: Flexbox layout that wraps naturally */}
          <div className="hidden md:flex md:flex-wrap gap-3">
            {categories.map((category, index) => (
              <Button
                key={category}
                variant={index === 0 ? "default" : "outline"}
                size="sm"
                onClick={() => index > 0 && handleCategoryClick(category)}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-medium transition-all duration-300 ease-in-out transform hover:scale-105 ${
                  index === 0 
                    ? "bg-[#D01E1E] text-white hover:bg-[#B01818] shadow-lg" 
                    : "border-gray-200 text-gray-600 hover:border-[#D01E1E] hover:text-white hover:bg-[#D01E1E] hover:shadow-md"
                }`}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </section>

      <section className="py-2 md:py-6 px-1 md:px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-2 md:mb-6 px-1 md:px-0">
            <h2 className="text-base md:text-lg font-bold text-gray-900">Featured Books</h2>
            <button onClick={handleExploreClick} className="text-[#D01E1E] text-xs md:text-sm font-medium">
              See All
            </button>
          </div>
          <div className="lg:hidden">
            {editorPicksLoading ? <BookCarouselSkeleton /> : (
            <InfiniteBookCarousel 
              books={featuredEditorPicks.map(fb => fb.book || fb).filter(Boolean)}
              getBookState={(book) => ({
                isInLibrary: isBookInLibrary(book._id),
                isInWishlist: isBookInWishlist(book._id),
                isInCart: isBookInCart(book._id)
              })}
              onAddToWishlist={handleAddToWishlist}
                onRemoveFromWishlist={handleRemoveFromWishlist}
            />
            )}
          </div>
          <div className="hidden lg:flex lg:flex-wrap gap-4 lg:gap-6">
            {editorPicksLoading ? (
              Array.from({ length: 12 }).map((_, i) => <div key={i} className="w-full h-64 bg-gray-200 animate-pulse rounded-lg" />)
            ) : (
              featuredEditorPicks.slice(0, 12).map((featuredBook) => {
                const book = featuredBook.book || featuredBook;
                if (!book) return null;
                return (
                  <BookCard 
                    key={book._id}
                    book={book}
                    variant="compact"
                    showActionButtons={false}
                    isInWishlist={isBookInWishlist(book._id)}
                    isInLibrary={isBookInLibrary(book._id)}
                    onAddToWishlist={handleAddToWishlist}
                    onRemoveFromWishlist={handleRemoveFromWishlist}
                  />
                );
              })
            )}
          </div>
        </div>
      </section>

      <section className="py-2 md:py-6 px-1 md:px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-2 md:mb-6 px-1 md:px-0">
            <h2 className="text-base md:text-lg font-bold text-gray-900">Best Sellers</h2>
            <button onClick={handleExploreClick} className="text-[#D01E1E] text-xs md:text-sm font-medium">
              See All
            </button>
          </div>
          <div className="lg:hidden">
            {bestsellersLoading ? <BookCarouselSkeleton /> : (
            <InfiniteBookCarousel 
              books={featuredBestsellers.map(fb => fb.book || fb).filter(Boolean)}
              getBookState={(book) => ({
                isInLibrary: isBookInLibrary(book._id),
                isInWishlist: isBookInWishlist(book._id),
                isInCart: isBookInCart(book._id)
              })}
              onAddToWishlist={handleAddToWishlist}
                onRemoveFromWishlist={handleRemoveFromWishlist}
            />
            )}
          </div>
          <div className="hidden lg:flex lg:flex-wrap gap-4 lg:gap-6">
            {bestsellersLoading ? (
              Array.from({ length: 12 }).map((_, i) => <div key={i} className="w-full h-64 bg-gray-200 animate-pulse rounded-lg" />)
            ) : (
              featuredBestsellers.slice(0, 12).map((featuredBook) => {
                const book = featuredBook.book || featuredBook;
                if (!book) return null;
                return (
                  <BookCard 
                    key={book._id}
                    book={book}
                    variant="compact"
                    showActionButtons={false}
                    isInWishlist={isBookInWishlist(book._id)}
                    isInLibrary={isBookInLibrary(book._id)}
                    onAddToWishlist={handleAddToWishlist}
                    onRemoveFromWishlist={handleRemoveFromWishlist}
                  />
                );
              })
            )}
          </div>
        </div>
      </section>

      <section className="py-12 md:py-32 px-4 bg-[#D01E1E] text-white">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-xl md:text-5xl font-bold mb-3 md:mb-12">Why ChapterOne?</h2>
          <p className="text-white/90 mb-6 md:mb-20 text-sm md:text-2xl">
            The secure, affordable way to access books online
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-16">
            <div className="text-center">
              <div className="w-12 h-12 md:w-24 md:h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-8">
                <BookOpen className="w-6 h-6 md:w-12 md:h-12 text-white" />
              </div>
              <h3 className="font-semibold mb-2 md:mb-6 text-sm md:text-2xl">Secure Reading</h3>
              <p className="text-xs md:text-lg text-white/80">
                Protected from piracy with secure in-browser technology
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 md:w-24 md:h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-8">
                <svg className="w-6 h-6 md:w-12 md:h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h3 className="font-semibold mb-2 md:mb-6 text-sm md:text-2xl">Accessible</h3>
              <p className="text-xs md:text-lg text-white/80">
                Read on any device with an internet connection
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 md:w-24 md:h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-8">
                <Heart className="w-6 h-6 md:w-12 md:h-12 text-white" />
              </div>
              <h3 className="font-semibold mb-2 md:mb-6 text-sm md:text-2xl">Fair Pricing</h3>
              <p className="text-xs md:text-lg text-white/80">
                Many free books with premium titles at reasonable costs
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-24 px-4 bg-black text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-800/20 to-transparent transform -skew-y-1"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-gray-600/20 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-gray-500/10 to-transparent rounded-full blur-3xl"></div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="mb-8 md:mb-12">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 md:mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Stay in the Loop
            </h2>
            <p className="text-gray-300 text-lg md:text-xl mb-8 md:mb-12 max-w-2xl mx-auto">
              Be the first to discover new releases, exclusive content, and personalized recommendations tailored just for you.
            </p>
          </div>
          
          <div className="bg-gray-800/50 backdrop-blur-xl rounded-3xl px-8 py-10 md:px-12 md:py-16 border border-gray-700/50 shadow-2xl">
            <div className="flex flex-col sm:flex-row gap-4 md:gap-6 max-w-2xl mx-auto">
              <Input 
                placeholder="Enter your email address" 
                className="bg-gray-700/50 border-gray-600/50 text-white placeholder:text-gray-400 rounded-2xl flex-1 py-4 md:py-6 text-lg backdrop-blur-sm focus:ring-2 focus:ring-[#D01E1E]/50" 
              />
              <Button 
                className="bg-gradient-to-r from-[#D01E1E] to-[#FF6B6B] hover:from-[#B01818] hover:to-[#E55555] text-white rounded-2xl px-8 py-4 md:px-12 md:py-6 text-lg font-semibold shadow-lg"
                onClick={handleSubscribe}
              >
                Subscribe
              </Button>
            </div>
            <p className="text-sm md:text-base text-gray-400 mt-6 md:mt-8">
              Join 10,000+ readers who get the latest updates. Unsubscribe anytime.
            </p>
          </div>
        </div>
      </section>

      <footer className="bg-white py-12 md:py-20 px-4 border-t border-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 md:gap-16 mb-8 md:mb-16">
            <div>
              <div className="flex items-center space-x-2 mb-4 md:mb-8">
                <div className="w-8 h-8 md:w-12 md:h-12 bg-gradient-to-br from-[#D01E1E] to-[#FF6B6B] rounded-xl flex items-center justify-center">
                  <BookOpen className="w-4 h-4 md:w-6 md:h-6 text-white" />
                </div>
                <span className="font-bold text-gray-900 text-lg md:text-2xl">ChapterOne</span>
              </div>
              <p className="text-gray-600 text-sm md:text-lg leading-relaxed">
                Making books accessible to everyone. Your library, online, anywhere, anytime. Fighting piracy through accessibility and affordability.
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-8 md:gap-16">
              <div>
                <h3 className="font-semibold text-gray-900 mb-4 md:mb-8 text-sm md:text-lg">Quick Links</h3>
                <ul className="space-y-2 md:space-y-4">
                  <li><button onClick={handleExploreClick} className="text-gray-600 hover:text-[#D01E1E] transition-colors text-sm md:text-base">Explore Books</button></li>
                  <li><Link to="/about" className="text-gray-600 hover:text-[#D01E1E] transition-colors text-sm md:text-base">About Us</Link></li>
                  <li><Link to="/contact" className="text-gray-600 hover:text-[#D01E1E] transition-colors text-sm md:text-base">Contact</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-4 md:mb-8 text-sm md:text-lg">Support</h3>
                <ul className="space-y-2 md:space-y-4">
                  <li><Link to="/contact" className="text-gray-600 hover:text-[#D01E1E] transition-colors text-sm md:text-base">Help Center</Link></li>
                  <li><Link to="/contact" className="text-gray-600 hover:text-[#D01E1E] transition-colors text-sm md:text-base">Contact Us</Link></li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="text-center pt-8 md:pt-12 border-t border-gray-100">
            <p className="text-xs md:text-base text-gray-500">© 2025 ChapterOne. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {user && <MobileBottomNav />}
    </div>
  );
};

export default Index;
