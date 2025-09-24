
import { useQuery } from '@tanstack/react-query';
import { api } from '@/utils/api';

export const useDashboardData = () => {
  return useQuery({
    queryKey: ['dashboard-data'],
    queryFn: async () => {
      // Fetch all purchases (admin only) - these are successful Paystack payments
      const purchases = await api.get('/purchases');
      // Fetch all users (admin only)
      const users = await api.get('/users');
      // Fetch all books (published only)
      const books = await api.get('/books');
      // Fetch all reviews (not paginated, for dashboard count)
      let reviews = [];
      try {
        reviews = await api.get('/reviews');
      } catch (e) {
        reviews = [];
      }

      // Calculate dashboard metrics
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      // Filter successful purchases (Paystack successful payments)
      const successfulPurchases = purchases.filter(p => 
        p.status === 'completed' || p.status === 'success' || p.transactionId
      );

      // Monthly purchases (successful payments from start of month)
      const monthlyPurchases = successfulPurchases.filter(p => 
        new Date(p.purchasedAt || p.createdAt) >= startOfMonth
      );
      
      // Today's purchases
      const todayPurchases = successfulPurchases.filter(p => 
        new Date(p.purchasedAt || p.createdAt) >= startOfToday
      );
      
      // Total purchases cost this month
      const totalMonthlyCost = monthlyPurchases.reduce((sum, purchase) => 
        sum + Number(purchase.amountPaid || purchase.amount_paid || 0), 0
      );
      
      // Users with reader role (today/month)
      const todayUsersCount = users.filter(u => 
        Array.isArray(u.roles) && u.roles.includes('reader') && 
        new Date(u.createdAt) >= startOfToday
      ).length;
      
      const monthlyUsersCount = users.filter(u => 
        Array.isArray(u.roles) && u.roles.includes('reader') && 
        new Date(u.createdAt) >= startOfMonth
      ).length;
      
      // Today's reviews
      const todayReviewsCount = reviews.filter(r => 
        new Date(r.createdAt) >= startOfToday
      ).length;
      
      // Recent sales (last 5 successful purchases)
      const recentSales = successfulPurchases
        .sort((a, b) => new Date(b.purchasedAt || b.createdAt) - new Date(a.purchasedAt || a.createdAt))
        .slice(0, 5);

      // Current user profile (admin only, from /auth/me)
      let currentUserProfile = null;
      try {
        currentUserProfile = await api.get('/auth/me');
      } catch (e) {
        currentUserProfile = null;
      }

      return {
        currentUserProfile,
        monthlyPurchases,
        allSales: successfulPurchases, // All successful sales for filtering
        todayPurchasesCount: todayPurchases.length,
        totalMonthlyCost,
        todayUsersCount,
        monthlyUsersCount,
        todayReviewsCount,
        recentSales,
      };
    }
  });
};
