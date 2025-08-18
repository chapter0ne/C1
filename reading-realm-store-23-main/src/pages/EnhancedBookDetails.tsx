import React from 'react';
import { useParams } from 'react-router-dom';
import { useBookDetails } from '@/hooks/useBooks';
import { useReviews } from '@/hooks/useReviews';
import { useUserData } from '@/contexts/UserDataContext';
import RatingModal from '@/components/RatingModal';
import { useState } from 'react';

const EnhancedBookDetails = () => {
  const { id } = useParams();
  const { data: book, isLoading: bookLoading } = useBookDetails(id || '');
  const { data: reviews = [], isLoading: reviewsLoading } = useReviews(id || '');
  const { userLibrary, wishlist, cart } = useUserData();
  const [showRatingModal, setShowRatingModal] = useState(false);
  const isInLibrary = userLibrary.some((entry: any) => (entry.book?._id || entry.book?.id || entry._id || entry.id) === (book?._id || book?.id));

  if (bookLoading) return <div>Loading book...</div>;
  if (!book) return <div>Book not found</div>;

  return (
    <div>
      <h1>{book.title}</h1>
      <p className="truncate">by {book.author}</p>
      <p>{book.description}</p>
      {/* Render other book details as needed */}
      <button onClick={() => setShowRatingModal(true)} className="bg-[#D01E1E] hover:bg-[#B01818] text-white px-4 py-2 rounded mt-4">Rate & Review</button>
      <RatingModal isOpen={showRatingModal} onClose={() => setShowRatingModal(false)} book={book} canReview={isInLibrary} />
      <h2>Reviews</h2>
      {reviewsLoading ? (
        <div>Loading reviews...</div>
      ) : reviews.length === 0 ? (
        <div>No reviews yet.</div>
      ) : (
        <ul>
          {reviews.map((review: any) => (
            <li key={review.id || review._id}>
              <strong>{review.user?.username || 'Anonymous'}:</strong> {review.reviewText}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default EnhancedBookDetails;
