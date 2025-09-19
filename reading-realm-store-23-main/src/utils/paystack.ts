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

// Create Paystack transaction using frontend popup
export const createPaystackTransaction = async (
  amount: number,
  email: string,
  bookIds: string[],
  userId: string,
  reference: string,
  onSuccess?: (reference: string) => Promise<void>,
  onError?: (error: string) => void
): Promise<PaystackResponse> => {
  return new Promise((resolve, reject) => {
    // Ensure Paystack is loaded
    if (typeof window === 'undefined' || !(window as any).PaystackPop) {
      reject(new Error('Paystack not loaded'));
      return;
    }

    const paystackPop = (window as any).PaystackPop.setup({
      key: PAYSTACK_PUBLIC_KEY,
      email,
      amount: amount * 100, // Convert to kobo
      ref: reference,
      currency: 'NGN',
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
      callback: function(response: any) {
        // Payment successful - call success handler asynchronously
        if (onSuccess) {
          onSuccess(response.reference).then(() => {
            resolve({
              status: true,
              message: 'Payment successful',
              data: {
                authorization_url: '',
                access_code: response.reference,
                reference: response.reference,
              },
            });
          }).catch((error) => {
            console.error('Error in payment success callback:', error);
            if (onError) {
              onError(error instanceof Error ? error.message : 'Payment processing failed');
            }
            reject(error);
          });
        } else {
          resolve({
            status: true,
            message: 'Payment successful',
            data: {
              authorization_url: '',
              access_code: response.reference,
              reference: response.reference,
            },
          });
        }
      },
      onClose: function() {
        // Payment cancelled
        const errorMsg = 'Payment cancelled by user';
        if (onError) {
          onError(errorMsg);
        }
        reject(new Error(errorMsg));
      },
    });

    paystackPop.openIframe();
  });
};

// Verify Paystack transaction through backend
export const verifyPaystackTransaction = async (reference: string): Promise<PaystackVerificationResponse> => {
  try {
    const response = await fetch(`/api/payments/verify/${reference}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Payment verification error: ${response.status}`);
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

