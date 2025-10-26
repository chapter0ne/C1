const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  description: { type: String },
  genre: { type: String },
  tags: [{ type: String }], // Add tags array for multiple categories
  isbn: { type: String },
  price: { type: Number, default: 0 },
  isFree: { type: Boolean, default: false },
  coverImageUrl: { type: String },
  
  // EPUB-specific fields
  epubFileUrl: { type: String }, // Cloudinary URL for the EPUB file
  epubPublicId: { type: String }, // Cloudinary public ID for management
  epubMetadata: {
    language: String,
    publisher: String,
    publicationDate: Date,
    isbn: String,
    rights: String,
    description: String,
    tableOfContents: [{
      title: String,
      href: String,
      level: Number
    }]
  },
  
  status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },
  rating: { type: Number, default: 5.0, min: 0, max: 5 }, // Default 5 stars
  totalRatings: { type: Number, default: 0 }, // Count of ratings
  averageRating: { type: Number, default: 5.0, min: 0, max: 5 }, // Cumulative average
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
  // Author social media links
  authorSocials: {
    instagram: { type: String, trim: true, default: '' },
    twitter: { type: String, trim: true, default: '' },
    tiktok: { type: String, trim: true, default: '' }
  },
}, { timestamps: true });

bookSchema.virtual('id').get(function () {
  return this._id.toHexString();
});
bookSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Book', bookSchema); 