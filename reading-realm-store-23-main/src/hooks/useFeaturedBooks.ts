import { useQuery } from '@tanstack/react-query';
import { api } from '@/utils/api';

export const useFeaturedBooks = (category?: 'bestseller' | 'editor_pick') => {
  return useQuery({
    queryKey: ['featured-books', category],
    queryFn: async () => {
      let url = '/featured-books';
      if (category) {
        url += `?category=${category}`;
      }
      const result = await api.get(url);
      return result || [];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 1
  });
};

export const useBestsellers = () => {
  return useFeaturedBooks('bestseller');
};

export const useEditorPicks = () => {
  return useFeaturedBooks('editor_pick');
};

