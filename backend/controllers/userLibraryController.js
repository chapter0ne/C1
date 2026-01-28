const UserLibrary = require('../models/UserLibrary');
const { resolveBookId } = require('../utils/resolveBookId');

exports.addToLibrary = async (req, res, next) => {
  try {
    const bookIdResolved = await resolveBookId(req.body.bookId);
    if (!bookIdResolved) return res.status(404).json({ message: 'Book not found' });
    const userId = req.user.userId;
    
    const existing = await UserLibrary.findOne({ user: userId, book: bookIdResolved });
    if (existing) {
      return res.status(400).json({ message: 'Book already in library' });
    }
    
    const libraryEntry = new UserLibrary({
      user: userId,
      book: bookIdResolved
    });
    
    await libraryEntry.save();
    res.status(201).json(libraryEntry);
  } catch (err) {
    next(err);
  }
};

exports.removeFromLibrary = async (req, res, next) => {
  try {
    const bookIdResolved = await resolveBookId(req.params.bookId);
    if (!bookIdResolved) return res.status(404).json({ message: 'Book not found' });
    const userId = req.user.userId;
    
    const result = await UserLibrary.findOneAndDelete({ user: userId, book: bookIdResolved });
    if (!result) {
      return res.status(404).json({ message: 'Book not found in library' });
    }
    
    res.json({ message: 'Book removed from library' });
  } catch (err) {
    next(err);
  }
};

exports.getUserLibrary = async (req, res, next) => {
  try {
    const userId = req.user.userId; // Use userId from JWT
    const library = await UserLibrary.find({ user: userId })
      .populate('book', 'title author genre coverImageUrl isFree price rating averageRating totalRatings')
      .sort({ addedAt: -1 });
    res.json(library);
  } catch (err) {
    res.json([]); // Always return an array on error
  }
};

exports.updateReadingProgress = async (req, res, next) => {
  try {
    const bookIdResolved = await resolveBookId(req.params.bookId);
    if (!bookIdResolved) return res.status(404).json({ message: 'Book not found' });
    const { readingStatus, currentChapter, progress } = req.body;
    const userId = req.user.userId;
    
    const libraryEntry = await UserLibrary.findOneAndUpdate(
      { user: userId, book: bookIdResolved },
      { readingStatus, currentChapter, progress },
      { new: true }
    );
    
    if (!libraryEntry) {
      return res.status(404).json({ message: 'Book not found in library' });
    }
    
    res.json(libraryEntry);
  } catch (err) {
    next(err);
  }
};

// Admin only - get all library entries for a specific book (bookId can be _id or slug)
exports.getBookLibraryCount = async (req, res, next) => {
  try {
    const bookIdResolved = await resolveBookId(req.params.bookId);
    if (!bookIdResolved) return res.status(404).json({ message: 'Book not found' });
    const count = await UserLibrary.countDocuments({ book: bookIdResolved });
    res.json({ count });
  } catch (err) {
    next(err);
  }
};

// Admin only - get all library entries
exports.getAllLibraryEntries = async (req, res, next) => {
  try {
    const libraryEntries = await UserLibrary.find()
      .populate('user', 'username email')
      .populate('book', 'title author genre')
      .sort({ addedAt: -1 });
    
    res.json(libraryEntries);
  } catch (err) {
    next(err);
  }
};

// Admin only - get top books by library count
exports.getTopBooksByLibraryCount = async (req, res, next) => {
  try {
    const { period = 'all-time', limit = 3 } = req.query;
    const Book = require('../models/Book');
    const Purchase = require('../models/Purchase');
    
    let startDate = null;
    const now = new Date();
    
    if (period === 'monthly') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (period === 'weekly') {
      // Get start of current week (Sunday)
      const dayOfWeek = now.getDay();
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek);
      startDate.setHours(0, 0, 0, 0);
    } else if (period === 'today') {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      startDate.setHours(0, 0, 0, 0);
    }
    
    // Aggregate library entries by book
    const matchStage = startDate 
      ? { addedAt: { $gte: startDate } }
      : {};
    
    const libraryCounts = await UserLibrary.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$book',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: parseInt(limit) }
    ]);
    
    // Get book details and additional stats
    const bookIds = libraryCounts.map(item => item._id);
    const books = await Book.find({ _id: { $in: bookIds } })
      .select('title author genre coverImageUrl isFree price');
    
    // Get all completed purchases (to check for multi-book purchases)
    const allPurchases = await Purchase.find({ status: 'completed' })
      .select('book amountPaid nombaData');
    
    // Calculate purchase counts and revenue for each book
    // Handle both single-book purchases and multi-book purchases
    const bookStats = new Map();
    
    bookIds.forEach(bookId => {
      bookStats.set(bookId.toString(), {
        purchaseCount: 0,
        totalRevenue: 0
      });
    });
    
    allPurchases.forEach(purchase => {
      const purchaseBookId = purchase.book?.toString();
      const amount = Number(purchase.amountPaid || 0);
      
      // Check metadata for multi-book purchases
      const metadata = purchase.nombaData?.fullResponse?.metadata || 
                      purchase.nombaData?.fullResponse?.data?.metadata ||
                      purchase.nombaData?.metadata;
      
      let relevantBookIds = [];
      
      if (metadata && metadata.bookIds && Array.isArray(metadata.bookIds)) {
        // Multi-book purchase
        relevantBookIds = metadata.bookIds.map(id => id.toString());
      } else if (purchaseBookId) {
        // Single-book purchase
        relevantBookIds = [purchaseBookId];
      }
      
      // Update stats for each relevant book
      relevantBookIds.forEach(bookId => {
        if (bookStats.has(bookId)) {
          const stats = bookStats.get(bookId);
          stats.purchaseCount += 1;
          // For multi-book purchases, divide revenue equally
          if (relevantBookIds.length > 1) {
            stats.totalRevenue += amount / relevantBookIds.length;
          } else {
            stats.totalRevenue += amount;
          }
        }
      });
    });
    
    // Combine data
    const result = libraryCounts.map(libItem => {
      const bookIdStr = libItem._id.toString();
      const book = books.find(b => b._id.toString() === bookIdStr);
      const stats = bookStats.get(bookIdStr) || { purchaseCount: 0, totalRevenue: 0 };
      
      return {
        bookId: libItem._id,
        book: book || null,
        libraryCount: libItem.count,
        purchaseCount: stats.purchaseCount,
        totalRevenue: stats.totalRevenue
      };
    }).filter(item => item.book !== null); // Only return books that exist
    
    res.json(result);
  } catch (err) {
    console.error('Error getting top books:', err);
    next(err);
  }
};

// Admin only - get detailed stats for a specific book (bookId can be _id or slug)
exports.getBookDetailedStats = async (req, res, next) => {
  try {
    const bookIdResolved = await resolveBookId(req.params.bookId);
    if (!bookIdResolved) return res.status(404).json({ message: 'Book not found' });
    const bookId = bookIdResolved;
    const Purchase = require('../models/Purchase');
    const Book = require('../models/Book');
    
    const book = await Book.findById(bookId);
    if (!book) return res.status(404).json({ message: 'Book not found' });
    
    const allLibraryEntries = await UserLibrary.find({ book: bookId })
      .populate('user', 'username email')
      .sort({ addedAt: -1 });
    
    // Get library entries added last month (previous calendar month)
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
    const lastMonthLibraryEntries = await UserLibrary.find({ 
      book: bookId,
      addedAt: { $gte: startOfLastMonth, $lte: endOfLastMonth }
    });
    
    // Get all purchases for this book (only completed)
    // A purchase can include this book either:
    // 1. As the main book field (single book purchase)
    // 2. In the metadata.bookIds array (multi-book purchase)
    const allPurchasesRaw = await Purchase.find({ 
      status: 'completed'
    })
    .populate('user', 'username email')
    .sort({ purchasedAt: -1, createdAt: -1 });
    
    // Filter purchases that include this book
    const allPurchases = allPurchasesRaw.filter(p => {
      // Check if book is the main purchase book
      if (p.book && p.book.toString() === bookId.toString()) {
        return true;
      }
      // Check if book is in metadata.bookIds
      const metadata = p.nombaData?.fullResponse?.metadata || 
                      p.nombaData?.fullResponse?.data?.metadata ||
                      p.nombaData?.metadata;
      if (metadata && metadata.bookIds) {
        const bookIds = Array.isArray(metadata.bookIds) ? metadata.bookIds : [metadata.bookIds];
        return bookIds.some(id => id.toString() === bookId.toString());
      }
      return false;
    });
    
    // Get purchases this month
    const monthlyPurchases = allPurchases.filter(p => {
      const purchaseDate = new Date(p.purchasedAt || p.createdAt);
      return purchaseDate >= startOfMonth;
    });
    
    // Calculate total revenue (for multi-book purchases, divide by number of books)
    const totalRevenue = allPurchases.reduce((sum, p) => {
      const amount = Number(p.amountPaid || 0);
      // If it's a multi-book purchase, divide revenue proportionally
      const metadata = p.nombaData?.fullResponse?.metadata || 
                      p.nombaData?.fullResponse?.data?.metadata ||
                      p.nombaData?.metadata;
      if (metadata && metadata.bookIds && Array.isArray(metadata.bookIds) && metadata.bookIds.length > 1) {
        // Divide revenue equally among books
        return sum + (amount / metadata.bookIds.length);
      }
      return sum + amount;
    }, 0);
    
    // Calculate monthly revenue
    const monthlyRevenue = monthlyPurchases.reduce((sum, p) => {
      const amount = Number(p.amountPaid || 0);
      const metadata = p.nombaData?.fullResponse?.metadata || 
                      p.nombaData?.fullResponse?.data?.metadata ||
                      p.nombaData?.metadata;
      if (metadata && metadata.bookIds && Array.isArray(metadata.bookIds) && metadata.bookIds.length > 1) {
        return sum + (amount / metadata.bookIds.length);
      }
      return sum + amount;
    }, 0);
    
    // Get purchase count (number of completed Purchase records for this book)
    const purchaseCount = allPurchases.length;
    
    // Breakdown by month (last 12 months)
    const monthlyBreakdown = [];
    for (let i = 11; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
      
      const monthPurchases = allPurchases.filter(p => {
        const purchaseDate = new Date(p.purchasedAt || p.createdAt);
        return purchaseDate >= monthStart && purchaseDate <= monthEnd;
      });
      
      const monthLibrary = allLibraryEntries.filter(entry => {
        const addedDate = new Date(entry.addedAt);
        return addedDate >= monthStart && addedDate <= monthEnd;
      });
      
      const monthRevenue = monthPurchases.reduce((sum, p) => {
        const amount = Number(p.amountPaid || 0);
        const metadata = p.nombaData?.fullResponse?.metadata || 
                        p.nombaData?.fullResponse?.data?.metadata ||
                        p.nombaData?.metadata;
        if (metadata && metadata.bookIds && Array.isArray(metadata.bookIds) && metadata.bookIds.length > 1) {
          return sum + (amount / metadata.bookIds.length);
        }
        return sum + amount;
      }, 0);
      
      monthlyBreakdown.push({
        month: monthStart.toISOString().slice(0, 7), // YYYY-MM format
        monthName: monthStart.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        purchaseCount: monthPurchases.length,
        libraryCount: monthLibrary.length,
        revenue: monthRevenue
      });
    }
    
    // Purchase timeline (all purchases with dates)
    // For multi-book purchases, show the full amount but note it's shared
    const purchaseTimeline = allPurchases.map(p => {
      const amount = Number(p.amountPaid || 0);
      const metadata = p.nombaData?.fullResponse?.metadata || 
                      p.nombaData?.fullResponse?.data?.metadata ||
                      p.nombaData?.metadata;
      const isMultiBook = metadata && metadata.bookIds && Array.isArray(metadata.bookIds) && metadata.bookIds.length > 1;
      
      return {
        date: p.purchasedAt || p.createdAt,
        user: p.user?.username || p.user?.email || 'Unknown',
        amount: isMultiBook ? (amount / metadata.bookIds.length) : amount,
        fullAmount: amount,
        isMultiBook,
        bookCount: isMultiBook ? metadata.bookIds.length : 1,
        transactionId: p.transactionId
      };
    }).sort((a, b) => new Date(b.date) - new Date(a.date));
    
    res.json({
      book: {
        _id: book._id,
        title: book.title,
        author: book.author,
        genre: book.genre,
        isFree: book.isFree,
        price: book.price,
        publishDate: book.createdAt || book.updatedAt // Use createdAt as publish date
      },
      stats: {
        totalLibraryCount: allLibraryEntries.length,
        lastMonthLibraryCount: lastMonthLibraryEntries.length,
        totalRevenue,
        monthlyRevenue,
        purchaseCount: purchaseCount, // Number of completed Purchase records
        monthlyPurchaseCount: monthlyPurchases.length
      },
      monthlyBreakdown,
      purchaseTimeline
    });
  } catch (err) {
    console.error('Error getting book detailed stats:', err);
    next(err);
  }
}; 