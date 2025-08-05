const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
  addedAt: { type: Date, default: Date.now },
  notes: { type: String, maxlength: 200 } // Optional notes about why they want this book
}, { timestamps: true });

wishlistSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

// Ensure unique user-book combination
wishlistSchema.index({ user: 1, book: 1 }, { unique: true });

wishlistSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Wishlist', wishlistSchema); 