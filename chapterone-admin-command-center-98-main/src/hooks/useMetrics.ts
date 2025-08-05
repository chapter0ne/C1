
import { useQuery } from '@tanstack/react-query';
import { api } from '@/utils/api';

export const useMetrics = () => {
  return useQuery({
    queryKey: ['metrics'],
    queryFn: async () => {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      // Fetch all books (published only)
      const books = await api.get('/books');
      // Fetch all users
      const users = await api.get('/users');
      // Fetch all purchases
      const purchases = await api.get('/purchases');

      // Get total published books count
      const totalBooks = books.length;
      // Get active users with reader role count
      const activeUsers = users.filter(u => Array.isArray(u.roles) && u.roles.includes('reader')).length;
      // Get monthly sales total (sum of all purchases this month)
      const monthlyPurchases = purchases.filter(p => new Date(p.createdAt) >= startOfMonth);
      const monthlySales = monthlyPurchases.reduce((sum, purchase) => sum + Number(purchase.amount_paid || purchase.amountPaid || 0), 0);
      // Get total revenue (sum of all purchases ever)
      const totalRevenue = purchases.reduce((sum, purchase) => sum + Number(purchase.amount_paid || purchase.amountPaid || 0), 0);

      return {
        totalBooks,
        activeUsers,
        monthlySales,
        totalRevenue
      };
    }
  });
};
