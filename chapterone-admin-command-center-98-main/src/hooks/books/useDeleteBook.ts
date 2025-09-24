
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/utils/api';
import { toast } from 'sonner';

export const useDeleteBook = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (bookId: string) => {
      console.log('useDeleteBook mutationFn called with bookId:', bookId);
      
      // Use a more conservative timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.log('useDeleteBook: Request timeout reached, aborting...');
        controller.abort();
      }, 20000); // Reduced to 20 second timeout
      
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
      
      // Cancel any outgoing refetches to prevent race conditions
      await queryClient.cancelQueries({ queryKey: ['all-books'] });
      
      // Get the current books data for rollback
      const previousBooks = queryClient.getQueryData(['all-books']);
      
      // Optimistically update the cache by removing the book
      if (previousBooks && Array.isArray(previousBooks)) {
        queryClient.setQueryData(['all-books'], (old: any) => {
          if (!old || !Array.isArray(old)) return old;
          return old.filter((book: any) => book._id !== bookId);
        });
        console.log('useDeleteBook: Optimistic update applied, book removed from cache');
      }
      
      // Return context for potential rollback
      return { previousBooks };
    },
    onSuccess: (data, bookId) => {
      console.log('useDeleteBook onSuccess called for bookId:', bookId);
      console.log('useDeleteBook: Success response data:', data);
      
      // Show success message immediately
      toast.success('Book deleted successfully');
      
      // The optimistic update already handled the UI update
      // No need to invalidate queries - this was causing the hanging issue
    },
    onError: (error: Error, bookId, context) => {
      console.error('useDeleteBook onError called for bookId:', bookId, 'Error:', error);
      console.error('useDeleteBook onError context:', context);
      
      // Rollback optimistic update if it exists
      if (context?.previousBooks) {
        queryClient.setQueryData(['all-books'], context.previousBooks);
        console.log('useDeleteBook: Rollback applied, book restored to cache');
      }
      
      // Show user-friendly error message
      toast.error(error.message || 'Failed to delete book');
    },
    onSettled: (data, error, bookId) => {
      console.log('useDeleteBook onSettled called for bookId:', bookId);
      console.log('useDeleteBook: Final result - data:', data, 'error:', error);
      
      // No additional invalidation needed - optimistic update handles everything
      // This prevents the cascade of refetches that was causing the hanging
      
      // Force a small delay to ensure UI state is properly reset
      setTimeout(() => {
        console.log('useDeleteBook: Mutation settled, UI should be responsive');
      }, 100);
    },
    // More conservative retry logic
    retry: (failureCount, error) => {
      console.log('useDeleteBook: Retry attempt', failureCount, 'for error:', error);
      
      // Don't retry on client errors (4xx) or timeout errors
      if (error.message?.includes('4') || 
          error.message?.includes('timeout') ||
          error.message?.includes('Authentication')) {
        console.log('useDeleteBook: Not retrying client/timeout error');
        return false;
      }
      
      // Only retry once for server errors to prevent hanging
      const shouldRetry = failureCount < 1;
      console.log('useDeleteBook: Should retry:', shouldRetry);
      return shouldRetry;
    },
    retryDelay: (attemptIndex) => {
      const delay = Math.min(2000 * 2 ** attemptIndex, 8000); // Increased delays
      console.log('useDeleteBook: Retry delay:', delay, 'ms for attempt:', attemptIndex);
      return delay;
    },
  });
};
