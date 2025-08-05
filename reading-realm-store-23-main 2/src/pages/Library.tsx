
import { useAuth } from '@/contexts/AuthContext';
import { useBooks } from '@/hooks/useBooks';
import { useWishlist } from '@/hooks/useWishlist';
import { useCart } from '@/hooks/useCart';

const Library = () => {
  const { user } = useAuth();
  const userId = user?.id || '';
  const { data: books = [], isLoading: booksLoading, error: booksError } = useBooks();
  const { wishlist = [], isLoading: wishlistLoading, error: wishlistError } = useWishlist(userId);
  const { cart = [], isLoading: cartLoading, error: cartError } = useCart(userId);

  // Ensure wishlist is always an array
  const safeWishlist = Array.isArray(wishlist) ? wishlist : [];

  if (booksLoading || wishlistLoading || cartLoading) {
    return <div>Loading your library...</div>;
  }
  if (booksError || wishlistError || cartError) {
    return <div>Error loading library data.</div>;
  }

  return (
    <div>
      <h1>My Library</h1>
      <h2>Books</h2>
      <ul>
        {books.map((book: any) => (
          <li key={book._id}>{book.title} by {book.author}</li>
        ))}
      </ul>
      <h2>Wishlist</h2>
      <ul>
        {safeWishlist.map((item: any) => (
          <li key={item._id || item.id}>{item.title}</li>
        ))}
      </ul>
      <h2>Cart</h2>
      <ul>
        {cart.map((item: any) => (
          <li key={item._id || item.id}>{item.title}</li>
        ))}
      </ul>
    </div>
  );
};

export default Library;
