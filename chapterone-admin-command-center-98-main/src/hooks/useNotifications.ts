
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/utils/api';
import { toast } from 'sonner';

export const useNotifications = () => {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      // Fetch all notifications from backend
      const notifications = await api.get('/notifications');
      return notifications || [];
    }
  });
};

export const useReaderStats = () => {
  return useQuery({
    queryKey: ['reader-stats'],
    queryFn: async () => {
      // Fetch all users
      const users = await api.get('/users');
      // Fetch all purchases
      const purchases = await api.get('/purchases');
      const now = new Date();
      const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const readers = users.filter(u => u.role === 'reader');
      const stats = {
        total: readers.length,
        newThisWeek: readers.filter(r => new Date(r.createdAt) >= lastWeek).length,
        newThisMonth: readers.filter(r => new Date(r.createdAt) >= lastMonth).length,
        activeBuyers: readers.filter(r => purchases.some(p => p.user && (p.user._id === r._id || p.user === r._id))).length
      };
      return stats;
    }
  });
};

export const useSendNotification = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (notification: {
      title: string;
      content: string;
      previewText?: string;
      actionUrl?: string;
      targetAudience: string;
    }) => {
      // Send notification via backend
      await api.post('/notifications', notification);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Notification sent successfully');
    }
  });
};
