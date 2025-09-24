const mongoose = require('mongoose');

const chapterSchema = new mongoose.Schema({
  book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  order: { type: Number, required: true } // New field for chapter order
}, { timestamps: true });

chapterSchema.virtual('id').get(function () {
  return this._id.toHexString();
});
chapterSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Chapter', chapterSchema);