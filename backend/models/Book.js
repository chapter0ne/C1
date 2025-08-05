const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  description: { type: String },
  genre: { type: String },
  isbn: { type: String },
  price: { type: Number, default: 0 },
  isFree: { type: Boolean, default: false },
  coverImageUrl: { type: String },
  status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

bookSchema.virtual('id').get(function () {
  return this._id.toHexString();
});
bookSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Book', bookSchema); 