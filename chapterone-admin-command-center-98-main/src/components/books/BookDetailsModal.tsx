
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useBookDetails } from "@/hooks/books/useBookDetails";
import { Loader2 } from "lucide-react";

interface BookDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookId: string;
}

const BookDetailsModal = ({ isOpen, onClose, bookId }: BookDetailsModalProps) => {
  const { data: book, isLoading } = useBookDetails(bookId);

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!book) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{book.title}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex gap-4">
            {book.coverImageUrl ? (
              <img 
                src={book.coverImageUrl} 
                alt={book.title}
                className="w-24 h-32 object-cover rounded"
              />
            ) : (
              <div className="w-24 h-32 bg-gray-800 rounded flex items-center justify-center">
                <span className="text-white text-xs font-bold">Book</span>
              </div>
            )}
            
            <div className="flex-1 space-y-2">
              <div>
                <span className="font-medium">Author:</span> {book.author}
              </div>
              <div>
                <span className="font-medium">Genre:</span> {book.genre || 'Not specified'}
              </div>
              <div>
                <span className="font-medium">Price:</span> {
                  book.isFree ? (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">Free</Badge>
                  ) : (
                    `₦${book.price || 0}`
                  )
                }
              </div>
              <div>
                <span className="font-medium">Status:</span>
                <Badge variant={book.status === 'published' ? 'default' : 'secondary'} className="ml-2">
                  {book.status}
                </Badge>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="font-medium mb-2">Description</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              {book.description || 'No description provided'}
            </p>
          </div>

          {book.tags && book.tags.length > 0 && (
            <>
              <Separator />
              <div>
                <h3 className="font-medium mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {book.tags.map((tag, index) => (
                    <Badge key={index} variant="outline">{tag}</Badge>
                  ))}
                </div>
              </div>
            </>
          )}

          <Separator />

          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{book.chapters?.length || 0}</div>
              <div className="text-sm text-gray-600">Chapters</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{book.purchase_count || 0}</div>
              <div className="text-sm text-gray-600">Purchases</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">{book.library_count || 0}</div>
              <div className="text-sm text-gray-600">In Libraries</div>
            </div>
          </div>

          {book.isbn && (
            <>
              <Separator />
              <div>
                <span className="font-medium">ISBN:</span> {book.isbn}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BookDetailsModal;
