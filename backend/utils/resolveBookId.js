const mongoose = require('mongoose');
const Book = require('../models/Book');

/**
 * Resolve a book identifier that might be either:
 * - a MongoDB ObjectId string, or
 * - a slug string
 *
 * Returns the corresponding Book._id (ObjectId) or null if not found/invalid.
 */
async function resolveBookId(idOrSlug) {
  if (!idOrSlug || (typeof idOrSlug !== 'string' && typeof idOrSlug !== 'number')) {
    return null;
  }

  const raw = String(idOrSlug).trim();
  if (!raw) return null;

  // If it looks like a valid ObjectId, try that first
  if (mongoose.Types.ObjectId.isValid(raw) && String(new mongoose.Types.ObjectId(raw)) === raw) {
    const byId = await Book.findById(raw).select('_id').lean();
    if (byId) return byId._id;
  }

  // Otherwise, treat it as a slug
  const bySlug = await Book.findOne({ slug: raw }).select('_id').lean();
  return bySlug ? bySlug._id : null;
}

module.exports = { resolveBookId };

