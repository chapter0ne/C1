
import { useQuery } from '@tanstack/react-query';
import { api } from '@/utils/api';

export const useDashboardData = () => {
  return useQuery({
    queryKey: ['dashboard-data'],
    queryFn: async () => {
      // Fetch all purchases (admin only)
      const purchases = await api.get('/purchases');
      // Fetch all users (admin only)
      const users = await api.get('/users');
      // Fetch all books (published only)
      const books = await api.get('/books');
      // Fetch all reviews (not paginated, for dashboard count)
      // (Assume you have an endpoint for all reviews, otherwise skip or implement)
      let reviews = [];
      try {
        reviews = await api.get('/reviews');
      } catch (e) {
        // If endpoint not available, fallback to empty
        reviews = [];
      }

      // Calculate dashboard metrics
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      // Monthly purchases
      const monthlyPurchases = purchases.filter(p => new Date(p.createdAt) >= startOfMonth);
      // Today's purchases
      const todayPurchases = purchases.filter(p => new Date(p.createdAt) >= startOfToday);
      // Total purchases cost this month
      const totalMonthlyCost = monthlyPurchases.reduce((sum, purchase) => sum + Number(purchase.amount_paid || purchase.amountPaid || 0), 0);
      // Users with reader role (today/month)
      const todayUsersCount = users.filter(u => u.role === 'reader' && new Date(u.createdAt) >= startOfToday).length;
      const monthlyUsersCount = users.filter(u => u.role === 'reader' && new Date(u.createdAt) >= startOfMonth).length;
      // Today's reviews
      const todayReviewsCount = reviews.filter(r => new Date(r.createdAt) >= startOfToday).length;
      // Recent sales (last 5)
      const recentSales = purchases
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
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
