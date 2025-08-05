
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/utils/api';
import { toast } from 'sonner';

export const useDeleteBook = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (bookId: string) => {
      console.log('useDeleteBook mutationFn called with bookId:', bookId);
      const result = await api.del(`/books/${bookId}`);
      console.log('useDeleteBook API response:', result);
      return result;
    },
    onSuccess: () => {
      console.log('useDeleteBook onSuccess called');
      queryClient.invalidateQueries({ queryKey: ['published-books'] });
      queryClient.invalidateQueries({ queryKey: ['draft-books'] });
      toast.success('Book deleted successfully');
    },
    onError: (error: Error) => {
      console.error('Delete book error:', error);
      toast.error(error.message || 'Failed to delete book');
    }
  });
};
