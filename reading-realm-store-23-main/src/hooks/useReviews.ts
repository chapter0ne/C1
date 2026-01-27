import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/utils/api';

export const useReviews = (bookId: string) => {
  return useQuery({
    queryKey: ['reviews', bookId],
    queryFn: async () => {
      const raw = await api.get(`/reviews/book/${bookId}`);
      if (Array.isArray(raw)) return raw;
      if (raw && typeof raw === 'object' && Array.isArray((raw as any).data)) return (raw as any).data;
      if (raw && typeof raw === 'object' && Array.isArray((raw as any).reviews)) return (raw as any).reviews;
      return [];
    },
    enabled: !!bookId,
    staleTime: 0,
    refetchOnMount: 'always',
  });
};

export const createReview = (bookId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      return await api.post('/reviews', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', bookId] });
      queryClient.invalidateQueries({ queryKey: ['book', bookId] });
      queryClient.invalidateQueries({ queryKey: ['user-review', bookId] });
    },
  });
};

export const useUserReview = (bookId: string) => {
  return useQuery({
    queryKey: ['user-review', bookId],
    queryFn: async () => {
      try {
        return await api.get(`/reviews/book/${bookId}/user`);
      } catch {
        // Not logged in, network error, or no review - treat as no review
        return null;
      }
    },
    enabled: !!bookId,
    retry: false,
  });
};

export const updateReview = (bookId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      return await api.put(`/reviews/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', bookId] });
    },
  });
};

export const deleteReview = (bookId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      return await api.del(`/reviews/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', bookId] });
    },
  });
}; 