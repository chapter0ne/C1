const express = require('express');
const Book = require('../models/Book');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const timeout = require('../middleware/timeout');
const router = express.Router();

// Apply timeout middleware to all routes (30 seconds)
router.use(timeout(30000));

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

// Create book (admin only)
router.post('/', authMiddleware, adminOnly, async (req, res) => {
  try {
    const book = new Book({ ...req.body, createdBy: req.user.userId });
    await book.save();

    // Save chapters if provided
    if (Array.isArray(req.body.chapters)) {
      const Chapter = require('../models/Chapter');
      for (const chapter of req.body.chapters) {
        await new Chapter({
          book: book._id,
          title: chapter.title,
          content: chapter.content
        }).save();
      }
    }

    res.status(201).json(book);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all books (admin) or only published (public), with search support
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { search, category, price, all } = req.query;
    const filter = {};
    if (!(all === 'true' && req.user && req.user.roles.includes('admin'))) {
      filter.status = 'published';
    }
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
        { genre: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } } // Add tags to search
      ];
    }
    if (category && category !== 'All') {
      // Filter by both genre and tags for better categorization
      filter.$or = [
        { genre: { $regex: category, $options: 'i' } },
        { tags: { $regex: category, $options: 'i' } }
      ];
    }
    if (price && price !== 'All') {
      if (price === 'Paid') filter.isFree = false;
      if (price === 'Free') filter.isFree = true;
    }
    const books = await Book.find(filter);
    res.json(books);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Public endpoint for reading app to fetch published books (no auth required)
router.get('/public', async (req, res) => {
  try {
    const { search, category, price } = req.query;
    const filter = { status: 'published' };
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
        { genre: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }
    if (category && category !== 'All') {
      filter.$or = [
        { genre: { $regex: category, $options: 'i' } },
        { tags: { $regex: category, $options: 'i' } }
      ];
    }
    if (price && price !== 'All') {
      if (price === 'Paid') filter.isFree = false;
      if (price === 'Free') filter.isFree = true;
    }
    
    const books = await Book.find(filter).select('title author genre coverImageUrl isFree price rating totalRatings averageRating tags');
    res.json(books);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Enhanced search/filter endpoint for books
router.get('/search', authMiddleware, async (req, res) => {
  try {
    const { search, category, price } = req.query;
    const filter = { status: 'published' };
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
        { genre: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } } // Add tags to search
      ];
    }
    if (category && category !== 'All') {
      // Filter by both genre and tags for better categorization
      filter.$or = [
        { genre: { $regex: category, $options: 'i' } },
        { tags: { $regex: category, $options: 'i' } }
      ];
    }
    if (price && price !== 'All') {
      if (price === 'Paid') filter.isFree = false;
      if (price === 'Free') filter.isFree = true;
    }
    const books = await Book.find(filter);
    res.json(books);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get book by ID (public if published, admin can get any)
router.get('/:id', authMiddleware, async (req, res) => {
  const book = await Book.findById(req.params.id);
  if (!book) return res.status(404).json({ message: 'Book not found' });
  if (book.status !== 'published' && !req.user.roles.includes('admin')) {
    return res.status(403).json({ message: 'Not authorized' });
  }
  res.json(book);
});

// Get chapters for a book
router.get('/:id/chapters', async (req, res) => {
  try {
    const Chapter = require('../models/Chapter');
    const chapters = await Chapter.find({ book: req.params.id }).sort('chapterOrder');
    res.json(chapters);
  } catch (err) {
    console.error('Error fetching chapters:', err);
    res.status(500).json({ message: 'Error fetching chapters' });
  }
});

// Update book (admin only)
router.put('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    console.log('Backend: Book update request received for ID:', req.params.id);
    console.log('Backend: Update data received:', req.body);
    
    const updateData = { ...req.body };
    // If isFree is set, ensure price is 0
    if (typeof updateData.isFree !== 'undefined') {
      updateData.isFree = !!updateData.isFree;
      if (updateData.isFree) {
        updateData.price = 0;
      }
    }
    // If price is set, ensure isFree is false if price > 0
    if (typeof updateData.price !== 'undefined' && Number(updateData.price) > 0) {
      updateData.isFree = false;
      updateData.price = Number(updateData.price);
    }
    
    console.log('Backend: Processed update data:', updateData);
    
    const book = await Book.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!book) {
      console.log('Backend: Book not found with ID:', req.params.id);
      return res.status(404).json({ message: 'Book not found' });
    }
    
    console.log('Backend: Book updated successfully:', book);
    res.json(book);
  } catch (err) {
    console.error('Backend: Error updating book:', err);
    res.status(500).json({ message: err.message });
  }
});

// Delete book (admin only)
router.delete('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    console.log('Delete book request started:', { 
      bookId: req.params.id, 
      userId: req.user.userId,
      userRoles: req.user.roles,
      timestamp: new Date().toISOString()
    });
    
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      console.log('Invalid ObjectId format:', req.params.id);
      return res.status(400).json({ message: 'Invalid book ID format' });
    }
    
    // Check if book exists before deletion
    const existingBook = await Book.findById(req.params.id);
    if (!existingBook) {
      console.log('Book not found for deletion:', req.params.id);
      return res.status(404).json({ message: 'Book not found' });
    }
    
    console.log('Book found, proceeding with deletion:', {
      bookId: existingBook._id,
      title: existingBook.title,
      status: existingBook.status
    });
    
    // Delete the book
    const deleteResult = await Book.findByIdAndDelete(req.params.id);
    console.log('Book deletion completed:', {
      bookId: req.params.id,
      deleteResult: deleteResult ? 'success' : 'failed',
      timestamp: new Date().toISOString()
    });
    
    if (!deleteResult) {
      console.log('Book deletion failed - no result returned');
      return res.status(500).json({ message: 'Failed to delete book' });
    }
    
    // Also delete associated chapters if they exist
    try {
      const Chapter = require('../models/Chapter');
      const chapterDeleteResult = await Chapter.deleteMany({ book: req.params.id });
      console.log('Associated chapters deleted:', {
        bookId: req.params.id,
        chaptersDeleted: chapterDeleteResult.deletedCount
      });
    } catch (chapterError) {
      console.warn('Warning: Could not delete associated chapters:', chapterError.message);
      // Don't fail the main deletion if chapter deletion fails
    }
    
    console.log('Book deletion process completed successfully');
    res.json({ 
      message: 'Book deleted successfully',
      bookId: req.params.id,
      title: existingBook.title,
      chaptersDeleted: true
    });
    
  } catch (err) {
    console.error('Delete book error occurred:', {
      bookId: req.params.id,
      error: err.message,
      stack: err.stack,
      timestamp: new Date().toISOString()
    });
    
    // Send appropriate error response
    if (err.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid book ID format' });
    }
    
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation error: ' + err.message });
    }
    
    res.status(500).json({ 
      message: 'Internal server error during book deletion',
      error: process.env.NODE_ENV === 'development' ? err.message : 'An error occurred'
    });
  }
});

module.exports = router; 