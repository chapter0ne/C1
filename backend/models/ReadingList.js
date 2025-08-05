const mongoose = require('mongoose');

const readingListSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // Books in the list (max 20)
  books: [{
    book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
    addedAt: { type: Date, default: Date.now },
    order: { type: Number, default: 0 }
  }],
  
  // Social features
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isPublic: { type: Boolean, default: true },
  
  // Metadata
  tags: [{ type: String }],
  category: { type: String },
  
  // Stats
  viewCount: { type: Number, default: 0 },
  shareCount: { type: Number, default: 0 }
}, { timestamps: true });

readingListSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

// Virtual for follower count
readingListSchema.virtual('followerCount').get(function() {
  return this.followers.length;
});

// Virtual for book count
readingListSchema.virtual('bookCount').get(function() {
  return this.books.length;
});

// Ensure max 20 books
readingListSchema.pre('save', function(next) {
  if (this.books.length > 20) {
    return next(new Error('Reading list cannot contain more than 20 books'));
  }
  next();
});

readingListSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('ReadingList', readingListSchema); 