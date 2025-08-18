
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useBooks } from '@/hooks/useBooks';
import { useReadingLists } from '@/hooks/useReadingLists';
import { useToast } from "@/hooks/use-toast";

const CurateList = () => {
  const { user } = useAuth();
  const userId = user?.id || '';
  const { data: books = [], isLoading: booksLoading, error: booksError } = useBooks();
  const { createList } = useReadingLists(userId);
  const { toast } = useToast();

  const [listName, setListName] = useState("");
  const [listDescription, setListDescription] = useState("");
  const [selectedBooks, setSelectedBooks] = useState<string[]>([]);
  const [createdListId, setCreatedListId] = useState<string | null>(null);

  const handleBookSelect = (bookId: string, selected: boolean) => {
    if (selected) {
      setSelectedBooks([...selectedBooks, bookId]);
    } else {
      setSelectedBooks(selectedBooks.filter(id => id !== bookId));
    }
  };

  const handleCreateList = async () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to create a reading list",
        variant: "destructive"
      });
      return;
    }
    if (!listName.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter a name for your reading list.",
        variant: "destructive"
      });
      return;
    }
    if (selectedBooks.length === 0) {
      toast({
        title: "No Books Selected",
        description: "Please select at least one book for your list.",
        variant: "destructive"
      });
      return;
    }
    try {
      const newList = {
        title: listName,
        description: listDescription,
        books: selectedBooks,
        is_public: true,
      };
      await createList.mutateAsync(newList);
      toast({
        title: "List Created!",
        description: `Successfully created "${listName}" with ${selectedBooks.length} book(s).`,
      });
      setCreatedListId(Date.now().toString()); // Placeholder for success
      setListName("");
      setListDescription("");
      setSelectedBooks([]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create reading list. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (booksLoading) return <div>Loading your books...</div>;
  if (booksError) return <div>Error loading books: {booksError.message}</div>;

  return (
    <div>
      <h1>Curate a Reading List</h1>
      <input
        type="text"
        placeholder="List Name"
        value={listName}
        onChange={e => setListName(e.target.value)}
      />
      <textarea
        placeholder="List Description"
        value={listDescription}
        onChange={e => setListDescription(e.target.value)}
      />
      <h2>Select Books</h2>
      <ul>
        {books.map((book: any) => (
          <li key={book._id}>
            <label>
              <input
                type="checkbox"
                checked={selectedBooks.includes(book._id)}
                onChange={e => handleBookSelect(book._id, e.target.checked)}
              />
              <span className="truncate">{book.title} by {book.author}</span>
            </label>
          </li>
        ))}
      </ul>
      <button onClick={handleCreateList}>Create List</button>
      {createdListId && <div>List created successfully!</div>}
    </div>
  );
};

export default CurateList;
