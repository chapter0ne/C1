import { useState } from "react";
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
import BookDetailsModal from "@/components/books/BookDetailsModal";
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
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

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
    console.log('Book data for deletion:', books.find(book => book._id === bookId));
    setDeleteBookId(bookId);
    setShowDeleteDialog(true);
  };

  const confirmDeleteBook = async () => {
    if (deleteBookId) {
      try {
        console.log('Attempting to delete book:', deleteBookId);
        await deleteBookMutation.mutateAsync(deleteBookId);
        console.log('Book deleted successfully');
        setShowDeleteDialog(false);
        setDeleteBookId(null);
      } catch (error) {
        console.error('Error deleting book:', error);
        // Error toast is handled by the mutation hook
      }
    }
  };

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
          <div className="overflow-y-auto">
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
          {/* Book Details Modal */}
          {selectedBookId && (
            <BookDetailsModal 
              isOpen={showDetails} 
              onClose={() => setShowDetails(false)} 
              bookId={selectedBookId} 
            />
          )}
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
          {/* Delete Confirmation Dialog */}
          <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Delete Book</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete this book? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col items-center">
                <Trash2 className="w-10 h-10 text-red-500 mb-4" />
                <h2 className="text-lg font-bold mb-2 sr-only">Delete Book</h2>
                <p className="text-gray-600 mb-4 sr-only">Are you sure you want to delete this book? This action cannot be undone.</p>
                <div className="flex space-x-4">
                  <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
                  <Button variant="destructive" onClick={confirmDeleteBook} disabled={deleteBookMutation.isPending}>
                    {deleteBookMutation.isPending ? "Deleting..." : "Delete"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default Books; 