const express = require('express');
const Book = require('../models/Book');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const timeout = require('../middleware/timeout');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { uploadEpubToCloudinary, parseEpubMetadata, extractCoverImage } = require('../utils/epubUploader');
const router = express.Router();

// Apply timeout middleware to all routes (30 seconds)
router.use(timeout(30000));

// Configure multer for temporary file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/temp/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `epub-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/epub+zip' || 
        path.extname(file.originalname).toLowerCase() === '.epub') {
      cb(null, true);
    } else {
      cb(new Error('Only EPUB files are allowed'), false);
    }
  },
  limits: { 
    fileSize: 50 * 1024 * 1024 // 50MB limit
  }
});

// Auth middleware
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'No token provided' });
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Auth middleware - decoded user:', decoded);
    req.user = decoded;
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    res.status(401).json({ message: 'Invalid token' });
  }
};

const adminOnly = (req, res, next) => {
  console.log('Admin check - user roles:', req.user.roles);
  if (!req.user.roles.includes('admin')) return res.status(403).json({ message: 'Admin only' });
  next();
};

// Create book (admin only)
router.post('/', authMiddleware, adminOnly, async (req, res) => {
  try {
    const book = new Book({ ...req.body, createdBy: req.user.userId });
    await book.save();

    // Save chapters if provided
    if (Array.isArray(req.body.chapters)) {
      const Chapter = require('../models/Chapter');
      for (const chapter of req.body.chapters) {
        await new Chapter({
          book: book._id,
          title: chapter.title,
          content: chapter.content
        }).save();
      }
    }

    res.status(201).json(book);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all books (admin) or only published (public), with search support
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { search, category, price, all } = req.query;
    const filter = {};
    if (!(all === 'true' && req.user && req.user.roles.includes('admin'))) {
      filter.status = 'published';
    }
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
        { genre: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } } // Add tags to search
      ];
    }
    if (category && category !== 'All') {
      // Filter by both genre and tags for better categorization
      filter.$or = [
        { genre: { $regex: category, $options: 'i' } },
        { tags: { $regex: category, $options: 'i' } }
      ];
    }
    if (price && price !== 'All') {
      if (price === 'Paid') filter.isFree = false;
      if (price === 'Free') filter.isFree = true;
    }
    const books = await Book.find(filter);
    res.json(books);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Public endpoint for reading app to fetch published books (no auth required)
router.get('/public', async (req, res) => {
  try {
    const { search, category, price } = req.query;
    const filter = { status: 'published' };
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
        { genre: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }
    if (category && category !== 'All') {
      filter.$or = [
        { genre: { $regex: category, $options: 'i' } },
        { tags: { $regex: category, $options: 'i' } }
      ];
    }
    if (price && price !== 'All') {
      if (price === 'Paid') filter.isFree = false;
      if (price === 'Free') filter.isFree = true;
    }
    
    const books = await Book.find(filter).select('title author genre coverImageUrl isFree price rating totalRatings averageRating tags');
    res.json(books);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Enhanced search/filter endpoint for books
router.get('/search', authMiddleware, async (req, res) => {
  try {
    const { search, category, price } = req.query;
    const filter = { status: 'published' };
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
        { genre: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } } // Add tags to search
      ];
    }
    if (category && category !== 'All') {
      // Filter by both genre and tags for better categorization
      filter.$or = [
        { genre: { $regex: category, $options: 'i' } },
        { tags: { $regex: category, $options: 'i' } }
      ];
    }
    if (price && price !== 'All') {
      if (price === 'Paid') filter.isFree = false;
      if (price === 'Free') filter.isFree = true;
    }
    const books = await Book.find(filter);
    res.json(books);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// One-time backfill: generate slugs for all books that don't have one (admin only).
// Run once so existing books get title-based URLs. New books get slug on create via pre-save.
router.post('/generate-slugs', authMiddleware, adminOnly, async (req, res) => {
  try {
    const books = await Book.find({ $or: [{ slug: { $exists: false } }, { slug: null }, { slug: '' }] });
    let updated = 0;
    for (const book of books) {
      book.slug = await Book.generateUniqueSlug(book.title);
      await book.save();
      updated += 1;
    }
    res.json({ message: `Generated slugs for ${updated} book(s).`, updated });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to generate slugs' });
  }
});

// Resolve id or slug to a book document (for :id routes)
async function findBookByIdOrSlug(idOrSlug) {
  if (!idOrSlug) return null;
  if (mongoose.Types.ObjectId.isValid(idOrSlug) && String(new mongoose.Types.ObjectId(idOrSlug)) === idOrSlug) {
    const byId = await Book.findById(idOrSlug);
    if (byId) return byId;
  }
  return Book.findOne({ slug: idOrSlug });
}

// Get book by ID or slug (public if published, admin can get any). Includes libraryCount (reads) for display.
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    let book = await findBookByIdOrSlug(req.params.id);
    if (!book) return res.status(404).json({ message: 'Book not found' });
    if (book.status !== 'published' && !req.user.roles.includes('admin')) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    if (!book.slug) {
      book.slug = await Book.generateUniqueSlug(book.title);
      await book.save();
    }
    const UserLibrary = require('../models/UserLibrary');
    const libraryCount = await UserLibrary.countDocuments({ book: book._id });
    const out = book.toObject ? book.toObject() : { ...book };
    out.libraryCount = libraryCount;
    res.json(out);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Error fetching book' });
  }
});

// Get chapters for a book
router.get('/:id/chapters', async (req, res) => {
  try {
    const book = await findBookByIdOrSlug(req.params.id);
    if (!book) return res.status(404).json({ message: 'Book not found' });
    const Chapter = require('../models/Chapter');
    const chapters = await Chapter.find({ book: book._id }).sort('chapterOrder');
    res.json(chapters);
  } catch (err) {
    console.error('Error fetching chapters:', err);
    res.status(500).json({ message: 'Error fetching chapters' });
  }
});

// Update book (admin only); id can be _id or slug
router.put('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const existing = await findBookByIdOrSlug(req.params.id);
    if (!existing) return res.status(404).json({ message: 'Book not found' });
    const updateData = { ...req.body };
    if (typeof updateData.isFree !== 'undefined') {
      updateData.isFree = !!updateData.isFree;
      if (updateData.isFree) updateData.price = 0;
    }
    if (typeof updateData.price !== 'undefined' && Number(updateData.price) > 0) {
      updateData.isFree = false;
      updateData.price = Number(updateData.price);
    }
    const book = await Book.findByIdAndUpdate(existing._id, updateData, { new: true });
    if (!book) return res.status(404).json({ message: 'Book not found' });
    res.json(book);
  } catch (err) {
    console.error('Backend: Error updating book:', err);
    res.status(500).json({ message: err.message });
  }
});

// Delete book (admin only); id can be _id or slug
router.delete('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const existingBook = await findBookByIdOrSlug(req.params.id);
    if (!existingBook) return res.status(404).json({ message: 'Book not found' });
    const bookId = existingBook._id;
    const deleteResult = await Book.findByIdAndDelete(bookId);
    if (!deleteResult) return res.status(500).json({ message: 'Failed to delete book' });
    try {
      const Chapter = require('../models/Chapter');
      await Chapter.deleteMany({ book: bookId });
    } catch (chapterError) {
      console.warn('Warning: Could not delete associated chapters:', chapterError.message);
    }
    
    console.log('Book deletion process completed successfully');
    res.json({ 
      message: 'Book deleted successfully',
      bookId: req.params.id,
      title: existingBook.title,
      chaptersDeleted: true
    });
    
  } catch (err) {
    console.error('Delete book error occurred:', {
      bookId: req.params.id,
      error: err.message,
      stack: err.stack,
      timestamp: new Date().toISOString()
    });
    
    // Send appropriate error response
    if (err.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid book ID format' });
    }
    
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation error: ' + err.message });
    }
    
    res.status(500).json({ 
      message: 'Internal server error during book deletion',
      error: process.env.NODE_ENV === 'development' ? err.message : 'An error occurred'
    });
  }
});

// EPUB upload endpoint
router.post('/upload-epub', authMiddleware, adminOnly, upload.single('epub'), async (req, res) => {
  let tempFilePath = null;
  
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No EPUB file uploaded' });
    }

    tempFilePath = req.file.path;
    console.log('Processing EPUB file:', req.file.originalname);
    console.log('Request body data:', {
      title: req.body.title,
      author: req.body.author,
      genre: req.body.genre,
      hasCoverImageUrl: !!req.body.coverImageUrl,
      coverImageUrl: req.body.coverImageUrl,
      hasTags: !!req.body.tags,
      tags: req.body.tags
    });

    // Parse EPUB metadata
    const epubMetadata = await parseEpubMetadata(tempFilePath);
    
    // Extract and upload cover image (or use provided cover URL)
    let coverImageUrl = req.body.coverImageUrl || await extractCoverImage(tempFilePath);
    
    // Upload EPUB to Cloudinary
    const epubUploadResult = await uploadEpubToCloudinary(tempFilePath, {
      tags: ['epub', 'book', req.body.genre || 'general']
    });

    // Parse tags from JSON string if provided
    let bookTags = [];
    if (req.body.tags) {
      try {
        bookTags = JSON.parse(req.body.tags);
      } catch (e) {
        console.warn('Failed to parse tags:', e);
        // If it's a string, split by comma
        if (typeof req.body.tags === 'string') {
          bookTags = req.body.tags.split(',').map(tag => tag.trim());
        }
      }
    }

    // Create book with EPUB data
    const bookData = {
      title: req.body.title || 'Untitled EPUB Book',
      author: req.body.author || 'Unknown Author',
      description: req.body.description || 'EPUB book uploaded',
      genre: req.body.genre || 'General',
      isbn: req.body.isbn || '',
      price: req.body.price ? Number(req.body.price) : 0,
      isFree: req.body.isFree === 'true' || req.body.isFree === true,
      coverImageUrl: coverImageUrl,
      tags: bookTags,
      epubFileUrl: epubUploadResult.url,
      epubPublicId: epubUploadResult.publicId,
      epubMetadata: epubMetadata,
      createdBy: req.user.userId,
      status: req.body.status || 'draft'
    };

    const book = new Book(bookData);
    await book.save();

    console.log('EPUB book created successfully:', book.title);
    console.log('Book saved with data:', {
      id: book._id,
      title: book.title,
      author: book.author,
      coverImageUrl: book.coverImageUrl,
      tags: book.tags,
      epubFileUrl: book.epubFileUrl,
      genre: book.genre
    });

    res.status(201).json({
      message: 'EPUB uploaded successfully',
      book: book
    });

  } catch (error) {
    console.error('EPUB upload error:', error);
    res.status(500).json({ 
      message: 'Failed to process EPUB file',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  } finally {
    // Clean up temporary file
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      try {
        fs.unlinkSync(tempFilePath);
        console.log('Temporary file cleaned up:', tempFilePath);
      } catch (cleanupError) {
        console.error('Error cleaning up temporary file:', cleanupError);
      }
    }
  }
});

// Get EPUB file for reading
router.get('/:id/epub', authMiddleware, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    if (!book.epubFileUrl) {
      return res.status(404).json({ message: 'EPUB file not available' });
    }

    // Check if user has access to the book
    if (book.status !== 'published' && !req.user.roles.includes('admin')) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Return the Cloudinary URL for the EPUB file
    res.json({ 
      epubUrl: book.epubFileUrl,
      title: book.title,
      author: book.author
    });

  } catch (error) {
    console.error('Error fetching EPUB:', error);
    res.status(500).json({ message: 'Failed to fetch EPUB file' });
  }
});

// Delete EPUB file from Cloudinary when book is deleted
router.delete('/:id/epub', authMiddleware, adminOnly, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    if (book.epubPublicId) {
      // Delete from Cloudinary
      const cloudinary = require('../config/cloudinary');
      await cloudinary.uploader.destroy(book.epubPublicId, {
        resource_type: 'raw'
      });
      
      // Update book to remove EPUB references
      book.epubFileUrl = undefined;
      book.epubPublicId = undefined;
      book.epubMetadata = undefined;
      await book.save();
      
      console.log('EPUB file deleted from Cloudinary:', book.epubPublicId);
    }

    res.json({ message: 'EPUB file deleted successfully' });

  } catch (error) {
    console.error('Error deleting EPUB:', error);
    res.status(500).json({ message: 'Failed to delete EPUB file' });
  }
});

module.exports = router; 