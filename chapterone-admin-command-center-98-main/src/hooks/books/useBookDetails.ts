
import { useQuery } from '@tanstack/react-query';
import { api } from '@/utils/api';
import { BookWithChapters } from '@/types/book';

export const useBookDetails = (bookId: string) => {
  return useQuery({
    queryKey: ['book-details', bookId],
    queryFn: async () => {
      if (!bookId) throw new Error('No bookId provided');
      
      try {
        // Fetch all data in parallel for better performance
        const [book, chaptersResponse, purchaseResponse, libraryResponse] = await Promise.allSettled([
          api.get(`/books/${bookId}`),
          api.get(`/chapters?bookId=${bookId}`),
          api.get(`/purchases/book/${bookId}/count`),
          api.get(`/user-library/book/${bookId}/count`)
        ]);
        
        // Extract successful responses
        const bookData = book.status === 'fulfilled' ? book.value : null;
        const chapters = chaptersResponse.status === 'fulfilled' ? chaptersResponse.value : [];
        const purchase_count = purchaseResponse.status === 'fulfilled' ? purchaseResponse.value?.count || 0 : 0;
        const library_count = libraryResponse.status === 'fulfilled' ? libraryResponse.value?.count || 0 : 0;
        
        if (!bookData) {
          throw new Error('Failed to fetch book data');
        }
        
        return {
          ...bookData,
          chapters: chapters || [],
          purchase_count,
          library_count
        } as BookWithChapters;
      } catch (error) {
        console.error('Error fetching book details:', error);
        throw error;
      }
    },
    enabled: !!bookId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    retryDelay: 1000
  });
};
