const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { authMiddleware } = require('../middleware/auth');

// All routes require authentication
router.use(authMiddleware);

// Get user's cart
router.get('/', cartController.getCart);

// Add book to cart
router.post('/books/:bookId', cartController.addToCart);

// Remove book from cart
router.delete('/books/:bookId', cartController.removeFromCart);

// Update cart item quantity
router.put('/books/:bookId/quantity', cartController.updateCartItemQuantity);

// Clear cart
router.delete('/clear', cartController.clearCart);

// Checkout
router.post('/checkout', cartController.checkout);

// Get cart summary
router.get('/summary', cartController.getCartSummary);

module.exports = router; 