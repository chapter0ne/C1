const express = require('express');
const FeaturedBook = require('../models/FeaturedBook');
const Book = require('../models/Book');
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

// Get all featured books (with optional category filter)
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    let query = {};
    
    if (category) {
      query.category = category;
    }
    
    const featuredBooks = await FeaturedBook.find(query)
      .populate('book', 'title author genre coverImageUrl isFree price status')
      .populate('featuredBy', 'username email')
      .sort({ displayOrder: 1, featuredAt: -1 });
    
    res.json(featuredBooks);
  } catch (err) {
    console.error('Get featured books error:', err);
    res.status(500).json({ message: err.message });
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
    const populatedFeaturedBook = await FeaturedBook.findById(featuredBook._id)
      .populate('book', 'title author genre coverImageUrl isFree price status')
      .populate('featuredBy', 'username email');
    
    res.status(201).json(populatedFeaturedBook);
  } catch (err) {
    console.error('Add featured book error:', err);
    res.status(500).json({ message: err.message });
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

module.exports = router; 