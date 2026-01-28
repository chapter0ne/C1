// Nomba payment integration utilities
export interface NombaTransaction {
  orderReference: string;
  amount: number;
  email: string;
  bookIds: string[];
  userId: string;
}

export interface NombaCheckoutResponse {
  success: boolean;
  checkoutLink: string;
  orderReference: string;
  purchaseId: string;
}

export interface NombaVerificationResponse {
  success: boolean;
  status: string;
  purchase: any;
  transaction: any;
}

/**
 * Create Nomba checkout order
 */
export const createNombaCheckout = async (
  amount: number,
  email: string,
  bookIds: string[],
  userId: string
): Promise<NombaCheckoutResponse> => {
  try {
    const API_BASE = import.meta.env.VITE_API_BASE_URL || (window as any)._env_?.API_BASE || 'https://backend-8zug.onrender.com/api';
    
    const response = await fetch(`${API_BASE}/payments/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({
        amount,
        bookIds,
        customerEmail: email,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create checkout');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating Nomba checkout:', error);
    throw new Error('Failed to initialize payment');
  }
};

/**
 * Verify Nomba transaction
 */
export const verifyNombaTransaction = async (
  reference: string
): Promise<NombaVerificationResponse> => {
  try {
    const API_BASE = import.meta.env.VITE_API_BASE_URL || (window as any)._env_?.API_BASE || 'https://backend-8zug.onrender.com/api';
    
    const response = await fetch(`${API_BASE}/payments/verify/${reference}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      const msg = error.message || 'Failed to verify transaction';
      const err = new Error(msg) as Error & { retrySuggested?: boolean };
      err.retrySuggested = error.retrySuggested === true;
      throw err;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    console.error('Error verifying Nomba transaction:', error);
    throw new Error('Failed to verify payment');
  }
};

/**
 * Generate unique order reference
 */
export const generateOrderReference = (): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return `BOOK_${timestamp}_${random}`.toUpperCase();
};

/**
 * Format amount for display
 */
export const formatAmount = (amount: number): string => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
  }).format(amount);
};
