const mongoose = require('mongoose');
const Book = require('./models/Book');
require('dotenv').config();

async function updateBookRatings() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Update all books to have default 5-star rating
    const result = await Book.updateMany(
      { 
        $or: [
          { rating: { $exists: false } },
          { rating: { $lt: 5 } },
          { totalRatings: { $exists: false } },
          { averageRating: { $exists: false } }
        ]
      },
      {
        $set: {
          rating: 5.0,
          totalRatings: 0,
          averageRating: 5.0
        }
      }
    );

    console.log(`Updated ${result.modifiedCount} books with default 5-star rating`);
    
    // Verify the update
    const books = await Book.find({ rating: 5.0, totalRatings: 0, averageRating: 5.0 });
    console.log(`Books with default rating: ${books.length}`);
    
    console.log('Book rating update completed successfully');
  } catch (error) {
    console.error('Error updating book ratings:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the script
updateBookRatings();

