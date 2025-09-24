
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
      // Fetch all purchases (successful Paystack payments)
      const purchases = await api.get('/purchases');

      // Filter successful purchases (Paystack successful payments only)
      const successfulPurchases = purchases.filter(p => 
        p.status === 'completed' || p.status === 'success' || p.transactionId
      );

      // Get total published books count
      const totalBooks = books.length;
      // Get active users with reader role count
      const activeUsers = users.filter(u => Array.isArray(u.roles) && u.roles.includes('reader')).length;
      // Get monthly sales total (sum of successful purchases this month)
      const monthlyPurchases = successfulPurchases.filter(p => 
        new Date(p.purchasedAt || p.createdAt) >= startOfMonth
      );
      const monthlySales = monthlyPurchases.reduce((sum, purchase) => 
        sum + Number(purchase.amountPaid || purchase.amount_paid || 0), 0
      );
      // Get total revenue (sum of all successful purchases ever)
      const totalRevenue = successfulPurchases.reduce((sum, purchase) => 
        sum + Number(purchase.amountPaid || purchase.amount_paid || 0), 0
      );

      return {
        totalBooks,
        activeUsers,
        monthlySales,
        totalRevenue
      };
    }
  });
};
