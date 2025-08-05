
import { useQuery } from '@tanstack/react-query';
import { api } from '@/utils/api';

export const useBookStore = () => {
  const { data: books = [], isLoading } = useQuery(['books'], async () => {
    return await api.get('/books');
  });

  // Example filters (replace with real logic as needed)
  const topRatedBooks = books.filter((b: any) => b.rating >= 4.5);
  const recentlyAddedBooks = books.slice(0, 10);
  const recommendedBooks = books.filter((b: any) => b.isRecommended);

  return {
    books,
    topRatedBooks,
    recentlyAddedBooks,
    recommendedBooks,
    isLoading,
  };
};
