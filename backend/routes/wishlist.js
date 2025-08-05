const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlistController');
const { authMiddleware } = require('../middleware/auth');

// All routes require authentication
router.use(authMiddleware);

// Add book to wishlist
router.post('/books/:bookId', wishlistController.addToWishlist);

// Remove book from wishlist
router.delete('/books/:bookId', wishlistController.removeFromWishlist);

// Get user's wishlist
router.get('/', wishlistController.getWishlist);

// Check if book is in wishlist
router.get('/books/:bookId/status', wishlistController.checkWishlistStatus);

// Update wishlist item notes
router.put('/books/:bookId/notes', wishlistController.updateWishlistNotes);

// Get wishlist statistics
router.get('/stats', wishlistController.getWishlistStats);

module.exports = router; 