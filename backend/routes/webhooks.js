const express = require('express');
const crypto = require('crypto');
const router = express.Router();

// Reachability check: GET /api/webhooks should return 200 so Nomba URL validation and debugging work
router.get('/', (req, res) => {
  res.status(200).json({
    ok: true,
    webhooks: {
      nomba: 'POST /api/webhooks/nomba for events, GET /api/webhooks/nomba for payment redirects',
      url: '/api/webhooks/nomba',
    },
  });
});

/**
 * Verify Nomba webhook signature per https://developer.nomba.com/docs/api-basics/webhook
 * Headers: nomba-signature, nomba-timestamp. Hashing payload:
 * event_type:requestId:userId:walletId:transactionId:type:time:responseCode:timestamp
 */
function verifyNombaWebhookSignature(req) {
  const secret = process.env.NOMBA_WEBHOOK_SECRET;
  if (!secret) return { verified: true }; // skip when not configured

  const signature = (req.headers['nomba-signature'] || req.headers['nomba-sig-value'] || '').trim();
  const timestamp = (req.headers['nomba-timestamp'] || '').trim();
  if (!signature) return { verified: false, reason: 'missing nomba-signature header' };

  const body = req.body || {};
  const eventType = body.event_type ?? body.event ?? '';
  const requestId = body.requestId ?? body.request_id ?? '';
  const data = body.data || {};
  const merchant = data.merchant || {};
  const transaction = data.transaction || {};
  const userId = merchant.userId ?? merchant.user_id ?? '';
  const walletId = merchant.walletId ?? merchant.wallet_id ?? '';
  const transactionId = transaction.transactionId ?? transaction.transaction_id ?? '';
  const type = transaction.type ?? '';
  const time = transaction.time ?? '';
  let responseCode = transaction.responseCode ?? transaction.response_code ?? '';
  if (responseCode === 'null') responseCode = '';

  const hashingPayload = `${eventType}:${requestId}:${userId}:${walletId}:${transactionId}:${type}:${time}:${responseCode}:${timestamp}`;
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(hashingPayload);
  const computed = hmac.digest('base64');

  // Both signature and computed are base64 strings; compare constant-time
  const sigBuf = Buffer.from(signature, 'utf8');
  const compBuf = Buffer.from(computed, 'utf8');
  if (sigBuf.length !== compBuf.length || !crypto.timingSafeEqual(sigBuf, compBuf)) {
    return { verified: false, reason: 'signature mismatch' };
  }
  return { verified: true };
}

// Nomba webhook handler - handles POST webhooks from Nomba
// Accept both /nomba and /nomba/ (trailing slash) so dashboard URL variations work
const nombaPostHandler = async (req, res) => {
  try {
    const verify = verifyNombaWebhookSignature(req);
    if (!verify.verified) {
      console.warn('Nomba webhook signature verification failed:', verify.reason);
      return res.status(401).json({ status: 'error', message: 'Invalid webhook signature' });
    }

    const { event, data } = req.body;
    const eventType = req.body.event_type ?? event;

    // Log full webhook payload for debugging
    console.log('Nomba webhook received - Full payload:', JSON.stringify(req.body, null, 2));
    console.log('Nomba webhook event:', eventType ?? event);
    console.log('Nomba webhook data keys:', data ? Object.keys(data) : 'no data');

    // Handle different Nomba webhook events (Nomba may send event or event_type)
    const ev = eventType ?? event;
    if (ev === 'payment.success' || ev === 'payment_success' || ev === 'order.completed') {
      const { orderReference, reference, transactionReference, transactionId, amount, status, customerEmail, metadata } = data;
      
      // Nomba might send the reference in different fields
      const paymentRef = orderReference || reference || transactionReference || transactionId;
      
      console.log('Processing successful payment:', {
        orderReference,
        reference,
        transactionReference,
        transactionId,
        paymentRef,
        amount,
        status
      });
      
      // Find the purchase record by transaction reference (try multiple fields)
      const Purchase = require('../models/Purchase');
      let purchase = await Purchase.findOne({ transactionId: paymentRef });
      
      // If not found by paymentRef, try orderReference
      if (!purchase && orderReference) {
        purchase = await Purchase.findOne({ transactionId: orderReference });
      }
      
      if (purchase) {
        console.log('Purchase found, updating to completed:', purchase._id);
        // Update purchase status to completed
        purchase.status = 'completed';
        // Store both our orderReference and Nomba's transaction reference
        purchase.paymentReference = paymentRef || orderReference;
        purchase.nombaData = {
          ...(purchase.nombaData || {}),
          amount: typeof amount === 'number' ? amount : parseFloat(amount), // Nomba sends NGN, not kobo
          customerEmail,
          status,
          metadata,
          transactionReference: paymentRef,
          webhookData: data, // Store full webhook data for debugging
        };
        await purchase.save();
        
        console.log('Purchase marked as completed:', orderReference);
        
        // Add book to user's library
        const UserLibrary = require('../models/UserLibrary');
        if (metadata && metadata.bookId) {
          const existingLibraryItem = await UserLibrary.findOne({ 
            user: purchase.user, 
            book: metadata.bookId 
          });
          
          if (!existingLibraryItem) {
            await UserLibrary.create({
              user: purchase.user,
              book: metadata.bookId,
              purchase: purchase._id,
              isFreeBook: false
            });
            console.log('Book added to user library:', metadata.bookId);
          }
        } else if (metadata && metadata.bookIds && Array.isArray(metadata.bookIds)) {
          // Handle multiple books
          for (const bookId of metadata.bookIds) {
            const existingLibraryItem = await UserLibrary.findOne({ 
              user: purchase.user, 
              book: bookId 
            });
            
            if (!existingLibraryItem) {
              await UserLibrary.create({
                user: purchase.user,
                book: bookId,
                purchase: purchase._id,
                isFreeBook: false
              });
              console.log('Book added to user library:', bookId);
            }
          }
        } else {
          // Fallback: try to get bookIds from purchase metadata stored during checkout
          const checkoutMetadata = purchase.nombaData?.fullResponse?.metadata || purchase.nombaData?.fullResponse?.data?.metadata;
          if (checkoutMetadata && checkoutMetadata.bookIds) {
            const bookIds = Array.isArray(checkoutMetadata.bookIds) 
              ? checkoutMetadata.bookIds 
              : [checkoutMetadata.bookIds];
            
            for (const bookId of bookIds) {
              const existingLibraryItem = await UserLibrary.findOne({ 
                user: purchase.user, 
                book: bookId 
              });
              
              if (!existingLibraryItem) {
                await UserLibrary.create({
                  user: purchase.user,
                  book: bookId,
                  purchase: purchase._id,
                  isFreeBook: false
                });
                console.log('Book added to user library from checkout metadata:', bookId);
              }
            }
          }
        }
      } else {
        console.log('Purchase not found for reference:', paymentRef || orderReference);
        console.log('Searched for:', { paymentRef, orderReference });
      }
    } else if (ev === 'payment.failed' || ev === 'payment_failed' || ev === 'order.failed') {
      const { orderReference, reference, transactionReference, transactionId } = data;
      const paymentRef = orderReference || reference || transactionReference || transactionId;
      const Purchase = require('../models/Purchase');
      let purchase = await Purchase.findOne({ transactionId: paymentRef });
      
      if (!purchase && orderReference) {
        purchase = await Purchase.findOne({ transactionId: orderReference });
      }
      
      if (purchase) {
        purchase.status = 'failed';
        await purchase.save();
        console.log('Purchase marked as failed:', orderReference);
      }
    }
    
    res.status(200).json({ status: 'success' });
  } catch (error) {
    console.error('Nomba webhook error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};
router.post(['/nomba', '/nomba/'], nombaPostHandler);

// Keep Paystack webhook for backward compatibility (can be removed later)
router.post('/paystack', async (req, res) => {
  try {
    const { event, data } = req.body;
    
    console.log('Paystack webhook received (legacy):', { event, reference: data?.reference });
    
    if (event === 'charge.success') {
      const { reference, amount, customer, metadata } = data;
      
      const Purchase = require('../models/Purchase');
      const purchase = await Purchase.findOne({ transactionId: reference });
      
      if (purchase) {
        purchase.status = 'completed';
        purchase.paymentReference = reference;
        purchase.paystackData = {
          amount: amount / 100,
          customer,
          metadata
        };
        await purchase.save();
        
        console.log('Purchase marked as completed (Paystack legacy):', reference);
        
        const UserLibrary = require('../models/UserLibrary');
        if (metadata && metadata.bookId) {
          const existingLibraryItem = await UserLibrary.findOne({ 
            user: purchase.user, 
            book: metadata.bookId 
          });
          
          if (!existingLibraryItem) {
            await UserLibrary.create({
              user: purchase.user,
              book: metadata.bookId,
              purchasedAt: new Date()
            });
            console.log('Book added to user library:', metadata.bookId);
          }
        }
      }
    }
    
    res.status(200).json({ status: 'success' });
  } catch (error) {
    console.error('Paystack webhook error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Handle GET requests for Nomba redirects (when user returns from payment page)
// If no query params, return 200 so Nomba dashboard URL validation and GET .../nomba reachability checks pass
router.get(['/nomba', '/nomba/'], async (req, res) => {
  try {
    const { orderReference, reference, transactionReference, transactionId, status, transactionRef } = req.query;
    const paymentRef = orderReference || reference;

    if (!paymentRef && !transactionReference && !transactionId) {
      return res.status(200).json({
        ok: true,
        endpoint: 'Nomba webhook',
        post: 'Send POST to this URL for webhook events',
        get: 'GET with orderReference/status for payment redirects',
      });
    }

    console.log('Nomba redirect received - Full query:', JSON.stringify(req.query, null, 2));
    const nombaTransactionRef = transactionReference || transactionId || transactionRef;
    
    console.log('Nomba redirect parsed:', { 
      orderReference, 
      reference, 
      transactionReference,
      transactionId,
      transactionRef,
      status, 
      paymentRef,
      nombaTransactionRef
    });
    
    // Get frontend URL from environment or default
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8080';
    
    if (!paymentRef) {
      // No reference, redirect to cart
      console.log('No payment reference in redirect, redirecting to cart');
      return res.redirect(`${frontendUrl}/cart?error=no_reference`);
    }
    
    // If status is success, try to update purchase immediately (webhook might not arrive for localhost)
    if (status === 'success' || status === 'completed') {
      console.log('Payment successful in redirect, updating purchase...');
      const Purchase = require('../models/Purchase');
      const purchase = await Purchase.findOne({ transactionId: paymentRef });
      
      if (purchase && purchase.status !== 'completed') {
        console.log('Updating purchase to completed from redirect');
        purchase.status = 'completed';
        if (nombaTransactionRef) {
          purchase.paymentReference = nombaTransactionRef;
        }
        purchase.nombaData = {
          ...(purchase.nombaData || {}),
          redirectStatus: status,
          redirectTransactionRef: nombaTransactionRef,
          redirectData: req.query
        };
        await purchase.save();
        
        // Add books to library
        const UserLibrary = require('../models/UserLibrary');
        const checkoutMetadata = purchase.nombaData?.fullResponse?.metadata || 
                                purchase.nombaData?.fullResponse?.data?.metadata;
        
        if (checkoutMetadata && checkoutMetadata.bookIds) {
          const bookIds = Array.isArray(checkoutMetadata.bookIds) 
            ? checkoutMetadata.bookIds 
            : [checkoutMetadata.bookIds];
          
          for (const bookId of bookIds) {
            if (!bookId) continue;
            const existingLibraryItem = await UserLibrary.findOne({ 
              user: purchase.user, 
              book: bookId 
            });
            
            if (!existingLibraryItem) {
              await UserLibrary.create({
                user: purchase.user,
                book: bookId,
                purchase: purchase._id,
                isFreeBook: false
              });
              console.log('Book added to user library from redirect:', bookId);
            }
          }
        }
      }
      
      // Redirect to payment verification page with success
      res.redirect(`${frontendUrl}/payment-verification?reference=${paymentRef}&status=success`);
    } else if (status === 'failed' || status === 'cancelled' || status === 'cancel') {
      // Redirect cancelled/failed payments directly to cart (no verification needed)
      res.redirect(`${frontendUrl}/cart?payment=cancelled`);
    } else {
      // No status provided, redirect to verification page to check status
      res.redirect(`${frontendUrl}/payment-verification?reference=${paymentRef}`);
    }
  } catch (error) {
    console.error('Nomba redirect error:', error);
    console.error('Error stack:', error.stack);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8080';
    res.redirect(`${frontendUrl}/cart?error=payment_error`);
  }
});

module.exports = router;












