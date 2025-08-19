const uploadConfig = require('../config/upload');

// Middleware to handle large file uploads
const largeUploadHandler = (req, res, next) => {
  // Set appropriate headers for large uploads
  res.set({
    'X-Accel-Buffering': 'no', // Disable nginx buffering for large uploads
    'Connection': 'keep-alive'
  });

  // Track upload progress for large files
  let uploadedBytes = 0;
  const contentLength = parseInt(req.headers['content-length'] || '0');
  
  if (contentLength > 10 * 1024 * 1024) { // Only track files larger than 10MB
    console.log(`Large upload detected: ${(contentLength / (1024 * 1024)).toFixed(2)}MB`);
    
    req.on('data', (chunk) => {
      uploadedBytes += chunk.length;
      const progress = ((uploadedBytes / contentLength) * 100).toFixed(2);
      
      // Log progress every 10%
      if (Math.floor(progress) % 10 === 0) {
        console.log(`Upload progress: ${progress}% (${(uploadedBytes / (1024 * 1024)).toFixed(2)}MB / ${(contentLength / (1024 * 1024)).toFixed(2)}MB)`);
      }
    });
  }

  // Set timeout for large uploads
  req.setTimeout(uploadConfig.timeouts.uploadTimeout);
  res.setTimeout(uploadConfig.timeouts.uploadTimeout);

  next();
};

// Middleware to validate upload size before processing
const validateUploadSize = (req, res, next) => {
  const contentLength = parseInt(req.headers['content-length'] || '0');
  
  if (contentLength > uploadConfig.maxBodySize) {
    return res.status(413).json({
      error: 'File too large',
      message: `Maximum allowed size is ${(uploadConfig.maxBodySize / (1024 * 1024 * 1024)).toFixed(1)}GB. Your file is ${(contentLength / (1024 * 1024 * 1024)).toFixed(1)}GB.`,
      maxSize: uploadConfig.maxBodySize,
      actualSize: contentLength
    });
  }

  next();
};

module.exports = {
  largeUploadHandler,
  validateUploadSize
};
