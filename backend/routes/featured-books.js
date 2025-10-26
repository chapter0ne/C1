const express = require('express');
const FeaturedBook = require('../models/FeaturedBook');
const Book = require('../models/Book');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const router = express.Router();

// Auth middleware
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'No token provided' });
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Auth middleware - decoded user:', decoded);
    req.user = decoded;
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    res.status(401).json({ message: 'Invalid token' });
  }
};

const adminOnly = (req, res, next) => {
  console.log('Admin check - user roles:', req.user.roles);
  if (!req.user.roles.includes('admin')) return res.status(403).json({ message: 'Admin only' });
  next();
};

// Get all featured books (with optional category filter) - Public endpoint
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    let query = {};
    
    if (category) {
      query.category = category;
    }
    
    let featuredBooks;
    try {
      // Try populate first
      featuredBooks = await FeaturedBook.find(query)
        .populate('book', 'title author genre coverImageUrl isFree price status rating totalRatings averageRating tags')
        .populate('featuredBy', 'username email')
        .sort({ displayOrder: 1, featuredAt: -1 });
    } catch (populateError) {
      console.error('Populate error in GET /featured-books:', populateError);
      
      // Fallback: get raw data and manually populate
      const rawFeaturedBooks = await FeaturedBook.find(query)
        .sort({ displayOrder: 1, featuredAt: -1 })
        .lean();
      
      featuredBooks = [];
      for (const fb of rawFeaturedBooks) {
        try {
          const book = await Book.findById(fb.book)
            .select('title author genre coverImageUrl isFree price status rating totalRatings averageRating tags')
            .lean();
          
          const user = await User.findById(fb.featuredBy)
            .select('username email')
            .lean();
          
          if (book) {
            featuredBooks.push({
              ...fb,
              book: book,
              featuredBy: user || { username: 'Unknown', email: 'unknown@example.com' }
            });
          }
        } catch (itemError) {
          console.log(`Skipping featured book ${fb._id} - error loading data:`, itemError.message);
        }
      }
    }
    
    // Filter out any featured books where the book was deleted
    const validFeaturedBooks = featuredBooks.filter(fb => fb.book && fb.book._id);
    
    // Always return an array, even if empty
    res.json(validFeaturedBooks || []);
  } catch (err) {
    console.error('Get featured books error:', err);
    console.error('Error stack:', err.stack);
    res.status(500).json({ message: err.message || 'Failed to fetch featured books' });
  }
});

// Add a book to featured list (admin only)
router.post('/', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { bookId, category } = req.body;
    
    // Validate required fields
    if (!bookId || !category) {
      return res.status(400).json({ message: 'Book ID and category are required' });
    }
    
    // Validate category
    if (!['bestseller', 'editor_pick'].includes(category)) {
      return res.status(400).json({ message: 'Category must be either "bestseller" or "editor_pick"' });
    }
    
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(bookId)) {
      return res.status(400).json({ message: 'Invalid book ID format' });
    }
    
    // Check if book exists
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    
    // Check if book is already featured in this category
    const existingFeatured = await FeaturedBook.findOne({
      book: bookId,
      category: category
    });
    
    if (existingFeatured) {
      return res.status(400).json({ message: 'Book is already featured in this category' });
    }
    
    // Check limits
    const currentCount = await FeaturedBook.countDocuments({ category });
    const maxBooks = category === 'bestseller' ? 10 : 20;
    
    if (currentCount >= maxBooks) {
      return res.status(400).json({ 
        message: `${category === 'bestseller' ? 'Bestseller' : 'Editor Picks'} list can only contain up to ${maxBooks} books` 
      });
    }
    
    // Create featured book entry
    const featuredBook = new FeaturedBook({
      book: bookId,
      category,
      featuredBy: req.user.userId,
      displayOrder: currentCount + 1
    });
    
    await featuredBook.save();
    
    // Populate and return the created featured book
    try {
      const populatedFeaturedBook = await FeaturedBook.findById(featuredBook._id)
        .populate('book', 'title author genre coverImageUrl isFree price status')
        .populate('featuredBy', 'username email');
      
      res.status(201).json(populatedFeaturedBook);
    } catch (populateError) {
      console.error('Error populating featured book after creation:', populateError);
      // Still return success, but with basic data
      res.status(201).json({
        _id: featuredBook._id,
        book: book,
        category: featuredBook.category,
        featuredBy: req.user.userId,
        displayOrder: featuredBook.displayOrder,
        featuredAt: featuredBook.featuredAt
      });
    }
  } catch (err) {
    console.error('Add featured book error:', err);
    console.error('Error stack:', err.stack);
    res.status(500).json({ message: err.message || 'Failed to add featured book' });
  }
});

// Remove a book from featured list (admin only)
router.delete('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid featured book ID format' });
    }
    
    const featuredBook = await FeaturedBook.findByIdAndDelete(id);
    
    if (!featuredBook) {
      return res.status(404).json({ message: 'Featured book not found' });
    }
    
    // Reorder remaining books in the same category
    await FeaturedBook.updateMany(
      { 
        category: featuredBook.category, 
        displayOrder: { $gt: featuredBook.displayOrder } 
      },
      { $inc: { displayOrder: -1 } }
    );
    
    res.json({ message: 'Featured book removed successfully' });
  } catch (err) {
    console.error('Remove featured book error:', err);
    res.status(500).json({ message: err.message });
  }
});

// Update display order of featured books (admin only)
router.put('/:id/order', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const { displayOrder } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid featured book ID format' });
    }
    
    if (typeof displayOrder !== 'number' || displayOrder < 0) {
      return res.status(400).json({ message: 'Display order must be a non-negative number' });
    }
    
    const featuredBook = await FeaturedBook.findByIdAndUpdate(
      id,
      { displayOrder },
      { new: true }
    ).populate('book', 'title author genre coverImageUrl isFree price status');
    
    if (!featuredBook) {
      return res.status(404).json({ message: 'Featured book not found' });
    }
    
    res.json(featuredBook);
  } catch (err) {
    console.error('Update featured book order error:', err);
    res.status(500).json({ message: err.message });
  }
});

// Clean up featured books with deleted book references (admin only)
router.post('/cleanup', authMiddleware, adminOnly, async (req, res) => {
  try {
    console.log('Starting cleanup of orphaned featured books...');
    
    // Get all featured books
    const allFeaturedBooks = await FeaturedBook.find({}).lean();
    
    let deletedCount = 0;
    const deletedIds = [];
    
    // Check each featured book to see if its referenced book exists
    for (const featuredBook of allFeaturedBooks) {
      try {
        const book = await Book.findById(featuredBook.book);
        if (!book) {
          // Book doesn't exist, delete this featured book entry
          await FeaturedBook.findByIdAndDelete(featuredBook._id);
          deletedCount++;
          deletedIds.push(featuredBook._id);
          console.log(`Deleted orphaned featured book entry ${featuredBook._id}`);
        }
      } catch (err) {
        // Error checking book, assume it doesn't exist
        await FeaturedBook.findByIdAndDelete(featuredBook._id);
        deletedCount++;
        deletedIds.push(featuredBook._id);
        console.log(`Deleted orphaned featured book entry ${featuredBook._id}`);
      }
    }
    
    if (deletedCount === 0) {
      return res.json({ message: 'No orphaned featured book entries found', deletedCount: 0 });
    }
    
    res.json({ 
      message: `Successfully removed ${deletedCount} orphaned featured book entries`, 
      deletedCount,
      deletedIds
    });
  } catch (err) {
    console.error('Cleanup featured books error:', err);
    res.status(500).json({ message: err.message });
  }
});

// Clear all featured books (admin only) - DANGEROUS OPERATION
router.post('/clear-all', authMiddleware, adminOnly, async (req, res) => {
  try {
    console.log('Clearing all featured books...');
    
    // Get count before deletion
    const countBefore = await FeaturedBook.countDocuments();
    console.log(`Found ${countBefore} featured book entries`);
    
    if (countBefore === 0) {
      return res.json({ message: 'No featured books to clear', deletedCount: 0 });
    }
    
    // Delete all featured books
    const result = await FeaturedBook.deleteMany({});
    console.log(`Deleted ${result.deletedCount} featured book entries`);
    
    // Verify deletion
    const countAfter = await FeaturedBook.countDocuments();
    console.log(`Remaining featured book entries: ${countAfter}`);
    
    res.json({ 
      message: `Successfully cleared all featured books`, 
      deletedCount: result.deletedCount,
      countBefore,
      countAfter
    });
  } catch (err) {
    console.error('Clear all featured books error:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router; 