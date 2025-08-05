
import { useQuery } from '@tanstack/react-query';
import { api } from '@/utils/api';

export const usePublishedBooks = () => {
  return useQuery({
    queryKey: ['all-books'],
    queryFn: async () => {
      return await api.get('/books?all=true');
    },
  });
};
