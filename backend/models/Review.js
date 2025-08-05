const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  reviewText: { type: String },
}, { timestamps: true });

reviewSchema.virtual('id').get(function () {
  return this._id.toHexString();
});
reviewSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Review', reviewSchema); 