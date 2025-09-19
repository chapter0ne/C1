import React, { createContext, useContext, useMemo, useCallback } from 'react';
import { useUserLibrary } from '@/hooks/useUserLibrary';
import { useWishlist } from '@/hooks/useWishlist';
import { useCart } from '@/hooks/useCart';
import { useLibraryMutations } from '@/hooks/useLibraryMutations';
import { useAuth } from '@/contexts/AuthContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/utils/api';
import { useToast } from '@/hooks/use-toast';

interface UserDataContextType {
  userLibrary: any[];
  libraryLoading: boolean;
  refetchLibrary: () => void;
  wishlist: any[];
  wishlistLoading: boolean;
  refetchWishlist: () => void;
  cart: { items: any[]; totalAmount: number };
  cartLoading: boolean;
  refetchCart: () => void;
  removeFromLibrary: ReturnType<typeof useMutation>;
  addToLibrary: ReturnType<typeof useMutation>;
  addToWishlist: ReturnType<typeof useMutation>;
  removeFromWishlist: ReturnType<typeof useMutation>;
  // Optimized helper functions
  isBookInLibrary: (bookId: string) => boolean;
  isBookInWishlist: (bookId: string) => boolean;
  isBookInCart: (bookId: string) => boolean;
  getBookState: (bookId: string) => { isInLibrary: boolean; isInWishlist: boolean; isInCart: boolean };
}

const UserDataContext = createContext<UserDataContextType | undefined>(undefined);

export const OptimizedUserDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const userId = user?.id || user?._id || '';
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Always call hooks in the same order (Rules of Hooks)
  const libraryResult = useUserLibrary(userId);
  const wishlistResult = useWishlist(userId);
  const cartResult = useCart(userId);
  const libraryMutations = useLibraryMutations(userId);

  // Extract values with fallbacks
  const userLibrary = libraryResult.data || [];
  const libraryLoading = libraryResult.isLoading || false;
  const refetchLibrary = libraryResult.refetch || (() => {});
  
  // Library mutations
  const addToLibrary = libraryMutations.addToLibrary;
  const removeFromLibrary = libraryMutations.removeFromLibrary;

  const wishlist = wishlistResult.wishlist || [];
  const wishlistLoading = wishlistResult.isLoading || false;
  const addToWishlist = wishlistResult.addToWishlist || (() => {});
  const removeFromWishlist = wishlistResult.removeFromWishlist || (() => {});
  const updateWishlistNotes = wishlistResult.updateWishlistNotes || (() => {});
  const checkWishlistStatus = wishlistResult.checkWishlistStatus || (() => {});
  const refetchWishlist = wishlistResult.refetch || (() => {});

  const cart = cartResult.cart || { items: [], totalAmount: 0 };
  const cartLoading = cartResult.isLoading || false;
  const refetchCart = cartResult.refetch || (() => {});
  const addToCart = cartResult.addToCart || (() => {});
  const removeFromCart = cartResult.removeFromCart || (() => {});
  const updateCartItemQuantity = cartResult.updateCartItemQuantity || (() => {});
  const clearCart = cartResult.clearCart || (() => {});
  const checkout = cartResult.checkout || (() => {});
  const getCartSummary = cartResult.getCartSummary || (() => {});

  // Helper functions (not memoized to avoid dependency issues)
  const isBookInLibrary = (bookId: string) => {
    if (!bookId || !userLibrary || userLibrary.length === 0) return false;
    return userLibrary.some((entry: any) => 
      (entry.book?._id || entry.book?.id || entry._id || entry.id) === bookId
    );
  };

  const isBookInWishlist = (bookId: string) => {
    if (!bookId || !wishlist || wishlist.length === 0) return false;
    return wishlist.some((item: any) => 
      (item.book?._id || item.book?.id || item._id || item.id) === bookId
    );
  };

  const isBookInCart = (bookId: string) => {
    if (!bookId || !cart?.items || cart.items.length === 0) return false;
    return cart.items.some((item: any) => 
      (item.book?._id || item.book?.id) === bookId
    );
  };

  const getBookState = (bookId: string) => ({
    isInLibrary: isBookInLibrary(bookId),
    isInWishlist: isBookInWishlist(bookId),
    isInCart: isBookInCart(bookId)
  });


  // Memoized context value to prevent unnecessary re-renders
  // Context value (not memoized to avoid dependency issues)
  const contextValue = {
    userLibrary,
    libraryLoading,
    refetchLibrary,
    wishlist,
    wishlistLoading,
    refetchWishlist,
    cart,
    cartLoading,
    refetchCart,
    removeFromLibrary,
    addToLibrary,
    addToWishlist,
    removeFromWishlist,
    isBookInLibrary,
    isBookInWishlist,
    isBookInCart,
    getBookState,
  };

  return (
    <UserDataContext.Provider value={contextValue}>
      {children}
    </UserDataContext.Provider>
  );
};

export const useOptimizedUserData = () => {
  const context = useContext(UserDataContext);
  if (context === undefined) {
    throw new Error('useOptimizedUserData must be used within an OptimizedUserDataProvider');
  }
  return context;
};

// Export as useUserData for compatibility
export const useUserData = () => {
  const context = useContext(UserDataContext);
  if (context === undefined) {
    throw new Error('useUserData must be used within an OptimizedUserDataProvider');
  }
  return context;
};

