
import { useQuery } from '@tanstack/react-query';
import { api } from '@/utils/api';
import { BookWithChapters } from '@/types/book';

export const useBookDetails = (bookId: string) => {
  return useQuery({
    queryKey: ['book-details', bookId],
    queryFn: async () => {
      if (!bookId) throw new Error('No bookId provided');
      
      // Fetch book details from backend
      const book = await api.get(`/books/${bookId}`);
      
      // Fetch chapters for the book
      let chapters = [];
      try {
        chapters = await api.get(`/chapters?bookId=${bookId}`);
      } catch (e) {
        console.log('No chapters found for book:', bookId);
        chapters = [];
      }
      
      // Fetch purchase count for the book (admin only)
      let purchase_count = 0;
      try {
        const purchaseData = await api.get(`/purchases/book/${bookId}/count`);
        purchase_count = purchaseData.count || 0;
      } catch (e) {
        console.log('No purchase data found for book:', bookId);
        purchase_count = 0;
      }
      
      // Fetch library count for the book (admin only)
      let library_count = 0;
      try {
        const libraryData = await api.get(`/user-library/book/${bookId}/count`);
        library_count = libraryData.count || 0;
      } catch (e) {
        console.log('No library data found for book:', bookId);
        library_count = 0;
      }
      
      return {
        ...book,
        chapters: chapters || [],
        purchase_count,
        library_count
      } as BookWithChapters;
    },
    enabled: !!bookId
  });
};
