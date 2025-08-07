
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Book } from "@/types/book";
import { CreditCard, BookOpen } from "lucide-react";

interface PurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  book: Book;
  onPurchaseSuccess: (bookId: string) => void;
}

const PurchaseModal = ({ isOpen, onClose, book, onPurchaseSuccess }: PurchaseModalProps) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePurchase = async () => {
    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      onPurchaseSuccess(book.id);
      onClose();
    }, 2000);
  };

  const handleFreeBook = () => {
    onPurchaseSuccess(book.id);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900">
            {book.isFree ? 'Add to Library' : 'Purchase Book'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="text-center">
            <div className="aspect-[3/4] bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white relative overflow-hidden rounded-md mb-4 max-w-32 mx-auto">
              <div className="absolute inset-0 bg-black/20"></div>
              <div className="text-center z-10 p-2">
                <h3 className="font-bold text-sm mb-1">{book.title.toUpperCase()}</h3>
                <p className="text-xs opacity-90">{book.author.toUpperCase()}</p>
              </div>
            </div>
            <h3 className="font-medium text-gray-900 mb-2">{book.title}</h3>
            <p className="text-gray-600 mb-4">by {book.author}</p>
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
            <Button
              onClick={handlePurchase}
              disabled={isProcessing}
              className="w-full bg-[#D01E1E] hover:bg-[#B01818] py-3"
              size="lg"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              {isProcessing ? 'Processing...' : `Pay $${book.price}`}
            </Button>
          )}

          <p className="text-xs text-gray-500 text-center">
            {book.isFree 
              ? "This book will be added to your library immediately."
              : "Secure payment processed by Paystack. You'll have instant access after purchase."
            }
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PurchaseModal;
