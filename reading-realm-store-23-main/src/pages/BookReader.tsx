import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useBookDetails, useBookChapters } from '@/hooks/useBooks';
import { useBookState } from '@/hooks/useBookState';

const BookReader = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { data: book, isLoading: bookLoading, error: bookError } = useBookDetails(id || '');
  const { data: chapters, isLoading: chaptersLoading, error: chaptersError } = useBookChapters(id || '');
  const { bookState, loading: stateLoading } = useBookState(id || '');
  const [hasAccess, setHasAccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !book) {
      setHasAccess(false);
      return;
    }
    // Access logic: free book or in library (purchased)
    if (book.isFree || bookState.isInLibrary) {
      setHasAccess(true);
      setError(null);
    } else {
      setHasAccess(false);
      setError('You need to purchase this book to read it');
    }
  }, [user, book, bookState]);

  if (bookLoading || chaptersLoading || stateLoading) {
    return <div>Loading book...</div>;
  }
  if (bookError || chaptersError) {
    return <div>Error loading book: {bookError?.message || chaptersError?.message}</div>;
  }
  if (!book) {
    return <div>Book not found</div>;
  }
  if (!hasAccess) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <h1>{book.title}</h1>
      <h2>by {book.author}</h2>
      <div>
        {chapters && chapters.length > 0 ? (
          <ul>
            {chapters.map((chapter: any) => (
              <li key={chapter._id || chapter.id}>{chapter.title}</li>
            ))}
          </ul>
        ) : (
          <div>No chapters found.</div>
        )}
      </div>
      {/* Add reading UI here */}
    </div>
  );
};

export default BookReader;
