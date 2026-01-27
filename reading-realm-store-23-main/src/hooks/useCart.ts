
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/utils/api';
import { 
  createNombaCheckout,
  verifyNombaTransaction,
  generateOrderReference
} from '@/utils/nomba';
import { useEffect, useState } from 'react';

// Local storage utilities for cart persistence
const CART_STORAGE_KEY = 'chapterone_cart';

const saveCartToStorage = (cartData: any) => {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartData));
  } catch (error) {
    console.error('Failed to save cart to localStorage:', error);
  }
};

const getCartFromStorage = () => {
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    return stored ? JSON.parse(stored) : { items: [], totalAmount: 0 };
  } catch (error) {
    console.error('Failed to load cart from localStorage:', error);
    return { items: [], totalAmount: 0 };
  }
};

const clearCartFromStorage = () => {
  try {
    localStorage.removeItem(CART_STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear cart from localStorage:', error);
  }
};

export const useCart = (userId: string) => {
  const queryClient = useQueryClient();
  const [localCart, setLocalCart] = useState(() => getCartFromStorage());

  const { data: cart = localCart, isLoading } = useQuery({
    queryKey: ['cart', userId],
    queryFn: async () => {
      if (!userId) {
        console.log('No userId, returning local cart');
        return localCart;
      }
      
      try {
      const response = await api.get('/cart');
        console.log('Cart API response:', response);
        const serverCart = response || { items: [], totalAmount: 0 };
        
        // Save server cart to localStorage
        saveCartToStorage(serverCart);
        setLocalCart(serverCart);
        
        return serverCart;
      } catch (error) {
        console.error('Failed to fetch cart from server, using local cart:', error);
        // If server fails, use local cart
        return localCart;
      }
    },
    enabled: !!userId,
    // Use local cart as initial data
    initialData: localCart,
    refetchOnWindowFocus: false,
    // Retry on error to fallback to local cart
    retry: false
  });

  // Sync local cart with server cart when cart data changes
  useEffect(() => {
    if (cart && cart !== localCart) {
      setLocalCart(cart);
      saveCartToStorage(cart);
    }
  }, [cart, localCart]);

  const addToCart = useMutation({
    mutationFn: async ({ bookId, quantity = 1 }: { bookId: string; quantity?: number }) => {
      console.log('Adding to cart via API:', { bookId, quantity });
      
      try {
        const result = await api.post(`/cart/books/${bookId}`, { quantity: 1 }); // Always send quantity 1
        console.log('Add to cart API result:', result);
        return result;
      } catch (error) {
        console.error('Add to cart API error:', error);
        
        // Don't fallback to local cart for specific error cases
        if (error.response?.status === 400) {
          const message = error.response?.data?.message || '';
          if (message.includes('already in your cart')) {
            throw new Error('Book is already in your cart. You can only add one copy of each book.');
          } else if (message.includes('already purchased')) {
            throw new Error('You have already purchased this book. It should be in your library.');
          } else if (message.includes('Free books cannot be added')) {
            throw new Error('Free books cannot be added to cart. Add them directly to your library.');
          }
        }
        
        // For other errors, still fallback to local cart
        const updatedLocalCart = {
          ...localCart,
          items: [...(localCart.items || []), { book: { _id: bookId }, quantity: 1 }]
        };
        setLocalCart(updatedLocalCart);
        saveCartToStorage(updatedLocalCart);
        
        throw error; // Re-throw to trigger onError
      }
    },
    onSuccess: (data) => {
      console.log('Add to cart success, invalidating queries');
      queryClient.invalidateQueries({ queryKey: ['cart', userId] });
    },
    onError: (error) => {
      console.error('Add to cart error:', error);
    },
  });

  const removeFromCart = useMutation({
    mutationFn: async (bookId: string) => {
      try {
      return await api.del(`/cart/books/${bookId}`);
      } catch (error) {
        console.error('Remove from cart API error, updating local cart:', error);
        
        // If API fails, update local cart
        const updatedLocalCart = {
          ...localCart,
          items: (localCart.items || []).filter((item: any) => 
            (item.book?._id || item.book?.id) !== bookId
          )
        };
        setLocalCart(updatedLocalCart);
        saveCartToStorage(updatedLocalCart);
        
        throw error; // Re-throw to trigger onError
      }
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
      // Create Nomba checkout order
      const nombaResponse = await createNombaCheckout(
        totalAmount,
        userEmail,
        selectedItems,
        userId
      );
      
      if (!nombaResponse.success) {
        throw new Error('Failed to create checkout order');
      }
      
      // Redirect user to Nomba checkout page
      if (nombaResponse.checkoutLink) {
        window.location.href = nombaResponse.checkoutLink;
      } else {
        throw new Error('No checkout link received');
      }
      
      // Return response (user will be redirected)
      return nombaResponse;
    },
    onSuccess: () => {
      // Additional success handling if needed
      console.log('Checkout mutation completed successfully');
    },
    onError: (error) => {
      console.error('Checkout error:', error);
    },
  });

  const verifyPayment = useMutation({
    mutationFn: async (reference: string) => {
      // Verify payment with Nomba
      const verificationResponse = await verifyNombaTransaction(reference);
      
      console.log('Verification response:', verificationResponse);
      
      // Check if verification was successful
      if (!verificationResponse.success) {
        const errorMessage = verificationResponse.message || 
                            verificationResponse.error || 
                            'Payment verification failed';
        throw new Error(errorMessage);
      }
      
      // Check if payment status is completed
      // Backend returns status: 'completed' | 'pending' | 'failed' | 'cancelled'
      const paymentStatus = verificationResponse.status;
      
      if (paymentStatus !== 'completed') {
        const statusMessage = paymentStatus === 'pending' 
          ? 'Payment is still being processed. Please wait a moment and refresh.'
          : paymentStatus === 'cancelled'
          ? 'Payment was cancelled'
          : paymentStatus === 'failed'
          ? 'Payment failed'
          : `Payment status: ${paymentStatus}`;
        throw new Error(statusMessage);
      }
      
      // Invalidate queries to refresh UI
      queryClient.invalidateQueries({ queryKey: ['cart', userId] });
      queryClient.invalidateQueries({ queryKey: ['userLibrary', userId] });
      
      return verificationResponse;
    },
    retry: false, // Disable automatic retries for payment verification
    retryOnMount: false, // Don't retry when component mounts
    retryOnWindowFocus: false, // Don't retry when window regains focus
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart', userId] });
      queryClient.invalidateQueries({ queryKey: ['userLibrary', userId] });
    },
    onError: (error) => {
      // Log error but don't retry
      console.error('Payment verification error (no retry):', error);
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

  // Function to manually sync local cart with server
  const syncCartWithServer = async () => {
    if (!userId) return;
    
    try {
      const response = await api.get('/cart');
      const serverCart = response || { items: [], totalAmount: 0 };
      
      // Update local cart with server data
      setLocalCart(serverCart);
      saveCartToStorage(serverCart);
      
      // Invalidate queries to refresh UI
      queryClient.invalidateQueries({ queryKey: ['cart', userId] });
      
      console.log('Cart synced with server successfully');
    } catch (error) {
      console.error('Failed to sync cart with server:', error);
    }
  };

  // Listen for online/offline events to sync cart
  useEffect(() => {
    const handleOnline = () => {
      console.log('User came back online, syncing cart...');
      syncCartWithServer();
    };

    window.addEventListener('online', handleOnline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, [userId]);

  return {
    cart, 
    isLoading, 
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    clearCart,
    checkout,
    verifyPayment,
    getCartSummary,
    syncCartWithServer
  };
};
