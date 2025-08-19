// Upload configuration for large book files
const uploadConfig = {
  // File size limits
  maxFileSize: 5 * 1024 * 1024 * 1024, // 5GB
  maxBodySize: 5 * 1024 * 1024 * 1024, // 5GB
  
  // Multer limits
  multer: {
    fileSize: 5 * 1024 * 1024 * 1024, // 5GB
    files: 50, // Allow many files
    fieldSize: 5 * 1024 * 1024 * 1024, // 5GB for form fields
    fieldNameSize: 1000, // Allow long field names
    fieldCount: 1000 // Allow many form fields
  },
  
  // Express body parser limits
  express: {
    json: '5gb',
    urlencoded: '5gb',
    text: '5gb',
    raw: '5gb'
  },
  
  // Timeout settings for large uploads
  timeouts: {
    uploadTimeout: 300000, // 5 minutes in milliseconds
    requestTimeout: 300000, // 5 minutes
    keepAliveTimeout: 300000 // 5 minutes
  },
  
  // Allowed file types for book covers
  allowedImageFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
  
  // Book content limits (for text-based books)
  bookContent: {
    maxChapterSize: 5 * 1024 * 1024 * 1024, // 5GB per chapter
    maxBookSize: 10 * 1024 * 1024 * 1024, // 10GB total book size
    compression: true // Enable compression for large text
  }
};

module.exports = uploadConfig;
