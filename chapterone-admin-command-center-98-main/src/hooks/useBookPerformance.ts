
import { useQuery } from '@tanstack/react-query';
import { api } from '@/utils/api';

export const useBookPerformance = () => {
  return useQuery({
    queryKey: ['book-performance'],
    queryFn: async () => {
      // Fetch all books (published only)
      const books = await api.get('/books');
      // Fetch all purchases
      const purchases = await api.get('/purchases');

      return books.map(book => {
        const bookPurchases = purchases.filter(p => (p.book && (p.book._id === book._id || p.book === book._id)));
        return {
          id: book._id || book.id,
          title: book.title,
          author: book.author,
          genre: book.genre || 'Unknown',
          totalSales: bookPurchases.length,
          totalRevenue: bookPurchases.reduce((sum, purchase) => sum + Number(purchase.amount_paid || purchase.amountPaid || 0), 0)
        };
      });
    }
  });
};
