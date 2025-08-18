import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useWishlist } from "@/hooks/useWishlist";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Heart, ShoppingCart, BookOpen, Trash2, Star } from "lucide-react";
import UniversalHeader from "@/components/UniversalHeader";
import MobileBottomNav from "@/components/MobileBottomNav";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/hooks/useCart";
import { useUserData } from '@/contexts/UserDataContext';
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

const Wishlist = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const { addToCart } = useCart(user?.id || '');

  // Add debugging for user authentication
  console.log('Wishlist - User auth:', { 
    user, 
    userId: user?.id, 
    user_id: user?._id,
    isAuthenticated: !!user 
  });

  const { wishlist, isLoading, addToWishlist, removeFromWishlist } = useWishlist(user?.id || '');
  const { userLibrary, addToLibrary } = useUserData();

  // Ensure wishlist is always an array and handle potential errors
  const safeWishlist = Array.isArray(wishlist) ? wishlist : [];
  
  // Add debugging to help identify issues
  console.log('Wishlist data:', { wishlist, safeWishlist, user: user?.id });
  
  // Add error handling for malformed data
  const validWishlistItems = safeWishlist.filter((item: any) => {
    const book = item.book || item;
    return book && book.title && book.author; // Ensure we have valid book data
  });

  // Filter wishlist based on search term
  const filteredWishlist = validWishlistItems.filter((item: any) => {
    const book = item.book || item;
    return book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
           book.author.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleRemoveFromWishlist = async (bookId: string) => {
    try {
      await removeFromWishlist.mutateAsync(bookId);
      toast({
        title: "Removed from Wishlist",
        description: "Book has been removed from your wishlist.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove book from wishlist.",
        variant: "destructive"
      });
    }
  };

  const handleAddToLibrary = async (bookId: string) => {
    try {
      await addToLibrary.mutateAsync(bookId);
      // Auto-remove from wishlist when added to library
      await removeFromWishlist.mutateAsync(bookId);
      toast({
        title: "Added to Library",
        description: "Book has been added to your library and removed from wishlist.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add book to library.",
        variant: "destructive"
      });
    }
  };



  const handleAddToCart = async (bookId: string) => {
    try {
      await addToCart.mutateAsync({ bookId });
      toast({
        title: "Added to Cart",
        description: "Book has been added to your cart.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add book to cart.",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <UniversalHeader currentPage="wishlist" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D01E1E] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your wishlist...</p>
          </div>
        </div>
        <MobileBottomNav />
      </div>
    );
  }

  // Check if user is authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-white">
        <UniversalHeader currentPage="wishlist" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Authentication Required</h3>
            <p className="text-gray-600 mb-6">Please log in to view your wishlist.</p>
            <Button 
              onClick={() => window.location.href = '/auth'}
              className="bg-[#D01E1E] hover:bg-[#B01818]"
            >
              Sign In
            </Button>
          </div>
        </div>
        <MobileBottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <UniversalHeader currentPage="wishlist" />
      
      <div className="flex-1 pb-20">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Wishlist</h1>
            <p className="text-gray-600">
              {validWishlistItems.length} book{validWishlistItems.length !== 1 ? 's' : ''} in your wishlist
            </p>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search your wishlist..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-50 border-gray-200 focus:bg-white focus:ring-2 focus:ring-[#D01E1E] focus:border-transparent"
              />
            </div>
          </div>

          {/* Wishlist Content */}
          {validWishlistItems.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Heart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg mb-2">Your wishlist is empty</p>
              <p className="text-sm mb-6">Start adding books you'd like to read!</p>
              <Link to="/explore" className="inline-block">
                <Button className="bg-[#D01E1E] hover:bg-[#B01818]">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Explore Books
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-6">
              {filteredWishlist.map((item: any) => {
                // Handle both direct book objects and nested book objects
                const book = item.book || item;
                
                // Skip if no book data
                if (!book || !book.title) {
                  return null;
                }

                // Check if book is in library
                const isInLibrary = userLibrary.some((entry: any) => 
                  (entry.book?._id || entry.book?.id || entry._id || entry.id) === (book._id || book.id)
                );
                
                return (
                  <Card key={item._id || item.id} className="hover:shadow-md transition-shadow border border-gray-200">
                    <CardContent className="p-4">
                      {/* Simple Book Display */}
                      <div className="text-center mb-4">
                        {/* Book Cover */}
                        <div className="w-24 h-32 mx-auto mb-3 bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg flex items-center justify-center text-white text-lg font-bold">
                          {book.coverImageUrl ? (
                            <img 
                              src={book.coverImageUrl} 
                              alt={book.title}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            book.title?.charAt(0) || 'B'
                          )}
                        </div>
                        
                        {/* Book Title */}
                        <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2">
                          {book.title || 'Untitled Book'}
                        </h3>
                        
                        {/* Author */}
                        <p className="text-xs text-gray-600 mb-2">
                          by {book.author || 'Unknown Author'}
                        </p>
                        
                        {/* Price Badge */}
                        <Badge 
                          variant={book.isFree ? "default" : "secondary"} 
                          className="text-xs mb-3"
                        >
                          {book.isFree ? "Free" : `₦${book.price?.toLocaleString() || '0'}`}
                        </Badge>
                      </div>

                      {/* Simple Action Buttons */}
                      <div className="space-y-2">
                        {/* Primary Action Button */}
                        {book.isFree && !isInLibrary ? (
                          <Button
                            size="sm"
                            onClick={() => handleAddToLibrary(book._id || book.id)}
                            className="w-full bg-[#D01E1E] hover:bg-[#B01818] text-white text-xs py-2"
                          >
                            <BookOpen className="w-3 h-3 mr-1" />
                            Add to Library
                          </Button>
                        ) : !book.isFree ? (
                          <Button
                            size="sm"
                            onClick={() => handleAddToCart(book._id || book.id)}
                            className="w-full bg-[#D01E1E] hover:bg-[#B01818] text-white text-xs py-2"
                          >
                            <ShoppingCart className="w-3 h-3 mr-1" />
                            Add to Cart
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            disabled
                            className="w-full bg-gray-200 text-gray-500 cursor-not-allowed text-xs py-2"
                          >
                            <BookOpen className="w-3 h-3 mr-1" />
                            In Library
                          </Button>
                        )}
                        
                        {/* Remove Button */}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRemoveFromWishlist(book._id || book.id)}
                          className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 text-xs py-1"
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Remove
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <MobileBottomNav />
    </div>
  );
};

export default Wishlist; 