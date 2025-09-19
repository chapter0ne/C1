import React from 'react';
import { useParams } from 'react-router-dom';
import { useBookDetails } from '@/hooks/useBooks';
import { useReviews } from '@/hooks/useReviews';
import { useUserData } from '@/contexts/OptimizedUserDataContext';

import { useState } from 'react';

const EnhancedBookDetails = () => {
  const { id } = useParams();
  const { data: book, isLoading: bookLoading } = useBookDetails(id || '');
  const { data: reviews = [], isLoading: reviewsLoading } = useReviews(id || '');
  const { userLibrary, wishlist, cart } = useUserData();

  const isInLibrary = userLibrary.some((entry: any) => (entry.book?._id || entry.book?.id || entry._id || entry.id) === (book?._id || book?.id));

  if (bookLoading) return <div>Loading book...</div>;
  if (!book) return <div>Book not found</div>;

  return (
    <div>
      <h1>{book.title}</h1>
      <p className="truncate">by {book.author}</p>
      <p>{book.description}</p>
      {/* Render other book details as needed */}
              {/* Review functionality permanently disabled */}
        <div className="text-center py-4">
          <p className="text-gray-500 text-sm">Review functionality is currently disabled</p>
        </div>
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
