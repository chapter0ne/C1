const Review = require('../models/Review');
const { resolveBookId } = require('../utils/resolveBookId');

exports.createReview = async (req, res, next) => {
  try {
    const bookIdResolved = await resolveBookId(req.body.book);
    if (!bookIdResolved) return res.status(404).json({ message: 'Book not found' });
    const userId = req.user.userId;
    const { rating, reviewText } = req.body;

    const existingReview = await Review.findOne({ user: userId, book: bookIdResolved });
    if (existingReview) {
      return res.status(400).json({ 
        message: 'You have already reviewed this book. Only one review per book is allowed.' 
      });
    }

    // Validate review text length (280 characters max)
    if (reviewText && reviewText.length > 280) {
      return res.status(400).json({ 
        message: 'Review text cannot exceed 280 characters.' 
      });
    }

    const review = new Review({ 
      book: bookIdResolved, 
      rating, 
      reviewText: reviewText || '', 
      user: userId 
    });
    await review.save();
    
    await Review.updateBookRating(bookIdResolved);
    
    res.status(201).json(review);
  } catch (err) {
    if (err.code === 11000) {
      // Duplicate key error (if unique index exists)
      return res.status(400).json({ 
        message: 'You have already reviewed this book. Only one review per book is allowed.' 
      });
    }
    next(err);
  }
};

exports.getUserReview = async (req, res, next) => {
  try {
    const bookIdResolved = await resolveBookId(req.params.bookId);
    if (!bookIdResolved) return res.json(null);
    const userId = req.user.userId;
    const review = await Review.findOne({ user: userId, book: bookIdResolved });
    res.json(review || null);
  } catch (err) {
    next(err);
  }
};

exports.getReviewsByBook = async (req, res, next) => {
  try {
    const bookIdResolved = await resolveBookId(req.params.bookId);
    if (!bookIdResolved) return res.json([]);
    const reviews = await Review.find({ book: bookIdResolved }).populate('user', 'username').sort({ createdAt: -1 });
    res.json(reviews || []);
  } catch (err) {
    next(err);
  }
};

exports.updateReview = async (req, res, next) => {
  try {
    // Validate review text length if provided
    if (req.body.reviewText && req.body.reviewText.length > 280) {
      return res.status(400).json({ 
        message: 'Review text cannot exceed 280 characters.' 
      });
    }

    const review = await Review.findOneAndUpdate(
      { _id: req.params.id, user: req.user.userId },
      req.body,
      { new: true }
    );
    if (!review) return res.status(404).json({ message: 'Review not found or not authorized' });
    
    // Update book rating after updating review
    await Review.updateBookRating(review.book);
    
    res.json(review);
  } catch (err) {
    next(err);
  }
};

exports.deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findOneAndDelete({ _id: req.params.id, user: req.user.userId });
    if (!review) return res.status(404).json({ message: 'Review not found or not authorized' });
    res.json({ message: 'Review deleted' });
  } catch (err) {
    next(err);
  }
}; 