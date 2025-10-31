
import { useQuery } from '@tanstack/react-query';
import { api } from '@/utils/api';

export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const users = await api.get('/users');
      return users.map(user => ({
        id: user._id || user.id,
        name: user.fullName || user.full_name || user.username || user.name,
        email: user.email,
        role: user.role || (user.roles ? user.roles[0] : 'reader'),
        joinDate: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '',
        booksPurchased: user.booksPurchased || (user.book_purchases ? user.book_purchases.length : 0),
        libraryCount: user.libraryCount || 0
      }));
    }
  });
};
