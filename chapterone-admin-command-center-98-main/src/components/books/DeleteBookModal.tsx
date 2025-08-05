
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDeleteBook } from "@/hooks/useBooks";
import { Loader2 } from "lucide-react";

interface DeleteBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  book: {
    id: string;
    title: string;
  } | null;
}

const DeleteBookModal = ({ isOpen, onClose, book }: DeleteBookModalProps) => {
  const [confirmTitle, setConfirmTitle] = useState("");
  const deleteBookMutation = useDeleteBook();

  const handleDelete = async () => {
    if (!book || confirmTitle !== book.title) return;
    
    try {
      await deleteBookMutation.mutateAsync(book.id);
      onClose();
      setConfirmTitle("");
    } catch (error) {
      console.error('Error deleting book:', error);
    }
  };

  const handleClose = () => {
    onClose();
    setConfirmTitle("");
  };

  if (!book) return null;

  const canDelete = confirmTitle === book.title;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-red-600">Delete Book</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            This action cannot be undone. This will permanently delete the book 
            <span className="font-medium"> "{book.title}" </span>
            and all its chapters.
          </p>
          
          <div>
            <Label htmlFor="confirm-title">
              Type the book title to confirm deletion:
            </Label>
            <Input
              id="confirm-title"
              value={confirmTitle}
              onChange={(e) => setConfirmTitle(e.target.value)}
              placeholder={book.title}
              className="mt-1"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDelete}
            disabled={!canDelete || deleteBookMutation.isPending}
          >
            {deleteBookMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete Book'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteBookModal;
