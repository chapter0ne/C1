import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/utils/api';

export const useNotifications = (userId: string) => {
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications', userId],
    queryFn: async () => {
      return await api.get('/notifications');
    },
    enabled: !!userId,
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
  });

  const markAsRead = useMutation({
    mutationFn: async (notificationId: string) => {
      return await api.put(`/notifications/${notificationId}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', userId] });
    },
  });

  const markAllAsRead = useMutation({
    mutationFn: async () => {
      return await api.put('/notifications/read-all');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', userId] });
    },
  });

  const deleteNotification = useMutation({
    mutationFn: async (notificationId: string) => {
      return await api.del(`/notifications/${notificationId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', userId] });
    },
  });

  const getUnreadCount = () => {
    return notifications.filter((notification: any) => !notification.isRead).length;
  };

  return { 
    notifications, 
    isLoading, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification,
    getUnreadCount
  };
}; 