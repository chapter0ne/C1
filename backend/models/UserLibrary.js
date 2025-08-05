const mongoose = require('mongoose');

const userLibrarySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
  addedAt: { type: Date, default: Date.now },
  
  // Reading progress
  readingStatus: { 
    type: String, 
    enum: ['not_started', 'reading', 'completed'], 
    default: 'not_started' 
  },
  currentChapter: { type: Number, default: 0 },
  currentPage: { type: Number, default: 0 },
  totalPagesRead: { type: Number, default: 0 },
  readingProgress: { type: Number, default: 0 }, // Percentage 0-100
  
  // Reading session tracking
  lastReadAt: { type: Date },
  totalReadingTime: { type: Number, default: 0 }, // in minutes
  readingSessions: [{
    startTime: { type: Date },
    endTime: { type: Date },
    duration: { type: Number }, // in minutes
    pagesRead: { type: Number, default: 0 }
  }],
  
  // Purchase info
  purchase: { type: mongoose.Schema.Types.ObjectId, ref: 'Purchase' },
  isFreeBook: { type: Boolean, default: false },
  
  // User notes and ratings
  userRating: { type: Number, min: 1, max: 5 },
  userReview: { type: String },
  personalNotes: { type: String },
  
  // Reading goals
  targetCompletionDate: { type: Date },
  isInReadingGoal: { type: Boolean, default: false }
}, { timestamps: true });

userLibrarySchema.virtual('id').get(function () {
  return this._id.toHexString();
});

// Ensure unique user-book combination
userLibrarySchema.index({ user: 1, book: 1 }, { unique: true });

// Calculate reading progress
userLibrarySchema.methods.calculateProgress = function() {
  if (this.totalPagesRead > 0) {
    // This would need to be updated when we have total pages from the book
    this.readingProgress = Math.min(100, (this.totalPagesRead / 100) * 100); // Placeholder calculation
  }
  return this.readingProgress;
};

userLibrarySchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('UserLibrary', userLibrarySchema); 