const express = require('express');
const { authMiddleware, adminOnly } = require('../middleware/auth');
const userLibraryController = require('../controllers/userLibraryController');
const router = express.Router();

// User routes (require authentication)
router.post('/', authMiddleware, userLibraryController.addToLibrary);
router.delete('/:bookId', authMiddleware, userLibraryController.removeFromLibrary);
router.get('/my', authMiddleware, userLibraryController.getUserLibrary);
router.put('/:bookId/progress', authMiddleware, userLibraryController.updateReadingProgress);

// Admin routes (require admin role)
router.get('/book/:bookId/count', authMiddleware, adminOnly, userLibraryController.getBookLibraryCount);
router.get('/book/:bookId/stats', authMiddleware, adminOnly, userLibraryController.getBookDetailedStats);
router.get('/top-books', authMiddleware, adminOnly, userLibraryController.getTopBooksByLibraryCount);
router.get('/', authMiddleware, adminOnly, userLibraryController.getAllLibraryEntries);

module.exports = router; 