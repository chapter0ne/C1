const express = require('express');
const Review = require('../models/Review');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { authMiddleware } = require('../middleware/auth');

// Get user's review for a specific book (authenticated) - must be before /book/:bookId
router.get('/book/:bookId/user', authMiddleware, reviewController.getUserReview);

// Get all reviews for a specific book (public)
router.get('/book/:bookId', reviewController.getReviewsByBook);

// Create a new review (authenticated)
router.post('/', authMiddleware, reviewController.createReview);

// Update a review (authenticated)
router.put('/:id', authMiddleware, reviewController.updateReview);

// Delete a review (authenticated)
router.delete('/:id', authMiddleware, reviewController.deleteReview);

module.exports = router; 

