
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/utils/api';
import { toast } from 'sonner';

export const useReviews = () => {
  return useQuery({
    queryKey: ['reviews'],
    queryFn: async () => {
      // Fetch all reviews from backend
      const reviews = await api.get('/reviews');
      // Optionally, populate book and user info if not already populated
      return reviews || [];
    }
  });
};

export const useDeleteReview = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (reviewId: string) => {
      // Delete review via backend
      await api.del(`/reviews/${reviewId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      toast.success('Review deleted successfully');
    }
  });
};
