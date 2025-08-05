
import React from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useReadingLists } from '@/hooks/useReadingLists';
import { useBooks } from '@/hooks/useBooks';

const ReadingListDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const userId = user?.id || '';
  const { readingLists, isLoading: listsLoading } = useReadingLists(userId);
  const { data: books = [], isLoading: booksLoading } = useBooks();

  if (listsLoading || booksLoading) {
    return <div>Loading reading list...</div>;
  }

  const readingList = readingLists.find((list: any) => list._id === id || list.id === id);
  if (!readingList) {
    return <div>Reading list not found</div>;
  }

  const listBooks = books.filter((book: any) => readingList.bookIds?.includes(book._id || book.id));

  return (
                <div>
      <h1>{readingList.name}</h1>
      <p>{readingList.description}</p>
      <h2>Books in this list:</h2>
      <ul>
        {listBooks.map((book: any) => (
          <li key={book._id || book.id}>{book.title} by {book.author}</li>
        ))}
      </ul>
    </div>
  );
};

export default ReadingListDetails;
