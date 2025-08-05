const Purchase = require('../models/Purchase');

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

// Admin only - get purchase count for a specific book
exports.getBookPurchaseCount = async (req, res, next) => {
  try {
    const { bookId } = req.params;
    const count = await Purchase.countDocuments({ book: bookId });
    res.json({ count });
  } catch (err) {
    next(err);
  }
}; 