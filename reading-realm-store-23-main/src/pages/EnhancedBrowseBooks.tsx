import { useState, useEffect, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useBooks } from '@/hooks/useBooks';
import { useToast } from "@/hooks/use-toast";
import { useUserData } from '@/contexts/UserDataContext';
import { useWishlist } from '@/hooks/useWishlist';
import BookCard from '@/components/BookCard';
import MobileBottomNav from "@/components/MobileBottomNav";
import UniversalHeader from "@/components/UniversalHeader";
import { ChevronDown, Filter, Star } from "lucide-react";
import InfiniteBookCarousel from "@/components/InfiniteBookCarousel";

const EnhancedBrowseBooks = () => {
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'All';
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedPrice, setSelectedPrice] = useState('All');
  const { toast } = useToast();
  const { userLibrary, wishlist, cart, addToLibrary, addToWishlist, removeFromWishlist, removeFromLibrary } = useUserData();
  const { refetch: refetchWishlist } = useWishlist(user?.id || user?._id || '');

  // Helper functions for instant state
  const isBookInLibrary = (bookId: string) => userLibrary.some((entry: any) => (entry.book?._id || entry.book?.id || entry._id || entry.id) === bookId);
  const isBookInWishlist = (bookId: string) => {
    if (!bookId || !wishlist || wishlist.length === 0) {
      console.log('isBookInWishlist: No bookId or empty wishlist:', { bookId, wishlistLength: wishlist?.length });
      return false;
    }

    const result = wishlist.some((item: any) => {
      // Check for populated book object first
      const itemBookId = item.book?._id || item.book?.id || item._id || item.id;
      const matches = itemBookId === bookId;
      if (matches) {
        console.log('Found book in wishlist:', { bookId, itemBookId, item });
      }
      return matches;
    });
    
    console.log('isBookInWishlist check:', { 
      bookId, 
      result, 
      wishlistLength: wishlist.length, 
      wishlistItems: wishlist.map((item: any) => ({ 
        itemId: item._id, 
        bookId: item.book?._id, 
        bookTitle: item.book?.title,
        bookObject: item.book
      }))
    });
    return result;
  };
  const isBookInCart = (bookId: string) => cart.items.some((item: any) => (item.book?._id || item.book?.id) === bookId);

  console.log('EnhancedBrowseBooks wishlist debug:', {
    wishlistLength: wishlist.length,
    wishlistItems: wishlist.map((item: any) => ({
      itemId: item._id,
      bookId: item.book?._id,
      bookTitle: item.book?.title,
      bookObject: item.book
    })),
    userLibraryLength: userLibrary.length,
    cartItemsLength: cart.items.length,
    userId: user?.id || user?._id
  });

  const { data: allBooks = [], isLoading, error } = useBooks();

  // Debug: Log authentication and books data
  useEffect(() => {
    console.log('EnhancedBrowseBooks: Component state:', {
      user: user ? { id: user.id, username: user.username, roles: user.roles } : null,
      token: localStorage.getItem('token') ? 'Token exists' : 'No token',
      allBooksLength: allBooks.length,
      isLoading,
      error: error?.message
    });
  }, [user, allBooks, isLoading, error]);

  // Categories including Short Stories
  const categories = ["Romance", "Horror", "Thriller", "Fiction", "Sci-Fi", "Adventure", "Mystery", "Fantasy", "Crime", "Short Stories"];
  const priceRanges = ['All', 'Free', 'Paid'];

  useEffect(() => {
    if (initialCategory !== 'All') {
      setSelectedCategory(initialCategory);
    }
  }, [initialCategory]);

  // Helper function to check if a book is free
  const isBookFree = (book: any) => book.isFree === true || book.is_free === true || book.price === 0 || book.price === '0';

  // Function to get books by category/tag with max 20 books
  const getCategoryBooks = (category: string) => {
    console.log(`getCategoryBooks called for category: ${category}`);
    console.log(`Total books available: ${allBooks.length}`);
    
    // If category is 'All', return all books (this was the bug!)
    if (category === 'All') {
      const allFilteredBooks = allBooks.filter((book: any) => {
        // Only apply price filter when category is 'All'
        if (selectedPrice === 'Free') {
          return isBookFree(book);
        } else if (selectedPrice === 'Paid') {
          return !isBookFree(book);
        }
        return true; // Return all books if no price filter
      });
      console.log(`Category 'All' returning ${allFilteredBooks.length} books`);
      return allFilteredBooks.slice(0, 20);
    }
    
    // For specific categories, filter by category and price with intelligent tag matching
    let filteredBooks = allBooks.filter((book: any) => {
      // Check if book matches the selected category - be more intelligent with matching
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
      
      // Apply price filter if selected
      if (selectedPrice === 'Free') {
        return matchesCategory && isBookFree(book);
      } else if (selectedPrice === 'Paid') {
        return matchesCategory && !isBookFree(book);
      }
      
      return matchesCategory;
    });

    console.log(`Category '${category}' returning ${filteredBooks.length} books`);
    // Limit to max 20 books per category
    return filteredBooks.slice(0, 20);
  };

  // Memoized category sections and uncategorized books
  const categorySections = useMemo(() => {
    return categories.map(category => {
      const categoryBooks = getCategoryBooks(category);
      return { category, books: categoryBooks };
    });
  }, [categories, allBooks, selectedPrice]);

  const uncategorizedBooks = useMemo(() => {
    // Get all books that appear in predefined categories
    const categorizedBookIds = new Set();
    categorySections.forEach(section => {
      section.books.forEach(book => {
        categorizedBookIds.add(book._id);
      });
    });

    // Filter uncategorized books by both category exclusion AND price filter
    const uncategorized = allBooks.filter(book => {
      // First, check if book is not in any predefined category
      const notInPredefinedCategory = !categorizedBookIds.has(book._id);
      
      // Then, apply price filter if selected
      let passesPriceFilter = true;
      if (selectedPrice === 'Free') {
        passesPriceFilter = isBookFree(book);
      } else if (selectedPrice === 'Paid') {
        passesPriceFilter = !isBookFree(book);
      }
      
      // Book must pass both filters
      const shouldInclude = notInPredefinedCategory && passesPriceFilter;
      
      // Debug logging for price filter issues
      if (selectedPrice === 'Free' && !isBookFree(book) && notInPredefinedCategory) {
        console.log(`Book "${book.title}" excluded from Others: not free but uncategorized`);
      }
      
      return shouldInclude;
    });
    
    console.log(`Found ${uncategorized.length} uncategorized books after applying price filter (selectedPrice: ${selectedPrice})`);
    return uncategorized;
  }, [categorySections, allBooks, selectedPrice]);

  // Function to get all books for a specific category when "See All" is clicked
  const getAllCategoryBooks = (category: string) => {
    let filteredBooks = allBooks.filter((book: any) => {
      // Use the same improved category matching logic as getCategoryBooks
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
      
      // Apply price filter if selected
      if (selectedPrice === 'Free') {
        return matchesCategory && isBookFree(book);
      } else if (selectedPrice === 'Paid') {
        return matchesCategory && !isBookFree(book);
      }
      
      return matchesCategory;
    });

    return filteredBooks;
  };

  const handleAddToLibrary = async (bookId: string) => {
    console.log('EnhancedBrowseBooks: Starting add to library process for bookId:', bookId);
    
    try {
      // First, add to library
      console.log('EnhancedBrowseBooks: Adding book to library...');
      await addToLibrary.mutateAsync(bookId);
      console.log('EnhancedBrowseBooks: Successfully added to library');
      
      // Check if book was in wishlist before adding to library
      const wasInWishlist = isBookInWishlist(bookId);
      console.log('EnhancedBrowseBooks: Book was in wishlist before library addition:', wasInWishlist);
      
      if (wasInWishlist) {
        // Auto-remove from wishlist when added to library
        console.log('EnhancedBrowseBooks: Attempting to remove from wishlist...');
        try {
          await removeFromWishlist.mutateAsync(bookId);
          console.log('EnhancedBrowseBooks: Successfully auto-removed from wishlist');
          
          // Force a refetch of the wishlist to ensure state updates
          try {
            await refetchWishlist();
            console.log('EnhancedBrowseBooks: Forced wishlist refetch after removal');
          } catch (refetchError) {
            console.log('EnhancedBrowseBooks: Refetch not available or failed:', refetchError);
          }
          
          toast({
            title: "Added to Library",
            description: "Book has been added to your library and removed from wishlist.",
            duration: 2000,
          });
        } catch (wishlistError) {
          console.error('EnhancedBrowseBooks: Failed to auto-remove from wishlist:', wishlistError);
          
          // Show warning toast that wishlist removal failed
          toast({
            title: "Warning",
            description: "Book added to library but failed to remove from wishlist. Please remove manually.",
            variant: "destructive",
            duration: 4000,
          });
        }
      } else {
        // Book wasn't in wishlist, just show success
        toast({
          title: "Added to Library",
          description: "Book has been added to your library.",
          duration: 2000,
        });
      }
    } catch (error) {
      console.error('EnhancedBrowseBooks: Failed to add to library:', error);
      toast({
        title: "Error",
        description: "Failed to add book to library.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const handleAddToWishlist = async (bookId: string) => {
    console.log('EnhancedBrowseBooks: Adding to wishlist:', bookId);
    try {
      await addToWishlist.mutateAsync({ bookId });
      console.log('EnhancedBrowseBooks: Successfully added to wishlist');
    } catch (error) {
      console.error('EnhancedBrowseBooks: Failed to add to wishlist:', error);
    }
  };

  const handleRemoveFromWishlist = async (bookId: string) => {
    console.log('EnhancedBrowseBooks: Removing from wishlist:', bookId);
    try {
      await removeFromWishlist.mutateAsync(bookId);
      console.log('EnhancedBrowseBooks: Successfully removed from wishlist');
    } catch (error) {
      console.error('EnhancedBrowseBooks: Failed to remove from wishlist:', error);
    }
  };

  const handleRemoveFromLibrary = async (bookId: string) => {
    console.log('EnhancedBrowseBooks: Removing from library:', bookId);
    try {
      await removeFromLibrary.mutateAsync(bookId);
      console.log('EnhancedBrowseBooks: Successfully removed from library');
    } catch (error) {
      console.error('EnhancedBrowseBooks: Failed to remove from library:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <UniversalHeader currentPage="explore" />
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D01E1E]"></div>
        </div>
        <MobileBottomNav />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <UniversalHeader currentPage="explore" />
        <div className="text-center py-12 text-red-500">Error loading books: {error.message}</div>
        <MobileBottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Desktop Header */}
      <UniversalHeader currentPage="explore" />

      {/* Page Title Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Discover Books</h1>
            <p className="text-gray-600">Explore our curated collection of books</p>
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
          {/* Mobile Filter Toggle */}
          <div className="md:hidden mb-4">
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="flex items-center gap-2 bg-white border-2 border-gray-200 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-[#D01E1E] focus:border-[#D01E1E] transition-all duration-200 w-full"
            >
              <Filter className="w-5 h-5 text-gray-400" />
              <span className="text-gray-700">Filters</span>
              <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${showMobileFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Filter Section */}
          <div className={`bg-white rounded-xl p-6 shadow-sm border border-gray-100 ${showMobileFilters ? 'block' : 'hidden md:block'}`}>
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              {/* Price Filter */}
              <div className="flex-shrink-0">
                <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">Price</h3>
                <div className="flex gap-2">
                  {priceRanges.map((price) => (
                    <button
                      key={price}
                      onClick={() => setSelectedPrice(price)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
                        selectedPrice === price
                          ? 'bg-[#D01E1E] text-white border-[#D01E1E]'
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-red-50 hover:text-[#B01818] hover:border-red-200'
                      }`}
                    >
                      {price}
                    </button>
                  ))}
                </div>
              </div>

              {/* Categories */}
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">Categories</h3>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(selectedCategory === category ? 'All' : category)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
                        selectedCategory === category
                          ? 'bg-[#D01E1E] text-white border-[#D01E1E]'
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-red-50 hover:text-[#B01818] hover:border-red-200'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Sections with Max 20 Books */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-8 py-6 pb-20">
        {selectedCategory === 'All' ? (
          // Show books organized into predefined category sections
          (() => {
            console.log(`Rendering sectionalized view with ${allBooks.length} total books`);
            
            if (allBooks.length === 0) {
              return (
                <div className="text-center py-12">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">No books found</h2>
                  <p className="text-gray-600">Try adjusting your filters or check back later</p>
                </div>
              );
            }

            return (
              <>
                {/* Show each predefined category section */}
                {categorySections.map(({ category, books }) => {
                  if (books.length === 0) return null;

                  return (
                    <div key={category} className="mb-12">
                      {/* Category Header */}
                      <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">{category}</h2>
                        <Link 
                          to={`/search?category=${encodeURIComponent(category)}`}
                          className="text-[#D01E1E] hover:text-[#B01818] font-medium transition-colors"
                        >
                          See All ({getAllCategoryBooks(category).length})
                        </Link>
                      </div>

                      {/* Mobile: Infinite side scroll, Desktop: Responsive grid */}
                      <div className="lg:hidden">
                        <InfiniteBookCarousel
                          books={books}
                          getBookState={(book) => ({
                            isInLibrary: isBookInLibrary(book._id),
                            isInWishlist: isBookInWishlist(book._id),
                            isInCart: isBookInCart(book._id)
                          })}
                          onAddToLibrary={handleAddToLibrary}
                          onRemoveFromLibrary={handleRemoveFromLibrary}
                          onAddToWishlist={handleAddToWishlist}
                          onRemoveFromWishlist={handleRemoveFromWishlist}
                        />
                      </div>

                      {/* Desktop: Responsive grid layout */}
                      <div className="hidden lg:flex lg:flex-wrap gap-4 lg:gap-6">
                        {books.map((book: any) => (
                          <BookCard
                            key={book._id}
                            book={book}
                            showActionButtons={false}
                            isInLibrary={isBookInLibrary(book._id)}
                            isInWishlist={isBookInWishlist(book._id)}
                            isInCart={isBookInCart(book._id)}
                            onAddToLibrary={handleAddToLibrary}
                            onRemoveFromLibrary={handleRemoveFromLibrary}
                            onAddToWishlist={handleAddToWishlist}
                            onRemoveFromWishlist={handleRemoveFromWishlist}
                            showHeart={!isBookInLibrary(book._id)}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}

                {/* Show uncategorized books in "Others" section */}
                {uncategorizedBooks.length > 0 && (
                  <div className="mb-12">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-2xl font-bold text-gray-900">Others</h2>
                      <Link 
                        to={`/search?category=Others`}
                        className="text-[#D01E1E] hover:text-[#B01818] font-medium transition-colors"
                      >
                        See All ({uncategorizedBooks.length})
                      </Link>
                    </div>

                    {/* Mobile: Infinite side scroll, Desktop: Responsive grid */}
                    <div className="lg:hidden">
                      <InfiniteBookCarousel
                        books={uncategorizedBooks}
                        getBookState={(book) => ({
                          isInLibrary: isBookInLibrary(book._id),
                          isInWishlist: isBookInWishlist(book._id),
                          isInCart: isBookInCart(book._id)
                        })}
                        onAddToLibrary={handleAddToLibrary}
                        onRemoveFromLibrary={handleRemoveFromLibrary}
                        onAddToWishlist={handleAddToWishlist}
                        onRemoveFromWishlist={handleRemoveFromWishlist}
                      />
                    </div>

                    {/* Desktop: Responsive grid layout */}
                    <div className="hidden lg:flex lg:flex-wrap gap-4 lg:gap-6">
                      {uncategorizedBooks.map((book: any) => (
                        <BookCard
                          key={book._id}
                          book={book}
                          showActionButtons={false}
                          isInLibrary={isBookInLibrary(book._id)}
                          isInWishlist={isBookInWishlist(book._id)}
                          isInCart={isBookInCart(book._id)}
                          onAddToLibrary={handleAddToLibrary}
                          onRemoveFromLibrary={handleRemoveFromLibrary}
                          onAddToWishlist={handleAddToWishlist}
                          onRemoveFromWishlist={handleRemoveFromWishlist}
                          showHeart={!isBookInLibrary(book._id)}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </>
            );
          })()
        ) : (
          // Show only selected category with max 20 books
          (() => {
            const categoryBooks = getCategoryBooks(selectedCategory);
            if (categoryBooks.length === 0) {
              return (
                <div className="text-center py-12">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">No {selectedCategory} books found</h2>
                  <p className="text-gray-600">Try a different category or check back later</p>
                </div>
              );
            }

            return (
              <div className="mb-12">
                {/* Category Header */}
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">{selectedCategory}</h2>
                  <Link 
                    to={`/search?category=${encodeURIComponent(selectedCategory)}`}
                    className="text-[#D01E1E] hover:text-[#B01818] font-medium transition-colors"
                  >
                    See All ({getAllCategoryBooks(selectedCategory).length})
                  </Link>
                </div>

                {/* Show max 20 books for selected category */}
                {/* Mobile: Infinite side scroll, Desktop: Responsive grid */}
                <div className="lg:hidden">
                  <InfiniteBookCarousel
                    books={categoryBooks}
                    getBookState={(book) => ({
                      isInLibrary: isBookInLibrary(book._id),
                      isInWishlist: isBookInWishlist(book._id),
                      isInCart: isBookInCart(book._id)
                    })}
                    onAddToLibrary={handleAddToLibrary}
                    onRemoveFromLibrary={handleRemoveFromLibrary}
                    onAddToWishlist={handleAddToWishlist}
                    onRemoveFromWishlist={handleRemoveFromWishlist}
                  />
                </div>

                {/* Desktop: Responsive grid layout */}
                <div className="hidden lg:flex lg:flex-wrap gap-4 lg:gap-6">
                  {categoryBooks.map((book: any) => (
                    <BookCard
                      key={book._id}
                      book={book}
                      showActionButtons={false}
                      isInLibrary={isBookInLibrary(book._id)}
                      isInWishlist={isBookInWishlist(book._id)}
                      isInCart={isBookInCart(book._id)}
                      onAddToLibrary={handleAddToLibrary}
                      onRemoveFromLibrary={handleRemoveFromLibrary}
                      onAddToWishlist={handleAddToWishlist}
                      onRemoveFromWishlist={handleRemoveFromWishlist}
                      showHeart={!isBookInLibrary(book._id)}
                    />
                  ))}
                </div>
              </div>
            );
          })()
        )}
      </div>

      {/* Mobile Bottom Nav */}
      <MobileBottomNav />
    </div>
  );
};

export default EnhancedBrowseBooks;

