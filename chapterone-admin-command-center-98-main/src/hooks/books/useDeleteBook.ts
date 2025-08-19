
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/utils/api';
import { toast } from 'sonner';

export const useDeleteBook = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (bookId: string) => {
      console.log('useDeleteBook mutationFn called with bookId:', bookId);
      
      // Add timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      try {
        const result = await api.del(`/books/${bookId}`, { signal: controller.signal });
        clearTimeout(timeoutId);
        console.log('useDeleteBook API response:', result);
        return result;
      } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
          throw new Error('Delete request timed out. Please try again.');
        }
        throw error;
      }
    },
    onSuccess: () => {
      console.log('useDeleteBook onSuccess called');
      // Invalidate ALL relevant queries to prevent stale data
      queryClient.invalidateQueries({ queryKey: ['all-books'] });
      queryClient.invalidateQueries({ queryKey: ['published-books'] });
      queryClient.invalidateQueries({ queryKey: ['draft-books'] });
      queryClient.invalidateQueries({ queryKey: ['books'] });
      toast.success('Book deleted successfully');
    },
    onError: (error: Error) => {
      console.error('Delete book error:', error);
      toast.error(error.message || 'Failed to delete book');
    },
    // Add retry logic with exponential backoff
    retry: (failureCount, error) => {
      // Don't retry on client errors (4xx)
      if (error.message?.includes('4')) return false;
      // Retry up to 2 times for server errors
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
  });
};
