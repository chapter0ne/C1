const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const { createCheckoutOrder, verifyTransaction, generateOrderReference } = require('../utils/nomba');
const Purchase = require('../models/Purchase');
const UserLibrary = require('../models/UserLibrary');
const router = express.Router();

// Create Nomba checkout order
router.post('/checkout', authMiddleware, async (req, res) => {
  try {
    const { amount, bookIds, customerEmail } = req.body;
    const userId = req.user.userId;

    console.log('Checkout request received:', { amount, bookIds, customerEmail, userId });

    if (!amount || !bookIds || !Array.isArray(bookIds) || bookIds.length === 0) {
      return res.status(400).json({ message: 'Amount and bookIds are required' });
    }

    // Fetch user email from database if not provided
    let userEmail = customerEmail;
    if (!userEmail) {
      const User = require('../models/User');
      const user = await User.findById(userId).select('email');
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      userEmail = user.email;
    }

    if (!userEmail) {
      return res.status(400).json({ message: 'Customer email is required' });
    }

    // Generate unique order reference
    const orderReference = generateOrderReference();
    console.log('Generated order reference:', orderReference);

    // Create purchase record with pending status
    const purchase = new Purchase({
      user: userId,
      book: bookIds[0], // Store first book (legacy field)
      amountPaid: amount,
      status: 'pending',
      transactionId: orderReference,
      paymentMethod: 'nomba',
    });
    await purchase.save();
    console.log('Purchase record created:', purchase._id);

    // Create Nomba checkout order
    const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8080';
    const callbackUrl = `${baseUrl}/api/webhooks/nomba`; // For webhook notifications
    const returnUrl = `${baseUrl}/api/webhooks/nomba?orderReference=${orderReference}`; // For user redirects
    
    console.log('Creating Nomba checkout with:', {
      orderReference,
      amount: Math.round(amount * 100),
      customerEmail: userEmail,
      callbackUrl,
      returnUrl
    });

    const checkoutResult = await createCheckoutOrder({
      orderReference,
      amount: Math.round(amount * 100), // Pass as kobo, utility will convert to NGN format
      customerEmail: userEmail,
      callbackUrl,
      returnUrl, // URL for user redirects
      metadata: {
        purchaseId: purchase._id.toString(),
        userId: userId,
        bookIds: bookIds,
      },
    });

    console.log('Nomba checkout result:', checkoutResult);

    if (!checkoutResult.success) {
      // Update purchase status to failed
      purchase.status = 'failed';
      await purchase.save();
      console.error('Nomba checkout failed:', checkoutResult.error);
      return res.status(500).json({ 
        message: 'Failed to create checkout order',
        error: checkoutResult.error || 'Unknown error'
      });
    }

    // Update purchase with checkout link
    // Nomba returns checkout link in various possible fields
    const responseData = checkoutResult.data;
    const checkoutLink = responseData.checkoutLink || 
                        responseData.checkout_url || 
                        responseData.paymentLink ||
                        responseData.url;
    
    purchase.nombaData = {
      checkoutLink: checkoutLink,
      orderReference: responseData.orderReference || orderReference,
      fullResponse: checkoutResult.fullResponse, // Store full response for debugging
      metadata: { bookIds }, // Store so redirect/webhook can add books even if Nomba does not echo metadata
    };
    await purchase.save();

    if (!checkoutLink) {
      console.error('No checkout link in response:', checkoutResult);
      return res.status(500).json({ 
        message: 'No checkout link received from Nomba',
        data: checkoutResult.fullResponse || checkoutResult.data
      });
    }

    res.json({
      success: true,
      checkoutLink: checkoutLink,
      orderReference: responseData.orderReference || orderReference,
      purchaseId: purchase._id,
    });
  } catch (error) {
    console.error('Payment checkout error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      message: 'Payment checkout failed', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Verify Nomba transaction
router.get('/verify/:reference', authMiddleware, async (req, res) => {
  try {
    const { reference } = req.params;

    console.log('Verification request for reference:', reference);

    // First check if purchase exists in our database
    const purchase = await Purchase.findOne({ transactionId: reference });

    if (!purchase) {
      console.log('Purchase not found for reference:', reference);
      return res.status(404).json({ 
        success: false,
        message: 'Purchase not found',
        error: 'No purchase record found for this reference'
      });
    }

    console.log('Purchase found:', {
      id: purchase._id,
      status: purchase.status,
      transactionId: purchase.transactionId
    });

    // If purchase is already completed, return success immediately (webhook may have already processed it)
    if (purchase.status === 'completed') {
      console.log('Purchase already completed (likely from webhook), returning success');
      
      // Ensure books are in library (webhook/redirect may have done this, but double-check)
      const checkoutMetadata = purchase.nombaData?.metadata ||
                              purchase.nombaData?.fullResponse?.metadata ||
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
            console.log('Book added to user library (verification check):', bookId);
          }
        }
        const { removeBooksFromUserCart } = require('../utils/cartHelpers');
        await removeBooksFromUserCart(purchase.user.toString(), bookIds);
      }
      
      return res.json({
        success: true,
        status: 'completed',
        message: 'Payment already verified',
        purchase: purchase,
      });
    }

    // If purchase is already marked as cancelled or failed, don't verify with Nomba
    if (purchase.status === 'cancelled' || purchase.status === 'failed') {
      console.log('Purchase already marked as:', purchase.status);
      return res.json({
        success: false,
        status: purchase.status,
        message: `Payment was ${purchase.status}`,
        purchase: purchase,
      });
    }

    // Try to verify with Nomba - but first check if we have a paymentReference from webhook
    // Nomba might use a different reference for verification than our orderReference
    let verificationReference = reference;
    
    // If we have a paymentReference from webhook, try that first
    if (purchase.paymentReference && purchase.paymentReference !== reference) {
      console.log('Trying verification with paymentReference from webhook:', purchase.paymentReference);
      verificationReference = purchase.paymentReference;
    }
    
    console.log('Verifying with Nomba API using reference:', verificationReference);
    let verificationResult = await verifyTransaction(verificationReference);
    
    // If verification fails with our reference, and we have a different paymentReference, try that
    if (!verificationResult.success && purchase.paymentReference && purchase.paymentReference !== verificationReference) {
      console.log('First verification failed, trying with paymentReference:', purchase.paymentReference);
      verificationResult = await verifyTransaction(purchase.paymentReference);
    }
    
    console.log('Nomba verification result:', {
      success: verificationResult.success,
      hasData: !!verificationResult.data,
      dataKeys: verificationResult.data ? Object.keys(verificationResult.data) : [],
      usedReference: verificationReference
    });

    if (!verificationResult.success) {
      console.log('Nomba verification failed:', verificationResult.error);

      // Re-fetch purchase: redirect or webhook may have completed it after we first loaded
      let freshPurchase = await Purchase.findById(purchase._id);
      if (freshPurchase && freshPurchase.status === 'completed') {
        console.log('Purchase was completed by redirect/webhook; returning success');
        const meta = freshPurchase.nombaData?.metadata || freshPurchase.nombaData?.fullResponse?.metadata;
        if (meta && meta.bookIds) {
          const ids = Array.isArray(meta.bookIds) ? meta.bookIds : [meta.bookIds];
          const { removeBooksFromUserCart } = require('../utils/cartHelpers');
          await removeBooksFromUserCart(freshPurchase.user.toString(), ids);
        }
        return res.json({
          success: true,
          status: 'completed',
          message: 'Payment already verified',
          purchase: freshPurchase,
        });
      }

      // If purchase is still pending, webhook may be delayed. Wait and re-check once before failing.
      if (freshPurchase && freshPurchase.status === 'pending') {
        const waitMs = 2500;
        console.log('Purchase still pending; waiting', waitMs, 'ms for webhook then re-checking...');
        await new Promise((r) => setTimeout(r, waitMs));
        freshPurchase = await Purchase.findById(purchase._id);
        if (freshPurchase && freshPurchase.status === 'completed') {
          console.log('Purchase completed by webhook during wait; returning success');
          const meta = freshPurchase.nombaData?.metadata || freshPurchase.nombaData?.fullResponse?.metadata;
          if (meta && meta.bookIds) {
            const ids = Array.isArray(meta.bookIds) ? meta.bookIds : [meta.bookIds];
            const { removeBooksFromUserCart } = require('../utils/cartHelpers');
            await removeBooksFromUserCart(freshPurchase.user.toString(), ids);
          }
          return res.json({
            success: true,
            status: 'completed',
            message: 'Payment verified',
            purchase: freshPurchase,
          });
        }
      }

      // If verification fails with 404, it might mean:
      // 1. Payment was cancelled (transaction doesn't exist in Nomba)
      // 2. Webhook hasn't arrived yet but payment is processing
      // 3. Nomba uses a different reference format
      const purchaseToUpdate = freshPurchase || purchase;
      const purchaseAge = Date.now() - new Date(purchaseToUpdate.createdAt).getTime();
      const fiveMinutes = 5 * 60 * 1000;

      if (purchaseToUpdate.status === 'pending' && purchaseAge > fiveMinutes) {
        purchaseToUpdate.status = 'cancelled';
        await purchaseToUpdate.save();
        console.log('Purchase status updated to cancelled (old pending purchase)');
      } else if (purchaseToUpdate.status === 'pending') {
        console.log('Purchase still pending, webhook may arrive soon. Age:', purchaseAge, 'ms');
      }

      return res.status(400).json({
        success: false,
        message: 'Transaction verification failed. If payment was successful, please wait a moment and refresh.',
        error: verificationResult.error,
        purchaseStatus: purchaseToUpdate.status,
        retrySuggested: purchaseToUpdate.status === 'pending',
        note: purchaseToUpdate.status === 'pending' ? 'Payment may still be processing. Webhook will update status automatically.' : undefined
      });
    }

    // Update purchase with verification data
    purchase.nombaData = {
      ...(purchase.nombaData || {}),
      verification: verificationResult.data,
    };

    // Extract transaction data - handle different response structures
    // Nomba checkout/transaction endpoint returns top-level { code, description, data }
    // where data contains { order, transactionDetails, ... }.
    const rootData = verificationResult.data || {};
    const transactionData = rootData.data || rootData || {};
    const orderData = transactionData.order || transactionData;
    const transactionDetails = transactionData.transactionDetails || transactionData.transaction || {};

    const nombaCode = rootData.code || transactionData.code;
    const nombaDescription = rootData.description || transactionData.description;
    const nombaSuccessFlag = transactionData.success === true || transactionData.success === 'true';
    const statusCode = transactionDetails.statusCode || transactionDetails.status || '';

    console.log('Transaction data structure:', {
      hasRootData: !!rootData,
      hasInnerData: !!transactionData,
      hasOrder: !!orderData,
      nombaCode,
      nombaDescription,
      successFlag: nombaSuccessFlag,
      statusFromOrder: orderData?.status || orderData?.paymentStatus,
      statusFromDetails: statusCode,
      hasMetadata: !!(orderData?.metadata || transactionData?.metadata),
    });

    // Check if payment was successful - handle various status formats
    // 1) Primary signal from Nomba: code === '00' or inner.success === true/'true'
    // 2) statusCode in transactionDetails often contains "Payment approved" or similar
    // 3) Fallback to any explicit status fields we already checked before
    const paymentStatus = orderData?.status || 
                         orderData?.paymentStatus || 
                         transactionData?.status || 
                         transactionData?.paymentStatus || 
                         transactionData?.orderStatus ||
                         statusCode;
    
    const isSuccessful =
      nombaCode === '00' ||
      nombaSuccessFlag ||
      /approved|success/i.test(statusCode || '') ||
      paymentStatus === 'success' ||
      paymentStatus === 'completed' ||
      paymentStatus === 'paid' ||
      paymentStatus === 'SUCCESS' ||
      paymentStatus === 'COMPLETED' ||
      orderData?.paid === true ||
      transactionData?.paid === true;
    
    console.log('Payment status check:', {
      paymentStatus,
      statusCode,
      nombaCode,
      nombaDescription,
      nombaSuccessFlag,
      isSuccessful,
      orderDataKeys: orderData ? Object.keys(orderData) : [],
      transactionDataKeys: transactionData ? Object.keys(transactionData) : []
    });

    if (isSuccessful) {
      console.log('Payment successful, updating purchase and adding books to library');
      purchase.status = 'completed';
      purchase.paymentReference = reference;

      // Get bookIds from transaction metadata OR purchase metadata (stored during checkout)
      let bookIds = [];
      
      // Try to get from order metadata first, then transaction metadata
      const metadata = orderData?.metadata || transactionData?.metadata || {};
      
      if (metadata.bookIds) {
        bookIds = Array.isArray(metadata.bookIds) 
          ? metadata.bookIds 
          : [metadata.bookIds];
      } else if (metadata.bookId) {
        bookIds = [metadata.bookId];
      }
      
      // If not in transaction metadata, get from purchase's stored metadata
      if (bookIds.length === 0 && purchase.nombaData && purchase.nombaData.fullResponse) {
        const checkoutMetadata = purchase.nombaData.fullResponse?.metadata || purchase.nombaData.fullResponse?.data?.metadata;
        if (checkoutMetadata && checkoutMetadata.bookIds) {
          bookIds = Array.isArray(checkoutMetadata.bookIds) 
            ? checkoutMetadata.bookIds 
            : [checkoutMetadata.bookIds];
        }
      }
      
      // Fallback: if we still don't have bookIds, check the purchase model (legacy field)
      if (bookIds.length === 0 && purchase.book) {
        bookIds = [purchase.book.toString()];
      }

      console.log('Book IDs to add to library:', bookIds);

      // Add books to user library
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
          console.log('Book added to user library:', bookId);
        } else {
          console.log('Book already in library:', bookId);
        }
      }
      const { removeBooksFromUserCart } = require('../utils/cartHelpers');
      await removeBooksFromUserCart(purchase.user.toString(), bookIds);
    } else {
      console.log('Payment not successful, status:', paymentStatus);
      // If status is not successful but we got a response, update purchase with the status
      if (paymentStatus) {
        purchase.status = paymentStatus === 'pending' ? 'pending' : 'failed';
      }
    }

    await purchase.save();
    console.log('Purchase saved with status:', purchase.status);

    res.json({
      success: purchase.status === 'completed',
      status: purchase.status,
      purchase: purchase,
      transaction: verificationResult.data,
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      success: false,
      message: 'Payment verification failed', 
      error: error.message 
    });
  }
});

module.exports = router;
