// Use live API by default; set NOMBA_BASE_URL in .env to switch (e.g. https://sandbox.nomba.com/v1 for test)
const NOMBA_BASE_URL = process.env.NOMBA_BASE_URL || 'https://api.nomba.com/v1';
const NOMBA_CLIENT_ID = process.env.NOMBA_CLIENT_ID;
const NOMBA_PRIVATE_KEY = process.env.NOMBA_PRIVATE_KEY || process.env.NOMBA_CLIENT_SECRET;
const NOMBA_ACCOUNT_ID = process.env.NOMBA_ACCOUNT_ID;

// Cache for access token
let accessToken = null;
let tokenExpiry = null;

/**
 * Get Nomba access token (with caching)
 */
async function getAccessToken() {
  // Return cached token if still valid
  if (accessToken && tokenExpiry && Date.now() < tokenExpiry) {
    console.log('Using cached Nomba access token');
    return accessToken;
  }

  try {
    // Validate environment variables
    if (!NOMBA_CLIENT_ID || !NOMBA_PRIVATE_KEY) {
      throw new Error('Nomba credentials not configured. Check NOMBA_CLIENT_ID and NOMBA_PRIVATE_KEY in .env');
    }

    // Validate environment variables
    if (!NOMBA_ACCOUNT_ID) {
      throw new Error('NOMBA_ACCOUNT_ID not configured in .env');
    }

    console.log('Requesting Nomba access token...');
    const response = await fetch(`${NOMBA_BASE_URL}/auth/token/issue`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'AccountId': NOMBA_ACCOUNT_ID, // AccountId required in header
      },
      body: JSON.stringify({
        grant_type: 'client_credentials',
        client_id: NOMBA_CLIENT_ID,
        client_secret: NOMBA_PRIVATE_KEY,
      }),
    });

    const data = await response.json();
    console.log('Nomba token response status:', response.status);
    console.log('Nomba token response data:', JSON.stringify(data, null, 2));

    if (!response.ok) {
      throw new Error(data.description || data.message || data.error || 'Failed to get access token');
    }

    // Nomba returns access_token nested in data.data object
    if (data && data.data && data.data.access_token) {
      accessToken = data.data.access_token;
      // Tokens expire after 30 minutes, set expiry to 25 minutes for safety
      tokenExpiry = Date.now() + 25 * 60 * 1000;
      console.log('Nomba access token obtained successfully');
      return accessToken;
    }

    // Fallback: check if access_token is at root level (for different API versions)
    if (data && data.access_token) {
      accessToken = data.access_token;
      tokenExpiry = Date.now() + 25 * 60 * 1000;
      console.log('Nomba access token obtained successfully (root level)');
      return accessToken;
    }

    throw new Error(`No access_token in response from Nomba. Response: ${JSON.stringify(data)}`);
  } catch (error) {
    console.error('Nomba token error:', error.message);
    console.error('Error details:', error);
    throw new Error(`Failed to authenticate with Nomba: ${error.message}`);
  }
}

/**
 * Create a checkout order in Nomba
 * @param {Object} orderData - Order details
 * @param {string} orderData.orderReference - Unique order reference
 * @param {number} orderData.amount - Amount in NGN (smallest currency unit, e.g., kobo)
 * @param {string} orderData.customerEmail - Customer email
 * @param {string} orderData.callbackUrl - Callback URL for payment status
 * @param {Object} orderData.metadata - Additional metadata
 * @returns {Promise<Object>} Checkout order response
 */
async function createCheckoutOrder(orderData) {
  try {
    if (!NOMBA_ACCOUNT_ID) {
      throw new Error('NOMBA_ACCOUNT_ID not configured in .env');
    }

    const token = await getAccessToken();

    // Nomba API requires the order details to be wrapped in an "order" object
    // Amount should be in NGN (not kobo), formatted as string with 2 decimal places
    const amountInNGN = typeof orderData.amount === 'number' 
      ? (orderData.amount / 100).toFixed(2) // Convert from kobo to NGN
      : orderData.amount.toString();
    
    const requestBody = {
      order: {
        orderReference: orderData.orderReference,
        customerEmail: orderData.customerEmail,
        amount: amountInNGN, // NGN format, not kobo (e.g., "4000.00")
        currency: 'NGN',
        callbackUrl: orderData.callbackUrl,
        returnUrl: orderData.returnUrl || orderData.callbackUrl, // URL to redirect user after payment
        accountId: NOMBA_ACCOUNT_ID, // Optional: can be in header or body
        // Note: metadata might need to be handled differently - check Nomba docs
      }
    };

    console.log('Creating Nomba checkout order with:', JSON.stringify(requestBody, null, 2));

    const response = await fetch(`${NOMBA_BASE_URL}/checkout/order`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'AccountId': NOMBA_ACCOUNT_ID, // AccountId required in header
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();
    console.log('Nomba checkout response status:', response.status);
    console.log('Nomba checkout response data:', JSON.stringify(data, null, 2));

    if (!response.ok) {
      const errorMsg = data.description || data.message || data.error || 'Failed to create checkout order';
      console.error('Nomba checkout failed:', errorMsg);
      return {
        success: false,
        error: errorMsg,
        responseData: data,
      };
    }

    // Nomba API returns data nested in data.data object (similar to token response)
    // Check both nested and root level structures
    const responseData = data.data || data;
    
    return {
      success: true,
      data: responseData,
      fullResponse: data, // Keep full response for debugging
    };
  } catch (error) {
    console.error('Nomba checkout error:', error.message);
    console.error('Error stack:', error.stack);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Verify a transaction by reference
 * @param {string} reference - Transaction reference
 * @returns {Promise<Object>} Transaction details
 */
async function verifyTransaction(reference) {
  try {
    const token = await getAccessToken();

    // Use the checkout transaction endpoint with ORDER_REFERENCE idType
    // This is the correct endpoint for verifying orders created via checkout
    const url = new URL(`${NOMBA_BASE_URL}/checkout/transaction`);
    url.searchParams.append('idType', 'ORDER_REFERENCE');
    url.searchParams.append('id', reference);
    url.searchParams.append('accountId', NOMBA_ACCOUNT_ID);

    console.log('Verifying transaction with Nomba (checkout endpoint):', {
      url: url.toString(),
      reference: reference,
      idType: 'ORDER_REFERENCE'
    });

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'AccountId': NOMBA_ACCOUNT_ID, // AccountId required in header
      },
    });

    console.log('Nomba verification response status:', response.status);

    const data = await response.json();
    console.log('Nomba verification response data:', JSON.stringify(data, null, 2));

    if (!response.ok) {
      console.error('Nomba verification failed:', {
        status: response.status,
        error: data.message || data.error || data.description || 'Unknown error',
        fullResponse: data
      });
      return {
        success: false,
        error: data.message || data.error || data.description || 'Failed to verify transaction',
        fullResponse: data
      };
    }

    return {
      success: true,
      data: data,
    };
  } catch (error) {
    console.error('Nomba verification error:', error.message);
    console.error('Error stack:', error.stack);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Generate unique order reference
 * @returns {string} Unique reference
 */
function generateOrderReference() {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return `BOOK_${timestamp}_${random}`.toUpperCase();
}

module.exports = {
  createCheckoutOrder,
  verifyTransaction,
  generateOrderReference,
  getAccessToken,
};
