
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/utils/api';
import { toast } from 'sonner';

export const useFeaturedBooks = (category?: 'bestseller' | 'editor_pick') => {
  return useQuery({
    queryKey: ['featured-books', category],
    queryFn: async () => {
      try {
        let url = '/featured-books';
        if (category) {
          url += `?category=${category}`;
        }
        const data = await api.get(url);
        return data || [];
      } catch (error) {
        console.error('Error fetching featured books:', error);
        // Return empty array if API fails
        return [];
      }
    },
    retry: 2,
    retryDelay: 1000,
    staleTime: 30000, // 30 seconds
  });
};

export const useAddFeaturedBook = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ bookId, category }: { bookId: string; category: 'bestseller' | 'editor_pick' }) => {
      try {
        await api.post('/featured-books', { bookId, category });
      } catch (error: any) {
        console.error('Error adding featured book:', error);
        // Re-throw with a more user-friendly message
        throw new Error(error?.response?.data?.message || error?.message || 'Failed to add book to featured list');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['featured-books'] });
      toast.success('Book added to featured list');
    },
    onError: (error: any) => {
      console.error('Mutation error:', error);
      toast.error(error.message || 'Failed to add book to featured list');
    }
  });
};

export const useRemoveFeaturedBook = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (featuredBookId: string) => {
      await api.del(`/featured-books/${featuredBookId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['featured-books'] });
      toast.success('Book removed from featured list');
    }
  });
};
