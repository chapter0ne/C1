import { useQuery } from '@tanstack/react-query';
import { api } from '@/utils/api';

export const useUserLibrary = (userId: string) => {
  return useQuery({
    queryKey: ['userLibrary', userId],
    queryFn: async () => {
      console.log('[useUserLibrary] Query running for userId:', userId);
      if (!userId) return [];
      try {
        const result = await api.get('/user-library/my');
        console.log('[useUserLibrary] Data returned:', result);
        return Array.isArray(result) ? result : [];
      } catch (e) {
        console.log('[useUserLibrary] Error:', e);
        return [];
      }
    },
    enabled: !!userId,
    initialData: [],
    staleTime: 0,
    refetchOnWindowFocus: true,
  });
}; 