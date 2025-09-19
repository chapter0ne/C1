
import { useParams } from "react-router-dom";
import { useBookDetails, useBooks } from '@/hooks/useBooks';
import { useReviews } from '@/hooks/useReviews';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Star, Heart, BookOpen, Pencil } from "lucide-react";
import { useBookState } from "@/hooks/useBookState";
import { useAuth } from "@/contexts/AuthContext";
import { useWishlist } from "@/hooks/useWishlist";
import { useState } from "react";

import BookCard from "@/components/BookCard";
import MobileBottomNav from "@/components/MobileBottomNav";
import UniversalHeader from "@/components/UniversalHeader";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { useCart } from "@/hooks/useCart";
import { useUserData } from '@/contexts/OptimizedUserDataContext';
import { getCoverImageUrl, hasCoverImage } from '@/utils/imageUtils';
import { useToast } from "@/hooks/use-toast";
import { useBookPurchaseStatus } from '@/hooks/usePurchaseHistory';

const REVIEWS_PER_PAGE = 3;

const BookDetails = () => {
  const { id } = useParams();
  const { data: book, isLoading, error } = useBookDetails(id || '');
  const { data: allBooks = [] } = useBooks();
  const { user } = useAuth();
  const { userLibrary, wishlist, cart, removeFromLibrary, addToLibrary, addToWishlist, removeFromWishlist } = useUserData();
  const { addToCart } = useCart(user?.id || '');
  const { data: reviews = [], isLoading: reviewsLoading } = useReviews(id || '');

  const [reviewPage, setReviewPage] = useState(1);
  const { toast } = useToast();

  // Library logic
  const libraryEntry = userLibrary.find((entry: any) => (entry.book?._id || entry.book?.id || entry._id || entry.id) === (book?._id || book?.id));
  const isInLibrary = !!libraryEntry;
  const isInWishlist = wishlist.some((item: any) => (item.book?._id || item._id || item.id) === (book?._id || book?.id));
  
  // Check if book is paid (not free)
  const isPaidBook = !(book?.isFree === true || book?.is_free === true || book?.price === 0 || book?.price === '0' || book?.price === undefined || book?.price === null);
  
  // Check purchase history to see if book was ever purchased (non-blocking)
  const { data: purchaseStatus } = useBookPurchaseStatus(user?.id || '', book?._id || '');
  const isBookPurchased = purchaseStatus?.isBookPurchased || false;
  
  // Book is considered purchased if it's in library with purchased flag OR if it was ever purchased (even if removed)
  const isPurchased = (isInLibrary && (libraryEntry?.isPurchased || libraryEntry?.purchased || false)) || isBookPurchased;
  
  console.log('BookDetails debug:', { 
    bookId: book?._id, 
    isInLibrary, 
    isPurchased,
    isInWishlist,
    libraryEntry,
    userLibraryLength: userLibrary.length,
    userLibraryEntries: userLibrary.map((entry: any) => ({
      bookId: entry.book?._id || entry.book?.id || entry._id || entry.id,
      bookTitle: entry.book?.title || 'No title',
      isPurchased: entry?.isPurchased || entry?.purchased || false
    })),
    addToLibrary: !!addToLibrary, 
    removeFromLibrary: !!removeFromLibrary,
    addToWishlist: !!addToWishlist,
    removeFromWishlist: !!removeFromWishlist
  });
  
  const handleWishlistAction = async () => {
    console.log('Wishlist action clicked:', { bookId: book?._id, isInWishlist, isInLibrary });
    
    if (!user) {
      console.log('No user logged in');
      return;
    }
    
    // Safety check: if book is in library, don't allow wishlist actions
    if (isInLibrary) {
      console.log('BookDetails: Book is in library, cannot modify wishlist');
      toast({
        title: "Cannot Modify Wishlist",
        description: "Books in your library cannot be added to or removed from wishlist.",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }
    
    try {
      if (isInWishlist) {
        console.log('Removing from wishlist...');
        await removeFromWishlist.mutateAsync(book?._id || '');
        console.log('Removed from wishlist successfully');
      } else {
        console.log('Adding to wishlist...');
        await addToWishlist.mutateAsync({ bookId: book?._id || '' });
        console.log('Added to wishlist successfully');
      }
    } catch (error) {
      console.error('Wishlist action error:', error);
    }
  };

  const handleBuyClick = async () => {
    if (!user) {
      toast({
        title: "Please Login",
        description: "You need to be logged in to purchase books.",
        variant: "destructive"
      });
      return;
    }

    if (!book) return;

    try {
      await addToCart.mutateAsync({ bookId: book._id || book.id, quantity: 1 });
      toast({
        title: "Added to Cart",
        description: `${book.title} has been added to your cart.`,
      });
    } catch (error: any) {
      console.error('Add to cart error:', error);
      
      // Show specific error message for different cases
      if (error.message?.includes('already in your cart')) {
        toast({
          title: "Already in Cart",
          description: "This book is already in your cart. You can only add one copy of each book.",
          variant: "destructive"
        });
      } else if (error.message?.includes('already purchased')) {
        toast({
          title: "Already Purchased",
          description: "You have already purchased this book. It should be in your library.",
          variant: "destructive"
        });
      } else if (error.message?.includes('Free books cannot be added')) {
        toast({
          title: "Free Book",
          description: "Free books cannot be added to cart. Add them directly to your library.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to add book to cart. Please try again.",
          variant: "destructive"
        });
      }
    }
  };

  const handleLibraryAction = async () => {
    console.log('Library action clicked:', { bookId: book?._id, isInLibrary, isInWishlist });
    
    if (!user) {
      console.log('No user logged in');
      return;
    }
    
    try {
      if (isInLibrary) {
        console.log('Removing from library...');
        await removeFromLibrary.mutateAsync(book?._id || '');
        console.log('Removed from library successfully');
        toast({
          title: "Removed from Library",
          description: `${book?.title} has been removed from your library.`,
        });
      } else {
        console.log('Adding to library...');
        await addToLibrary.mutateAsync(book?._id || '');
        console.log('Added to library successfully');
        
        // Auto-remove from wishlist when added to library
        if (isInWishlist) {
          console.log('BookDetails: Auto-removing from wishlist after adding to library...');
          try {
            await removeFromWishlist.mutateAsync(book?._id || '');
            console.log('BookDetails: Successfully auto-removed from wishlist');
            
            toast({
              title: "Added to Library",
              description: "Book has been added to your library and removed from wishlist.",
              duration: 2000,
            });
          } catch (wishlistError) {
            console.error('BookDetails: Failed to auto-remove from wishlist:', wishlistError);
            
            toast({
              title: "Warning",
              description: "Book added to library but failed to remove from wishlist. Please remove manually.",
              variant: "destructive",
              duration: 4000,
            });
          }
        } else {
          toast({
            title: "Added to Library",
            description: "Book has been added to your library.",
            duration: 2000,
          });
        }
      }
    } catch (error) {
      console.error('Library action error:', error);
      toast({
        title: "Error",
        description: "Failed to add book to library.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  // Related books: 4 books with at least one matching tag, not current book
  const bookTags = book ? (book.tags || [book.genre, book.category]).filter(Boolean) : [];
  const relatedBooks = book
    ? allBooks.filter(
        (b) => b._id !== book._id && b.tags && b.tags.some((tag: string) => bookTags.includes(tag))
      ).slice(0, 4)
    : [];

  // Can review if in library
  const canReview = isInLibrary;

  // Price logic
  const isBookFree = book?.isFree === true || book?.is_free === true || book?.price === 0 || book?.price === '0' || book?.price === undefined || book?.price === null;
  const priceDisplay = isBookFree ? 'Free' : `₦${typeof book?.price === 'number' ? book.price.toLocaleString() : 'Free'}`;

  // Star logic
  const rating = typeof book?.rating === 'number' ? book.rating : 0;
  const reviewCount = Array.isArray(reviews) ? reviews.length : 0;

  // Pagination for reviews
  const totalPages = Math.ceil(reviewCount / REVIEWS_PER_PAGE) || 1;
  const paginatedReviews = reviews.slice((reviewPage - 1) * REVIEWS_PER_PAGE, reviewPage * REVIEWS_PER_PAGE);

  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (error || !book) return <div className="min-h-screen flex items-center justify-center text-red-500">Book not found.</div>;

  // Responsive check for mobile
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Page Header */}
      <UniversalHeader currentPage="book-details" />
      {/* Main Content */}
      <div className="flex-1 pb-20">
        {/* Desktop/Tablet: Two-column layout, Mobile: Stacked */}
        <div className="max-w-7xl w-full mx-auto flex flex-col md:flex-row gap-8 p-4 md:p-8">
          {/* Left Column: Book Card + Related Books */}
          <div className="flex-shrink-0 w-full md:w-80 lg:w-96 flex flex-col">
            {/* Book Card */}
            <Card className="shadow-lg rounded-2xl overflow-hidden w-full mb-6">
              <CardContent className="p-6 flex flex-col items-center">
                {/* Book Cover */}
                <div className="w-56 h-80 md:w-64 md:h-96 rounded-lg overflow-hidden mb-6 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                  {hasCoverImage(book) ? (
                    <img src={getCoverImageUrl(book)!} alt={book.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-white text-lg font-bold text-center p-4">{book.title}</div>
                  )}
                </div>
                {/* Price/Main Action Button */}
                {isBookFree ? (
                  <Button
                    className={`w-full text-lg font-semibold mb-3 rounded-lg ${
                      isInLibrary 
                        ? 'bg-red-600 hover:bg-red-700' 
                        : 'bg-[#D01E1E] hover:bg-[#B01818]'
                    }`}
                    size="lg"
                    onClick={handleLibraryAction}
                  >
                    {isInLibrary ? 'Remove from Library' : 'Add to Library'}
                  </Button>
                ) : (
                  <Button 
                    className={`w-full text-lg font-semibold mb-3 rounded-lg ${
                      isInLibrary || isPurchased
                        ? 'bg-green-600 hover:bg-green-700 cursor-not-allowed' 
                        : 'bg-[#D01E1E] hover:bg-[#B01818]'
                    }`}
                    size="lg"
                    onClick={isInLibrary || isPurchased ? undefined : handleBuyClick}
                    disabled={isInLibrary || isPurchased}
                  >
                    {isInLibrary 
                      ? 'In Library'
                      : isPurchased
                        ? 'Purchased'
                        : `Buy for ${priceDisplay}`
                    }
                  </Button>
                )}
                <div className="flex w-full gap-2">
                  {/* Wishlist Button: Disabled if book is in library or purchased */}
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className={`flex-1 rounded-lg ${
                      isInLibrary || isPurchased
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                        : isInWishlist 
                          ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100' 
                          : ''
                    }`}
                    onClick={isInLibrary || isPurchased ? undefined : handleWishlistAction}
                    disabled={isInLibrary || isPurchased}
                    title={isInLibrary || isPurchased ? (isPurchased ? "Purchased book - Cannot modify wishlist" : "Cannot modify wishlist for books in library") : ""}
                  >
                    <Heart className={`w-4 h-4 mr-2 ${
                      isInLibrary || isPurchased
                        ? 'text-gray-400' 
                        : isInWishlist 
                          ? 'fill-red-500 text-red-500' 
                          : ''
                    }`} />
                    {isInLibrary 
                      ? (isPurchased ? 'Purchased' : 'In Library')
                      : isPurchased
                        ? 'Purchased'
                        : isInWishlist 
                          ? 'Remove from Wishlist' 
                          : 'Add to Wishlist'
                    }
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Desktop: Related Books Section below book card */}
            {relatedBooks.length > 0 && (
              <div className="hidden md:block">
                <h2 className="text-lg font-bold mb-4">Related Books</h2>
                <div className="grid grid-cols-2 gap-3">
                  {relatedBooks.map((relatedBook) => (
                    <div key={relatedBook._id || relatedBook.id}>
                      <BookCard book={relatedBook} variant="compact" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Book Info and Reviews */}
          <div className="flex-1 flex flex-col gap-6">
            {/* Desktop: Tags, Title, Description, Stars, Price */}
            <div className="hidden md:block">
              <div className="mb-4 flex flex-wrap gap-2">
                {(book.tags || [book.genre, book.category]).filter(Boolean).map((tag: string, i: number) => (
                  <span key={tag + i} className="bg-gray-100 text-gray-700 rounded-full px-3 py-1 text-xs font-medium">{tag}</span>
                ))}
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{book.title}</h1>
              <p className="text-lg text-gray-600 mb-3 truncate">by {book.author}</p>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-5 h-5 ${i < Math.round(rating) ? 'text-black fill-black' : 'text-black'}`} />
                  ))}
                  <span className="text-base font-medium text-black ml-1">{rating.toFixed(1)}</span>
                  <span className="text-xs text-gray-500 ml-2">({reviewCount} reviews)</span>
                </div>
                <span className={isBookFree ? "text-green-600 font-semibold" : "text-gray-900 font-semibold ml-4"}>
                  {priceDisplay}
                </span>
              </div>
              <p className="text-gray-700 text-base mb-6 text-left whitespace-pre-line leading-relaxed">{book.description}</p>
            </div>

            {/* Mobile/Tablet: Tags, Title, Description below card */}
            <div className="block md:hidden w-full">
              {/* Tags */}
              <div className="mb-2 flex flex-wrap gap-2">
                {(book.tags || [book.genre, book.category]).filter(Boolean).map((tag: string, i: number) => (
                  <span key={tag + i} className="bg-gray-100 text-gray-700 rounded-full px-3 py-1 text-xs font-medium">{tag}</span>
                ))}
              </div>
              {/* Title & Author */}
              <h1 className="text-2xl font-bold text-gray-900 mb-1">{book.title}</h1>
              <p className="text-base text-gray-600 mb-2 truncate">by {book.author}</p>
              {/* Stars & Price */}
              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < Math.round(rating) ? 'text-black fill-black' : 'text-black'}`} />
                  ))}
                  <span className="text-sm font-medium text-black ml-1">{rating.toFixed(1)}</span>
                  <span className="text-xs text-gray-500 ml-2">({reviewCount} reviews)</span>
                </div>
                <span className={isBookFree ? "text-green-600 font-semibold" : "text-gray-900 font-semibold ml-4"}>
                  {priceDisplay}
                </span>
              </div>
              {/* Description */}
              <p className="text-gray-700 text-sm mb-4 text-left whitespace-pre-line">{book.description}</p>
            </div>

            {/* Book Details */}
            <div className="mb-6">
              <h3 className="font-semibold text-lg mb-3">Book Details</h3>
              <div className="grid grid-cols-2 gap-4 text-sm bg-gray-50 p-4 rounded-lg">
                <div>
                  <span className="font-semibold">Published:</span> {book.published || '-'}
                </div>
                <div>
                  <span className="font-semibold">Pages:</span> {book.pages || '-'}
                </div>
                <div>
                  <span className="font-semibold">Language:</span> {book.language || '-'}
                </div>
                <div>
                  <span className="font-semibold">ISBN:</span> {book.isbn || '-'}
                </div>
              </div>
            </div>

            {/* Review functionality permanently disabled */}
            <div className="block md:hidden mb-4 text-center py-4">
              <p className="text-gray-500 text-sm">Review functionality is currently disabled</p>
            </div>

            {/* Reviews Section - Extended for desktop */}
            <div className="bg-gray-50 rounded-xl shadow-inner p-4 md:min-h-[400px] md:max-h-[500px] min-h-[260px] max-h-[340px] overflow-y-auto flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-bold">Reviews</h2>
                {/* Review functionality permanently disabled */}
                <div className="hidden md:block text-center py-2">
                  <p className="text-gray-500 text-sm">Review functionality is currently disabled</p>
                </div>
              </div>
              {reviewsLoading ? (
                <div>Loading reviews...</div>
              ) : (
                <>
                  {paginatedReviews.length === 0 ? (
                    <div className="text-gray-500 text-center py-8">No reviews yet.</div>
                  ) : (
                    <ul className="divide-y divide-gray-200">
                      {paginatedReviews.map((review: any) => (
                        <li key={review._id || review.id} className="py-3">
                          <div className="flex items-center gap-2 mb-1">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`w-4 h-4 ${i < Math.round(review.rating) ? 'text-black fill-black' : 'text-black'}`} />
                            ))}
                            <span className="font-medium text-sm text-black ml-1">{typeof review.rating === 'number' ? review.rating.toFixed(1) : '0.0'}</span>
                            <span className="text-xs text-gray-500 ml-2">{review.user?.username || 'Anonymous'}</span>
                            <span className="text-xs text-gray-400 ml-auto">{review.createdAt ? new Date(review.createdAt).toLocaleDateString() : ''}</span>
                          </div>
                          <div className="text-gray-700 text-sm">{review.comment || review.reviewText}</div>
                        </li>
                      ))}
                    </ul>
                  )}
                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-center gap-2 mt-4">
                      <Button size="sm" variant="outline" disabled={reviewPage === 1} onClick={() => setReviewPage(p => Math.max(1, p - 1))}>Prev</Button>
                      <span className="text-sm font-medium">Page {reviewPage} of {totalPages}</span>
                      <Button size="sm" variant="outline" disabled={reviewPage === totalPages} onClick={() => setReviewPage(p => Math.min(totalPages, p + 1))}>Next</Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Related Books Section (Mobile/Tablet only) */}
        {relatedBooks.length > 0 && (
          <div className="w-full max-w-2xl mx-auto p-4">
            <h2 className="text-lg font-bold mb-2">Related Books</h2>
            <div className="flex gap-3 overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory pb-2">
              {relatedBooks.map((relatedBook) => (
                <div key={relatedBook._id || relatedBook.id} className="min-w-[7rem] flex-shrink-0 snap-start">
                  <BookCard book={relatedBook} variant="compact" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Page Footer - Only show on desktop/tablet */}
      {!isMobile && (
        <footer className="bg-white py-12 md:py-20 px-4 border-t border-gray-100">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8 md:gap-16 mb-8 md:mb-16">
              <div>
                <div className="flex items-center space-x-2 mb-4 md:mb-8">
                  <div className="w-8 h-8 md:w-12 md:h-12 bg-gradient-to-br from-[#D01E1E] to-[#FF6B6B] rounded-xl flex items-center justify-center">
                    <BookOpen className="w-4 h-4 md:w-6 md:h-6 text-white" />
                  </div>
                  <span className="font-bold text-gray-900 text-lg md:text-2xl">ChapterOne</span>
                </div>
                <p className="text-gray-600 text-sm md:text-lg leading-relaxed">
                  Making books accessible to everyone. Your library, online, anywhere, anytime. Fighting piracy through accessibility and affordability.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-8 md:gap-16">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4 md:mb-8 text-sm md:text-lg">Quick Links</h3>
                  <ul className="space-y-2 md:space-y-4">
                    <li><Link to="/explore" className="text-gray-600 hover:text-[#D01E1E] transition-colors text-sm md:text-base">Explore Books</Link></li>
                    <li><Link to="/about" className="text-gray-600 hover:text-[#D01E1E] transition-colors text-sm md:text-base">About Us</Link></li>
                    <li><Link to="/contact" className="text-gray-600 hover:text-[#D01E1E] transition-colors text-sm md:text-base">Contact</Link></li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4 md:mb-8 text-sm md:text-lg">Support</h3>
                  <ul className="space-y-2 md:space-y-4">
                    <li><Link to="/contact" className="text-gray-600 hover:text-[#D01E1E] transition-colors text-sm md:text-base">Help Center</Link></li>
                    <li><Link to="/contact" className="text-gray-600 hover:text-[#D01E1E] transition-colors text-sm md:text-base">Contact Us</Link></li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="text-center pt-8 md:pt-12 border-t border-gray-100">
              <p className="text-xs md:text-base text-gray-500">© 2025 ChapterOne. All rights reserved.</p>
            </div>
          </div>
        </footer>
      )}

      {/* Sticky Mobile Bottom Navigation */}
      <MobileBottomNav />


    </div>
  );
};

export default BookDetails;
