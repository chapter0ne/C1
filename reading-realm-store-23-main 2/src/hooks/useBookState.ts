import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '@/utils/api';

export type BookState = 'wishlist' | 'cart' | 'library';
export type ReadingStatus = 'not_started' | 'reading' | 'completed';

export interface BookStateInfo {
  bookId: string;
  isInWishlist: boolean;
  isInCart: boolean;
  isInLibrary: boolean;
  readingStatus: ReadingStatus | null;
  hasStartedReading: boolean;
}

export const useBookState = (bookId: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [bookState, setBookState] = useState<BookStateInfo>({
    bookId,
    isInWishlist: false,
    isInCart: false,
    isInLibrary: false,
    readingStatus: null,
    hasStartedReading: false
  });
  const [loading, setLoading] = useState(false);

  const fetchBookState = async () => {
    if (!user || !bookId) return;
    
    setLoading(true);
    try {
      // Check wishlist status from API
      const wishlistResponse = await api.get(`/wishlist/books/${bookId}/status`);
      const isInWishlist = wishlistResponse.isInWishlist;

      // Check cart status from API
      const cartResponse = await api.get('/cart');
      const isInCart = cartResponse.items?.some((item: any) => item.book._id === bookId || item.book.id === bookId) || false;

      // Check library status from API
      const libraryResponse = await api.get('/user-library/my');
      const libraryArray = Array.isArray(libraryResponse) ? libraryResponse : [];
      const libraryItem = libraryArray.find((item: any) => 
        (item.book?._id === bookId || item.book?.id === bookId || item.book === bookId)
      );
      const isInLibrary = !!libraryItem;
      const readingStatus = libraryItem?.readingStatus || null;

      setBookState({
        bookId,
        isInWishlist,
        isInCart,
        isInLibrary,
        readingStatus,
        hasStartedReading: readingStatus !== 'not_started' && isInLibrary
      });
    } catch (error) {
      console.error('Error fetching book state:', error);
      // Do NOT forcibly set isInLibrary to false on error. Just keep previous state.
    } finally {
      setLoading(false);
    }
  };

  const addToWishlist = async () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to add books to wishlist",
        variant: "destructive"
      });
      return;
    }

    try {
      await api.post(`/wishlist/books/${bookId}`);
      setBookState(prev => ({ ...prev, isInWishlist: true }));
      // Invalidate wishlist query to refresh wishlist page
      queryClient.invalidateQueries({ queryKey: ['wishlist', user.id] });
      toast({
        title: "Added to Wishlist",
        description: "Book has been added to your wishlist"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to add book to wishlist",
        variant: "destructive"
      });
    }
  };

  const removeFromWishlist = async () => {
    if (!user) return;

    try {
      await api.del(`/wishlist/books/${bookId}`);
      setBookState(prev => ({ ...prev, isInWishlist: false }));
      // Invalidate wishlist query to refresh wishlist page
      queryClient.invalidateQueries({ queryKey: ['wishlist', user.id] });
      toast({
        title: "Removed from Wishlist",
        description: "Book has been removed from your wishlist"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove book from wishlist",
        variant: "destructive"
      });
    }
  };

  const addToCart = async () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to add books to cart",
        variant: "destructive"
      });
      return;
    }

    try {
      await api.post(`/cart/books/${bookId}`);
      setBookState(prev => ({ ...prev, isInCart: true }));
      toast({
        title: "Added to Cart",
        description: "Book has been added to your cart"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to add book to cart",
        variant: "destructive"
      });
    }
  };

  const removeFromCart = async () => {
    if (!user) return;

    try {
      await api.del(`/cart/books/${bookId}`);
      setBookState(prev => ({ ...prev, isInCart: false }));
      toast({
        title: "Removed from Cart",
        description: "Book has been removed from your cart"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove book from cart",
        variant: "destructive"
      });
    }
  };

  const addToLibrary = async () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to add books to library",
        variant: "destructive"
      });
      return;
    }

    try {
      await api.post('/user-library', { bookId });
      setBookState(prev => ({
        ...prev,
        isInLibrary: true,
        readingStatus: 'not_started',
        hasStartedReading: false
      }));
      // Invalidate user library query to refresh the library page
      queryClient.invalidateQueries({ queryKey: ['userLibrary', user.id] });
      toast({
        title: "Added to Library",
        description: "Book has been added to your library"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to add book to library",
        variant: "destructive"
      });
    }
  };

  const removeFromLibrary = async () => {
    if (!user) return;

    try {
      await api.del(`/user-library/${bookId}`);
      setBookState(prev => ({
        ...prev,
        isInLibrary: false,
        readingStatus: null,
        hasStartedReading: false
      }));
      // Invalidate user library query to refresh the library page
      queryClient.invalidateQueries({ queryKey: ['userLibrary', user.id] });
      toast({
        title: "Removed from Library",
        description: "Book has been removed from your library"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove book from library",
        variant: "destructive"
      });
    }
  };

  const startReading = async () => {
    if (!user || !bookState.isInLibrary) return;

    try {
      await api.put(`/user-library/${bookId}/progress`, {
        readingStatus: 'reading',
        currentChapter: 0,
        progress: 0
      });
      setBookState(prev => ({
        ...prev,
        readingStatus: 'reading',
        hasStartedReading: true
      }));
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update reading status",
        variant: "destructive"
      });
    }
  };

  const getActionLabel = () => {
    if (bookState.isInLibrary) {
      return bookState.hasStartedReading ? "Continue Reading" : "Start Reading";
    }
    return "Add to Library";
  };

  useEffect(() => {
    fetchBookState();
  }, [user, bookId]);

  return {
    bookState,
    loading,
    addToWishlist,
    removeFromWishlist,
    addToCart,
    removeFromCart,
    addToLibrary,
    removeFromLibrary,
    startReading,
    getActionLabel,
    refetch: fetchBookState
  };
};
