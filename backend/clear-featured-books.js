const mongoose = require('mongoose');
const FeaturedBook = require('./models/FeaturedBook');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/chapterone');
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Clear all featured books
const clearAllFeaturedBooks = async () => {
  try {
    console.log('Clearing all featured books...');
    
    // Get count before deletion
    const countBefore = await FeaturedBook.countDocuments();
    console.log(`Found ${countBefore} featured book entries`);
    
    if (countBefore === 0) {
      console.log('No featured books to clear');
      return;
    }
    
    // Delete all featured books
    const result = await FeaturedBook.deleteMany({});
    console.log(`Deleted ${result.deletedCount} featured book entries`);
    
    // Verify deletion
    const countAfter = await FeaturedBook.countDocuments();
    console.log(`Remaining featured book entries: ${countAfter}`);
    
    if (countAfter === 0) {
      console.log('✅ Successfully cleared all featured books!');
    } else {
      console.log('⚠️ Some featured books may still exist');
    }
    
  } catch (error) {
    console.error('Clear error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run clear
const runClear = async () => {
  await connectDB();
  await clearAllFeaturedBooks();
};

runClear();
