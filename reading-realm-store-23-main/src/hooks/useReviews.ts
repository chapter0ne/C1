import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/utils/api';

export const useReviews = (bookId: string) => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ['reviews', bookId],
    queryFn: async () => {
      return await api.get(`/reviews/book/${bookId}`);
    },
    enabled: !!bookId,
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
    },
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