
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/utils/api';

export const useCreateBook = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      return await api.post('/books', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['published-books']);
    },
  });
};

export const useUpdateBook = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      return await api.put(`/books/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['published-books']);
    },
  });
};

export const useDeleteBook = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      return await api.del(`/books/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['published-books']);
    },
  });
};

export const useBookDetails = (id: string) => {
  return useQuery(['book', id], async () => {
    return await api.get(`/books/${id}`);
  });
};
