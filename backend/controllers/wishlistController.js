const Wishlist = require('../models/Wishlist');
const Book = require('../models/Book');
const User = require('../models/User');

// Add book to wishlist
exports.addToWishlist = async (req, res) => {
  try {
    const { bookId } = req.params;
    const userId = req.user.userId; // Changed from req.user.id to req.user.userId
    const { notes } = req.body;

    console.log('addToWishlist debug:', { bookId, userId, user: req.user });

    // Check if book exists
    const book = await Book.findById(bookId);
    if (!book) {
      console.log('Book not found:', bookId);
      return res.status(404).json({ message: 'Book not found' });
    }

    // Check if already in wishlist
    const existingWishlistItem = await Wishlist.findOne({ user: userId, book: bookId });
    if (existingWishlistItem) {
      console.log('Book already in wishlist:', { bookId, userId });
      return res.status(400).json({ message: 'Book is already in your wishlist' });
    }

    const wishlistItem = new Wishlist({
      user: userId,
      book: bookId,
      notes
    });

    await wishlistItem.save();
    await wishlistItem.populate('book', 'title author coverImageUrl price isFree');

    console.log('Wishlist item added:', wishlistItem);
    res.status(201).json(wishlistItem);
  } catch (error) {
    console.error('addToWishlist error:', error);
    res.status(500).json({ message: 'Error adding to wishlist', error: error.message });
  }
};

// Remove book from wishlist
exports.removeFromWishlist = async (req, res) => {
  try {
    const { bookId } = req.params;
    const userId = req.user.userId; // Changed from req.user.id to req.user.userId

    console.log('removeFromWishlist debug:', { bookId, userId, user: req.user });

    const wishlistItem = await Wishlist.findOneAndDelete({ user: userId, book: bookId });
    
    if (!wishlistItem) {
      console.log('Wishlist item not found:', { bookId, userId });
      return res.status(404).json({ message: 'Book not found in wishlist' });
    }

    console.log('Wishlist item removed:', wishlistItem);
    res.json({ message: 'Book removed from wishlist' });
  } catch (error) {
    console.error('removeFromWishlist error:', error);
    res.status(500).json({ message: 'Error removing from wishlist', error: error.message });
  }
};

// Get user's wishlist
exports.getWishlist = async (req, res) => {
  try {
    const userId = req.user.userId; // Changed from req.user.id to req.user.userId
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    console.log('getWishlist debug:', { userId, user: req.user });

    const wishlistItems = await Wishlist.find({ user: userId })
      .populate('book', 'title author coverImageUrl price isFree description genre')
      .sort({ addedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Wishlist.countDocuments({ user: userId });

    console.log('getWishlist result:', { 
      userId, 
      total, 
      wishlistItemsCount: wishlistItems.length,
      firstItem: wishlistItems[0] 
    });

    res.json({
      wishlist: wishlistItems,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error('getWishlist error:', error);
    res.status(500).json({ message: 'Error fetching wishlist', error: error.message });
  }
};

// Check if book is in wishlist
exports.checkWishlistStatus = async (req, res) => {
  try {
    const { bookId } = req.params;
    const userId = req.user.userId; // Changed from req.user.id to req.user.userId

    const wishlistItem = await Wishlist.findOne({ user: userId, book: bookId });
    
    res.json({
      isInWishlist: !!wishlistItem,
      wishlistItem: wishlistItem ? {
        id: wishlistItem._id,
        addedAt: wishlistItem.addedAt,
        notes: wishlistItem.notes
      } : null
    });
  } catch (error) {
    res.status(500).json({ message: 'Error checking wishlist status', error: error.message });
  }
};

// Update wishlist item notes
exports.updateWishlistNotes = async (req, res) => {
  try {
    const { bookId } = req.params;
    const userId = req.user.userId; // Changed from req.user.id to req.user.userId
    const { notes } = req.body;

    const wishlistItem = await Wishlist.findOneAndUpdate(
      { user: userId, book: bookId },
      { notes },
      { new: true }
    ).populate('book', 'title author coverImageUrl price isFree');

    if (!wishlistItem) {
      return res.status(404).json({ message: 'Book not found in wishlist' });
    }

    res.json(wishlistItem);
  } catch (error) {
    res.status(500).json({ message: 'Error updating wishlist notes', error: error.message });
  }
};

// Get wishlist statistics
exports.getWishlistStats = async (req, res) => {
  try {
    const userId = req.user.userId; // Changed from req.user.id to req.user.userId

    const totalItems = await Wishlist.countDocuments({ user: userId });
    const freeBooks = await Wishlist.countDocuments({ 
      user: userId,
      'book.isFree': true 
    }).populate('book');
    const paidBooks = totalItems - freeBooks;

    res.json({
      totalItems,
      freeBooks,
      paidBooks,
      estimatedTotalCost: 0 // Would need to calculate based on book prices
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching wishlist stats', error: error.message });
  }
}; 