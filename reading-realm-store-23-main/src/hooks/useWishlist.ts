
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/utils/api';

export const useWishlist = (userId: string) => {
  const queryClient = useQueryClient();

  const { data: wishlistResponse, isLoading, error, refetch } = useQuery({
    queryKey: ['wishlist', userId],
    queryFn: async () => {
      console.log('Fetching wishlist for userId:', userId);
      if (!userId) {
        console.log('No userId, returning empty wishlist');
        return { wishlist: [] };
      }
      const response = await api.get('/wishlist');
      console.log('Wishlist API response:', response);
      return response;
    },
    enabled: !!userId,
    // Return empty object with wishlist array if no userId
    initialData: { wishlist: [] },
    retry: 1,
    staleTime: 0, // Always fetch fresh data
    refetchOnWindowFocus: false
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
    error,
    wishlistLength: wishlist.length,
    firstItem: wishlist[0]
  });

  const addToWishlist = useMutation({
    mutationFn: async ({ bookId }: { bookId: string }) => {
      console.log('Adding to wishlist:', { bookId });
      const response = await api.post(`/wishlist/books/${bookId}`);
      console.log('Add to wishlist response:', response);
      return response;
    },
    onSuccess: (data) => {
      console.log('Add to wishlist success, invalidating queries');
      console.log('Added wishlist item:', data);
      queryClient.invalidateQueries({ queryKey: ['wishlist', userId] });
    },
    onError: (error) => {
      console.error('Add to wishlist error:', error);
    }
  });

  const removeFromWishlist = useMutation({
    mutationFn: async (bookId: string) => {
      console.log('Removing from wishlist:', bookId);
      const response = await api.del(`/wishlist/books/${bookId}`);
      console.log('Remove from wishlist response:', response);
      return response;
    },
    onSuccess: (data) => {
      console.log('Remove from wishlist success, invalidating queries');
      console.log('Removed wishlist item:', data);
      queryClient.invalidateQueries({ queryKey: ['wishlist', userId] });
    },
    onError: (error) => {
      console.error('Remove from wishlist error:', error);
    }
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
    checkWishlistStatus,
    refetch
  };
};
