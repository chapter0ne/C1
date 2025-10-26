const mongoose = require('mongoose');
const FeaturedBook = require('./models/FeaturedBook');
const Book = require('./models/Book');

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

// Test function
const testFeaturedBooks = async () => {
  try {
    console.log('Testing featured books API...');
    
    // Get all featured books
    const allFeaturedBooks = await FeaturedBook.find({}).lean();
    console.log(`Total featured book entries: ${allFeaturedBooks.length}`);
    
    // Check each one
    for (const fb of allFeaturedBooks) {
      try {
        const book = await Book.findById(fb.book);
        console.log(`Featured book ${fb._id}: ${book ? book.title : 'BOOK NOT FOUND'} (${fb.category})`);
      } catch (err) {
        console.log(`Featured book ${fb._id}: ERROR - ${err.message} (${fb.category})`);
      }
    }
    
    // Test populate
    console.log('\nTesting populate...');
    try {
      const populatedBooks = await FeaturedBook.find({})
        .populate('book', 'title author')
        .populate('featuredBy', 'username')
        .lean();
      console.log(`Populated books: ${populatedBooks.length}`);
      populatedBooks.forEach(fb => {
        console.log(`- ${fb.book?.title || 'NULL'} by ${fb.book?.author || 'Unknown'} (${fb.category})`);
      });
    } catch (populateError) {
      console.error('Populate error:', populateError.message);
    }
    
  } catch (error) {
    console.error('Test error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run test
const runTest = async () => {
  await connectDB();
  await testFeaturedBooks();
};

runTest();
