import { useQuery } from '@tanstack/react-query';
import { api } from '@/utils/api';

export type TopBooksPeriod = 'all-time' | 'monthly' | 'weekly' | 'today';

export const useTopBooks = (period: TopBooksPeriod = 'all-time', limit: number = 3) => {
  return useQuery({
    queryKey: ['top-books', period, limit],
    queryFn: async () => {
      const response = await api.get(`/user-library/top-books?period=${period}&limit=${limit}`);
      return response;
    }
  });
};

export const useBookDetailedStats = (bookId: string | null) => {
  return useQuery({
    queryKey: ['book-stats', bookId],
    queryFn: async () => {
      if (!bookId) return null;
      const response = await api.get(`/user-library/book/${bookId}/stats`);
      return response;
    },
    enabled: !!bookId
  });
};
