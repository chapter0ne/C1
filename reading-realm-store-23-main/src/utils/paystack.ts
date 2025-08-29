// Paystack integration utilities
export const PAYSTACK_PUBLIC_KEY = 'pk_test_a7e751eb05e05f4e7c4a7312bffa0ca9b5e1a023';

export interface PaystackTransaction {
  reference: string;
  amount: number;
  email: string;
  metadata: {
    bookIds: string[];
    userId: string;
    custom_fields: Array<{
      display_name: string;
      variable_name: string;
      value: string;
    }>;
  };
}

export interface PaystackResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

export interface PaystackVerificationResponse {
  status: boolean;
  message: string;
  data: {
    reference: string;
    amount: number;
    status: string;
    gateway_response: string;
    paid_at: string;
    metadata: {
      bookIds: string[];
      userId: string;
    };
  };
}

// Initialize Paystack
export const initializePaystack = () => {
  if (typeof window !== 'undefined' && !(window as any).PaystackPop) {
    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    document.head.appendChild(script);
  }
};

// Create Paystack transaction
export const createPaystackTransaction = async (
  amount: number,
  email: string,
  bookIds: string[],
  userId: string,
  reference: string
): Promise<PaystackResponse> => {
  try {
    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PAYSTACK_PUBLIC_KEY.replace('pk_', 'sk_')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: amount * 100, // Convert to kobo (smallest currency unit)
        email,
        reference,
        callback_url: `${window.location.origin}/payment/verify`,
        metadata: {
          bookIds,
          userId,
          custom_fields: [
            {
              display_name: 'Books',
              variable_name: 'books',
              value: bookIds.join(', '),
            },
            {
              display_name: 'User ID',
              variable_name: 'user_id',
              value: userId,
            },
          ],
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Paystack API error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating Paystack transaction:', error);
    throw new Error('Failed to initialize payment');
  }
};

// Verify Paystack transaction
export const verifyPaystackTransaction = async (reference: string): Promise<PaystackVerificationResponse> => {
  try {
    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${PAYSTACK_PUBLIC_KEY.replace('pk_', 'sk_')}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Paystack verification error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error verifying Paystack transaction:', error);
    throw new Error('Failed to verify payment');
  }
};

// Generate unique reference
export const generateReference = (): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return `BOOK_${timestamp}_${random}`.toUpperCase();
};

// Format amount for display
export const formatAmount = (amount: number): string => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
  }).format(amount);
};
