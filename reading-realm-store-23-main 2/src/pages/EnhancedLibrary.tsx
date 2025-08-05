import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useBooks } from '@/hooks/useBooks';
import { useUserData } from '@/contexts/UserDataContext';
import { useReadingLists } from '@/hooks/useReadingLists';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, 
  Heart, 
  ShoppingCart, 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  Star,
  Clock,
  TrendingUp,
  Bookmark,
  Plus,
  ArrowRight,
  Calendar,
  Target
} from 'lucide-react';
import UniversalHeader from '@/components/UniversalHeader';
import MobileBottomNav from '@/components/MobileBottomNav';
import BookCard from '@/components/BookCard';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { getCoverImageUrl, hasCoverImage } from '@/utils/imageUtils';

const EnhancedLibrary = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeTab, setActiveTab] = useState('library');
  const userId = user?.id || '';
  const { profile, isLoading: profileLoading } = useProfile(userId);
  const { data: books = [], isLoading: booksLoading } = useBooks();
  const {
    userLibrary,
    libraryLoading,
    wishlist,
    wishlistLoading,
    cart,
    cartLoading,
    removeFromLibrary,
    refetchLibrary
  } = useUserData();
  const { toast } = useToast();
  const { readingLists = [], isLoading: listsLoading } = useReadingLists(userId);

  useEffect(() => {
    if (userId) {
      refetchLibrary();
    }
  }, [userId]);

  console.log('[EnhancedLibrary] Render. userId:', userId);
  console.log('[EnhancedLibrary] userLibrary:', userLibrary);

  // Unified loading spinner for both auth and library data
  const isLoading = authLoading || profileLoading || booksLoading || wishlistLoading || cartLoading || listsLoading || libraryLoading;
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

  // Ensure wishlist is always an array
  const safeWishlist = Array.isArray(wishlist) ? wishlist : [];

  // Helper functions to check if a book is in library/wishlist/cart
  const isBookInLibrary = (bookId: string) => userLibrary.some((entry: any) => (entry.book?._id || entry.book?.id || entry._id || entry.id) === bookId);
  const isBookInWishlist = (bookId: string) => safeWishlist.some((item: any) => (item._id || item.id) === bookId);
  const isBookInCart = (bookId: string) => cart.items.some((item: any) => (item.book?._id || item.book?.id) === bookId);

  // Filter user library books based on search term
  const filteredLibraryBooks = userLibrary.filter((entry: any) => {
    const book = entry.book || entry;
    if (!book || !book.title || !book.author) return false;
    return (
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Filter all books for other purposes (like wishlist)
  const filteredBooks = books.filter((book: any) => {
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

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <UniversalHeader currentPage="library" />
      
      <div className="flex-1 pb-20">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 text-gray-900 px-4 py-8 md:py-12">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">My Library</h1>
                <p className="text-gray-600">Welcome back, {profile?.fullName || user?.username || 'Reader'}!</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Search and Filters */}
          <div className="mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search your library..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-50 border-gray-200 focus:bg-white"
                />
              </div>
              {/* Desktop View Mode Buttons */}
              <div className="hidden md:flex gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'outline' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className={`${
                    viewMode === 'grid' 
                      ? 'text-[#D01E1E] bg-white' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'outline' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className={`${
                    viewMode === 'list' 
                      ? 'text-[#D01E1E] bg-white' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full max-w-xs mx-auto grid-cols-2 mb-6">
              <TabsTrigger value="library" className="text-sm">My Library</TabsTrigger>
              <TabsTrigger value="wishlist" className="text-sm">Wishlist</TabsTrigger>
            </TabsList>

            <TabsContent value="library" className="space-y-6">
              {/* Mobile View Mode Buttons - Top Corner */}
              <div className="flex md:hidden justify-end mb-4">
                <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className={`h-8 px-3 rounded-md ${
                      viewMode === 'grid' 
                        ? 'text-[#D01E1E] bg-white shadow-sm' 
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    <Grid3X3 className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className={`h-8 px-3 rounded-md ${
                      viewMode === 'list' 
                        ? 'text-[#D01E1E] bg-white shadow-sm' 
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    <List className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              {/* User Library Books Grid */}
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-4">My Books ({filteredLibraryBooks.length})</h2>
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {filteredLibraryBooks.map((entry: any) => {
                      const book = entry.book || entry;
                      return (
                        <BookCard
                          key={book._id}
                          book={book}
                          showActionButtons={true}
                          isInLibrary={true}
                          isInWishlist={isBookInWishlist(book._id)}
                          isInCart={isBookInCart(book._id)}
                          onRemoveFromLibrary={handleRemoveFromLibrary}
                        />
                      );
                    })}
                  </div>
                ) : (
                  <div className="space-y-2 md:space-y-1">
                    {filteredLibraryBooks.map((entry: any) => {
                      const book = entry.book || entry;
                      return (
                        <BookCard
                          key={book._id}
                          book={book}
                          variant="list"
                          isInLibrary={true}
                          isInWishlist={isBookInWishlist(book._id)}
                          isInCart={isBookInCart(book._id)}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="wishlist" className="space-y-6">
              {/* Mobile View Mode Buttons - Top Corner */}
              <div className="flex md:hidden justify-end mb-4">
                <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className={`h-8 px-3 rounded-md ${
                      viewMode === 'grid' 
                        ? 'text-[#D01E1E] bg-white shadow-sm' 
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    <Grid3X3 className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className={`h-8 px-3 rounded-md ${
                      viewMode === 'list' 
                        ? 'text-[#D01E1E] bg-white shadow-sm' 
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    <List className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-[#D01E1E]" />
                  My Wishlist ({safeWishlist.length})
                </h2>
                {safeWishlist.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Heart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p>Your wishlist is empty. Start adding books you'd like to read!</p>
                    <Link to="/explore" className="mt-4 inline-block">
                      <Button className="bg-[#D01E1E] hover:bg-[#B01818] mt-4">
                        <BookOpen className="w-4 h-4 mr-2" />
                        Explore Books
                      </Button>
                    </Link>
                  </div>
                ) : (
                  viewMode === 'grid' ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                      {safeWishlist.map((item: any) => (
                        <BookCard
                          key={item._id || item.id}
                          book={item}
                          showActionButtons={true}
                          isInLibrary={isBookInLibrary(item._id || item.id)}
                          isInWishlist={true}
                          isInCart={isBookInCart(item._id || item.id)}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {safeWishlist.map((item: any) => (
                        <Card key={item._id || item.id} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex gap-4">
                              <div className="w-16 h-24 bg-gradient-to-br from-slate-800 to-slate-900 rounded flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                                        {hasCoverImage(item) ? (
              <img src={getCoverImageUrl(item)!} alt={item.title} className="w-full h-full object-cover rounded" />
            ) : (
              item.title.charAt(0)
            )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                                <p className="text-sm text-gray-600 mb-2">by {item.author}</p>
                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                  <div className="flex items-center gap-1">
                                    <Star className="w-3 h-3 fill-current text-yellow-400" />
                                    <span>{item.rating?.toFixed(1) || '0.0'}</span>
                                  </div>
                                  <span>{item.pages || 0} pages</span>
                                  <Badge variant={item.isFree ? "default" : "secondary"} className="text-xs">
                                    {item.isFree ? "Free" : `₦${item.price?.toLocaleString() || '0'}`}
                                  </Badge>
                                </div>
                              </div>
                              <div className="flex flex-col gap-2">
                                <Button size="sm" className="bg-[#D01E1E] hover:bg-[#B01818]">
                                  <BookOpen className="w-3 h-3 mr-1" />
                                  Add to Library
                                </Button>
                                <Button size="sm" variant="outline">
                                  <ShoppingCart className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <MobileBottomNav />
    </div>
  );
};

export default EnhancedLibrary;
