import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Search, Eye, Edit, Trash2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/utils/api";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Drafts = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteBookId, setDeleteBookId] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: books = [], isLoading } = useQuery({
    queryKey: ['all-books'],
    queryFn: async () => await api.get('/books?all=true'),
  });

  const draftBooks = books.filter((book: any) => book.status === 'draft');

  const filteredBooks = draftBooks.filter(book => {
    return (
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const publishBookMutation = useMutation({
    mutationFn: async (bookId: string) => {
      return await api.put(`/books/${bookId}`, { status: 'published' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['all-books']);
      toast.success('Book published successfully!');
    },
    onError: () => {
      toast.error('Failed to publish book');
    }
  });

  const deleteBookMutation = useMutation({
    mutationFn: async (bookId: string) => {
      return await api.del(`/books/${bookId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['all-books']);
      toast.success('Book deleted successfully!');
    },
    onError: () => {
      toast.error('Failed to delete book');
    }
  });

  const handleEditBook = (bookId: string) => {
    navigate(`/upload/${bookId}`);
  };

  const handleDeleteBook = (bookId: string) => {
    setDeleteBookId(bookId);
    setShowDeleteDialog(true);
  };

  const confirmDeleteBook = async () => {
    if (deleteBookId) {
      await deleteBookMutation.mutateAsync(deleteBookId);
      setShowDeleteDialog(false);
      setDeleteBookId(null);
    }
  };

  return (
    <DashboardLayout>
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500 w-4 h-4" />
              <Input 
                placeholder="Search drafts..." 
                className="pl-10 w-64 focus:border-black focus:ring-0"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="max-h-96 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Book</TableHead>
                  <TableHead>Genre</TableHead>
                  <TableHead>Upload Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBooks.map((book: any) => (
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
                    <TableCell>{book.genre || 'Not specified'}</TableCell>
                    <TableCell>{book.createdAt ? new Date(book.createdAt).toLocaleDateString() : 'N/A'}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Draft</Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => handleEditBook(book._id)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit draft
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => publishBookMutation.mutate(book._id)}>
                            <span className="w-4 h-4 mr-2">🚀</span>
                            Publish
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteBook(book._id)}>
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default Drafts; 