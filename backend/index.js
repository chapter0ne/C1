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

// 🔥 LOG FIRST to see if requests reach server
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`\n🔵 [${timestamp}] ${req.method} ${req.path}`);
  console.log(`   Origin: ${req.headers.origin || 'no origin'}`);
  console.log(`   Headers:`, JSON.stringify(req.headers, null, 2));
  next();
});

// 🔥 MANUAL CORS - Express 5 compatible, handle ALL origins
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  // ALWAYS set CORS headers, even if no origin (for same-origin requests)
  res.setHeader('Access-Control-Allow-Origin', origin || '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');
  res.setHeader('Access-Control-Max-Age', '86400');
  res.setHeader('Access-Control-Expose-Headers', 'Content-Type, Authorization');
  
  // Handle OPTIONS preflight IMMEDIATELY
  if (req.method === 'OPTIONS') {
    console.log('🚨 OPTIONS preflight handled - returning 204');
    return res.status(204).end();
  }
  
  next();
});

// Also use cors package as backup
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Content-Type', 'Authorization'],
}));

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
const paymentRoutes = require('./routes/payments');
const webhookRoutes = require('./routes/webhooks');

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
app.use('/api/payments', paymentRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/uploads', express.static(require('path').join(__dirname, 'uploads')));
app.use('/api/upload', uploadRoutes);

// Health check endpoint for Render
app.get('/api/health', (req, res) => {
  console.log('✅ Health check endpoint hit!');
  res.status(200).json({ 
    status: 'OK', 
    message: 'ChapterOne Backend is running',
    timestamp: new Date().toISOString()
  });
});

// Simple test endpoint to verify server is receiving requests
app.get('/api/test', (req, res) => {
  console.log('✅ Test endpoint hit!');
  res.status(200).json({ 
    message: 'Backend is working!',
    timestamp: new Date().toISOString(),
    origin: req.headers.origin || 'no origin'
  });
});

app.get('/', (req, res) => {
  res.send('ChapterOne Admin Backend is running');
});

// Error handler (should be last)
app.use(errorHandler);

// Render requires binding to 0.0.0.0 and process.env.PORT — start server first so port is open when Render scans
const PORT = Number(process.env.PORT) || 5000;
const HOST = process.env.PORT ? '0.0.0.0' : (process.env.HOST || 'localhost');

const server = app.listen(PORT, HOST, () => {
  console.log(`\nServer listening on ${HOST}:${PORT} (Render expects 0.0.0.0:PORT)`);
  console.log('Health: /api/health\n');
  // Connect to MongoDB after port is open so Render detects the port immediately
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.error('MongoDB connection error:', err));
});

server.on('error', (err) => {
  console.error('Server failed to bind:', err.message);
  if (err.code === 'EADDRINUSE') console.error(`Port ${PORT} is already in use`);
}); 