const Purchase = require('../models/Purchase');
const { resolveBookId } = require('../utils/resolveBookId');

exports.createPurchase = async (req, res, next) => {
  try {
    const purchase = new Purchase({ ...req.body, user: req.user.userId });
    await purchase.save();
    res.status(201).json(purchase);
  } catch (err) {
    next(err);
  }
};

exports.getPurchasesByUser = async (req, res, next) => {
  try {
    const purchases = await Purchase.find({ user: req.user.userId }).populate('book');
    res.json(purchases);
  } catch (err) {
    next(err);
  }
};

exports.getAllPurchases = async (req, res, next) => {
  try {
    const purchases = await Purchase.find().populate('user').populate('book');
    res.json(purchases);
  } catch (err) {
    next(err);
  }
};

// Admin only - get purchase count for a specific book (bookId can be _id or slug)
exports.getBookPurchaseCount = async (req, res, next) => {
  try {
    const bookIdResolved = await resolveBookId(req.params.bookId);
    if (!bookIdResolved) return res.status(404).json({ message: 'Book not found' });
    const count = await Purchase.countDocuments({ book: bookIdResolved });
    res.json({ count });
  } catch (err) {
    next(err);
  }
};

// Check if user has purchased a specific book (bookId in query can be _id or slug)
exports.checkUserBookPurchase = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const bookIdResolved = await resolveBookId(req.query.bookId);
    if (!bookIdResolved) return res.json({ hasPurchased: false, purchase: null });

    const purchase = await Purchase.findOne({ 
      user: userId, 
      book: bookIdResolved 
    });

    res.json({ 
      hasPurchased: !!purchase,
      purchase: purchase || null
    });
  } catch (err) {
    next(err);
  }
}; 