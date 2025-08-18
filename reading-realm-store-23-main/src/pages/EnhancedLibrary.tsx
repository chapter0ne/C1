import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useBooks } from '@/hooks/useBooks';
import { useUserData } from '@/contexts/UserDataContext';
import { useReadingLists } from '@/hooks/useReadingLists';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  BookOpen, 
  Search,
  Heart
} from 'lucide-react';
import UniversalHeader from '@/components/UniversalHeader';
import MobileBottomNav from '@/components/MobileBottomNav';
import BookCard from '@/components/BookCard';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const EnhancedLibrary = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const userId = user?.id || '';
  const { profile, isLoading: profileLoading } = useProfile(userId);
  const { data: books = [], isLoading: booksLoading } = useBooks();
  const {
    userLibrary,
    libraryLoading,
    removeFromLibrary,
    refetchLibrary,
    wishlist,
    removeFromWishlist,
    refetchWishlist
  } = useUserData();
  const { toast } = useToast();
  const { readingLists = [], isLoading: listsLoading } = useReadingLists(userId);
  const [activeTab, setActiveTab] = useState<'library' | 'wishlist'>('library');

  useEffect(() => {
    if (userId) {
      refetchLibrary();
    }
  }, [userId]);

  console.log('[EnhancedLibrary] Render. userId:', userId);
  console.log('[EnhancedLibrary] userLibrary:', userLibrary);

  // Unified loading spinner for both auth and library data
  const isLoading = authLoading || profileLoading || booksLoading || listsLoading || libraryLoading;
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-400 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  if (!user) {
    navigate('/auth');
    return null;
  }

  // Helper functions to check if a book is in library
  const isBookInLibrary = (bookId: string) => userLibrary.some((entry: any) => (entry.book?._id || entry.book?.id || entry._id || entry.id) === bookId);

  // Helper functions to check if a book is in wishlist
  const isBookInWishlist = (bookId: string) => wishlist.some((item: any) => (item.book?._id || item.book?.id || item._id || item.id) === bookId);

  // Filter user library books based on search term
  const filteredLibraryBooks = userLibrary.filter((entry: any) => {
    const book = entry.book || entry;
    if (!book || !book.title || !book.author) return false;
    return (
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Filter wishlist books based on search term
  const filteredWishlistBooks = wishlist.filter((entry: any) => {
    const book = entry.book || entry;
    if (!book || !book.title || !book.author) return false;
    return (
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Remove from library handler
  const handleRemoveFromLibrary = (bookId: string) => {
    removeFromLibrary.mutate(bookId, {
      onSuccess: () => {
        toast({ title: 'Removed from Library', description: 'Book has been removed from your library.' });
      },
      onError: () => {
        toast({ title: 'Error', description: 'Failed to remove book from library.', variant: 'destructive' });
      }
    });
  };

  // Remove from wishlist handler
  const handleRemoveFromWishlist = (bookId: string) => {
    removeFromWishlist.mutate(bookId, {
      onSuccess: () => {
        toast({ title: 'Removed from Wishlist', description: 'Book has been removed from your wishlist.' });
      },
      onError: () => {
        toast({ title: 'Error', description: 'Failed to remove book from wishlist.', variant: 'destructive' });
      }
    });
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <UniversalHeader currentPage="library" />
      
      <div className="flex-1 p-2 md:p-4 pb-16">
        {/* Hero Section */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 text-gray-900 px-2 md:px-4 py-2 md:py-3">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-4">
              <div>
                  <h1 className="text-xl md:text-2xl font-bold text-gray-900">My Library</h1>
                  <p className="text-sm md:text-base text-gray-600">Welcome back, {profile?.fullName || user?.username || 'Reader'}!</p>
                </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-2 md:px-6 py-4">
          {/* Search and Filters */}
          <div className="mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search your library..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-50 border-gray-200 focus:bg-white"
                />
            </div>
          </div>

          {/* Desktop Tabs - Hidden on Mobile */}
          <div className="hidden md:flex mb-6 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('library')}
              className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${
                activeTab === 'library'
                  ? 'border-[#D01E1E] text-[#D01E1E]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <BookOpen className="w-4 h-4 inline mr-2" />
              Library ({filteredLibraryBooks.length})
            </button>
            <button
              onClick={() => setActiveTab('wishlist')}
              className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${
                activeTab === 'wishlist'
                  ? 'border-[#D01E1E] text-[#D01E1E]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Heart className="w-4 h-4 inline mr-2" />
              Wishlist ({filteredWishlistBooks.length})
            </button>
          </div>

          {/* Content based on active tab (Desktop) or current page (Mobile) */}
          {/* Desktop: Show content based on active tab */}
          <div className="hidden md:block">
            {activeTab === 'library' ? (
              // Library Tab Content
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-[#D01E1E]" />
                  My Library ({filteredLibraryBooks.length})
                </h2>
                {filteredLibraryBooks.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p>Your library is empty. Start adding books to read!</p>
                    <Link to="/explore" className="mt-4 inline-block">
                      <Button className="bg-[#D01E1E] hover:bg-[#B01818] mt-4">
                        <BookOpen className="w-4 h-4 mr-2" />
                        Explore Books
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4 lg:gap-6 pb-4">
                    {filteredLibraryBooks.map((entry: any) => {
                      const book = entry.book || entry;
                      if (!book || !book.title) return null;

                      return (
                        <BookCard
                          key={entry._id || entry.id}
                          book={book}
                          variant="compact"
                          showActionButtons={false}
                          isInLibrary={true}
                          onRemoveFromLibrary={handleRemoveFromLibrary}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              // Wishlist Tab Content
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-[#D01E1E]" />
                  My Wishlist ({filteredWishlistBooks.length})
                </h2>
                {filteredWishlistBooks.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Heart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p>Your wishlist is empty. Start adding books you want to read!</p>
                    <Link to="/explore" className="mt-4 inline-block">
                      <Button className="bg-[#D01E1E] hover:bg-[#B01818] mt-4">
                        <BookOpen className="w-4 h-4 mr-2" />
                        Explore Books
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4 lg:gap-6 pb-4">
                    {filteredWishlistBooks.map((entry: any) => {
                      const book = entry.book || entry;
                      if (!book || !book.title) return null;

                      return (
                        <BookCard
                          key={entry._id || entry.id}
                          book={book}
                          variant="compact"
                          showActionButtons={false}
                          isInWishlist={true}
                          onRemoveFromWishlist={handleRemoveFromWishlist}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile: Show only library content (wishlist accessible via bottom nav) */}
          <div className="md:hidden">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#D01E1E]" />
              My Library ({filteredLibraryBooks.length})
            </h2>
            {filteredLibraryBooks.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p>Your library is empty. Start adding books to read!</p>
                <Link to="/explore" className="mt-4 inline-block">
                  <Button className="bg-[#D01E1E] hover:bg-[#B01818] mt-4">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Explore Books
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4 lg:gap-6 pb-4">
                {filteredLibraryBooks.map((entry: any) => {
                  const book = entry.book || entry;
                  if (!book || !book.title) return null;

                  return (
                    <BookCard
                      key={entry._id || entry.id}
                      book={book}
                      variant="compact"
                      showActionButtons={false}
                      isInLibrary={true}
                      onRemoveFromLibrary={handleRemoveFromLibrary}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <MobileBottomNav />
    </div>
  );
};

export default EnhancedLibrary;
