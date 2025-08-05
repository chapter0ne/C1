const cloudinary = require('../config/cloudinary');

/**
 * Delete an image from Cloudinary
 * @param {string} publicId - The public ID of the image
 * @returns {Promise<Object>} - Result of the deletion operation
 */
const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return { success: true, result };
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Extract public ID from Cloudinary URL
 * @param {string} url - Cloudinary URL
 * @returns {string|null} - Public ID or null if not found
 */
const extractPublicId = (url) => {
  if (!url || typeof url !== 'string') return null;
  
  // Match Cloudinary URL pattern
  const match = url.match(/\/upload\/[^\/]+\/([^\/]+)$/);
  if (match) {
    // Remove file extension
    return match[1].replace(/\.[^/.]+$/, '');
  }
  
  return null;
};

/**
 * Generate optimized Cloudinary URL with transformations
 * @param {string} publicId - The public ID of the image
 * @param {Object} options - Transformation options
 * @returns {string} - Optimized Cloudinary URL
 */
const generateOptimizedUrl = (publicId, options = {}) => {
  const defaultOptions = {
    width: 400,
    height: 600,
    crop: 'fill',
    gravity: 'auto',
    quality: 'auto',
    fetch_format: 'auto'
  };
  
  const transformationOptions = { ...defaultOptions, ...options };
  
  return cloudinary.url(publicId, {
    transformation: [transformationOptions]
  });
};

module.exports = {
  deleteImage,
  extractPublicId,
  generateOptimizedUrl
}; 