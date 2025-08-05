
import { useParams } from "react-router-dom";
import { useSearchBooks } from '@/hooks/useBooks';

const AuthorPage = () => {
  const { authorName } = useParams();
  const decodedAuthorName = authorName ? decodeURIComponent(authorName) : '';
  const { data: books = [], isLoading, error } = useSearchBooks({ search: decodedAuthorName });

  if (isLoading) {
    return <div>Loading author's books...</div>;
  }
  if (error) {
    return <div>Error loading author's books: {error.message}</div>;
  }

  return (
    <div>
      <h1>Books by {decodedAuthorName}</h1>
      {books.length === 0 ? (
        <div>No books found for this author.</div>
      ) : (
        <ul>
          {books.map((book: any) => (
            <li key={book._id}>{book.title}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AuthorPage;
