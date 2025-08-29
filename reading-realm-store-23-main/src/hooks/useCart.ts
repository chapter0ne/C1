
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/utils/api';
import { 
  createPaystackTransaction, 
  verifyPaystackTransaction, 
  generateReference,
  initializePaystack 
} from '@/utils/paystack';

export const useCart = (userId: string) => {
  const queryClient = useQueryClient();

  const { data: cart = { items: [], totalAmount: 0 }, isLoading } = useQuery({
    queryKey: ['cart', userId],
    queryFn: async () => {
      const response = await api.get('/cart');
      // Ensure we return the data property from the response
      return response?.data || { items: [], totalAmount: 0 };
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
    mutationFn: async ({ 
      selectedItems, 
      userEmail, 
      totalAmount 
    }: { 
      selectedItems: string[];
      userEmail: string;
      totalAmount: number;
    }) => {
      // Initialize Paystack
      initializePaystack();
      
      // Generate unique reference for this transaction
      const reference = generateReference();
      
      // Create Paystack transaction
      const paystackResponse = await createPaystackTransaction(
        totalAmount,
        userEmail,
        selectedItems,
        userId,
        reference
      );
      
      if (!paystackResponse.status) {
        throw new Error(paystackResponse.message || 'Payment initialization failed');
      }
      
      // Return Paystack response for redirect
      return paystackResponse;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart', userId] });
      queryClient.invalidateQueries({ queryKey: ['userLibrary', userId] });
    },
  });

  const verifyPayment = useMutation({
    mutationFn: async (reference: string) => {
      // Verify payment with Paystack
      const verificationResponse = await verifyPaystackTransaction(reference);
      
      if (!verificationResponse.status || verificationResponse.data.status !== 'success') {
        throw new Error('Payment verification failed');
      }
      
      // Process successful payment on backend
      const backendResponse = await api.post('/cart/process-payment', {
        reference,
        bookIds: verificationResponse.data.metadata.bookIds,
        userId: verificationResponse.data.metadata.userId,
        amount: verificationResponse.data.amount / 100, // Convert from kobo to naira
        paystackData: verificationResponse.data
      });
      
      return backendResponse;
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
    verifyPayment,
    getCartSummary
  };
};
