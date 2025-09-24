// Script to assign 'order' to chapters based on their createdAt timestamp
// Usage: node scripts/migrateChapterOrder.js

const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/YOUR_DB_NAME';

const bookSchema = new mongoose.Schema({
  title: String,
  author: String,
  description: String,
  genre: String,
  tags: [String],
  isbn: String,
  price: Number,
  isFree: Boolean,
  coverImageUrl: String,
  status: String,
  rating: Number,
  totalRatings: Number,
  averageRating: Number,
  createdBy: mongoose.Schema.Types.ObjectId,
}, { timestamps: true });

const chapterSchema = new mongoose.Schema({
  book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
  title: String,
  content: String,
  order: Number,
  createdAt: Date,
  updatedAt: Date
}, { timestamps: true });

const Book = mongoose.model('Book', bookSchema);
const Chapter = mongoose.model('Chapter', chapterSchema);

async function migrateOneBook() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  // Find all books
  const books = await Book.find({});
  if (!books.length) {
    console.log('No books found.');
    await mongoose.disconnect();
    return;
  }

  // Pick the first book
  const book = books[0];
  console.log('Migrating chapters for book:');
  console.log({
    id: book._id,
    title: book.title,
    author: book.author,
    description: book.description,
    genre: book.genre,
    status: book.status
  });

  // Find chapters for this book
  const chapters = await Chapter.find({ book: book._id }).sort({ createdAt: 1 });
  if (!chapters.length) {
    console.log('No chapters found for this book.');
    await mongoose.disconnect();
    return;
  }

  for (let i = 0; i < chapters.length; i++) {
    if (typeof chapters[i].order !== 'number') {
      chapters[i].order = i;
      await chapters[i].save();
      console.log(`Set order ${i} for chapter ${chapters[i]._id}`);
    }
  }

  console.log('Migration for this book complete.');
  await mongoose.disconnect();
}

migrateOneBook().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
