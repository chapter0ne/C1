const cloudinary = require('../config/cloudinary');
const fs = require('fs');
const path = require('path');

const uploadEpubToCloudinary = async (filePath, options = {}) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: 'raw',
      folder: 'epubs',
      public_id: `epub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      format: 'epub',
      ...options
    });
    
    return {
      url: result.secure_url,
      publicId: result.public_id,
      size: result.bytes
    };
  } catch (error) {
    console.error('Error uploading EPUB to Cloudinary:', error);
    throw new Error('Failed to upload EPUB file');
  }
};

const parseEpubMetadata = async (filePath) => {
  try {
    // For now, return basic metadata structure
    // We can enhance this later with proper EPUB parsing
    const fileName = path.basename(filePath, '.epub');
    
    return {
      language: 'en',
      publisher: '',
      publicationDate: null,
      isbn: '',
      rights: '',
      description: `EPUB file: ${fileName}`,
      tableOfContents: []
    };
  } catch (error) {
    console.error('Error parsing EPUB metadata:', error);
    throw new Error('Failed to parse EPUB file');
  }
};

const extractCoverImage = async (filePath) => {
  try {
    // For now, return null for cover image
    // We can enhance this later with proper EPUB parsing
    return null;
  } catch (error) {
    console.error('Error extracting cover image:', error);
    return null;
  }
};

// Generate signed URL for EPUB access (optional security feature)
const generateSignedEpubUrl = (publicId, options = {}) => {
  return cloudinary.url(publicId, {
    resource_type: 'raw',
    sign_url: true,
    expires_at: Math.floor(Date.now() / 1000) + (60 * 60), // 1 hour expiry
    ...options
  });
};

module.exports = {
  uploadEpubToCloudinary,
  parseEpubMetadata,
  extractCoverImage,
  generateSignedEpubUrl
};
