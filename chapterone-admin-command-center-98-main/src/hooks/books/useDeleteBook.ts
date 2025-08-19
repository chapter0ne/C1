
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
      const timeoutId = setTimeout(() => {
        console.log('useDeleteBook: Request timeout reached, aborting...');
        controller.abort();
      }, 30000); // 30 second timeout
      
      try {
        console.log('useDeleteBook: Making API call to delete book...');
        const result = await api.del(`/books/${bookId}`, { signal: controller.signal });
        clearTimeout(timeoutId);
        console.log('useDeleteBook API response:', result);
        return result;
      } catch (error) {
        clearTimeout(timeoutId);
        console.error('useDeleteBook: Error during deletion:', error);
        
        if (error.name === 'AbortError') {
          console.log('useDeleteBook: Request was aborted due to timeout');
          throw new Error('Delete request timed out. Please try again.');
        }
        
        // Handle specific error types
        if (error.message?.includes('Failed to fetch')) {
          throw new Error('Network error. Please check your connection and try again.');
        }
        
        if (error.message?.includes('413')) {
          throw new Error('File too large. Please reduce file size and try again.');
        }
        
        if (error.message?.includes('401')) {
          throw new Error('Authentication expired. Please login again.');
        }
        
        if (error.message?.includes('403')) {
          throw new Error('Access denied. You do not have permission to delete this book.');
        }
        
        if (error.message?.includes('404')) {
          throw new Error('Book not found. It may have been already deleted.');
        }
        
        if (error.message?.includes('500')) {
          throw new Error('Server error. Please try again later.');
        }
        
        throw error;
      }
    },
    onMutate: async (bookId) => {
      console.log('useDeleteBook: onMutate called for bookId:', bookId);
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['all-books'] });
      await queryClient.cancelQueries({ queryKey: ['published-books'] });
      await queryClient.cancelQueries({ queryKey: ['draft-books'] });
      await queryClient.cancelQueries({ queryKey: ['books'] });
    },
    onSuccess: (data, bookId) => {
      console.log('useDeleteBook onSuccess called for bookId:', bookId);
      console.log('useDeleteBook: Success response data:', data);
      
      // Invalidate ALL relevant queries to prevent stale data
      queryClient.invalidateQueries({ queryKey: ['all-books'] });
      queryClient.invalidateQueries({ queryKey: ['published-books'] });
      queryClient.invalidateQueries({ queryKey: ['draft-books'] });
      queryClient.invalidateQueries({ queryKey: ['books'] });
      
      toast.success('Book deleted successfully');
    },
    onError: (error: Error, bookId, context) => {
      console.error('useDeleteBook onError called for bookId:', bookId, 'Error:', error);
      console.error('useDeleteBook onError context:', context);
      
      // Show user-friendly error message
      toast.error(error.message || 'Failed to delete book');
    },
    onSettled: (data, error, bookId) => {
      console.log('useDeleteBook onSettled called for bookId:', bookId);
      console.log('useDeleteBook: Final result - data:', data, 'error:', error);
    },
    // Add retry logic with exponential backoff
    retry: (failureCount, error) => {
      console.log('useDeleteBook: Retry attempt', failureCount, 'for error:', error);
      
      // Don't retry on client errors (4xx)
      if (error.message?.includes('4')) {
        console.log('useDeleteBook: Not retrying 4xx error');
        return false;
      }
      
      // Retry up to 2 times for server errors
      const shouldRetry = failureCount < 2;
      console.log('useDeleteBook: Should retry:', shouldRetry);
      return shouldRetry;
    },
    retryDelay: (attemptIndex) => {
      const delay = Math.min(1000 * 2 ** attemptIndex, 5000);
      console.log('useDeleteBook: Retry delay:', delay, 'ms for attempt:', attemptIndex);
      return delay;
    },
  });
};
