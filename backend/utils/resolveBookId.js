const mongoose = require('mongoose');
const Book = require('../models/Book');

/**
 * Resolve id or slug to a book's _id (ObjectId). Use for any route that accepts
 * bookId from the client, since the frontend may pass slug (e.g. from /book/my-book-title).
 * @param {string} idOrSlug - Book _id (24 hex) or slug
 * @returns {Promise<mongoose.Types.ObjectId|null>} Book _id or null if not found
 */
async function resolveBookId(idOrSlug) {
  if (!idOrSlug || typeof idOrSlug !== 'string') return null;
  const s = idOrSlug.trim();
  if (!s) return null;
  if (mongoose.Types.ObjectId.isValid(s) && String(new mongoose.Types.ObjectId(s)) === s) {
    const book = await Book.findById(s).select('_id').lean();
    if (book) return book._id;
  }
  const bySlug = await Book.findOne({ slug: s }).select('_id').lean();
  return bySlug ? bySlug._id : null;
}

module.exports = { resolveBookId };
