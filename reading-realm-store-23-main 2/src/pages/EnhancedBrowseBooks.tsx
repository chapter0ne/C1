import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useBooks } from '@/hooks/useBooks';
import { useToast } from "@/hooks/use-toast";
import { useUserData } from '@/contexts/UserDataContext';
import BookCard from '@/components/BookCard';
import InfiniteBookCarousel from '@/components/InfiniteBookCarousel';
import MobileBottomNav from "@/components/MobileBottomNav";
import UniversalHeader from "@/components/UniversalHeader";
import { ChevronDown, Filter, Star } from "lucide-react";

const EnhancedBrowseBooks = () => {
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'All';
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedPrice, setSelectedPrice] = useState('All');
  const { toast } = useToast();
  const { userLibrary, wishlist, cart, addToLibrary } = useUserData();

  // Helper functions for instant state
  const isBookInLibrary = (bookId: string) => userLibrary.some((entry: any) => (entry.book?._id || entry.book?.id || entry._id || entry.id) === bookId);
  const isBookInWishlist = (bookId: string) => wishlist.some((item: any) => (item._id || item.id) === bookId);
  const isBookInCart = (bookId: string) => cart.items.some((item: any) => (item.book?._id || item.book?.id) === bookId);

  const { data: allBooks = [], isLoading, error } = useBooks();

  // Categories including Short Stories
  const categories = ["Romance", "Horror", "Thriller", "Fiction", "Sci-Fi", "Adventure", "Mystery", "Fantasy", "Crime", "Short Stories"];
  const priceRanges = ['All', 'Free', 'Paid'];

  useEffect(() => {
    if (initialCategory !== 'All') {
      setSelectedCategory(initialCategory);
    }
  }, [initialCategory]);

  const handleAddToLibrary = async (bookId: string) => {
    try {
      await addToLibrary.mutateAsync(bookId);
    } catch (error) {
      console.error('Failed to add to library:', error);
    }
  };

  // Filter books by category and price, sorted by newest first
  const filterBooks = (books: any[], category: string, price: string) => {
    return books.filter(book => {
      const matchesCategory = category === 'All' || 
        (book.tags && book.tags.includes(category)) ||
        (book.category && book.category === category) ||
        (book.genre && book.genre === category);
      
      const matchesPrice = price === 'All' || 
        (price === 'Free' && (book.isFree || book.price === 0)) ||
        (price === 'Paid' && !book.isFree && book.price > 0);
      
      return matchesCategory && matchesPrice;
    }).sort((a, b) => {
      // Sort by newest first (createdAt or _id for MongoDB ObjectId)
      const dateA = new Date(a.createdAt || a.created_at || 0);
      const dateB = new Date(b.createdAt || b.created_at || 0);
      return dateB.getTime() - dateA.getTime();
    });
  };

  // Get books for each category based on tags
  const getCategoryBooks = (category: string) => {
    const filteredBooks = filterBooks(allBooks, category, selectedPrice);
    return filteredBooks; // Return all filtered books for infinite scroll
  };

  const isBookFree = (book: any) => book.isFree === true || book.is_free === true || book.price === 0 || book.price === '0';

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
                      onClick={() => setSelectedCategory(category)}
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

      {/* Category Sections with Infinite Scroll */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-8 py-6 pb-20">
        {selectedCategory === 'All' ? (
          // Show all categories when "All" is selected
          categories.map((category) => {
            const categoryBooks = getCategoryBooks(category);
            if (categoryBooks.length === 0) return null;

            return (
              <div key={category} className="mb-12">
                {/* Category Header */}
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">{category}</h2>
                  <Link 
                    to={`/search?category=${encodeURIComponent(category)}`}
                    className="text-[#D01E1E] hover:text-[#B01818] font-medium transition-colors"
                  >
                    See All
                  </Link>
                </div>

                {/* Infinite Scroll for Mobile/Tablet and Desktop */}
                <div className="lg:hidden">
                  <InfiniteBookCarousel 
                    books={categoryBooks}
                    getBookState={(book) => ({
                      isInLibrary: isBookInLibrary(book._id),
                      isInWishlist: isBookInWishlist(book._id),
                      isInCart: isBookInCart(book._id)
                    })}
                    onAddToLibrary={handleAddToLibrary}
                  />
                </div>

                {/* Infinite Scroll for Desktop (when 5+ books) */}
                {categoryBooks.length >= 5 ? (
                  <div className="hidden lg:block">
                    <InfiniteBookCarousel 
                      books={categoryBooks}
                      getBookState={(book) => ({
                        isInLibrary: isBookInLibrary(book._id),
                        isInWishlist: isBookInWishlist(book._id),
                        isInCart: isBookInCart(book._id)
                      })}
                      onAddToLibrary={handleAddToLibrary}
                    />
                  </div>
                ) : (
                  /* Grid Layout for Desktop (when less than 5 books) */
                  <div className="hidden lg:grid grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 md:gap-6">
                    {categoryBooks.map((book: any) => (
                      <BookCard
                        key={book._id}
                        book={book}
                        showActionButtons={true}
                        isInLibrary={isBookInLibrary(book._id)}
                        isInWishlist={isBookInWishlist(book._id)}
                        isInCart={isBookInCart(book._id)}
                        onAddToLibrary={handleAddToLibrary}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          // Show only selected category
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
                    See All
                  </Link>
                </div>

                {/* Infinite Scroll for Mobile/Tablet and Desktop */}
                <div className="lg:hidden">
                  <InfiniteBookCarousel 
                    books={categoryBooks}
                    getBookState={(book) => ({
                      isInLibrary: isBookInLibrary(book._id),
                      isInWishlist: isBookInWishlist(book._id),
                      isInCart: isBookInCart(book._id)
                    })}
                    onAddToLibrary={handleAddToLibrary}
                  />
                </div>

                {/* Infinite Scroll for Desktop (when 5+ books) */}
                {categoryBooks.length >= 5 ? (
                  <div className="hidden lg:block">
                    <InfiniteBookCarousel 
                      books={categoryBooks}
                      getBookState={(book) => ({
                        isInLibrary: isBookInLibrary(book._id),
                        isInWishlist: isBookInWishlist(book._id),
                        isInCart: isBookInCart(book._id)
                      })}
                      onAddToLibrary={handleAddToLibrary}
                    />
                  </div>
                ) : (
                  /* Grid Layout for Desktop (when less than 5 books) */
                  <div className="hidden lg:grid grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 md:gap-6">
                    {categoryBooks.map((book: any) => (
                      <BookCard
                        key={book._id}
                        book={book}
                        showActionButtons={true}
                        isInLibrary={isBookInLibrary(book._id)}
                        isInWishlist={isBookInWishlist(book._id)}
                        isInCart={isBookInCart(book._id)}
                        onAddToLibrary={handleAddToLibrary}
                      />
                    ))}
                  </div>
                )}
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
