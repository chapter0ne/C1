const Cart = require('../models/Cart');
const Book = require('../models/Book');
const User = require('../models/User');
const Purchase = require('../models/Purchase');
const UserLibrary = require('../models/UserLibrary');

// Get user's cart
exports.getCart = async (req, res) => {
  try {
    const userId = req.user.userId; // Changed from req.user.id to req.user.userId

    let cart = await Cart.findOne({ user: userId })
      .populate('items.book', 'title author coverImageUrl price isFree description');

    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
      await cart.save();
    }

    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching cart', error: error.message });
  }
};

// Add book to cart
exports.addToCart = async (req, res) => {
  try {
    const { bookId } = req.params;
    const userId = req.user.userId; // Changed from req.user.id to req.user.userId
    const { quantity = 1 } = req.body;

    // Check if book exists
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Free books cannot be added to cart
    if (book.isFree) {
      return res.status(400).json({ message: 'Free books cannot be added to cart' });
    }

    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    }

    // Check if book is already in cart
    const existingItem = cart.items.find(item => item.book.toString() === bookId);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({
        book: bookId,
        quantity
      });
    }

    await cart.save();
    await cart.populate('items.book', 'title author coverImageUrl price isFree description');

    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Error adding to cart', error: error.message });
  }
};

// Remove book from cart
exports.removeFromCart = async (req, res) => {
  try {
    const { bookId } = req.params;
    const userId = req.user.userId; // Changed from req.user.id to req.user.userId

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.items = cart.items.filter(item => item.book.toString() !== bookId);
    await cart.save();
    await cart.populate('items.book', 'title author coverImageUrl price isFree description');

    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Error removing from cart', error: error.message });
  }
};

// Update cart item quantity
exports.updateCartItemQuantity = async (req, res) => {
  try {
    const { bookId } = req.params;
    const userId = req.user.userId; // Changed from req.user.id to req.user.userId
    const { quantity } = req.body;

    if (quantity < 1) {
      return res.status(400).json({ message: 'Quantity must be at least 1' });
    }

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const item = cart.items.find(item => item.book.toString() === bookId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    item.quantity = quantity;
    await cart.save();
    await cart.populate('items.book', 'title author coverImageUrl price isFree description');

    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Error updating cart item', error: error.message });
  }
};

// Clear cart
exports.clearCart = async (req, res) => {
  try {
    const userId = req.user.userId; // Changed from req.user.id to req.user.userId

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.items = [];
    await cart.save();

    res.json({ message: 'Cart cleared successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error clearing cart', error: error.message });
  }
};

// Checkout (process purchase)
exports.checkout = async (req, res) => {
  try {
    const userId = req.user.userId; // Changed from req.user.id to req.user.userId
    const { paymentMethod, selectedItems } = req.body; // selectedItems is array of bookIds

    const cart = await Cart.findOne({ user: userId })
      .populate('items.book', 'title author price isFree');

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Filter items if specific items are selected
    let itemsToPurchase = cart.items;
    if (selectedItems && selectedItems.length > 0) {
      itemsToPurchase = cart.items.filter(item => 
        selectedItems.includes(item.book._id.toString())
      );
    }

    if (itemsToPurchase.length === 0) {
      return res.status(400).json({ message: 'No items selected for purchase' });
    }

    // Calculate total
    let totalAmount = 0;
    const purchasedBooks = [];

    for (const item of itemsToPurchase) {
      if (!item.book.isFree) {
        totalAmount += item.book.price * item.quantity;
        purchasedBooks.push(item.book._id);
      }
    }

    // Here you would integrate with Paystack for payment processing
    // For now, we'll simulate a successful payment
    
    // Create purchase record
    const purchase = new Purchase({
      user: userId,
      books: purchasedBooks,
      totalAmount,
      paymentMethod,
      status: 'completed',
      transactionId: `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    });

    await purchase.save();

    // Add books to user library
    for (const bookId of purchasedBooks) {
      const existingLibraryItem = await UserLibrary.findOne({ user: userId, book: bookId });
      if (!existingLibraryItem) {
        const libraryItem = new UserLibrary({
          user: userId,
          book: bookId,
          purchase: purchase._id,
          isFreeBook: false
        });
        await libraryItem.save();
      }
    }

    // Remove purchased items from cart
    cart.items = cart.items.filter(item => 
      !purchasedBooks.includes(item.book._id)
    );
    await cart.save();

    res.json({
      message: 'Purchase completed successfully',
      purchase,
      remainingCartItems: cart.items.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Error processing checkout', error: error.message });
  }
};

// Get cart summary
exports.getCartSummary = async (req, res) => {
  try {
    const userId = req.user.userId; // Changed from req.user.id to req.user.userId

    const cart = await Cart.findOne({ user: userId })
      .populate('items.book', 'title price isFree');

    if (!cart) {
      return res.json({
        itemCount: 0,
        totalAmount: 0,
        items: []
      });
    }

    let totalAmount = 0;
    let itemCount = 0;

    for (const item of cart.items) {
      if (!item.book.isFree) {
        totalAmount += item.book.price * item.quantity;
      }
      itemCount += item.quantity;
    }

    res.json({
      itemCount,
      totalAmount,
      items: cart.items
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching cart summary', error: error.message });
  }
}; 