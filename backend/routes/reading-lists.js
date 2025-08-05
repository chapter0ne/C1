const express = require('express');
const router = express.Router();
const readingListController = require('../controllers/readingListController');
const { authMiddleware } = require('../middleware/auth');

// All routes require authentication
router.use(authMiddleware);

// Create reading list
router.post('/', readingListController.createReadingList);

// Get all reading lists (public)
router.get('/', readingListController.getReadingLists);

// Get specific reading list
router.get('/:id', readingListController.getReadingList);

// Update reading list
router.put('/:id', readingListController.updateReadingList);

// Delete reading list
router.delete('/:id', readingListController.deleteReadingList);

// Follow/unfollow reading list
router.post('/:id/follow', readingListController.toggleFollowReadingList);

// Comments
router.post('/:id/comments', readingListController.addComment);
router.get('/:id/comments', readingListController.getComments);

// Get user's reading lists
router.get('/user/:userId', readingListController.getUserReadingLists);

module.exports = router; 