const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { 
    type: String, 
    enum: [
      'streak_update',
      'streak_broken', 
      'new_follower',
      'reading_list_follower',
      'reading_list_comment',
      'admin_announcement',
      'book_recommendation',
      'purchase_success',
      'reading_reminder'
    ], 
    required: true 
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  data: { type: mongoose.Schema.Types.Mixed }, // Additional data like bookId, userId, etc.
  isRead: { type: Boolean, default: false },
  readAt: { type: Date },
  expiresAt: { type: Date }, // For ephemeral notifications
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' }
}, { timestamps: true });

notificationSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

// Auto-delete expired notifications
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Auto-delete read notifications after 30 days
notificationSchema.index({ isRead: 1, updatedAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

notificationSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Notification', notificationSchema); 