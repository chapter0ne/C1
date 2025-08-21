import { useRandomBooks, useBooks } from '@/hooks/useBooks';
import { useUserData } from '@/contexts/UserDataContext';
import { useAuth } from '@/contexts/AuthContext';
import { useWishlist } from '@/hooks/useWishlist';
import { useSearchParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import BookCard from "@/components/BookCard";
import MobileBottomNav from "@/components/MobileBottomNav";
import UniversalHeader from "@/components/UniversalHeader";
import { useToast } from "@/hooks/use-toast";
import { useViewportHeight } from "@/hooks/useViewportHeight";

const Search = () => {
  const { user } = useAuth();
  const { userLibrary, wishlist, cart, addToWishlist, removeFromWishlist, refetchWishlist } = useUserData();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const category = searchParams.get('category');
  const [searchTerm, setSearchTerm] = useState('');
  const { effectiveHeight } = useViewportHeight();
  const [stickyTop, setStickyTop] = useState(64); // Default 64px (4rem)

  const isBookInLibrary = (bookId: string) => userLibrary.some((entry: any) => (entry.book?._id || entry.book?.id || entry._id || entry.id) === bookId);
  const isBookInWishlist = (bookId: string) => wishlist.some((item: any) => (item.book?._id || item.book?.id || item._id || item.id) === bookId);
  const isBookInCart = (bookId: string) => cart.items.some((item: any) => (item.book?._id || item.book?.id) === bookId);

  // Update sticky positioning when viewport changes
  useEffect(() => {
    // Position search bar directly below navbar (64px height)
    setStickyTop(64);
  }, [effectiveHeight]);

  // Wishlist handlers for heart button functionality
  const handleAddToWishlist = async (bookId: string) => {
    if (!user) {
      toast({
        title: "Please Login",
        description: "You need to be logged in to add books to your wishlist.",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    try {
      // addToWishlist expects { bookId } format
      const result = await addToWishlist.mutateAsync({ bookId });
      
      // Force refetch to update the UI state
      await refetchWishlist();
      
      toast({
        title: "Added to Wishlist",
        description: "Book has been added to your wishlist.",
        duration: 2000,
      });
    } catch (error) {
      console.error('Search: Failed to add to wishlist:', error);
      
      toast({
        title: "Error",
        description: "Failed to add book to wishlist.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const handleRemoveFromWishlist = async (bookId: string) => {
    try {
      // removeFromWishlist expects just bookId string
      const result = await removeFromWishlist.mutateAsync(bookId);
      
      // Force refetch to update the UI state
      await refetchWishlist();
      
      toast({
        title: "Removed from Wishlist",
        description: "Book has been removed from your wishlist.",
        duration: 2000,
      });
    } catch (error) {
      console.error('Search: Failed to remove from wishlist:', error);
      
      toast({
        title: "Error",
        description: "Failed to remove book from wishlist.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  // Get books based on category filter or random books
  const { data: allBooks = [], isLoading, error } = useBooks();
  
  // Ensure we have books before filtering
  if (!allBooks || allBooks.length === 0) {
  return (
    <div className="min-h-screen full-viewport-height bg-gray-50 flex flex-col">
      {/* Desktop Header */}
      <UniversalHeader currentPage="search" />

      {/* Search Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
          {/* Search Bar */}
          <div className="relative mb-6">
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search books, authors, genres..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border-2 border-gray-200 rounded-xl pl-12 pr-6 py-4 text-lg focus:outline-none focus:ring-2 focus:ring-[#D01E1E] focus:border-[#D01E1E] transition-all duration-200 shadow-sm"
            />
          </div>

          {/* Page Title */}
          <div className="text-center mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2 hidden md:block">
                {category ? `${category} Books` : 'Find your favourite books'}
              </h1>
              <p className="text-gray-600 hidden md:block">
                {category ? `Explore our collection of ${category.toLowerCase()} books` : 'Explore our curated collection of books'}
              </p>
              {searchTerm && (
                <p className="text-sm text-gray-500 mt-2">
                  Showing {allBooks.length} results for "{searchTerm}"
                </p>
              )}
              {category && !searchTerm && (
                <p className="text-sm text-gray-500 mt-2">
                  Found {allBooks.length} books in {category} category
                </p>
              )}
              
            </div>
          </div>
        </div>

        {/* Books Grid */}
        <div className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-8 py-6 pb-20">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D01E1E] mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading books...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-500">
              <p className="text-lg font-medium">Error loading books</p>
              <p className="text-sm">{error.message}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-4 px-4 py-2 bg-[#D01E1E] text-white rounded-lg hover:bg-[#B01818]"
              >
                Try Again
              </button>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg font-medium">No books available</p>
              <p className="text-sm">There are no books in the system yet.</p>
            </div>
          )}
        </div>

        {/* Mobile Bottom Nav */}
        <MobileBottomNav />
      </div>
    );
  }

  const filteredBooks = category 
    ? allBooks.filter((book: any) => {
        // Validate book object
        if (!book || typeof book !== 'object') {
          return false;
        }
        
        // Special handling for "Others" category - this is a computed category
        if (category === 'Others') {
          // For "Others", we need to check if the book doesn't fit into any predefined categories
          // This is a simplified version - in practice, you might want to match the exact logic from EnhancedBrowseBooks
          const predefinedCategories = [
            // Fiction Categories
            "Fiction", "Romance", "Thriller", "Adventure", "Mystery", "Fantasy", "Sci-Fi", "Horror", "Drama", "Comedy", "Crime", "Short Stories",
            // Non-Fiction Categories
            "Non-Fiction", "Biography", "Autobiography", "Poetry"
          ];
          
          // Check if book has any of the predefined categories
          const hasPredefinedCategory = predefinedCategories.some(predefinedCat => {
            if (book.tags && Array.isArray(book.tags)) {
              return book.tags.some(tag => tag.toLowerCase() === predefinedCat.toLowerCase());
            }
            if (book.category && book.category.toLowerCase() === predefinedCat.toLowerCase()) {
              return true;
            }
            if (book.genre && book.genre.toLowerCase() === predefinedCat.toLowerCase()) {
              return true;
            }
            return false;
          });
          
          // Return true if book doesn't have any predefined category
          return !hasPredefinedCategory;
        }
        
        // Use the same improved category matching logic as EnhancedBrowseBooks
        let matchesCategory = false;
        
        // Check exact matches first
        if (book.tags && Array.isArray(book.tags)) {
          matchesCategory = book.tags.some(tag => 
            tag.toLowerCase() === category.toLowerCase()
          );
        }
        
        // Check single tag field
        if (!matchesCategory && book.tag) {
          matchesCategory = book.tag.toLowerCase() === category.toLowerCase();
        }
        
        // Check category field
        if (!matchesCategory && book.category) {
          matchesCategory = book.category.toLowerCase() === category.toLowerCase();
        }
        
        // Check genre field
        if (!matchesCategory && book.genre) {
          matchesCategory = book.genre.toLowerCase() === category.toLowerCase();
        }
        
        // Check for partial matches in tags (more flexible)
        if (!matchesCategory && book.tags && Array.isArray(book.tags)) {
          matchesCategory = book.tags.some(tag => {
            const tagLower = tag.toLowerCase();
            const categoryLower = category.toLowerCase();
            
            // Check if tag contains category or category contains tag
            return tagLower.includes(categoryLower) || 
                   categoryLower.includes(tagLower) ||
                   // Handle common variations
                   (category === 'Sci-Fi' && (tagLower.includes('sci-fi') || tagLower.includes('science fiction') || tagLower.includes('scifi'))) ||
                   (category === 'Short Stories' && (tagLower.includes('short story') || tagLower.includes('short stories') || tagLower.includes('short')));
          });
        }
        
        return matchesCategory;
      })
    : allBooks;

  // Apply search filter to the books
  const searchFilteredBooks = searchTerm 
    ? filteredBooks.filter((book: any) => {
        // Validate book object
        if (!book || typeof book !== 'object') {
          return false;
        }
        
        return (book.title && book.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
               (book.author && book.author.toLowerCase().includes(searchTerm.toLowerCase())) ||
               (book.tags && Array.isArray(book.tags) && book.tags.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase())));
      })
    : filteredBooks;

  const displayBooks = searchFilteredBooks;
  
  return (
    <div className="min-h-screen full-viewport-height bg-gray-50 flex flex-col">
      {/* Desktop Header */}
      <UniversalHeader currentPage="search" />

      {/* Search Section - Sticky and Glassy */}
      <div 
        className="sticky z-40 backdrop-blur-xl bg-white/30 border shadow-2xl"
        style={{ top: `${stickyTop}px` }}
      >
        <div className="max-w-7xl mx-auto px-2 md:px-8 py-2 md:py-4">
          {/* Search Bar */}
          <div className="relative mb-2 md:mb-4">
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search books, authors, genres..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-white/30 rounded-xl pl-12 pr-6 py-4 text-lg focus:outline-none focus:ring-2 focus:ring-[#D01E1E] focus:border-[#D01E1E] transition-all duration-300 ease-out shadow-2xl bg-white/40 backdrop-blur-xl text-gray-800 font-medium hover:bg-white/50 focus:bg-white/60"
            />
          </div>

          {/* Page Title */}
          <div className="text-center mb-2 md:mb-3">
            <h1 className="text-3xl font-bold text-gray-900 mb-2 hidden md:block">
              {category ? `${category} Books` : 'Find your favourite books'}
            </h1>
            <p className="text-gray-600 hidden md:block">
              {category ? `Explore our collection of ${category.toLowerCase()} books` : 'Explore our curated collection of books'}
            </p>
            {searchTerm && (
              <p className="text-sm text-gray-500 mt-2">
                Showing {displayBooks.length} results for "{searchTerm}"
              </p>
            )}
            {category && !searchTerm && (
              <p className="text-lg md:text-sm font-semibold text-gray-700 mt-1 md:mt-1">
                {category} Books
              </p>
            )}
            
          </div>
        </div>
      </div>

      {/* Books Grid */}
      <div 
        className="flex-1 max-w-7xl mx-auto w-full px-2 md:px-8 py-2 md:py-4 pb-20" 
        style={{ paddingTop: `calc(${stickyTop + 2}px)` }}
      >
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D01E1E] mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading books...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-500">
            <p className="text-lg font-medium">Error loading books</p>
            <p className="text-sm">{error.message}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-4 py-2 bg-[#D01E1E] text-white rounded-lg hover:bg-[#B01818]"
            >
              Try Again
            </button>
          </div>
        ) : displayBooks.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg font-medium">No books found</p>
            <p className="text-sm">
              {searchTerm && category 
                ? `No results for "${searchTerm}" in ${category} category. Try a different search term or category.`
                : searchTerm 
                ? `No results for "${searchTerm}". Try a different search term.`
                : category 
                ? `No books found in ${category} category. Try a different category or check back later.`
                : 'Try a different category or check back later'
              }
            </p>
            {category && (
              <div className="mt-4 p-4 bg-gray-100 rounded-lg text-left max-w-md mx-auto">
                <p className="text-sm font-medium text-gray-700 mb-2">Current filters:</p>
                <p className="text-sm text-gray-600">Category: {category}</p>
                {searchTerm && <p className="text-sm text-gray-600">Search: "{searchTerm}"</p>}
                <p className="text-sm text-gray-600">Total books available: {allBooks.length}</p>
                <p className="text-sm text-gray-600">Books after category filter: {filteredBooks.length}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4 lg:gap-6">
            {displayBooks.filter((book: any) => book && book._id).map((book: any) => {
              const bookInLibrary = isBookInLibrary(book._id);
              const bookInWishlist = isBookInWishlist(book._id);
              const shouldShowHeart = !bookInLibrary;
              
              return (
                <BookCard
                  key={book._id}
                  book={book}
                  variant="compact"
                  showActionButtons={false}
                  showHeart={shouldShowHeart}
                  isInLibrary={bookInLibrary}
                  isInWishlist={bookInWishlist}
                  isInCart={isBookInCart(book._id)}
                  onAddToWishlist={handleAddToWishlist}
                  onRemoveFromWishlist={handleRemoveFromWishlist}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Mobile Bottom Nav */}
      <MobileBottomNav />
    </div>
  );
};

export default Search;
