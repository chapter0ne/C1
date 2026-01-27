const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  reviewText: { type: String, maxlength: 280 },
}, { timestamps: true });

// Ensure one review per user per book
reviewSchema.index({ user: 1, book: 1 }, { unique: true });

// Method to update book rating when review is added/updated/deleted
reviewSchema.statics.updateBookRating = async function(bookId) {
  const Book = require('./Book');
  const objectId = mongoose.Types.ObjectId.isValid(bookId) ? new mongoose.Types.ObjectId(bookId) : bookId;

  const stats = await this.aggregate([
    { $match: { book: objectId } },
    {
      $group: {
        _id: null,
        totalRatings: { $sum: 1 },
        averageRating: { $avg: '$rating' }
      }
    }
  ]);

  if (stats.length > 0) {
    const { totalRatings, averageRating } = stats[0];
    const rounded = Math.round((averageRating || 0) * 10) / 10;
    await Book.findByIdAndUpdate(objectId, {
      totalRatings,
      averageRating: rounded,
      rating: rounded
    });
  } else {
    await Book.findByIdAndUpdate(objectId, {
      totalRatings: 0,
      averageRating: 5.0,
      rating: 5.0
    });
  }
};

// Don't update in pre-save (review not in DB yet). Controller calls updateBookRating after save.

// Pre-remove middleware to update book rating
reviewSchema.pre('remove', async function(next) {
  await this.constructor.updateBookRating(this.book);
  next();
});

reviewSchema.virtual('id').get(function () {
  return this._id.toHexString();
});
reviewSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Review', reviewSchema); 