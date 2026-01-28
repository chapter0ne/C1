const mongoose = require('mongoose');

function slugify(text) {
  if (!text || typeof text !== 'string') return '';
  return text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'book';
}

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  slug: { type: String, unique: true, sparse: true },
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
}, { timestamps: true });

/** Ensure unique slug: if base slug exists, append -2, -3, ... */
bookSchema.statics.generateUniqueSlug = async function (title) {
  const base = slugify(title);
  let slug = base;
  let n = 2;
  while (await this.findOne({ slug })) {
    slug = `${base}-${n}`;
    n += 1;
  }
  return slug;
};

bookSchema.pre('save', async function (next) {
  if (this.isModified('title') || !this.slug) {
    this.slug = await this.constructor.generateUniqueSlug(this.title);
  }
  next();
});

bookSchema.virtual('id').get(function () {
  return this._id.toHexString();
});
bookSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Book', bookSchema);
module.exports.slugify = slugify; 