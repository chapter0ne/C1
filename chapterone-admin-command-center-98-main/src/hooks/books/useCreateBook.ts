
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/utils/api';

export const useCreateBook = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (bookData: any) => {
      return await api.post('/books', bookData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['published-books'] });
      queryClient.invalidateQueries({ queryKey: ['draft-books'] });
      queryClient.invalidateQueries({ queryKey: ['all-books'] });
    },
  });
};

export const useUpdateBook = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...bookData }: { id: string; [key: string]: any }) => {
      return await api.put(`/books/${id}`, bookData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['published-books'] });
      queryClient.invalidateQueries({ queryKey: ['draft-books'] });
      queryClient.invalidateQueries({ queryKey: ['all-books'] });
    },
  });
};

export const useBookDetails = (id: string) => {
  return useQuery(['book', id], async () => {
    return await api.get(`/books/${id}`);
  });
};
