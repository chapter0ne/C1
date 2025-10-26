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

// Cleanup function
const cleanupFeaturedBooks = async () => {
  try {
    console.log('Starting cleanup of orphaned featured books...');
    
    // Get all featured books
    const allFeaturedBooks = await FeaturedBook.find({}).lean();
    console.log(`Found ${allFeaturedBooks.length} featured book entries`);
    
    let deletedCount = 0;
    const deletedIds = [];
    
    // Check each featured book to see if its referenced book exists
    for (const featuredBook of allFeaturedBooks) {
      try {
        const book = await Book.findById(featuredBook.book);
        if (!book) {
          // Book doesn't exist, delete this featured book entry
          await FeaturedBook.findByIdAndDelete(featuredBook._id);
          deletedCount++;
          deletedIds.push(featuredBook._id);
          console.log(`Deleted orphaned featured book entry ${featuredBook._id}`);
        } else {
          console.log(`Featured book ${featuredBook._id} references valid book: ${book.title}`);
        }
      } catch (err) {
        // Error checking book, assume it doesn't exist
        await FeaturedBook.findByIdAndDelete(featuredBook._id);
        deletedCount++;
        deletedIds.push(featuredBook._id);
        console.log(`Deleted orphaned featured book entry ${featuredBook._id} due to error: ${err.message}`);
      }
    }
    
    if (deletedCount === 0) {
      console.log('No orphaned featured book entries found');
    } else {
      console.log(`Successfully removed ${deletedCount} orphaned featured book entries`);
      console.log('Deleted IDs:', deletedIds);
    }
    
    // Show remaining featured books
    const remainingFeaturedBooks = await FeaturedBook.find({})
      .populate('book', 'title author')
      .lean();
    
    console.log(`\nRemaining featured books: ${remainingFeaturedBooks.length}`);
    remainingFeaturedBooks.forEach(fb => {
      console.log(`- ${fb.book?.title || 'Unknown'} (${fb.category})`);
    });
    
  } catch (error) {
    console.error('Cleanup error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run cleanup
const runCleanup = async () => {
  await connectDB();
  await cleanupFeaturedBooks();
};

runCleanup();
