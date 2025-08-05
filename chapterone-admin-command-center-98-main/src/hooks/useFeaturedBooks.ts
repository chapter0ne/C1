
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/utils/api';
import { toast } from 'sonner';

export const useFeaturedBooks = (category?: 'bestseller' | 'editor_pick') => {
  return useQuery({
    queryKey: ['featured-books', category],
    queryFn: async () => {
      let url = '/featured-books';
      if (category) {
        url += `?category=${category}`;
      }
      const data = await api.get(url);
      return data || [];
    }
  });
};

export const useAddFeaturedBook = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ bookId, category }: { bookId: string; category: 'bestseller' | 'editor_pick' }) => {
      await api.post('/featured-books', { bookId, category });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['featured-books'] });
      toast.success('Book added to featured list');
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
