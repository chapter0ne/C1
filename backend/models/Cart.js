const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
    addedAt: { type: Date, default: Date.now },
    quantity: { type: Number, default: 1 }
  }],
  totalAmount: { type: Number, default: 0 },
  lastUpdated: { type: Date, default: Date.now }
}, { timestamps: true });

cartSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

// Virtual for item count
cartSchema.virtual('itemCount').get(function() {
  return this.items.reduce((total, item) => total + item.quantity, 0);
});

// Calculate total amount before saving
cartSchema.pre('save', async function(next) {
  if (this.items.length > 0) {
    const Book = mongoose.model('Book');
    let total = 0;
    
    for (let item of this.items) {
      const book = await Book.findById(item.book);
      if (book && !book.isFree) {
        total += (book.price * item.quantity);
      }
    }
    
    this.totalAmount = total;
  }
  this.lastUpdated = new Date();
  next();
});

cartSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Cart', cartSchema); 