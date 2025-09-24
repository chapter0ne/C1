
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { api } from '@/utils/api';

export const useCreateBook = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (bookData: any) => {
      return await api.post('/books', bookData);
    },
    onSuccess: () => {
      // Only invalidate the main query to prevent conflicts
      queryClient.invalidateQueries({ queryKey: ['all-books'] });
    },
  });
};

export const useUpdateBook = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...bookData }: { id: string; [key: string]: any }) => {
      console.log('useUpdateBook mutationFn called with:', { id, bookData });
      console.log('Making API call to PUT /books/' + id);
      const result = await api.put(`/books/${id}`, bookData);
      console.log('useUpdateBook API response:', result);
      return result;
    },
    onSuccess: (data) => {
      console.log('useUpdateBook onSuccess:', data);
      console.log('Invalidating all-books query cache...');
      // Invalidate multiple queries to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ['all-books'] });
      queryClient.invalidateQueries({ queryKey: ['book', data._id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-data'] });
      console.log('Cache invalidation completed');
    },
    onError: (error) => {
      console.error('useUpdateBook onError:', error);
    },
  });
};

export const useBookDetails = (id: string) => {
  return useQuery(['book', id], async () => {
    return await api.get(`/books/${id}`);
  });
};
