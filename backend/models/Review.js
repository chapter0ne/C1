const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  reviewText: { type: String },
}, { timestamps: true });

// Method to update book rating when review is added/updated/deleted
reviewSchema.statics.updateBookRating = async function(bookId) {
  const Book = require('./Book');
  
  const stats = await this.aggregate([
    { $match: { book: bookId } },
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
    await Book.findByIdAndUpdate(bookId, {
      totalRatings,
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
      rating: Math.round(averageRating * 10) / 10 // Keep rating field for backward compatibility
    });
  } else {
    // No reviews, reset to default
    await Book.findByIdAndUpdate(bookId, {
      totalRatings: 0,
      averageRating: 5.0,
      rating: 5.0
    });
  }
};

// Pre-save middleware to update book rating
reviewSchema.pre('save', async function(next) {
  if (this.isNew || this.isModified('rating')) {
    await this.constructor.updateBookRating(this.book);
  }
  next();
});

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