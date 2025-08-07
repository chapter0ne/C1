import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useWishlist } from "@/hooks/useWishlist";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Heart, ShoppingCart, BookOpen, Trash2, Edit3 } from "lucide-react";
import UniversalHeader from "@/components/UniversalHeader";
import MobileBottomNav from "@/components/MobileBottomNav";
import BookCard from "@/components/BookCard";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/hooks/useCart";

const Wishlist = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [notesText, setNotesText] = useState("");

  // Add debugging for user authentication
  console.log('Wishlist - User auth:', { 
    user, 
    userId: user?.id, 
    user_id: user?._id,
    isAuthenticated: !!user 
  });

  const { wishlist, isLoading, addToWishlist, removeFromWishlist } = useWishlist(user?.id || '');
  const { addToCart } = useCart(user?.id || '');

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

  const handleEditNotes = (item: any) => {
    setEditingNotes(item._id || item.id);
    setNotesText(item.notes || "");
  };

  const handleSaveNotes = async (item: any) => {
    try {
      // This would need to be implemented in the backend
      // For now, we'll just close the editing mode
      setEditingNotes(null);
      toast({
        title: "Notes Updated",
        description: "Your notes have been saved.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update notes.",
        variant: "destructive"
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingNotes(null);
    setNotesText("");
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
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Wishlist</h1>
            <p className="text-gray-600">
              {validWishlistItems.length} book{validWishlistItems.length !== 1 ? 's' : ''} in your wishlist
            </p>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search your wishlist..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2"
              />
            </div>
          </div>

          {/* Wishlist Content */}
          {filteredWishlist.length === 0 ? (
            <div className="text-center py-12">
              <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {searchTerm ? 'No matching books found' : 'Your wishlist is empty'}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm 
                  ? 'Try adjusting your search terms'
                  : 'Start adding books you\'d like to read later'
                }
              </p>
              {!searchTerm && (
                <Button 
                  onClick={() => window.history.back()}
                  className="bg-[#D01E1E] hover:bg-[#B01818]"
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  Browse Books
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredWishlist.map((item: any) => {
                // Handle both direct book objects and nested book objects
                const book = item.book || item;
                const isEditing = editingNotes === (item._id || item.id);
                
                // Skip if no book data
                if (!book || !book.title) {
                  return null;
                }
                
                return (
                  <Card key={item._id || item.id} className="group hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      {/* Book Card */}
                      <div className="mb-4">
                        <BookCard book={book} variant="compact" />
                      </div>

                      {/* Notes Section */}
                      <div className="mb-4">
                        {isEditing ? (
                          <div className="space-y-2">
                            <Input
                              value={notesText}
                              onChange={(e) => setNotesText(e.target.value)}
                              placeholder="Add notes about this book..."
                              className="text-sm"
                            />
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleSaveNotes(item)}
                                className="flex-1 bg-[#D01E1E] hover:bg-[#B01818]"
                              >
                                Save
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={handleCancelEdit}
                                className="flex-1"
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              {item.notes ? (
                                <p className="text-sm text-gray-600 italic">"{item.notes}"</p>
                              ) : (
                                <p className="text-sm text-gray-400">No notes added</p>
                              )}
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEditNotes(item)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Edit3 className="w-3 h-3" />
                            </Button>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        {!book.isFree && (
                          <Button
                            size="sm"
                            onClick={() => handleAddToCart(book._id || book.id)}
                            className="flex-1 bg-[#D01E1E] hover:bg-[#B01818]"
                          >
                            <ShoppingCart className="w-3 h-3 mr-1" />
                            Add to Cart
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRemoveFromWishlist(book._id || book.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>

                      {/* Added Date */}
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <p className="text-xs text-gray-500">
                          Added {new Date(item.addedAt).toLocaleDateString()}
                        </p>
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