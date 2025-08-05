const mongoose = require('mongoose');

const userNotificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: [
      'follow_request',
      'follow_accepted',
      'follow_rejected',
      'admin_announcement',
      'other'
    ],
    required: true
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  data: { type: mongoose.Schema.Types.Mixed },
  isRead: { type: Boolean, default: false }
}, { timestamps: true });

userNotificationSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

userNotificationSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('UserNotification', userNotificationSchema); 