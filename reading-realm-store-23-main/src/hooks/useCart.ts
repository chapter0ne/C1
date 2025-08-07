
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/utils/api';

export const useCart = (userId: string) => {
  const queryClient = useQueryClient();

  const { data: cart = { items: [], totalAmount: 0 }, isLoading } = useQuery({
    queryKey: ['cart', userId],
    queryFn: async () => {
      return await api.get('/cart');
    },
    enabled: !!userId,
    // Return empty cart if no userId
    initialData: { items: [], totalAmount: 0 },
  });

  const addToCart = useMutation({
    mutationFn: async ({ bookId, quantity = 1 }: { bookId: string; quantity?: number }) => {
      return await api.post(`/cart/books/${bookId}`, { quantity });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart', userId] });
    },
  });

  const removeFromCart = useMutation({
    mutationFn: async (bookId: string) => {
      return await api.del(`/cart/books/${bookId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart', userId] });
    },
  });

  const updateCartItemQuantity = useMutation({
    mutationFn: async ({ bookId, quantity }: { bookId: string; quantity: number }) => {
      return await api.put(`/cart/books/${bookId}/quantity`, { quantity });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart', userId] });
    },
  });

  const clearCart = useMutation({
    mutationFn: async () => {
      return await api.del('/cart/clear');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart', userId] });
    },
  });

  const checkout = useMutation({
    mutationFn: async ({ paymentMethod, selectedItems }: { 
      paymentMethod: string; 
      selectedItems: string[] 
    }) => {
      return await api.post('/cart/checkout', { paymentMethod, selectedItems });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart', userId] });
      queryClient.invalidateQueries({ queryKey: ['userLibrary', userId] });
    },
  });

  const getCartSummary = async () => {
    try {
      const response = await api.get('/cart/summary');
      return response;
    } catch (error) {
      return { itemCount: 0, totalAmount: 0, items: [] };
    }
  };

  return {
    cart, 
    isLoading, 
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    clearCart,
    checkout,
    getCartSummary
  };
};
