
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/utils/api';

export const useProfile = (userId: string) => {
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', userId],
    queryFn: async () => {
      if (!userId) throw new Error('User ID is required');
      // Use the reader endpoint for current user's profile
      return await api.get('/reader/profile');
    },
    enabled: !!userId,
    // Return null if no userId
    initialData: null,
  });

  const updateProfile = useMutation({
    mutationFn: async (data: any) => {
      if (!userId) throw new Error('User ID is required');
      // Use the reader endpoint for updating current user's profile
      return await api.put('/reader/profile', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', userId] });
    },
  });

  return { profile, isLoading, updateProfile };
};
