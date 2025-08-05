const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
  amountPaid: { type: Number, required: true },
  purchasedAt: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Purchase', purchaseSchema); 