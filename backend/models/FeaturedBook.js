const mongoose = require('mongoose');

const featuredBookSchema = new mongoose.Schema({
  book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
  category: { type: String, enum: ['bestseller', 'editor_pick'], required: true },
  featuredAt: { type: Date, default: Date.now },
  featuredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  displayOrder: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('FeaturedBook', featuredBookSchema); 