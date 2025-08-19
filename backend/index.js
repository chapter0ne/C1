const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import configurations
const cloudinary = require('./config/cloudinary');
const uploadConfig = require('./config/upload');
const { largeUploadHandler, validateUploadSize } = require('./middleware/largeUploadHandler');

console.log('MONGODB_URI:', process.env.MONGODB_URI);
console.log('JWT_SECRET:', process.env.JWT_SECRET);
console.log('CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME);
console.log('Upload limits configured:', {
  maxFileSize: `${uploadConfig.maxFileSize / (1024 * 1024 * 1024)}GB`,
  maxBodySize: `${uploadConfig.maxBodySize / (1024 * 1024 * 1024)}GB`
});

const app = express();
app.use(cors());

// Large upload handling middleware
app.use(largeUploadHandler);
app.use(validateUploadSize);

// Increase body parser limits for large book uploads
app.use(express.json({ 
  limit: uploadConfig.express.json
}));
app.use(express.urlencoded({ 
  limit: uploadConfig.express.urlencoded, 
  extended: true 
}));
app.use(express.text({ 
  limit: uploadConfig.express.text
}));
app.use(express.raw({ 
  limit: uploadConfig.express.raw
}));

// Set timeout for large uploads
app.use((req, res, next) => {
  req.setTimeout(uploadConfig.timeouts.uploadTimeout);
  res.setTimeout(uploadConfig.timeouts.uploadTimeout);
  next();
});

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));


const logger = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/auth');
const bookRoutes = require('./routes/books');
const userRoutes = require('./routes/users');
const readerRoutes = require('./routes/reader');
const chapterRoutes = require('./routes/chapters');
const purchaseRoutes = require('./routes/purchases');
const reviewRoutes = require('./routes/reviews');
const notificationRoutes = require('./routes/notifications');
const uploadRoutes = require('./routes/upload');
const featuredBookRoutes = require('./routes/featured-books');
const userLibraryRoutes = require('./routes/userLibrary');
const readingListRoutes = require('./routes/reading-lists');
const wishlistRoutes = require('./routes/wishlist');
const cartRoutes = require('./routes/cart');

app.use(logger);

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reader', readerRoutes);
app.use('/api/chapters', chapterRoutes);
app.use('/api/purchases', purchaseRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/featured-books', featuredBookRoutes);
app.use('/api/user-library', userLibraryRoutes);
app.use('/api/reading-lists', readingListRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/cart', cartRoutes);
app.use('/uploads', express.static(require('path').join(__dirname, 'uploads')));
app.use('/api/upload', uploadRoutes);

app.get('/', (req, res) => {
  res.send('ChapterOne Admin Backend is running');
});

// Error handler (should be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 