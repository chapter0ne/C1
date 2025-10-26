
import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Trash2, BookOpen } from "lucide-react";
import { useFeaturedBooks, useAddFeaturedBook, useRemoveFeaturedBook } from "@/hooks/useFeaturedBooks";
import { usePublishedBooks } from "@/hooks/books/usePublishedBooks";
import { toast } from "sonner";

const FeaturedBooksManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBooks, setSelectedBooks] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("bestseller");

  const { data: featuredBooks = [], isLoading: featuredLoading } = useFeaturedBooks();
  const { data: allBooks = [], isLoading: booksLoading } = usePublishedBooks();
  const addFeaturedMutation = useAddFeaturedBook();
  const removeFeaturedMutation = useRemoveFeaturedBook();

  const bestsellerBooks = featuredBooks?.filter(fb => fb.category === 'bestseller') || [];
  const editorPickBooks = featuredBooks?.filter(fb => fb.category === 'editor_pick') || [];

  // Get books that are not already in the current category
  const availableBooks = allBooks.filter(book => 
    !featuredBooks?.some(fb => fb.book && fb.book._id === book._id && fb.category === activeTab)
  );

  // Filter books based on search term
  const filteredAvailableBooks = availableBooks.filter(book =>
    book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (book.genre && book.genre.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleBookSelection = (bookId: string, checked: boolean) => {
    if (checked) {
      setSelectedBooks(prev => [...prev, bookId]);
    } else {
      setSelectedBooks(prev => prev.filter(id => id !== bookId));
    }
  };

  const handleAddSelectedBooks = async () => {
    if (selectedBooks.length === 0) return;

    const maxBooks = activeTab === 'bestseller' ? 10 : 20;
    const currentCount = activeTab === 'bestseller' ? bestsellerBooks.length : editorPickBooks.length;
    
    if (currentCount + selectedBooks.length > maxBooks) {
      toast.error(`Cannot add more books. ${activeTab === 'bestseller' ? 'Bestseller' : 'Editor Picks'} list can only contain up to ${maxBooks} books.`);
      return;
    }

    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    // Add books one by one
    for (const bookId of selectedBooks) {
      try {
        await addFeaturedMutation.mutateAsync({
          bookId,
          category: activeTab as 'bestseller' | 'editor_pick'
        });
        successCount++;
      } catch (error: any) {
        errorCount++;
        // Check if it's a duplicate error
        if (error?.message?.includes('already featured')) {
          // Silently skip duplicate books
          continue;
        }
        // Store other errors for reporting
        const bookTitle = allBooks.find(b => b._id === bookId)?.title || 'Unknown book';
        errors.push(`${bookTitle}: ${error?.message || 'Failed to add'}`);
      }
    }
    
    setSelectedBooks([]);
    setSearchTerm("");
    
    // Show appropriate feedback
    if (successCount > 0) {
      toast.success(`${successCount} book(s) added to ${activeTab === 'bestseller' ? 'Bestsellers' : 'Editor Picks'}`);
    }
    if (errorCount > 0 && errors.length > 0) {
      toast.error(`Failed to add ${errorCount} book(s). Some books may already be in the list.`);
    } else if (errorCount > 0) {
      toast.warning(`${errorCount} book(s) were already in the list.`);
    }
  };

  const handleRemoveFeaturedBook = async (featuredBookId: string) => {
    try {
      console.log('Removing featured book with ID:', featuredBookId);
      console.log('Featured book object:', featuredBookId);
      await removeFeaturedMutation.mutateAsync(featuredBookId);
      toast.success('Book removed from featured list');
    } catch (error) {
      console.error('Error removing book:', error);
      toast.error('Failed to remove book');
    }
  };

  const getCurrentBooks = () => {
    return activeTab === 'bestseller' ? bestsellerBooks : editorPickBooks;
  };

  const getMaxBooks = () => {
    return activeTab === 'bestseller' ? 10 : 20;
  };

  if (featuredLoading || booksLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center p-8">
          <div className="text-lg">Loading featured books...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
            <div className="mb-6 flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Featured Books Management</h2>
                <p className="text-gray-600">Manage books displayed in bestsellers and editor picks sections</p>
              </div>
              <Button
                variant="destructive"
                onClick={async () => {
                  if (confirm('Are you sure you want to clear ALL featured books? This action cannot be undone.')) {
                    try {
                      const response = await fetch('https://backend-8zug.onrender.com/api/featured-books/clear-all', {
                        method: 'POST',
                        headers: {
                          'Authorization': `Bearer ${localStorage.getItem('token')}`,
                          'Content-Type': 'application/json'
                        }
                      });
                      const result = await response.json();
                      if (response.ok) {
                        toast.success(result.message);
                        // Refresh the page to update the lists
                        window.location.reload();
                      } else {
                        toast.error(result.message || 'Failed to clear featured books');
                      }
                    } catch (error) {
                      toast.error('Failed to clear featured books');
                    }
                  }
                }}
                className="ml-4"
              >
                Clear All Featured Books
              </Button>
            </div>

        <Tabs value={activeTab} onValueChange={(value) => {
          setActiveTab(value);
          setSelectedBooks([]);
          setSearchTerm("");
        }} className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="bestseller">
              Bestsellers ({bestsellerBooks.length}/{getMaxBooks()})
            </TabsTrigger>
            <TabsTrigger value="editor_pick">
              Editor Picks ({editorPickBooks.length}/{getMaxBooks()})
            </TabsTrigger>
              </TabsList>

          <TabsContent value={activeTab} className="space-y-6">
            {/* Add Books Section */}
                <Card>
                  <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Add Books to {activeTab === 'bestseller' ? 'Bestsellers' : 'Editor Picks'}
                </CardTitle>
                  </CardHeader>
                  <CardContent>
                <div className="space-y-4">
                  {/* Search */}
                  <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                          <Input
                      placeholder="Search books by title, author, or genre..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                          />
                        </div>

                  {/* Book Selection List */}
                  <div className="border rounded-lg max-h-96 overflow-y-auto">
                    {filteredAvailableBooks.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">
                        {searchTerm ? 'No books found matching your search.' : 'No available books to add.'}
                      </div>
                    ) : (
                      <div className="divide-y">
                        {filteredAvailableBooks.map((book) => (
                          <div key={book._id} className="flex items-center space-x-3 p-4 hover:bg-gray-50">
                            <Checkbox
                              checked={selectedBooks.includes(book._id)}
                              onCheckedChange={(checked) => handleBookSelection(book._id, checked as boolean)}
                            />
                            <div className="flex items-center space-x-3 flex-1">
                              {book.coverImageUrl ? (
                                <img
                                  src={book.coverImageUrl}
                                  alt={book.title}
                                  className="w-12 h-16 object-cover rounded shadow"
                                />
                              ) : (
                                <div className="w-12 h-16 bg-gray-200 rounded flex items-center justify-center">
                                  <BookOpen className="h-6 w-6 text-gray-400" />
                                </div>
                              )}
                              <div className="flex-1">
                                <h3 className="font-medium text-sm">{book.title}</h3>
                                <p className="text-sm text-gray-600">by {book.author}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  {book.genre && (
                                    <Badge variant="outline" className="text-xs">
                                      {book.genre}
                                    </Badge>
                                  )}
                                  <Badge variant={book.isFree ? 'secondary' : 'default'} className="text-xs">
                                    {book.isFree ? 'Free' : 'Paid'}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                        </div>
                      ))}
                        </div>
                      )}
                  </div>

                  {/* Add Button */}
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-600">
                      {selectedBooks.length} book(s) selected
                      </div>
                      <Button 
                      onClick={handleAddSelectedBooks}
                      disabled={selectedBooks.length === 0 || addFeaturedMutation.isPending}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                      Add {selectedBooks.length > 0 ? `${selectedBooks.length} Book${selectedBooks.length > 1 ? 's' : ''}` : 'Books'}
                      </Button>
                  </div>
                    </div>
                  </CardContent>
                </Card>

            {/* Current Featured Books */}
                <Card>
                  <CardHeader>
                <CardTitle>Current {activeTab === 'bestseller' ? 'Bestsellers' : 'Editor Picks'}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                  {getCurrentBooks().map((featuredBook, index) => {
                    console.log('Featured book object:', featuredBook);
                    return (
                      <div key={featuredBook._id || `featured-${index}`} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center space-x-4">
                          {featuredBook.book?.coverImageUrl ? (
                            <img 
                              src={featuredBook.book.coverImageUrl} 
                              alt={featuredBook.book.title}
                              className="w-16 h-20 object-cover rounded shadow"
                            />
                          ) : (
                            <div className="w-16 h-20 bg-gray-200 rounded flex items-center justify-center">
                              <BookOpen className="h-8 w-8 text-gray-400" />
                            </div>
                            )}
                            <div>
                            <h3 className="font-medium">{featuredBook.book?.title}</h3>
                            <p className="text-sm text-gray-600">by {featuredBook.book?.author}</p>
                            <div className="flex items-center gap-2 mt-1">
                              {featuredBook.book?.genre && (
                                <Badge variant="outline" className="text-xs">
                                  {featuredBook.book.genre}
                                </Badge>
                              )}
                              <Badge variant={featuredBook.book?.isFree ? 'secondary' : 'default'} className="text-xs">
                                {featuredBook.book?.isFree ? 'Free' : 'Paid'}
                              </Badge>
                            </div>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleRemoveFeaturedBook(featuredBook._id)}
                            disabled={removeFeaturedMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                    );
                  })}
                      
                  {getCurrentBooks().length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                      No books in {activeTab === 'bestseller' ? 'bestsellers' : 'editor picks'} list yet.
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
    </DashboardLayout>
  );
};

export default FeaturedBooksManagement;
