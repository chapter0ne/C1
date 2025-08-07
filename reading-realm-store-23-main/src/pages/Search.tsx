import { useRandomBooks, useBooks } from '@/hooks/useBooks';
import { useUserData } from '@/contexts/UserDataContext';
import { useSearchParams } from 'react-router-dom';
import { useState } from 'react';
import BookCard from "@/components/BookCard";
import MobileBottomNav from "@/components/MobileBottomNav";
import UniversalHeader from "@/components/UniversalHeader";

const Search = () => {
  const { userLibrary, wishlist, cart, addToLibrary } = useUserData();
  const [searchParams] = useSearchParams();
  const category = searchParams.get('category');
  const [searchTerm, setSearchTerm] = useState('');

  const isBookInLibrary = (bookId: string) => userLibrary.some((entry: any) => (entry.book?._id || entry.book?.id || entry._id || entry.id) === bookId);
  const isBookInWishlist = (bookId: string) => wishlist.some((item: any) => (item._id || item.id) === bookId);
  const isBookInCart = (bookId: string) => cart.items.some((item: any) => (item.book?._id || item.book?.id) === bookId);

  const handleAddToLibrary = async (bookId: string) => {
    try {
      await addToLibrary.mutateAsync(bookId);
    } catch (error) {
      console.error('Failed to add to library:', error);
    }
  };

  // Get books based on category filter or random books
  const { data: allBooks = [], isLoading, error } = useBooks();
  
  const filteredBooks = category 
    ? allBooks.filter((book: any) => 
        (book.tags && book.tags.includes(category)) ||
        (book.category && book.category === category) ||
        (book.genre && book.genre === category)
      )
    : allBooks;

  // Apply search filter to the books
  const searchFilteredBooks = searchTerm 
    ? filteredBooks.filter((book: any) => 
        (book.title && book.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (book.author && book.author.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (book.tags && book.tags.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase())))
      )
    : filteredBooks;

  const displayBooks = searchFilteredBooks;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {category ? `${category} Books` : 'Find your favourite books'}
            </h1>
            <p className="text-gray-600">
              {category ? `Explore our collection of ${category.toLowerCase()} books` : 'Explore our curated collection of books'}
            </p>
            {searchTerm && (
              <p className="text-sm text-gray-500 mt-2">
                Showing {displayBooks.length} results for "{searchTerm}"
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
          <div className="text-center py-12 text-red-500">Error loading books: {error.message}</div>
        ) : displayBooks.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg font-medium">No books found</p>
            <p className="text-sm">
              {searchTerm ? `No results for "${searchTerm}". Try a different search term.` : 'Try a different category or check back later'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
            {displayBooks.map((book: any) => (
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

      {/* Mobile Bottom Nav */}
      <MobileBottomNav />
    </div>
  );
};

export default Search;
