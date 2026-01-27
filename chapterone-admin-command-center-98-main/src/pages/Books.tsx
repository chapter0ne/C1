import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Search, Eye, Edit, Trash2, X } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { usePublishedBooks } from "@/hooks/books/usePublishedBooks";
import { useDeleteBook } from "@/hooks/books/useDeleteBook";
import BookStatsModal from "@/components/BookStatsModal";
import { Dialog, DialogContent, DialogHeader, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/utils/api";
import { useNavigate, Link } from "react-router-dom";

const Books = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [genreFilter, setGenreFilter] = useState("all-genres");
  const [categoryFilter, setCategoryFilter] = useState("category");
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [deleteBookId, setDeleteBookId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [confirmTitle, setConfirmTitle] = useState('');

  const { data: books = [], isLoading } = useQuery({
    queryKey: ['all-books'],
    queryFn: async () => await api.get('/books?all=true'),
  });
  const deleteBookMutation = useDeleteBook();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const publishBookMutation = useMutation({
    mutationFn: async (bookId: string) => {
      return await api.put(`/books/${bookId}`, { status: 'published' });
    },
    onSuccess: () => {
      // Use optimistic update approach instead of immediate invalidation
      queryClient.invalidateQueries({ queryKey: ['all-books'] });
      toast.success('Book published successfully!');
    },
    onError: () => {
      toast.error('Failed to publish book');
    }
  });

  // Fetch library counts for all books
  const { data: libraryCounts = {} } = useQuery({
    queryKey: ['library-counts'],
    queryFn: async () => {
      try {
        const counts: Record<string, number> = {};
        
        // Fetch all counts in parallel for better performance
        const countPromises = books.map(async (book) => {
          try {
            const response = await api.get(`/user-library/book/${book._id}/count`);
            return { bookId: book._id, count: response.count || 0 };
          } catch (error) {
            console.warn(`Failed to fetch library count for book ${book._id}:`, error);
            return { bookId: book._id, count: 0 };
          }
        });
        
        const results = await Promise.allSettled(countPromises);
        
        results.forEach((result) => {
          if (result.status === 'fulfilled') {
            counts[result.value.bookId] = result.value.count;
          }
        });
        
        return counts;
      } catch (error) {
        console.error('Error fetching library counts:', error);
        return {};
      }
    },
    enabled: books.length > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 1,
    retryDelay: 2000
  });

  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGenre = genreFilter === "all-genres" || (book.genre?.toLowerCase() === genreFilter);
    const matchesCategory = categoryFilter === "category" ||
      (categoryFilter === "free" && book.isFree) ||
      (categoryFilter === "paid" && !book.isFree);
    return matchesSearch && matchesGenre && matchesCategory;
  });

  const handleViewDetails = (bookId: string) => {
    setSelectedBookId(bookId);
    setShowDetails(true);
  };

  const handleEditBook = (bookId: string) => {
    navigate(`/upload/${bookId}`);
  };

  const handleDeleteBook = (bookId: string) => {
    console.log('handleDeleteBook called with bookId:', bookId);
    setDeleteBookId(bookId);
    setShowDeleteModal(true);
    setConfirmTitle(''); // Reset confirmation input
  };

  const confirmDeleteBook = async () => {
    if (!deleteBookId) return;
    
    const book = books.find(book => book._id === deleteBookId);
    if (!book) return;
    
    // Check if the typed title matches exactly
    if (confirmTitle.trim() !== book.title.trim()) {
      toast.error('Book title does not match. Please type the exact title to confirm deletion.');
      return;
    }
    
    setShowDeleteModal(false);
    setDeleteBookId(deleteBookId); // Keep deleteBookId for loading overlay
    
    try {
      console.log('Attempting to delete book:', deleteBookId);
      await deleteBookMutation.mutateAsync(deleteBookId);
      console.log('Book deleted successfully');
    } catch (error) {
      console.error('Error deleting book:', error);
    } finally {
      setDeleteBookId(null);
      setConfirmTitle('');
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setDeleteBookId(null);
    setConfirmTitle('');
  };

  // Simple cleanup on unmount
  useEffect(() => {
    return () => {
      setDeleteBookId(null);
    };
  }, []);

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showDeleteModal) {
        cancelDelete();
      }
    };

    if (showDeleteModal) {
      window.addEventListener('keydown', handleEscapeKey);
      return () => window.removeEventListener('keydown', handleEscapeKey);
    }
  }, [showDeleteModal]);

  const draftCount = books.filter((book) => book.status === 'draft').length;

  return (
    <DashboardLayout>
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500 w-4 h-4" />
                <Input 
                  placeholder="Search books..." 
                  className="pl-10 w-64 focus:border-black focus:ring-0"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={genreFilter} onValueChange={setGenreFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-genres">All Genres</SelectItem>
                  <SelectItem value="technology">Technology</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="fiction">Fiction</SelectItem>
                </SelectContent>
              </Select>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="category">Category</SelectItem>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              variant="outline"
              className="ml-4 relative"
              onClick={() => navigate('/drafts')}
            >
              View Drafts
              {draftCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full px-2 py-0.5 text-xs font-bold animate-pulse">
                  {draftCount}
                </span>
              )}
            </Button>
          </div>
          <div className="max-h-[calc(100vh-280px)] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Book</TableHead>
                  <TableHead>Readers</TableHead>
                  <TableHead>Genre</TableHead>
                  <TableHead>Upload Date</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBooks.map((book) => (
                  <TableRow key={book._id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        {book.coverImageUrl ? (
                          <img
                            src={book.coverImageUrl}
                            alt={book.title}
                            className="w-10 h-14 object-cover rounded shadow"
                          />
                        ) : (
                          <div className="w-10 h-14 bg-gray-200 rounded flex items-center justify-center">
                            <span className="text-gray-400 text-xs font-bold">No Image</span>
                          </div>
                        )}
                        <div>
                          <p className="font-medium">{book.title}</p>
                          <p className="text-sm text-gray-600">By {book.author}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{libraryCounts[book._id] || 0}</TableCell>
                    <TableCell>{book.genre || 'Not specified'}</TableCell>
                    <TableCell>{book.createdAt ? new Date(book.createdAt).toLocaleDateString() : 'N/A'}</TableCell>
                    <TableCell>
                      <Badge variant={(book.isFree ?? book.is_free) ? 'secondary' : 'default'}
                        className={(book.isFree ?? book.is_free) ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
                        {(book.isFree ?? book.is_free) ? 'Free' : 'Paid'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={book.status === 'published' ? 'default' : 'secondary'} className={book.status === 'published' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}>
                        {book.status === 'published' ? 'Published' : 'Draft'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => handleViewDetails(book._id)}>
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditBook(book._id)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit book
                          </DropdownMenuItem>
                          {book.status !== 'published' && (
                            <DropdownMenuItem onClick={() => publishBookMutation.mutate(book._id)}>
                              <span className="w-4 h-4 mr-2">🚀</span>
                              Publish
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteBook(book._id)}>
                            <Trash2 className="w-4 h-4 mr-2" />
                            Remove Book
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {/* Book Stats Modal */}
          <BookStatsModal
            bookId={selectedBookId}
            isOpen={showDetails}
            onClose={() => {
              setShowDetails(false);
              setSelectedBookId(null);
            }}
          />
          {/* Edit Book Modal (placeholder) */}
          <Dialog open={showEdit} onOpenChange={setShowEdit}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Edit Book (Coming Soon)</DialogTitle>
                <DialogDescription>
                  Book editing functionality will be implemented here.
                </DialogDescription>
              </DialogHeader>
              <div className="text-gray-500">Book editing functionality will be implemented here.</div>
            </DialogContent>
          </Dialog>
          {/* Modern Delete Confirmation Modal */}
          {showDeleteModal && deleteBookId && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
                {/* Modal Header */}
                <div className="bg-gradient-to-r from-red-50 to-red-100 px-6 py-4 border-b border-red-200">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                      <Trash2 className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Delete Book</h3>
                      <p className="text-sm text-gray-600">This action cannot be undone</p>
                    </div>
                  </div>
                </div>

                {/* Modal Content */}
                <div className="px-6 py-6">
                  <div className="mb-4">
                    <p className="text-gray-700 mb-2">
                      Are you sure you want to delete this book?
                    </p>
                    <div className="bg-gray-50 rounded-lg p-3 border">
                      <p className="font-medium text-gray-900">
                        {books.find(book => book._id === deleteBookId)?.title}
                      </p>
                      <p className="text-sm text-gray-600">
                        by {books.find(book => book._id === deleteBookId)?.author}
                      </p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <label htmlFor="confirm-title" className="block text-sm font-medium text-gray-700 mb-2">
                      Type the book title to confirm deletion:
                    </label>
                    <Input
                      id="confirm-title"
                      value={confirmTitle}
                      onChange={(e) => setConfirmTitle(e.target.value)}
                      placeholder={books.find(book => book._id === deleteBookId)?.title}
                      className="w-full"
                      autoComplete="off"
                    />
                  </div>

                  <div className="flex space-x-3">
                    <Button
                      variant="outline"
                      onClick={cancelDelete}
                      className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={confirmDeleteBook}
                      disabled={confirmTitle.trim() !== books.find(book => book._id === deleteBookId)?.title?.trim()}
                      className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Delete Book
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Simple loading overlay for delete operation */}
          {deleteBookId && !showDeleteModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-4">
                <div className="flex items-center space-x-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600"></div>
                  <div>
                    <p className="font-medium">Deleting book...</p>
                    <p className="text-sm text-gray-600">Please wait while we delete the book.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default Books; 