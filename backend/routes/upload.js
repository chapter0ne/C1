const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { deleteImage } = require('../utils/cloudinaryUtils');
const uploadConfig = require('../config/upload');

const router = express.Router();

// Configure Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'book-covers',
    allowed_formats: uploadConfig.allowedImageFormats,
    transformation: [
      { width: 400, height: 600, crop: 'fill', gravity: 'auto' },
      { quality: 'auto', fetch_format: 'auto' }
    ]
  }
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    console.log('File filter called with:', file);
    const fileExtension = file.originalname.split('.').pop()?.toLowerCase();
    
    if (!fileExtension || !uploadConfig.allowedImageFormats.includes(fileExtension)) {
      console.log('File format not allowed:', fileExtension);
      return cb(new Error(`File format .${fileExtension} is not allowed. Please use: ${uploadConfig.allowedImageFormats.join(', ')}`));
    }
    
    cb(null, true);
  },
  limits: uploadConfig.multer
});

// POST /api/upload/book-cover
router.post('/book-cover', upload.single('cover'), (err, req, res, next) => {
  if (err) {
    console.error('Multer error:', err);
    return res.status(400).json({ error: err.message });
  }
  next();
}, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Return the Cloudinary URL
    const fileUrl = req.file.path;
    res.json({ 
      url: fileUrl,
      public_id: req.file.filename,
      secure_url: req.file.path.replace('http://', 'https://')
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// DELETE /api/upload/book-cover/:public_id
router.delete('/book-cover/:public_id', async (req, res) => {
  try {
    const { public_id } = req.params;
    
    // Delete from Cloudinary using utility function
    const result = await deleteImage(public_id);
    
    if (result.success) {
      res.json({ message: 'Image deleted successfully' });
    } else {
      res.status(400).json({ error: 'Failed to delete image', details: result.error });
    }
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Delete failed' });
  }
});

// PUT /api/upload/book-cover/update - Update book cover and delete old one
router.put('/book-cover/update', upload.single('cover'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { oldCoverUrl } = req.body;
    
    // If there's an old cover, delete it from Cloudinary
    if (oldCoverUrl) {
      const { extractPublicId } = require('../utils/cloudinaryUtils');
      const oldPublicId = extractPublicId(oldCoverUrl);
      if (oldPublicId) {
        await deleteImage(oldPublicId);
      }
    }

    // Return the new Cloudinary URL
    const fileUrl = req.file.path;
    res.json({ 
      url: fileUrl,
      public_id: req.file.filename,
      secure_url: req.file.path.replace('http://', 'https://')
    });
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ error: 'Update failed' });
  }
});

module.exports = router; 