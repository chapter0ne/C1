const Cart = require('../models/Cart');

/**
 * Remove purchased book IDs from a user's cart (e.g. after successful payment).
 * @param {string} userId - User _id
 * @param {string[]} bookIds - Array of book _ids to remove
 */
async function removeBooksFromUserCart(userId, bookIds) {
  if (!userId || !bookIds || !Array.isArray(bookIds) || bookIds.length === 0) return;
  const ids = bookIds.map((id) => id && id.toString()).filter(Boolean);
  if (ids.length === 0) return;
  try {
    const cart = await Cart.findOne({ user: userId });
    if (!cart || !cart.items || cart.items.length === 0) return;
    const before = cart.items.length;
    cart.items = cart.items.filter((item) => {
      const bookId = item.book && (item.book._id ? item.book._id.toString() : item.book.toString());
      return !ids.includes(bookId);
    });
    if (cart.items.length < before) {
      await cart.save();
      console.log('Removed purchased books from cart:', ids.length, 'books, cart items now:', cart.items.length);
    }
  } catch (err) {
    console.error('removeBooksFromUserCart error:', err.message);
  }
}

module.exports = { removeBooksFromUserCart };
