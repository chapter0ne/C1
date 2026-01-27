const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  fullName: { type: String },
  bio: { type: String },
  avatarUrl: { type: String },
  roles: { type: [String], enum: ['admin', 'reader'], default: ['reader'] },
  
  // Streak system
  streakCount: { type: Number, default: 0 },
  lastLoginDate: { type: Date },
  streakStartDate: { type: Date },
  
  // Social features
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  
  // Profile stats
  totalBooksRead: { type: Number, default: 0 },
  totalPagesRead: { type: Number, default: 0 },
  joinDate: { type: Date, default: Date.now },
  
  // Preferences
  readingPreferences: {
    favoriteGenres: [{ type: String }],
    readingGoal: { type: Number, default: 0 }, // books per year
    notificationsEnabled: { type: Boolean, default: true }
  }
}, { timestamps: true });

userSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

// Virtual for follower count (guard when only partial fields are loaded, e.g. populate('user', 'username'))
userSchema.virtual('followerCount').get(function() {
  return Array.isArray(this.followers) ? this.followers.length : 0;
});

// Virtual for following count
userSchema.virtual('followingCount').get(function() {
  return Array.isArray(this.following) ? this.following.length : 0;
});

userSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('User', userSchema); 