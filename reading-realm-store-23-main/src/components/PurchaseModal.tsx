
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Book } from "@/types/book";
import { CreditCard, BookOpen, ShoppingCart } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface PurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  book: Book;
  onPurchaseSuccess: (bookId: string) => void;
}

const PurchaseModal = ({ isOpen, onClose, book, onPurchaseSuccess }: PurchaseModalProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { user } = useAuth();
  const { addToCart } = useCart(user?.id || '');
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleAddToCart = async () => {
    if (!user) {
      toast({
        title: "Please Login",
        description: "You need to be logged in to add books to cart.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      console.log('Adding to cart:', { bookId: book._id || book.id, bookTitle: book.title });
      const result = await addToCart.mutateAsync({ bookId: book._id || book.id, quantity: 1 });
      console.log('Add to cart result:', result);
      toast({
        title: "Added to Cart",
        description: `${book.title} has been added to your cart.`,
      });
      onClose();
    } catch (error) {
      console.error('Add to cart error:', error);
      toast({
        title: "Error",
        description: "Failed to add book to cart. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFreeBook = async () => {
    if (!user) {
      toast({
        title: "Please Login",
        description: "You need to be logged in to add books to library.",
        variant: "destructive"
      });
      return;
    }

    // For free books, add directly to library
    onPurchaseSuccess(book._id || book.id);
    onClose();
  };

  const handleGoToCart = () => {
    onClose();
    navigate('/cart');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900">
            {book.isFree ? 'Add to Library' : 'Purchase Book'}
          </DialogTitle>
          <DialogDescription>
            {book.isFree 
              ? "Add this free book to your personal library to start reading immediately."
              : "Complete your purchase to add this book to your library and start reading."
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="text-center">
            <div className="aspect-[3/4] bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white relative overflow-hidden rounded-md mb-4 max-w-32 mx-auto">
              <div className="absolute inset-0 bg-black/20"></div>
              <div className="text-center z-10 p-2">
                <h3 className="font-bold text-sm mb-1">{book.title.toUpperCase()}</h3>
                <p className="text-xs opacity-90 truncate">{book.author.toUpperCase()}</p>
              </div>
            </div>
            <h3 className="font-medium text-gray-900 mb-2">{book.title}</h3>
            <p className="text-gray-600 mb-4 truncate">by {book.author}</p>
            <div className="text-2xl font-bold">
              <span className={book.isFree ? "text-green-600" : "text-[#D01E1E]"}>
                {book.isFree ? "Free" : `$${book.price}`}
              </span>
            </div>
          </div>

          {book.isFree ? (
            <Button
              onClick={handleFreeBook}
              className="w-full bg-[#D01E1E] hover:bg-[#B01818] py-3"
              size="lg"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Add to Library
            </Button>
          ) : (
            <div className="space-y-3">
              <Button
                onClick={handleAddToCart}
                disabled={isProcessing}
                className="w-full bg-[#D01E1E] hover:bg-[#B01818] py-3"
                size="lg"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                {isProcessing ? 'Adding...' : `Add to Cart - $${book.price}`}
              </Button>
              <Button
                onClick={handleGoToCart}
                variant="outline"
                className="w-full py-3"
                size="lg"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Go to Cart
              </Button>
            </div>
          )}

          <p className="text-xs text-gray-500 text-center">
            {book.isFree 
              ? "This book will be added to your library immediately."
              : "Add to cart and proceed to checkout for secure payment via Paystack."
            }
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PurchaseModal;
