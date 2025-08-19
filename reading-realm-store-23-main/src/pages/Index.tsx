import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, BookOpen, Heart, Star, User } from "lucide-react";
import InfiniteBookCarousel from "@/components/InfiniteBookCarousel";
import BookCard from "@/components/BookCard";
import { useToast } from "@/hooks/use-toast";
import MobileBottomNav from "@/components/MobileBottomNav";
import { useAuth } from "@/contexts/AuthContext";
import { useBooks } from '@/hooks/useBooks';
import { useUserData } from '@/contexts/UserDataContext';

// Skeleton loader for book carousels
const BookCarouselSkeleton = () => (
  <>
    {/* Mobile: Horizontal scroll skeleton */}
    <div className="flex gap-4 overflow-x-auto pb-2 md:hidden">
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

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, logout } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: books = [], isLoading: booksLoading, error: booksError } = useBooks();
  const { userLibrary, wishlist, cart, addToWishlist, removeFromWishlist } = useUserData();

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
                  <Link to="/cart" className="hidden md:block">
                    <Button variant="ghost" size="sm" className="rounded-full p-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.68 8.32M7 13h10M17 21a2 2 0 100-4 2 2 0 000 4zM9 21a2 2 0 100-4 2 2 0 000 4z" />
                      </svg>
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

      <section className="relative bg-gradient-to-br from-gray-50 to-gray-100 py-6 md:py-20 px-2 md:px-6 lg:px-8">
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

      <section className="bg-white px-1 md:px-4 pb-2 md:pb-6">
        <div className="max-w-7xl mx-auto">
          {/* Mobile: Horizontal scroll */}
          <div className="flex gap-1 md:gap-2 overflow-x-auto pb-1 md:pb-2 scrollbar-hide md:hidden">
            {categories.map((category, index) => (
              <div key={category} className="flex-shrink-0">
                <Button
                  variant={index === 0 ? "default" : "outline"}
                  size="sm"
                  onClick={() => index > 0 && handleCategoryClick(category)}
                  className={`whitespace-nowrap rounded-full px-3 md:px-4 py-1.5 md:py-2 text-xs font-medium ${
                    index === 0 
                      ? "bg-[#D01E1E] text-white hover:bg-[#B01818]" 
                      : "border-gray-200 text-gray-600 hover:border-[#D01E1E] hover:text-white hover:bg-[#D01E1E]"
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
                className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-medium ${
                  index === 0 
                    ? "bg-[#D01E1E] text-white hover:bg-[#B01818]" 
                    : "border-gray-200 text-gray-600 hover:border-[#D01E1E] hover:text-white hover:bg-[#D01E1E]"
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
            {booksLoading ? <BookCarouselSkeleton /> : (
            <InfiniteBookCarousel 
              books={books}
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
            {booksLoading ? (
              Array.from({ length: 12 }).map((_, i) => <div key={i} className="w-full h-64 bg-gray-200 animate-pulse rounded-lg" />)
            ) : (
              books.slice(0, 12).map((book) => (
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
              ))
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
            {booksLoading ? <BookCarouselSkeleton /> : (
            <InfiniteBookCarousel 
              books={books}
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
            {booksLoading ? (
              Array.from({ length: 12 }).map((_, i) => <div key={i} className="w-full h-64 bg-gray-200 animate-pulse rounded-lg" />)
            ) : (
              books.slice(0, 12).map((book) => (
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
              ))
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
