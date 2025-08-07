
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/utils/api';

export const useWishlist = (userId: string) => {
  const queryClient = useQueryClient();

  const { data: wishlistResponse, isLoading, error } = useQuery({
    queryKey: ['wishlist', userId],
    queryFn: async () => {
      console.log('Fetching wishlist for userId:', userId);
      const response = await api.get('/wishlist');
      console.log('Wishlist API response:', response);
      return response;
    },
    enabled: !!userId,
    // Return empty object with wishlist array if no userId
    initialData: { wishlist: [] },
    retry: 1
  });

  // Log errors if they occur
  if (error) {
    console.error('Wishlist fetch error:', error);
  }

  // Extract the wishlist array from the response
  // Backend returns: { wishlist: [...], totalPages: ..., currentPage: ..., total: ... }
  const wishlist = wishlistResponse?.wishlist || [];
  
  console.log('useWishlist hook result:', { 
    userId, 
    wishlistResponse, 
    wishlist, 
    isLoading, 
    error 
  });

  const addToWishlist = useMutation({
    mutationFn: async ({ bookId, notes }: { bookId: string; notes?: string }) => {
      return await api.post(`/wishlist/books/${bookId}`, { notes });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist', userId] });
    },
  });

  const removeFromWishlist = useMutation({
    mutationFn: async (bookId: string) => {
      return await api.del(`/wishlist/books/${bookId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist', userId] });
    },
  });

  const updateWishlistNotes = useMutation({
    mutationFn: async ({ bookId, notes }: { bookId: string; notes: string }) => {
      return await api.put(`/wishlist/books/${bookId}/notes`, { notes });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist', userId] });
    },
  });

  const checkWishlistStatus = async (bookId: string) => {
    try {
      const response = await api.get(`/wishlist/books/${bookId}/status`);
      return response;
    } catch (error) {
      return { isInWishlist: false };
    }
  };

  return { 
    wishlist, 
    isLoading, 
    addToWishlist, 
    removeFromWishlist, 
    updateWishlistNotes,
    checkWishlistStatus
  };
};
