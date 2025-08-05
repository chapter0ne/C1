const UserLibrary = require('../models/UserLibrary');

exports.addToLibrary = async (req, res, next) => {
  try {
    const { bookId } = req.body;
    const userId = req.user.userId;
    
    // Check if already in library
    const existing = await UserLibrary.findOne({ user: userId, book: bookId });
    if (existing) {
      return res.status(400).json({ message: 'Book already in library' });
    }
    
    const libraryEntry = new UserLibrary({
      user: userId,
      book: bookId
    });
    
    await libraryEntry.save();
    res.status(201).json(libraryEntry);
  } catch (err) {
    next(err);
  }
};

exports.removeFromLibrary = async (req, res, next) => {
  try {
    const { bookId } = req.params;
    const userId = req.user.userId;
    
    const result = await UserLibrary.findOneAndDelete({ user: userId, book: bookId });
    if (!result) {
      return res.status(404).json({ message: 'Book not found in library' });
    }
    
    res.json({ message: 'Book removed from library' });
  } catch (err) {
    next(err);
  }
};

exports.getUserLibrary = async (req, res, next) => {
  try {
    const userId = req.user.userId; // Use userId from JWT
    const library = await UserLibrary.find({ user: userId })
      .populate('book', 'title author genre coverImageUrl isFree price')
      .sort({ addedAt: -1 });
    res.json(library);
  } catch (err) {
    res.json([]); // Always return an array on error
  }
};

exports.updateReadingProgress = async (req, res, next) => {
  try {
    const { bookId } = req.params;
    const { readingStatus, currentChapter, progress } = req.body;
    const userId = req.user.userId;
    
    const libraryEntry = await UserLibrary.findOneAndUpdate(
      { user: userId, book: bookId },
      { readingStatus, currentChapter, progress },
      { new: true }
    );
    
    if (!libraryEntry) {
      return res.status(404).json({ message: 'Book not found in library' });
    }
    
    res.json(libraryEntry);
  } catch (err) {
    next(err);
  }
};

// Admin only - get all library entries for a specific book
exports.getBookLibraryCount = async (req, res, next) => {
  try {
    const { bookId } = req.params;
    const count = await UserLibrary.countDocuments({ book: bookId });
    res.json({ count });
  } catch (err) {
    next(err);
  }
};

// Admin only - get all library entries
exports.getAllLibraryEntries = async (req, res, next) => {
  try {
    const libraryEntries = await UserLibrary.find()
      .populate('user', 'username email')
      .populate('book', 'title author genre')
      .sort({ addedAt: -1 });
    
    res.json(libraryEntries);
  } catch (err) {
    next(err);
  }
}; 