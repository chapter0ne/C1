const mongoose = require('mongoose');

const readingListCommentSchema = new mongoose.Schema({
  readingList: { type: mongoose.Schema.Types.ObjectId, ref: 'ReadingList', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true, maxlength: 500 },
  parentComment: { type: mongoose.Schema.Types.ObjectId, ref: 'ReadingListComment' }, // For replies
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

readingListCommentSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

// Virtual for like count
readingListCommentSchema.virtual('likeCount').get(function() {
  return this.likes.length;
});

readingListCommentSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('ReadingListComment', readingListCommentSchema); 