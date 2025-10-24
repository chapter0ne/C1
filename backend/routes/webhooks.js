const express = require('express');
const router = express.Router();

// Paystack webhook handler
router.post('/paystack', async (req, res) => {
  try {
    const { event, data } = req.body;
    
    console.log('Paystack webhook received:', { event, reference: data?.reference });
    
    if (event === 'charge.success') {
      const { reference, amount, customer, metadata } = data;
      
      // Find the purchase record by transaction reference
      const Purchase = require('../models/Purchase');
      const purchase = await Purchase.findOne({ transactionId: reference });
      
      if (purchase) {
        // Update purchase status to completed
        purchase.status = 'completed';
        purchase.paymentReference = reference;
        purchase.paystackData = {
          amount: amount / 100, // Paystack amounts are in kobo
          customer,
          metadata
        };
        await purchase.save();
        
        console.log('Purchase marked as completed:', reference);
        
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
              purchasedAt: new Date()
            });
            console.log('Book added to user library:', metadata.bookId);
          }
        }
      } else {
        console.log('Purchase not found for reference:', reference);
      }
    }
    
    res.status(200).json({ status: 'success' });
  } catch (error) {
    console.error('Paystack webhook error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

module.exports = router;










