const Review = require('../models/Review');

exports.createReview = async (req, res, next) => {
  try {
    const review = new Review({ ...req.body, user: req.user.userId });
    await review.save();
    res.status(201).json(review);
  } catch (err) {
    next(err);
  }
};

exports.getReviewsByBook = async (req, res, next) => {
  try {
    const reviews = await Review.find({ book: req.params.bookId }).populate('user', 'username');
    res.json(reviews);
  } catch (err) {
    next(err);
  }
};

exports.updateReview = async (req, res, next) => {
  try {
    const review = await Review.findOneAndUpdate(
      { _id: req.params.id, user: req.user.userId },
      req.body,
      { new: true }
    );
    if (!review) return res.status(404).json({ message: 'Review not found or not authorized' });
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