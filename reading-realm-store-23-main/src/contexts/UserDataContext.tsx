import React, { createContext, useContext } from 'react';
import { useUserLibrary } from '@/hooks/useUserLibrary';
import { useWishlist } from '@/hooks/useWishlist';
import { useCart } from '@/hooks/useCart';
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
}

const UserDataContext = createContext<UserDataContextType | undefined>(undefined);

export const UserDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const userId = user?.id || user?._id || '';
  const queryClient = useQueryClient();
  const { toast } = useToast();

  console.log('UserDataContext debug:', { user, userId, user_id: user?._id, user_id_alt: user?.id });

  const { data: userLibrary = [], isLoading: libraryLoading, refetch: refetchLibrary } = useUserLibrary(userId);
  const { wishlist = [], isLoading: wishlistLoading, addToWishlist, removeFromWishlist, updateWishlistNotes, checkWishlistStatus, refetch: refetchWishlist } = useWishlist(userId);
  const { cart = { items: [], totalAmount: 0 }, isLoading: cartLoading, addToCart, removeFromCart, updateCartItemQuantity, clearCart, checkout, getCartSummary } = useCart(userId);

  // Remove from library mutation
  const removeFromLibrary = useMutation({
    mutationFn: async (bookId: string) => {
      return await api.del(`/user-library/${bookId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userLibrary', userId] });
      toast({
        title: "Removed from Library",
        description: "Book has been removed from your library.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove book from library.",
        variant: "destructive",
      });
    },
  });

  // Add to library mutation
  const addToLibrary = useMutation({
    mutationFn: async (bookId: string) => {
      return await api.post('/user-library', { bookId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userLibrary', userId] });
      toast({
        title: "Added to Library",
        description: "Book has been added to your library.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add book to library.",
        variant: "destructive",
      });
    },
  });

  console.log('UserDataContext mutations:', { 
    addToWishlist: !!addToWishlist, 
    removeFromWishlist: !!removeFromWishlist,
    addToLibrary: !!addToLibrary,
    removeFromLibrary: !!removeFromLibrary
  });

  return (
    <UserDataContext.Provider value={{
      userLibrary,
      libraryLoading,
      refetchLibrary,
      wishlist,
      wishlistLoading,
      refetchWishlist,
      cart,
      cartLoading,
      refetchCart: () => {},
      removeFromLibrary,
      addToLibrary,
      addToWishlist,
      removeFromWishlist,
    }}>
      {children}
    </UserDataContext.Provider>
  );
};

export const useUserData = () => {
  const ctx = useContext(UserDataContext);
  if (!ctx) throw new Error('useUserData must be used within a UserDataProvider');
  return ctx;
}; 