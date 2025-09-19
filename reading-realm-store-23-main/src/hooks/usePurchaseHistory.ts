import { useQuery } from '@tanstack/react-query';
import { api } from '@/utils/api';

export const usePurchaseHistory = (userId: string, bookId?: string) => {
  return useQuery({
    queryKey: ['purchaseHistory', userId, bookId],
    queryFn: async () => {
      if (!userId) return [];
      
      try {
        if (bookId) {
          // For specific book check, use the new endpoint
          const response = await api.get(`/purchases/user/${userId}?bookId=${bookId}`);
          return response?.hasPurchased ? [response.purchase] : [];
        } else {
          // For all purchases, use the existing endpoint
          const response = await api.get('/purchases/my');
          return response || [];
        }
      } catch (error) {
        console.error('Failed to fetch purchase history:', error);
        return [];
      }
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false
  });
};

export const useBookPurchaseStatus = (userId: string, bookId: string) => {
  return useQuery({
    queryKey: ['bookPurchaseStatus', userId, bookId],
    queryFn: async () => {
      if (!userId || !bookId) return { isBookPurchased: false, purchase: null };
      
      try {
        const response = await api.get(`/purchases/user/${userId}?bookId=${bookId}`);
        return {
          isBookPurchased: response?.hasPurchased || false,
          purchase: response?.purchase || null
        };
      } catch (error) {
        console.error('Failed to check book purchase status:', error);
        return { isBookPurchased: false, purchase: null };
      }
    },
    enabled: !!userId && !!bookId,
    staleTime: 10 * 60 * 1000, // 10 minutes - longer cache
    gcTime: 30 * 60 * 1000, // 30 minutes garbage collection
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 1, // Only retry once for faster failure
    retryDelay: 1000 // Quick retry
  });
};
